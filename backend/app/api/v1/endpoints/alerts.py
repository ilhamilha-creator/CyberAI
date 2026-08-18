"""Alerts CRUD endpoints"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from app.core.database import get_db
from app.models.models import Alert

router = APIRouter()

@router.get("")
async def get_alerts(
    severity: Optional[str] = None, status: Optional[str] = None,
    vlan: Optional[int] = None, attack_type: Optional[str] = None,
    hours: int = 24, limit: int = 50, offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    q = select(Alert).where(Alert.ts >= text(f"NOW() - INTERVAL '{hours} hours'"))
    count_q = select(func.count(Alert.id)).where(Alert.ts >= text(f"NOW() - INTERVAL '{hours} hours'"))
    if severity:
        q = q.where(Alert.severity == severity)
        count_q = count_q.where(Alert.severity == severity)
    if status:
        q = q.where(Alert.status == status)
        count_q = count_q.where(Alert.status == status)
    if vlan:
        q = q.where(Alert.vlan_id == vlan)
        count_q = count_q.where(Alert.vlan_id == vlan)
    if attack_type:
        q = q.where(Alert.alert_type == attack_type)
        count_q = count_q.where(Alert.alert_type == attack_type)

    total = (await db.execute(count_q)).scalar() or 0
    result = await db.execute(q.order_by(Alert.ts.desc()).limit(limit).offset(offset))
    alerts = result.scalars().all()
    return {"alerts": [_serialize(a) for a in alerts], "total": total, "limit": limit, "offset": offset}

@router.put("/{alert_id}/status")
async def update_alert_status(alert_id: str, body: dict, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import update
    from datetime import datetime, timezone
    new_status = body.get("status", "acknowledged")
    values = {"status": new_status, "updated_at": datetime.now(timezone.utc)}
    if new_status == "closed":
        values["resolved_at"] = datetime.now(timezone.utc)
    if body.get("false_positive"):
        values["false_positive"] = True
    await db.execute(update(Alert).where(Alert.id == alert_id).values(**values))
    await db.commit()
    return {"id": alert_id, "status": new_status}

def _serialize(a):
    return {c.name: (str(v) if hasattr(v, 'isoformat') or hasattr(v, 'hex') else v) for c, v in zip(a.__table__.columns, [getattr(a, c.name) for c in a.__table__.columns])}
