"""
"Ask a stylist" — compares two saved looks and gives a written opinion
on which one to pick, for when someone's torn between two options.

Uses the Gemini API directly (a separate service from YouCam — needs
its own key, free tier available). Fetches both result images, sends
them inline to a vision-capable Gemini model, and asks for a short,
specific comparison.

Requires GEMINI_API_KEY: https://aistudio.google.com/apikey (free tier)
"""

import base64
import os

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["stylist"])

GEMINI_MODEL = "gemini-3.7-flash"
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"


class LookForComparison(BaseModel):
    name: str
    imageUrl: str


class CompareLooksRequest(BaseModel):
    looks: list[LookForComparison]
    occasion: str | None = None


async def _fetch_image_b64(url: str) -> tuple[str, str]:
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
            return base64.b64encode(resp.content).decode(), content_type
    except httpx.HTTPError as exc:
        raise HTTPException(502, f"Couldn't fetch image for comparison ({url}): {exc}") from exc


@router.post("/compare-looks")
async def compare_looks(payload: CompareLooksRequest):
    if len(payload.looks) != 2:
        raise HTTPException(400, "Compare exactly two looks at a time.")

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(500, "GEMINI_API_KEY is not configured on the server")

    occasion_line = f" for {payload.occasion}" if payload.occasion else ""
    prompt = (
        f"Someone is deciding between two outfits they tried on virtually{occasion_line} "
        f"and can't decide. Photo 1 is \"{payload.looks[0].name}\". Photo 2 is "
        f"\"{payload.looks[1].name}\". Give a short, honest opinion (3-4 sentences): "
        "which one you'd lean toward and why (fit, color, how it reads for the "
        "occasion), and one specific thing that would make the other option work "
        "better too. Be direct and specific, not wishy-washy — but note that fit "
        "and taste are personal, so frame it as a lean, not a verdict."
    )

    # Gemini's inline image parts need base64 bytes, not bare URLs, so both
    # look images are fetched here before the actual generation call.
    img1_b64, img1_ct = await _fetch_image_b64(payload.looks[0].imageUrl)
    img2_b64, img2_ct = await _fetch_image_b64(payload.looks[1].imageUrl)

    body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": img1_ct, "data": img1_b64}},
                    {"inline_data": {"mime_type": img2_ct, "data": img2_b64}},
                ]
            }
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                GEMINI_ENDPOINT,
                params={"key": api_key},
                json=body,
            )
    except httpx.TimeoutException as exc:
        raise HTTPException(504, "Gemini took too long to respond — try again in a moment.") from exc
    except httpx.HTTPError as exc:
        raise HTTPException(502, f"Couldn't reach Gemini: {exc}") from exc

    if resp.status_code >= 400:
        raise HTTPException(resp.status_code, f"Gemini API request failed: {resp.text[:300]}")
    data = resp.json()
    candidates = data.get("candidates", [])
    parts = candidates[0]["content"]["parts"] if candidates else []
    opinion = "".join(p.get("text", "") for p in parts).strip()

    if not opinion:
        raise HTTPException(502, "Got an empty response from the stylist model.")

    return {"opinion": opinion}