"""ML training async tasks"""
from app.tasks.celery_app import celery_app
import logging
logger = logging.getLogger("cyberai.tasks.ml")

@celery_app.task(name="app.tasks.ml_tasks.retrain_all", queue="ml")
def retrain_all():
    logger.info("Starting ML retrain pipeline")
    try:
        import sys; sys.path.insert(0, "/app")
        from engine.models.classical.train_classical import ClassicalTrainer
        trainer = ClassicalTrainer()
        results = trainer.run_full_pipeline(use_synthetic=True)
        return {"status": "completed", "models": len(results)}
    except Exception as e:
        logger.error("Retrain failed: %s", e)
        return {"status": "error", "error": str(e)}
