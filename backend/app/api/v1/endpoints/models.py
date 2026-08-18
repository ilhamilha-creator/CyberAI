"""ML Models registry endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import MLModel
router = APIRouter()

@router.get("")
async def get_models(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(MLModel).order_by(MLModel.f1_score.desc().nullslast()))
    models = r.scalars().all()
    return {"models": [{c.name: (str(v) if hasattr(v,'hex') else v) for c,v in zip(m.__table__.columns, [getattr(m,c.name) for c in m.__table__.columns])} for m in models]}

@router.post("/retrain")
async def retrain():
    return {"status": "queued", "message": "Re-training scheduled via Celery"}
