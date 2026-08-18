"""Celery application for async tasks"""
from celery import Celery
from celery.schedules import crontab
import os

celery_app = Celery("cyberai",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/1"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/2"))

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_routes={"app.tasks.ml_tasks.*": {"queue": "ml"}, "app.tasks.bigdata_tasks.*": {"queue": "bigdata"}},
    beat_schedule={
        "retrain-models": {"task": "app.tasks.ml_tasks.retrain_all", "schedule": crontab(hour="*/6")},
        "process-bigdata": {"task": "app.tasks.bigdata_tasks.run_batch", "schedule": crontab(minute="*/30")},
    },
)

celery_app.autodiscover_tasks(["app.tasks"])
