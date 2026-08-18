"""VLAN risk analysis"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
router = APIRouter()

@router.get("")
async def get_vlans(db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("""SELECT vlan_id, COUNT(*) AS total_alerts,
        COUNT(*) FILTER(WHERE severity='critical')*4 + COUNT(*) FILTER(WHERE severity='high')*3 +
        COUNT(*) FILTER(WHERE severity='medium')*2 + COUNT(*) FILTER(WHERE severity='low') AS risk_score
        FROM alerts WHERE ts >= NOW()-INTERVAL '24h' GROUP BY vlan_id ORDER BY risk_score DESC"""))
    return {"vlans": [dict(row) for row in r.mappings()]}
