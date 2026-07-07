import json
from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.alert import Alert, AlertType
from app.models.camera import Camera, CameraStatus

router = APIRouter()


def _parse_date(value: Optional[str], default: datetime) -> datetime:
    if not value:
        return default
    return datetime.strptime(value, "%Y-%m-%d")


def _seconds_between(start: Optional[datetime], end: Optional[datetime]) -> Optional[float]:
    if not start or not end:
        return None
    return max(0.0, (end - start).total_seconds())


def _avg(values: list[float]) -> Optional[float]:
    return sum(values) / len(values) if values else None


def _camera_rules(camera: Camera) -> set[str]:
    rules: set[str] = set()
    caps = camera.ai_capabilities or {}
    if isinstance(caps, dict):
        for key, enabled in caps.items():
            if enabled:
                rules.add(str(key))

    if camera.intrusion_zones:
        try:
            zones = json.loads(camera.intrusion_zones)
            for zone in zones:
                if isinstance(zone, dict):
                    z_type = str(zone.get("type") or zone.get("zone_type") or "").lower()
                    if z_type:
                        rules.add(z_type)
                    for rule in zone.get("enabled_rules") or zone.get("rules") or []:
                        rules.add(str(rule))
                else:
                    rules.add("unauthorized_access")
        except Exception:
            rules.add("unauthorized_access")
    return rules


@router.get("/security")
async def get_security_kpis(
    from_date: Optional[str] = Query(None, alias="from"),
    to_date: Optional[str] = Query(None, alias="to"),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Phase-1 measurable security KPIs.

    Some business KPIs are naturally estimated unless the customer integrates a
    guard-tour/helpdesk system. We expose the formula inputs so the number is
    transparent, not magic.
    """
    now = datetime.utcnow()
    start = _parse_date(from_date, now - timedelta(days=7))
    end = _parse_date(to_date, now) + timedelta(days=1)

    alerts_res = await db.execute(
        select(Alert).where(Alert.created_at >= start, Alert.created_at < end)
    )
    alerts = alerts_res.scalars().all()
    incident_alerts = [a for a in alerts if a.type != AlertType.MATCH]
    true_incidents = [a for a in incident_alerts if not a.false_positive]
    false_positive_count = sum(1 for a in incident_alerts if a.false_positive)

    response_times = [
        s
        for s in (_seconds_between(a.created_at, a.acknowledged_at) for a in true_incidents)
        if s is not None
    ]
    investigation_times = [
        s
        for s in (_seconds_between(a.created_at, a.resolved_at) for a in true_incidents)
        if s is not None
    ]

    unauthorized = [
        a
        for a in true_incidents
        if a.type in (AlertType.UNAUTHORIZED_ACCESS, AlertType.INTRUSION)
    ]
    prevented = sum(1 for a in unauthorized if a.acknowledged or a.resolved_at is not None)

    camera_res = await db.execute(select(Camera))
    cameras = camera_res.scalars().all()
    active_cameras = [c for c in cameras if c.status == CameraStatus.ACTIVE]
    total_cameras = len(cameras)

    # Uptime approximation from current status plus offline alert durations
    window_seconds = max(1.0, (end - start).total_seconds())
    offline_seconds_by_camera: dict[str, float] = {}
    for alert in incident_alerts:
        if alert.type != AlertType.CAMERA_OFFLINE:
            continue
        offline_end = alert.resolved_at or min(now, end)
        overlap_start = max(alert.created_at, start)
        overlap_end = min(offline_end, end)
        duration = _seconds_between(overlap_start, overlap_end) or 0.0
        offline_seconds_by_camera[alert.camera_id] = offline_seconds_by_camera.get(alert.camera_id, 0.0) + duration

    if total_cameras:
        uptime_values = [
            max(0.0, 1.0 - (offline_seconds_by_camera.get(c.id, 0.0) / window_seconds))
            for c in cameras
        ]
        cctv_uptime_percent = round((_avg(uptime_values) or 0.0) * 100, 2)
    else:
        cctv_uptime_percent = 0.0

    coverage_rules: dict[str, int] = {
        "camera_offline": 0,
        "camera_obstruction": 0,
        "unauthorized_access": 0,
        "loitering": 0,
        "crowd_detected": 0,
        "door_left_open": 0,
    }
    for camera in cameras:
        rules = _camera_rules(camera)
        # These two are default-on unless explicitly disabled.
        caps = camera.ai_capabilities if isinstance(camera.ai_capabilities, dict) else {}
        if caps.get("camera_offline", True):
            coverage_rules["camera_offline"] += 1
        if caps.get("camera_obstruction", True):
            coverage_rules["camera_obstruction"] += 1
        if "restricted_area" in rules or "intrusion" in rules or "unauthorized_access" in rules:
            coverage_rules["unauthorized_access"] += 1
        if "loitering_area" in rules or "loitering" in rules:
            coverage_rules["loitering"] += 1
        if "crowd_area" in rules or "crowd_detected" in rules or "crowd_detection" in rules:
            coverage_rules["crowd_detected"] += 1
        if "door_area" in rules or "door_left_open" in rules:
            coverage_rules["door_left_open"] += 1

    auto_detected = len(true_incidents)
    manual_review_minutes_saved = auto_detected * 5
    baseline_investigation_seconds = 15 * 60
    avg_investigation = _avg(investigation_times)
    investigation_reduction_percent = None
    if avg_investigation is not None:
        investigation_reduction_percent = round(
            max(0.0, (baseline_investigation_seconds - avg_investigation) / baseline_investigation_seconds) * 100,
            2,
        )

    return {
        "range": {"from": start.isoformat(), "to": (end - timedelta(seconds=1)).isoformat()},
        "incident_detected_ai": auto_detected,
        "response_time_security": {
            "avg_seconds": round(_avg(response_times), 2) if response_times else None,
            "sample_size": len(response_times),
        },
        "unauthorized_access_prevented": prevented,
        "cctv_uptime": {
            "percent": cctv_uptime_percent,
            "online_cameras": len(active_cameras),
            "total_cameras": total_cameras,
        },
        "area_coverage_ai": {
            "total_cameras": total_cameras,
            "active_cameras": len(active_cameras),
            "rules": coverage_rules,
        },
        "false_positive_rate": {
            "percent": round((false_positive_count / len(incident_alerts) * 100), 2) if incident_alerts else 0.0,
            "false_positive": false_positive_count,
            "total_incidents": len(incident_alerts),
        },
        "security_workload_reduction": {
            "estimated_minutes_saved": manual_review_minutes_saved,
            "formula": "true_ai_incidents * 5 manual review minutes",
        },
        "incident_investigation_time_reduction": {
            "percent": investigation_reduction_percent,
            "avg_seconds": round(avg_investigation, 2) if avg_investigation is not None else None,
            "baseline_seconds": baseline_investigation_seconds,
        },
        "by_type": {
            (a.type.value if hasattr(a.type, "value") else str(a.type)): sum(
                1 for item in true_incidents if item.type == a.type
            )
            for a in true_incidents
        },
    }
