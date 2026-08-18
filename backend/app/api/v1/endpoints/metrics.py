"""SOC Metrics endpoints"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.database import get_db

router = APIRouter()

@router.get("")
async def get_metrics(db: AsyncSession = Depends(get_db)):
    r = await db.execute(text("""
        SELECT COUNT(*) AS total_alerts,
            COUNT(*) FILTER (WHERE severity='critical') AS critical_alerts,
            COUNT(*) FILTER (WHERE severity='high') AS high_alerts,
            COUNT(*) FILTER (WHERE severity='medium') AS medium_alerts,
            COUNT(*) FILTER (WHERE severity='low') AS low_alerts,
            COUNT(*) FILTER (WHERE status='new') AS new_alerts,
            COUNT(*) FILTER (WHERE status='acknowledged') AS ack_alerts,
            COUNT(*) FILTER (WHERE status='closed') AS closed_alerts,
            COUNT(*) FILTER (WHERE false_positive=TRUE) AS false_positives
        FROM alerts WHERE ts >= NOW() - INTERVAL '24 hours'
    """))
    row = r.mappings().first()
    return {"kpis": dict(row) if row else {}, "period": "24h"}

@router.get("/timeline")
async def get_timeline(hours: int = 24, db: AsyncSession = Depends(get_db)):
    r = await db.execute(text(f"""
        SELECT date_trunc('hour', ts) AS hour, severity, COUNT(*) AS count
        FROM alerts WHERE ts >= NOW() - INTERVAL '{hours} hours'
        GROUP BY 1, 2 ORDER BY 1
    """))
    return {"timeline": [dict(row) for row in r.mappings().all()]}

@router.get("/distribution")
async def get_distribution(db: AsyncSession = Depends(get_db)):
    sev = await db.execute(text("SELECT severity, COUNT(*) AS count FROM alerts WHERE ts >= NOW()-INTERVAL '24h' GROUP BY severity"))
    typ = await db.execute(text("SELECT alert_type, COUNT(*) AS count FROM alerts WHERE ts >= NOW()-INTERVAL '24h' GROUP BY alert_type ORDER BY count DESC"))
    vlan = await db.execute(text("SELECT vlan_id, COUNT(*) AS count FROM alerts WHERE ts >= NOW()-INTERVAL '24h' GROUP BY vlan_id ORDER BY count DESC"))
    return {"by_severity": [dict(r) for r in sev.mappings()], "by_type": [dict(r) for r in typ.mappings()], "by_vlan": [dict(r) for r in vlan.mappings()]}
