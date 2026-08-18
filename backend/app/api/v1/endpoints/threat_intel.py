"""Threat Intelligence endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import ThreatIntel
router = APIRouter()

@router.get("")
async def get_threat_intel(db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(ThreatIntel).where(ThreatIntel.is_active==True).order_by(ThreatIntel.last_seen.desc()).limit(100))
    return {"iocs": [{"type":t.ioc_type,"value":t.ioc_value,"threat":t.threat_type,"confidence":t.confidence,"source":t.source} for t in r.scalars()]}
