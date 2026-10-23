
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "vulnscan.db"


def get_connection():
    """Create a connection to the SQLite database."""
    connection = sqlite3.connect(DATABASE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    """Create the tables needed for users and scan history."""
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS scans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                target_url TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'queued',
                results_json TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        connection.commit()


def save_scan(user_id, target_url, status="queued"):
    """Create a scan-history record and return its ID."""
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO scans (user_id, target_url, status)
            VALUES (?, ?, ?)
            """,
            (user_id, target_url, status),
        )
        connection.commit()
        return cursor.lastrowid


def update_scan(scan_id, status, results_json=None):
    """Update scan status and optionally store JSON results."""
    with get_connection() as connection:
        connection.execute(
            """
            UPDATE scans
            SET status = ?,
                results_json = ?,
                completed_at = CASE
                    WHEN ? IN ('completed', 'failed')
                    THEN CURRENT_TIMESTAMP
                    ELSE completed_at
                END
            WHERE id = ?
            """,
            (status, results_json, status, scan_id),
        )
        connection.commit()


def get_scan_history(user_id):
    """Return the latest scans belonging to one user."""
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, target_url, status, results_json,
                   created_at, completed_at
            FROM scans
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,),
        ).fetchall()

        return [dict(row) for row in rows]
