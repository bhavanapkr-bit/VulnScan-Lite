
import json
import os

from celery import Celery

from database import update_scan
from scanner.core import scan_website


REDIS_URL = os.getenv("REDIS_URL", "").strip()

if not REDIS_URL:
    raise RuntimeError("REDIS_URL is missing from the environment.")

celery_app = Celery(
    "vulnscan_lite",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    task_track_started=True,
    result_expires=3600,
)


@celery_app.task(name="vulnscan.run_scan")
def run_scan(scan_id: int, target_url: str):
    """Run a passive website scan as a background job."""
    update_scan(scan_id, "running")

    try:
        results = scan_website(target_url)

        update_scan(
            scan_id,
            "completed",
            json.dumps(results),
        )

        return {
            "scan_id": scan_id,
            "status": "completed",
            "results": results,
        }

    except Exception:
        update_scan(
            scan_id,
            "failed",
            json.dumps({"error": "The scan could not be completed."}),
        )
        raise
