"""Threat analysis endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db
router = APIRouter()

@router.get("")
async def get_threats(db: AsyncSession = Depends(get_db)):
    ips = await db.execute(text("""SELECT src_ip, COUNT(*) AS alert_count, array_agg(DISTINCT alert_type) AS attack_types,
        MAX(confidence) AS max_confidence FROM alerts WHERE ts >= NOW()-INTERVAL '24h' GROUP BY src_ip ORDER BY alert_count DESC LIMIT 20"""))
    return {"top_ips": [dict(r) for r in ips.mappings()]}

@router.post("/block-ip")
async def block_ip(body: dict, user: dict = Depends(__import__('app.core.security', fromlist=['require_admin']).require_admin)):
    from app.core.database import async_session
    from app.models.models import IPBlocklist
    async with async_session() as db:
        db.add(IPBlocklist(ip_address=body["ip"], reason=body.get("reason",""), blocked_by=user["sub"]))
        await db.commit()
    return {"status": "blocked", "ip": body["ip"]}
