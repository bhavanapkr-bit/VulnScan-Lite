

import os
from tasks import celery_app

# Check whether the worker receives the Redis setting.
redis_url = os.getenv("REDIS_URL", "").strip()
print(f"WORKER REDIS_URL present: {bool(redis_url)}")
print(f"WORKER REDIS_URL scheme: {redis_url.split('://', 1)[0] if '://' in redis_url else 'MISSING_OR_INVALID'}")

app = celery_app
