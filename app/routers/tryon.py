import logging
import secrets

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..images import resolve_image
from ..youcam_client import (
    start_tryon_task,
    upload_image,
    wait_for_result,
    start_bag_tryon_task,
    upload_bag_image,
    wait_for_bag_result,
)
from .. import jobs

log = logging.getLogger("tryon")
router = APIRouter(prefix="/api", tags=["tryon"])


# Mirrors src/types/tryOn.ts TryOnRequestPayload exactly.
class TryOnRequest(BaseModel):
    userImage: str
    garmentImage: str
    garmentCategory: str
    gender: str | None = None


@router.post("/try-on")
async def create_try_on(payload: TryOnRequest):
    job_id = f"job_{secrets.token_urlsafe(9)}"
    jobs.create(job_id)

    # Fire-and-forget: the frontend polls GET /api/try-on/:jobId for the
    # result, it does not wait on this request (see services/index.ts ->
    # pollTryOnJob). Kick off generation in the background and return
    # immediately, matching the mock's behavior.
    import asyncio

    asyncio.create_task(_run_generation(job_id, payload))

    return {"jobId": job_id, "status": "processing"}


@router.get("/try-on/{job_id}")
async def get_try_on_status(job_id: str):
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(404, "job not found")
    return {"jobId": job_id, **job}


async def _run_generation(job_id: str, payload: TryOnRequest) -> None:
    try:
        person_bytes, person_ct = await resolve_image(payload.userImage)
        garment_bytes, garment_ct = await resolve_image(payload.garmentImage)

        if payload.garmentCategory == "Bags":
            # See the "Bag Virtual Try-On" block in youcam_client.py —
            # unverified against official docs, best-effort based on the
            # confirmed shoes API contract.
            person_file_id = await upload_bag_image(person_bytes, person_ct)
            bag_file_id = await upload_bag_image(garment_bytes, garment_ct)
            task_id = await start_bag_tryon_task(person_file_id, bag_file_id, payload.gender)
            result = await wait_for_bag_result(task_id)
        else:
            person_file_id = await upload_image(person_bytes, person_ct)
            garment_file_id = await upload_image(garment_bytes, garment_ct)
            task_id = await start_tryon_task(person_file_id, garment_file_id, payload.garmentCategory)
            result = await wait_for_result(task_id)

        result_url = result.get("url")
        if not result_url and isinstance(result.get("results"), dict):
            result_url = result["results"].get("url")

        task_status = result.get("task_status") or result.get("status")
        if task_status == "success" and result_url:
            jobs.set_completed(job_id, result_url)
        else:
            jobs.set_failed(job_id, "YouCam couldn't generate this look. Please try again.")

    except Exception:
        log.exception("try-on generation failed for job %s", job_id)
        jobs.set_failed(job_id, "We couldn't create your look this time. Please try again.")
