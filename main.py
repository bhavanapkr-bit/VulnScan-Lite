
import ipaddress
import json
import socket
from urllib.parse import urlparse

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from fastapi.middleware.cors import CORSMiddleware

from database import init_db, save_scan, get_connection, get_scan_history
from tasks import run_scan


app = FastAPI(
    title="VulnScan Lite API",
    description="Passive security checks for authorized websites.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScanRequest(BaseModel):
    url: HttpUrl


@app.on_event("startup")
def startup():
    init_db()


def validate_target(url: str):
    """Reject malformed URLs and hosts resolving to non-public IPs."""
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        raise ValueError("Enter a valid HTTP or HTTPS website URL.")

    if parsed.username or parsed.password:
        raise ValueError("URLs containing usernames or passwords are not allowed.")

    hostname = parsed.hostname.rstrip(".").lower()

    if hostname == "localhost" or hostname.endswith(".localhost"):
        raise ValueError("Localhost targets are not allowed.")

    try:
        addresses = {
            item[4][0]
            for item in socket.getaddrinfo(
                hostname, parsed.port or (443 if parsed.scheme == "https" else 80)
            )
        }
    except socket.gaierror as error:
        raise ValueError("The website hostname could not be resolved.") from error

    if not addresses:
        raise ValueError("The website hostname has no resolved IP addresses.")

    for address in addresses:
        ip = ipaddress.ip_address(address)
        if not ip.is_global:
            raise ValueError(
                "Private, local, and non-public IP addresses are not allowed."
            )


@app.get("/")
def home():
    return {
        "message": "VulnScan Lite API is running",
        "disclaimer": (
            "Only scan websites you own. "
            "This tool performs passive analysis only."
        ),
    }


@app.post("/api/scan", status_code=202)
def start_scan(request: ScanRequest):
    url = str(request.url)

    try:
        validate_target(url)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    scan_id = save_scan(user_id=None, target_url=url, status="queued")

    try:
        run_scan.delay(scan_id, url)
    except Exception as error:
        from database import update_scan
        update_scan(scan_id, "failed")
        raise HTTPException(
            status_code=503,
            detail="Could not queue the scan. Check that Redis and Celery are running.",
        ) from error

    return {
        "scan_id": scan_id,
        "status": "queued",
        "status_url": f"/api/scan/{scan_id}/status",
        "message": "Scan queued successfully.",
    }


@app.get("/api/scan/{scan_id}/status")

def scan_status(scan_id: int):
    with get_connection() as connection:
        row = connection.execute(
            """SELECT id, target_url, status, results_json, created_at,
                      completed_at
               FROM scans WHERE id = ?""",
            (scan_id,),
        ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Scan not found.")

    scan = dict(row)
    results_json = scan.pop("results_json")

    return {
        **scan,
        "results": json.loads(results_json) if results_json else None,
    }

@app.get("/api/scans/history")
def scan_history():
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, target_url, status, created_at, completed_at
            FROM scans
            WHERE user_id IS NULL
            ORDER BY id DESC
            """
        ).fetchall()

    return {"scans": [dict(row) for row in rows]}
