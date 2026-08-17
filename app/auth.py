import os
from typing import Any

import httpx
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")


class AuthRequest(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str


class AuthResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    user: dict[str, Any] | None = None
    message: str | None = None


def _identifier_to_email(payload: AuthRequest) -> str:
    identifier = (payload.email or payload.username or "").strip().lower()
    if "@" in identifier:
        return identifier
    normalized = "".join(ch for ch in identifier if ch.isalnum() or ch in {"_", ".", "-"})
    return f"{normalized}@vesta.local"


def _headers() -> dict[str, str]:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase credentials are not configured")
    return {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }


async def _request_json(method: str, path: str, *, token: str | None = None, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    headers = _headers()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.request(method, f"{SUPABASE_URL.rstrip('/')}/auth/v1/{path.lstrip('/')}", headers=headers, json=payload)
        try:
            body = response.json()
        except ValueError:
            body = {}

        if response.status_code >= 400:
            detail = body.get("msg") or body.get("message") or body.get("error_description") or body.get("error") or "Supabase auth request failed"
            raise HTTPException(status_code=response.status_code, detail=detail)

        return body


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: AuthRequest) -> AuthResponse:
    email = _identifier_to_email(payload)
    data = await _request_json(
        "POST",
        "signup",
        payload={
            "email": email,
            "password": payload.password,
            "data": {"username": payload.username or email.split("@")[0]},
        },
    )
    return AuthResponse(
        access_token=data.get("access_token"),
        refresh_token=data.get("refresh_token"),
        user=data.get("user"),
        message="Signup successful",
    )


@router.post("/signin", response_model=AuthResponse)
async def signin(payload: AuthRequest) -> AuthResponse:
    email = _identifier_to_email(payload)
    data = await _request_json(
        "POST",
        "token?grant_type=password",
        payload={"email": email, "password": payload.password},
    )
    return AuthResponse(
        access_token=data.get("access_token"),
        refresh_token=data.get("refresh_token"),
        user=data.get("user"),
        message="Sign-in successful",
    )


@router.get("/session", response_model=AuthResponse)
async def session(authorization: str | None = Header(default=None)) -> AuthResponse:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing access token")

    token = authorization.split(" ", 1)[1].strip()
    data = await _request_json("GET", "user", token=token)
    return AuthResponse(access_token=token, user=data, message="Session active")
