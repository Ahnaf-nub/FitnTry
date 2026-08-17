import os
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from app.routers import tryon, stylist
    from app.auth import router as auth_router
else:
    from .routers import tryon, stylist
    from .auth import router as auth_router

BASE_DIR = Path(__file__).resolve().parents[1]
FRONTEND_DIR = BASE_DIR / "vesta"
FRONTEND_DIST_DIR = FRONTEND_DIR / "dist"

app = FastAPI(title="FitnTry try-on backend")

origins = [o.strip() for o in os.environ.get("FRONTEND_ORIGINS", "http://localhost:5173").split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tryon.router)
app.include_router(stylist.router)
app.include_router(auth_router)

if (FRONTEND_DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST_DIR / "assets"), name="frontend-assets")


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/", include_in_schema=False)
@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str = ""):
    # Serve a real static file (e.g. /silk-blouse.jpg from vesta/public/)
    # if one exists at that path — only fall back to index.html for
    # actual client-side routes, so React Router still works on refresh.
    if full_path:
        candidate = (FRONTEND_DIST_DIR / full_path).resolve()
        if candidate.is_file() and FRONTEND_DIST_DIR.resolve() in candidate.parents:
            return FileResponse(candidate)

    index_file = FRONTEND_DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)

    return HTMLResponse("<h1>Frontend build missing</h1><p>The vesta/dist build output is missing.</p>", status_code=503)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=4000, reload=False)
