"""
In-memory job store. Good enough for a hackathon demo (single process,
jobs live a few seconds to a couple minutes). If you need jobs to survive
a server restart, swap this dict for SQLite the same way the FastAPI
booth-dashboard project did — the shape stored here already matches what
you'd put in a table.
"""

from typing import Literal, Optional, TypedDict


class Job(TypedDict, total=False):
    status: Literal["processing", "completed", "failed"]
    resultImage: Optional[str]
    error: Optional[str]


_jobs: dict[str, Job] = {}


def create(job_id: str) -> None:
    _jobs[job_id] = {"status": "processing"}


def set_completed(job_id: str, result_image: str) -> None:
    _jobs[job_id] = {"status": "completed", "resultImage": result_image}


def set_failed(job_id: str, error: str) -> None:
    _jobs[job_id] = {"status": "failed", "error": error}


def get(job_id: str) -> Optional[Job]:
    return _jobs.get(job_id)
