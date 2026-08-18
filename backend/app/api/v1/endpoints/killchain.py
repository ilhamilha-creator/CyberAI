"""Kill Chain analysis"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
router = APIRouter()

@router.get("")
async def get_kill_chain(db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("""SELECT session_id, threat_actor, kill_chain_phase, MIN(ts) AS started, MAX(ts) AS last_seen,
        COUNT(*) AS event_count, array_agg(DISTINCT vlan_id) AS target_vlans
        FROM alerts WHERE session_id IS NOT NULL AND session_id!='' AND ts >= NOW()-INTERVAL '24h'
        GROUP BY session_id, threat_actor, kill_chain_phase ORDER BY last_seen DESC LIMIT 50"""))
    return {"sessions": [dict(row) for row in r.mappings()]}
