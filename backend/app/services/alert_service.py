import logging
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert, AlertSeverity, AlertType
from app.utils.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


def _enum_value(value: Any) -> str:
    return value.value if hasattr(value, "value") else str(value)


async def create_or_update_active_alert(
    db: AsyncSession,
    *,
    alert_type: AlertType,
    severity: AlertSeverity,
    title: str,
    description: str,
    camera_id: str,
    dedupe_key: Optional[str] = None,
    person_id: Optional[str] = None,
    face_id: Optional[str] = None,
    image_data: Optional[bytes] = None,
    metadata: Optional[dict[str, Any]] = None,
    notify: bool = True,
    camera_name: Optional[str] = None,
) -> Alert:
    """Create one active alert per camera/type/dedupe key, or refresh it.

    Phase-1 detectors can run every few frames. This helper prevents alert
    storms while preserving KPI fields (`first_seen_at`, `last_seen_at`).
    """
    now = datetime.utcnow()
    metadata = dict(metadata or {})
    if dedupe_key:
        metadata.setdefault("dedupe_key", dedupe_key)

    stmt = select(Alert).where(
        Alert.camera_id == camera_id,
        Alert.type == alert_type,
        Alert.resolved_at.is_(None),
        Alert.false_positive == False,
    )
    if dedupe_key:
        # JSON key lookup works on PostgreSQL and SQLite JSON1 in modern builds.
        # If a dialect cannot optimize this, the filtered active set is tiny.
        stmt = stmt.where(Alert.metadata_json["dedupe_key"].as_string() == dedupe_key)

    res = await db.execute(stmt.order_by(Alert.created_at.desc()))
    alert = res.scalars().first()

    is_new = alert is None
    if is_new:
        alert = Alert(
            id=str(uuid.uuid4()),
            type=alert_type,
            severity=severity,
            title=title,
            description=description,
            camera_id=camera_id,
            person_id=person_id,
            face_id=face_id,
            acknowledged=False,
            first_seen_at=now,
            last_seen_at=now,
            false_positive=False,
            image_data=image_data,
            metadata_json=metadata,
        )
        db.add(alert)
    else:
        alert.title = title
        alert.description = description
        alert.severity = severity
        alert.last_seen_at = now
        alert.metadata_json = {**(alert.metadata_json or {}), **metadata}
        if image_data:
            alert.image_data = image_data

    await db.commit()
    await db.refresh(alert)

    if is_new:
        await ws_manager.broadcast(
            {
                "type": "new_alert",
                "data": serialize_alert(alert),
            }
        )
        if notify:
            try:
                from app.services.waha_service import send_alert_notification

                import asyncio

                asyncio.create_task(
                    send_alert_notification(
                        alert_id=alert.id,
                        alert_title=alert.title,
                        alert_description=alert.description,
                        severity=_enum_value(alert.severity),
                        alert_type=_enum_value(alert.type),
                        camera_name=camera_name or camera_id,
                        timestamp=now,
                        face_image_bytes=image_data,
                    )
                )
            except Exception as notify_err:
                logger.error("Failed to queue alert notification %s: %s", alert.id, notify_err)
    else:
        await ws_manager.broadcast(
            {
                "type": "updated_alert",
                "data": serialize_alert(alert),
            }
        )

    return alert


async def resolve_active_alerts(
    db: AsyncSession,
    *,
    alert_type: AlertType,
    camera_id: str,
    dedupe_key: Optional[str] = None,
    note: Optional[str] = None,
) -> int:
    now = datetime.utcnow()
    stmt = select(Alert).where(
        Alert.camera_id == camera_id,
        Alert.type == alert_type,
        Alert.resolved_at.is_(None),
    )
    if dedupe_key:
        stmt = stmt.where(Alert.metadata_json["dedupe_key"].as_string() == dedupe_key)

    res = await db.execute(stmt)
    alerts = res.scalars().all()
    for alert in alerts:
        alert.resolved_at = now
        alert.resolution_note = note or alert.resolution_note
        alert.last_seen_at = now
        await ws_manager.broadcast(
            {
                "type": "updated_alert",
                "data": serialize_alert(alert),
            }
        )
    if alerts:
        await db.commit()
    return len(alerts)


def serialize_alert(alert: Alert) -> dict[str, Any]:
    return {
        "id": alert.id,
        "type": _enum_value(alert.type),
        "severity": _enum_value(alert.severity),
        "title": alert.title,
        "description": alert.description,
        "camera_id": alert.camera_id,
        "person_id": alert.person_id,
        "face_id": alert.face_id,
        "acknowledged": bool(alert.acknowledged),
        "first_seen_at": alert.first_seen_at.isoformat() if alert.first_seen_at else None,
        "last_seen_at": alert.last_seen_at.isoformat() if alert.last_seen_at else None,
        "acknowledged_at": alert.acknowledged_at.isoformat() if alert.acknowledged_at else None,
        "resolved_at": alert.resolved_at.isoformat() if alert.resolved_at else None,
        "false_positive": bool(alert.false_positive),
        "resolution_note": alert.resolution_note,
        "metadata": alert.metadata_json or {},
        "has_image": alert.has_image,
        "created_at": alert.created_at.isoformat() if alert.created_at else None,
        "updated_at": alert.updated_at.isoformat() if alert.updated_at else None,
    }
