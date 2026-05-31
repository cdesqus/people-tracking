"""
Waha WhatsApp HTTP API Service
Handles session management, QR/pairing auth, and sending alert notifications.
"""

import asyncio
import base64
import logging
from datetime import datetime
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

# In-memory cache for Waha config to avoid DB query on every alert
_config_cache: Optional[dict] = None
_config_cache_ttl: float = 0.0
_CONFIG_CACHE_SECONDS = 30


def _build_headers(api_key: Optional[str]) -> dict:
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["X-Api-Key"] = api_key
    return headers


async def _get_config() -> Optional[dict]:
    """Load WhatsApp config from DB (cached for 30 seconds)."""
    global _config_cache, _config_cache_ttl
    import time

    now = time.monotonic()
    if _config_cache is not None and now < _config_cache_ttl:
        return _config_cache

    try:
        from app.database import async_session
        from app.models.whatsapp_config import WhatsappConfig
        from sqlalchemy import select

        async with async_session() as session:
            res = await session.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
            cfg = res.scalar_one_or_none()
            if cfg:
                _config_cache = {
                    "waha_url": cfg.waha_url.rstrip("/"),
                    "api_key": cfg.waha_api_key,
                    "session": cfg.session_name,
                    "is_enabled": cfg.is_enabled,
                    "alert_severities": cfg.alert_severities or ["critical", "high"],
                }
                _config_cache_ttl = now + _CONFIG_CACHE_SECONDS
                return _config_cache
    except Exception as e:
        logger.error(f"[Waha] Failed to load config from DB: {e}")

    return None


def invalidate_config_cache():
    """Call this after config is updated via API."""
    global _config_cache, _config_cache_ttl
    _config_cache = None
    _config_cache_ttl = 0.0


async def get_session_status() -> dict:
    """Get current Waha session status."""
    cfg = await _get_config()
    if not cfg:
        return {"status": "config_missing", "error": "Waha config not found"}

    url = f"{cfg['waha_url']}/api/sessions/{cfg['session']}"
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, headers=_build_headers(cfg["api_key"]))
            return resp.json()
    except httpx.ConnectError:
        return {"status": "unreachable", "error": f"Cannot connect to Waha at {cfg['waha_url']}"}
    except Exception as e:
        logger.error(f"[Waha] get_session_status error: {e}")
        return {"status": "error", "error": str(e)}


async def start_session(waha_url: str, api_key: Optional[str], session_name: str) -> dict:
    """Start (or restart) a Waha session. Creates the session if it doesn't exist."""
    create_url = f"{waha_url.rstrip('/')}/api/sessions"
    headers = _build_headers(api_key)
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Try to create the session (which also starts it automatically)
            resp = await client.post(create_url, headers=headers, json={"name": session_name})
            
            if resp.status_code in (200, 201):
                return resp.json()
            
            # 2. If it already exists (409 Conflict), try to start it explicitly
            if resp.status_code == 409 or "exists" in resp.text.lower():
                start_url = f"{waha_url.rstrip('/')}/api/sessions/{session_name}/start"
                start_resp = await client.post(start_url, headers=headers, json={})
                return start_resp.json()
                
            return resp.json()
    except Exception as e:
        logger.error(f"[Waha] start_session error: {e}")
        return {"error": str(e)}


async def get_qr_code(waha_url: str, api_key: Optional[str], session_name: str) -> Optional[bytes]:
    """
    Fetch QR code image from Waha.
    Returns PNG image bytes or None on failure.
    """
    url = f"{waha_url.rstrip('/')}/api/{session_name}/auth/qr?format=image"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=_build_headers(api_key))
            if resp.status_code == 200:
                return resp.content
            logger.warning(f"[Waha] get_qr_code returned {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        logger.error(f"[Waha] get_qr_code error: {e}")
        return None


async def request_pairing_code(
    waha_url: str, api_key: Optional[str], session_name: str, phone_number: str
) -> dict:
    """
    Request a pairing code for phone-number-based auth.
    phone_number should be in international format without +, e.g. "628123456789"
    """
    url = f"{waha_url.rstrip('/')}/api/{session_name}/auth/request-code"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                headers=_build_headers(api_key),
                json={"phoneNumber": phone_number},
            )
            return resp.json()
    except Exception as e:
        logger.error(f"[Waha] request_pairing_code error: {e}")
        return {"error": str(e)}


async def logout_session(waha_url: str, api_key: Optional[str], session_name: str) -> dict:
    """Logout and completely delete the Waha session to reset its cache."""
    url = f"{waha_url.rstrip('/')}/api/sessions/{session_name}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.delete(url, headers=_build_headers(api_key))
            invalidate_config_cache()
            return resp.json()
    except Exception as e:
        logger.error(f"[Waha] logout_session error: {e}")
        return {"error": str(e)}


async def list_groups(waha_url: str, api_key: Optional[str], session_name: str) -> list:
    """Fetch all WhatsApp groups the connected account belongs to."""
    url = f"{waha_url.rstrip('/')}/api/{session_name}/groups"
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=_build_headers(api_key))
            if resp.status_code == 200:
                data = resp.json()
                # Normalize: return list of {id, name}
                groups = []
                for g in data:
                    groups.append({
                        "id": g.get("id", ""),
                        "name": g.get("name", g.get("subject", "Unknown Group")),
                    })
                return groups
            return []
    except Exception as e:
        logger.error(f"[Waha] list_groups error: {e}")
        return []


def _format_alert_caption(
    alert_title: str,
    alert_description: str,
    severity: str,
    alert_type: str,
    camera_name: str,
    timestamp: Optional[datetime] = None,
) -> str:
    """Build the formatted WhatsApp message caption for an alert."""
    severity_emoji = {
        "critical": "🔴",
        "high": "🟠",
        "medium": "🟡",
        "low": "🟢",
    }.get(severity.lower(), "⚪")

    type_label = {
        "unknown_face": "Unknown Face Detected",
        "match": "Face Matched",
        "suspicious_activity": "Suspicious Activity",
        "system_error": "System Error",
    }.get(alert_type.lower(), alert_type.replace("_", " ").title())

    ts = timestamp.strftime("%d/%m/%Y %H:%M:%S") if timestamp else datetime.utcnow().strftime("%d/%m/%Y %H:%M:%S")

    return (
        f"🚨 *SECURITY ALERT*\n"
        f"━━━━━━━━━━━━━━━━━\n"
        f"{severity_emoji} *Severity:* {severity.upper()}\n"
        f"📋 *Type:* {type_label}\n"
        f"📌 *Camera:* {camera_name}\n"
        f"🕐 *Time:* {ts}\n\n"
        f"📝 {alert_description}\n"
        f"━━━━━━━━━━━━━━━━━\n"
        f"_Powered by People Tracking System_"
    )


async def send_alert_notification(
    alert_id: str,
    alert_title: str,
    alert_description: str,
    severity: str,
    alert_type: str,
    camera_name: str,
    timestamp: Optional[datetime] = None,
    face_image_bytes: Optional[bytes] = None,
) -> None:
    """
    Send alert notification to all active WhatsApp recipients.
    Silently logs errors — never raises, never blocks the main flow.
    """
    try:
        logger.info(f"[Waha] >>> send_alert_notification CALLED for alert_id={alert_id}, severity={severity}, type={alert_type}")
        cfg = await _get_config()
        if not cfg:
            logger.warning("[Waha] No config found in DB, skipping WA notification")
            return

        logger.info(f"[Waha] Config loaded: enabled={cfg['is_enabled']}, url={cfg['waha_url']}, session={cfg['session']}, severities={cfg['alert_severities']}")

        if not cfg["is_enabled"]:
            logger.warning("[Waha] Notifications DISABLED (is_enabled=False), skipping")
            return

        # Check if this severity is enabled
        allowed_severities = [s.lower() for s in (cfg["alert_severities"] or [])]
        if severity.lower() not in allowed_severities:
            logger.warning(f"[Waha] Severity '{severity}' NOT in allowed list {allowed_severities}, skipping")
            return

        # Load active recipients
        from app.database import async_session
        from app.models.whatsapp_recipient import WhatsappRecipient
        from sqlalchemy import select

        async with async_session() as session:
            res = await session.execute(
                select(WhatsappRecipient).where(WhatsappRecipient.is_active == True)
            )
            recipients = res.scalars().all()

        if not recipients:
            logger.warning("[Waha] No active recipients found (is_active=True), skipping")
            return

        logger.info(f"[Waha] Sending to {len(recipients)} recipient(s): {[r.label for r in recipients]}")

        caption = _format_alert_caption(
            alert_title, alert_description, severity, alert_type, camera_name, timestamp
        )

        waha_url = cfg["waha_url"]
        api_key = cfg["api_key"]
        session_name = cfg["session"]

        async with httpx.AsyncClient(timeout=20.0) as client:
            for recipient in recipients:
                try:
                    if face_image_bytes:
                        # Send image with caption
                        b64_image = base64.b64encode(face_image_bytes).decode("utf-8")
                        payload = {
                            "session": session_name,
                            "chatId": recipient.chat_id,
                            "file": {
                                "mimetype": "image/jpeg",
                                "data": b64_image,
                                "filename": f"alert_{alert_id}.jpg",
                            },
                            "caption": caption,
                        }
                        endpoint = f"{waha_url}/api/sendImage"
                    else:
                        # Text-only fallback
                        payload = {
                            "session": session_name,
                            "chatId": recipient.chat_id,
                            "text": caption,
                        }
                        endpoint = f"{waha_url}/api/sendText"

                    resp = await client.post(
                        endpoint,
                        json=payload,
                        headers=_build_headers(api_key),
                    )

                    if resp.status_code in (200, 201):
                        logger.info(
                            f"[Waha] Alert '{alert_id}' sent to {recipient.label} ({recipient.chat_id})"
                        )
                    else:
                        logger.warning(
                            f"[Waha] Failed to send to {recipient.label}: {resp.status_code} {resp.text[:200]}"
                        )

                except Exception as send_err:
                    logger.error(f"[Waha] Error sending to {recipient.label}: {send_err}")

    except Exception as e:
        logger.error(f"[Waha] send_alert_notification unexpected error: {e}")


async def send_test_message(waha_url: str, api_key: Optional[str], session_name: str, chat_id: str) -> dict:
    """Send a simple test message to verify connectivity."""
    payload = {
        "session": session_name,
        "chatId": chat_id,
        "text": (
            "✅ *People Tracking System*\n"
            "━━━━━━━━━━━━━━━━━\n"
            "Test message berhasil dikirim!\n"
            "Notifikasi alert akan tampil seperti ini (dengan foto capture).\n"
            "━━━━━━━━━━━━━━━━━\n"
            f"_Dikirim pada {datetime.utcnow().strftime('%d/%m/%Y %H:%M:%S')} UTC_"
        ),
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{waha_url.rstrip('/')}/api/sendText",
                json=payload,
                headers=_build_headers(api_key),
            )
            return {"status_code": resp.status_code, "body": resp.json()}
    except Exception as e:
        logger.error(f"[Waha] send_test_message error: {e}")
        return {"error": str(e)}
