from __future__ import annotations

from typing import Any

from app.models.camera import Camera


DEFAULT_AI_CAPABILITIES: dict[str, bool] = {
    # Lightweight health checks. Keep these on for most cameras.
    "camera_offline": True,
    "camera_obstruction": True,
    # Heavy AI analytics. Enable only on high-value cameras/zones.
    "face_recognition": False,
    "unknown_person": False,
    "unauthorized_access": False,
    "loitering": False,
    "crowd_detected": False,
    "door_left_open": False,
}


def normalize_ai_capabilities(raw: Any = None) -> dict[str, bool]:
    caps = dict(DEFAULT_AI_CAPABILITIES)
    if isinstance(raw, dict):
        for key in caps:
            if key in raw:
                caps[key] = bool(raw[key])
    return caps


def camera_capability_enabled(camera: Camera, key: str, default: bool | None = None) -> bool:
    caps = normalize_ai_capabilities(camera.ai_capabilities)
    if default is not None and key not in (camera.ai_capabilities or {}):
        return default
    return bool(caps.get(key, False))


def camera_has_any_capability(camera: Camera, keys: set[str] | list[str] | tuple[str, ...]) -> bool:
    return any(camera_capability_enabled(camera, key) for key in keys)
