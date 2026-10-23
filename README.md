# VulnScan Lite

VulnScan Lite is a lightweight website security scanning application built with a React frontend and a Python FastAPI backend.

## Features

- Website security header checks
- SSL/TLS certificate and connection checks
- Passive technology detection
- Background scanning using Celery and Redis
- Scan history and saved scan reports
- JSON scan results

## Requirements

- Python
- Node.js and npm
- Redis server

## Backend Setup

1. Create and activate a Python virtual environment.
2. Install the Python dependencies:

   `pip install -r requirements.txt`

3. Configure the Redis connection using the project's existing configuration.
4. Start the FastAPI backend from the project root:

   `.venv\Scripts\python.exe -m uvicorn main:app --reload`

5. Start the Celery worker in a separate terminal from the project root:

   `.venv\Scripts\python.exe -m celery -A worker:app worker --pool=solo --loglevel=info`

## Frontend Setup

1. Open a terminal in the `frontend` directory.
2. Install dependencies:

   `npm install`

3. Start the frontend using:

   `npm run dev`

## Important Notes

- Start Redis before running background scans.
- Keep the backend, frontend, and Celery worker running when testing scans.
- Configure the frontend API URL to match the backend address.
- Do not include passwords, API keys, or other secrets in a shared ZIP.
- Do not include the local virtual environment or `node_modules` in the ZIP.
- The exact startup commands and environment settings should be verified against the project configuration before deployment.

## Project Status

This project is intended for educational and authorized website security testing.
