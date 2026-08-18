"""CyberAI-Expert v8.0"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, alerts, metrics, models, threats, llm, admin, ml_ops, killchain, advanced_ai, agent_memory

router = APIRouter()

# Include sub-routers
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
router.include_router(llm.router, prefix="/llm", tags=["llm", "ai", "chat"])
router.include_router(advanced_ai.router, tags=["advanced-ai", "training", "knowledge"])
router.include_router(agent_memory.router, prefix="/agent-memory", tags=["agent-memory", "cockroachdb", "vector-indexing"])
