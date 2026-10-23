
from tasks import celery_app

# Celery uses this application to discover and execute background tasks.
app = celery_app
