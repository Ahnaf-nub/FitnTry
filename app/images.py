import base64
import mimetypes
import re
from pathlib import Path

import httpx
from fastapi import HTTPException

_DATA_URL_RE = re.compile(r"^data:(?P<content_type>[\w/+.-]+);base64,(?P<data>.+)$", re.DOTALL)

# app/images.py -> app -> vesta-backend -> vesta-backend/vesta/dist
# Mirrors the FRONTEND_DIST_DIR path main.py serves static files from.
_FRONTEND_DIST_DIR = Path(__file__).resolve().parents[1] / "vesta" / "dist"


async def resolve_image(src: str) -> tuple[bytes, str]:
    """
    Accepts:
      - a data URL (from the frontend's FileReader.readAsDataURL — user
        photos and custom garment uploads),
      - a plain http(s):// URL, or
      - a root-relative path like "/silk-blouse.jpg" (the built-in garment
        catalog in src/data/garments.ts uses these — they're static files
        served straight out of vesta/dist by main.py, not real URLs).
    Returns (raw_bytes, content_type).
    """
    match = _DATA_URL_RE.match(src)
    if match:
        content_type = match.group("content_type")
        data = base64.b64decode(match.group("data"))
        return data, content_type

    if src.startswith(("http://", "https://")):
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(src)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
            return resp.content, content_type

    # Root-relative catalog path -> read straight off disk instead of
    # round-tripping through HTTP (also works when the server isn't
    # reachable at a fixed host:port, e.g. behind a proxy).
    candidate = (_FRONTEND_DIST_DIR / src.lstrip("/")).resolve()
    if _FRONTEND_DIST_DIR.resolve() not in candidate.parents or not candidate.is_file():
        raise HTTPException(status_code=400, detail=f"Could not resolve image source: {src!r}")

    content_type = mimetypes.guess_type(candidate.name)[0] or "image/jpeg"
    return candidate.read_bytes(), content_type
