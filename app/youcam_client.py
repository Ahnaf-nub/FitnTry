"""
Async wrapper around YouCam's Fashion API (Clothes / "cloth" feature),
V2 API pattern. Verified against Perfect Corp's own docs (yce.perfectcorp.com/document,
docs.perfectcorp.com/reference/ai_shoes/v2.0 — a sibling Fashion API endpoint
with an identical contract) plus a working third-party implementation, since
the previous version of this file was guessing at undocumented paths.

Confirmed facts this file relies on:
  - API host: https://yce-api-01.makeupar.com
  - Feature slug for clothing try-on is "cloth" (not "clothes", "cloth-v3",
    or "cloth-v4" — those were guesses in the previous version and are why
    you were getting 400s).
  - File upload:  POST /s2s/v2.0/file/cloth
      body: {"files": [{"content_type": str, "file_name": str, "file_size": int}]}
      All three fields are required — a previous version of this file only
      sent content_type, which is itself enough to cause a 400.
  - Task create:  POST /s2s/v2.0/task/cloth
      body is FLAT — no {"request_id": ..., "payload": {...}} wrapper.
      That wrapper shape is specific to the face-swap pre-process endpoint,
      not this one, and was wrongly copied over in a previous version.
      Fields: src_file_id/src_file_url, ref_file_id/ref_file_url,
      garment_category, change_shoes (optional).
  - Task poll:    GET /s2s/v2.0/task/cloth/{task_id}
      success shape: {"status":200,"data":{"error":null,"results":{"url":"..."},"task_status":"success"}}
"""

import asyncio
import os
import time

import httpx

BASE_URL = "https://yce-api-01.makeupar.com"
FEATURE = "cloth"

UPLOAD_ENDPOINT = f"/s2s/v2.0/file/{FEATURE}"
TASK_ENDPOINT = f"/s2s/v2.0/task/{FEATURE}"


def _headers() -> dict[str, str]:
    api_key = os.environ.get("YOUCAM_API_KEY")
    if not api_key:
        raise RuntimeError("YOUCAM_API_KEY must be set")
    return {"Authorization": f"Bearer {api_key}"}


def _file_extension(content_type: str) -> str:
    if content_type.endswith("jpeg") or content_type.endswith("jpg"):
        return "jpg"
    if content_type.endswith("png"):
        return "png"
    if content_type.endswith("webp"):
        return "webp"
    return "jpg"


def _map_garment_category(category: str) -> str:
    normalized = category.strip().lower()
    return {
        "tops": "upper_body",
        "top": "upper_body",
        "jackets": "upper_body",
        "jacket": "upper_body",
        "bottoms": "lower_body",
        "bottom": "lower_body",
        "dress": "full_body",
        "dresses": "full_body",
        "full looks": "full_body",
        "full look": "full_body",
    }.get(normalized, "auto")  # "auto" = let YouCam auto-detect, a real documented value


async def upload_image(content: bytes, content_type: str) -> str:
    file_name = f"upload_{int(time.time() * 1000)}.{_file_extension(content_type)}"

    async with httpx.AsyncClient(base_url=BASE_URL, headers=_headers(), timeout=30) as client:
        resp = await client.post(
            UPLOAD_ENDPOINT,
            json={
                "files": [
                    {
                        "content_type": content_type,
                        "file_name": file_name,
                        "file_size": len(content),
                    }
                ]
            },
        )
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"YouCam file upload failed ({resp.status_code}): {resp.text}",
                request=resp.request,
                response=resp,
            )
        body = resp.json()
        file_entry = body["data"]["files"][0]

    upload_request = file_entry["requests"][0]
    upload_url = upload_request["url"]
    upload_headers = {str(k): str(v) for k, v in (upload_request.get("headers") or {}).items()}
    upload_headers.setdefault("Content-Type", content_type)

    async with httpx.AsyncClient(timeout=30) as client:
        put_resp = await client.put(upload_url, content=content, headers=upload_headers)
        put_resp.raise_for_status()

    return file_entry["file_id"]


async def start_tryon_task(person_file_id: str, garment_file_id: str, garment_category: str) -> str:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=_headers(), timeout=30) as client:
        resp = await client.post(
            TASK_ENDPOINT,
            json={
                "src_file_id": person_file_id,
                "ref_file_id": garment_file_id,
                "garment_category": _map_garment_category(garment_category),
            },
        )
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"YouCam task create failed ({resp.status_code}): {resp.text}",
                request=resp.request,
                response=resp,
            )
        return resp.json()["data"]["task_id"]


async def poll_tryon_task(task_id: str) -> dict:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=_headers(), timeout=30) as client:
        resp = await client.get(f"{TASK_ENDPOINT}/{task_id}")
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"YouCam task poll failed ({resp.status_code}): {resp.text}",
                request=resp.request,
                response=resp,
            )
        return resp.json()["data"]  # {"error":..., "results":{"url":...}, "task_status":...}


async def wait_for_result(task_id: str, interval_s: float = 2.0, timeout_s: float = 90.0) -> dict:
    start = time.monotonic()
    while time.monotonic() - start < timeout_s:
        result = await poll_tryon_task(task_id)
        if result.get("task_status") in ("success", "error"):
            return result
        await asyncio.sleep(interval_s)
    raise TimeoutError(f"Task {task_id} timed out after {timeout_s}s")


# ============================================================================
# Bag Virtual Try-On — ADDED WITHOUT AN OFFICIAL REFERENCE DOC.
#
# Unlike everything above (verified against docs.perfectcorp.com/reference/
# ai_shoes/v2.0 and a working third-party implementation), I could not find
# or fetch an authoritative docs.perfectcorp.com/reference/ai_bag page for
# this. This is a best-effort implementation modeled on the *confirmed*
# shoes API contract (docs.perfectcorp.com/reference/ai_shoes/v2.0), since
# Perfect Corp's own marketing page says the bag API "integrates seamlessly"
# the same way and a third-party integration blog independently describes
# bags as needing a "gender" field like shoes do — same file/task/poll
# shape as cloth and shoes, just a different FEATURE slug and payload.
#
# THIS IS UNVERIFIED. If task creation 400s, the two most likely culprits
# are: (1) the feature slug isn't "bag", or (2) the payload needs a "style"
# field the way shoes does (shoes supports style_minimalist / style_bohemian
# / style_cottagecore / style_french_elegance / style_retro_fashion — bags
# may use the same five, since the bag product page also advertises "four
# preset styles" for scene generation, which doesn't quite match). Check the
# response body's error message against your API console's live docs before
# guessing further — don't just retry with a different guessed slug.
# ============================================================================

BAG_FEATURE = "bag"
BAG_UPLOAD_ENDPOINT = f"/s2s/v2.0/file/{BAG_FEATURE}"
BAG_TASK_ENDPOINT = f"/s2s/v2.0/task/{BAG_FEATURE}"


async def upload_bag_image(content: bytes, content_type: str) -> str:
    file_name = f"upload_{int(time.time() * 1000)}.{_file_extension(content_type)}"

    async with httpx.AsyncClient(base_url=BASE_URL, headers=_headers(), timeout=30) as client:
        resp = await client.post(
            BAG_UPLOAD_ENDPOINT,
            json={
                "files": [
                    {
                        "content_type": content_type,
                        "file_name": file_name,
                        "file_size": len(content),
                    }
                ]
            },
        )
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"YouCam bag file upload failed ({resp.status_code}): {resp.text}",
                request=resp.request,
                response=resp,
            )
        body = resp.json()
        file_entry = body["data"]["files"][0]

    upload_request = file_entry["requests"][0]
    upload_url = upload_request["url"]
    upload_headers = {str(k): str(v) for k, v in (upload_request.get("headers") or {}).items()}
    upload_headers.setdefault("Content-Type", content_type)

    async with httpx.AsyncClient(timeout=30) as client:
        put_resp = await client.put(upload_url, content=content, headers=upload_headers)
        put_resp.raise_for_status()

    return file_entry["file_id"]


def _map_gender(gender: str | None) -> str:
    normalized = (gender or "").strip().lower()
    return {"women": "female", "men": "male"}.get(normalized, "female")


async def start_bag_tryon_task(person_file_id: str, bag_file_id: str, gender: str | None) -> str:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=_headers(), timeout=30) as client:
        resp = await client.post(
            BAG_TASK_ENDPOINT,
            json={
                "src_file_id": person_file_id,
                "ref_file_id": bag_file_id,
                "gender": _map_gender(gender),
            },
        )
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"YouCam bag task create failed ({resp.status_code}): {resp.text}",
                request=resp.request,
                response=resp,
            )
        return resp.json()["data"]["task_id"]


async def poll_bag_tryon_task(task_id: str) -> dict:
    async with httpx.AsyncClient(base_url=BASE_URL, headers=_headers(), timeout=30) as client:
        resp = await client.get(f"{BAG_TASK_ENDPOINT}/{task_id}")
        if resp.status_code >= 400:
            raise httpx.HTTPStatusError(
                f"YouCam bag task poll failed ({resp.status_code}): {resp.text}",
                request=resp.request,
                response=resp,
            )
        return resp.json()["data"]


async def wait_for_bag_result(task_id: str, interval_s: float = 2.0, timeout_s: float = 90.0) -> dict:
    start = time.monotonic()
    while time.monotonic() - start < timeout_s:
        result = await poll_bag_tryon_task(task_id)
        if result.get("task_status") in ("success", "error"):
            return result
        await asyncio.sleep(interval_s)
    raise TimeoutError(f"Bag task {task_id} timed out after {timeout_s}s")
