"""Dataset management endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import DatasetMeta
router = APIRouter()

@router.get("")
async def list_datasets(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(DatasetMeta).order_by(DatasetMeta.created_at.desc()))
    ds = r.scalars().all()
    return {"datasets": [{"name":d.name,"source":d.source,"samples":d.total_samples,"status":d.status} for d in ds]}
