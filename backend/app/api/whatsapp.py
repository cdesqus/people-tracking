"""
WhatsApp notification management API via Waha.
Handles Waha config, session auth (QR / pairing code), and recipient management.
"""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.whatsapp_config import WhatsappConfig
from app.models.whatsapp_recipient import WhatsappRecipient, RecipientType
from app.services import waha_service

router = APIRouter()


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class WhatsappConfigUpdate(BaseModel):
    waha_url: str
    waha_api_key: Optional[str] = None
    session_name: str = "default"
    is_enabled: bool = False
    alert_severities: list[str] = ["critical", "high"]
    alert_types: list[str] = ["match", "unknown_face", "suspicious_activity", "system_error"]


class RecipientCreate(BaseModel):
    chat_id: str
    label: str
    type: RecipientType = RecipientType.PERSON
    is_active: bool = True


class RecipientUpdate(BaseModel):
    chat_id: Optional[str] = None
    label: Optional[str] = None
    type: Optional[RecipientType] = None
    is_active: Optional[bool] = None


class PairingCodeRequest(BaseModel):
    phone_number: str  # international format without +, e.g. "628123456789"


class StartSessionRequest(BaseModel):
    waha_url: Optional[str] = None
    waha_api_key: Optional[str] = None
    session_name: Optional[str] = None


# ─── Config Endpoints ─────────────────────────────────────────────────────────

@router.get("/config")
async def get_whatsapp_config(db: AsyncSession = Depends(get_db)):
    """Get current Waha configuration."""
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()
    if not cfg:
        # Return defaults if not configured yet
        return {
            "id": "singleton",
            "waha_url": "http://localhost:3000",
            "waha_api_key": None,
            "session_name": "default",
            "is_enabled": False,
            "alert_severities": ["critical", "high"],
            "alert_types": ["match", "unknown_face", "suspicious_activity", "system_error"],
        }
    return {
        "id": cfg.id,
        "waha_url": cfg.waha_url,
        "waha_api_key": cfg.waha_api_key,
        "session_name": cfg.session_name,
        "is_enabled": cfg.is_enabled,
        "alert_severities": cfg.alert_severities,
        "alert_types": cfg.alert_types,
    }


@router.put("/config")
async def update_whatsapp_config(data: WhatsappConfigUpdate, db: AsyncSession = Depends(get_db)):
    """Create or update Waha configuration."""
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()

    if cfg:
        cfg.waha_url = data.waha_url
        cfg.waha_api_key = data.waha_api_key
        cfg.session_name = data.session_name
        cfg.is_enabled = data.is_enabled
        cfg.alert_severities = data.alert_severities
        cfg.alert_types = data.alert_types
    else:
        cfg = WhatsappConfig(
            id="singleton",
            waha_url=data.waha_url,
            waha_api_key=data.waha_api_key,
            session_name=data.session_name,
            is_enabled=data.is_enabled,
            alert_severities=data.alert_severities,
            alert_types=data.alert_types,
        )
        db.add(cfg)

    await db.commit()
    await db.refresh(cfg)

    # Invalidate in-memory cache so next alert uses updated config
    waha_service.invalidate_config_cache()

    return {"success": True, "message": "Configuration saved", "data": {
        "waha_url": cfg.waha_url,
        "session_name": cfg.session_name,
        "is_enabled": cfg.is_enabled,
        "alert_severities": cfg.alert_severities,
        "alert_types": cfg.alert_types,
    }}


# ─── Session / Auth Endpoints ─────────────────────────────────────────────────

@router.get("/status")
async def get_session_status(db: AsyncSession = Depends(get_db)):
    """Get the current Waha session status."""
    status = await waha_service.get_session_status()
    return status


@router.post("/session/start")
async def start_session(body: StartSessionRequest, db: AsyncSession = Depends(get_db)):
    """Start (or restart) a Waha session. Uses saved config if body fields are empty."""
    # Load saved config as fallback
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()

    waha_url = body.waha_url or (cfg.waha_url if cfg else "http://localhost:3000")
    api_key = body.waha_api_key or (cfg.waha_api_key if cfg else None)
    session_name = body.session_name or (cfg.session_name if cfg else "default")

    result = await waha_service.start_session(waha_url, api_key, session_name)
    return result


@router.post("/session/logout")
async def logout_session(db: AsyncSession = Depends(get_db)):
    """Logout the active Waha session."""
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=400, detail="Waha is not configured")

    result = await waha_service.logout_session(cfg.waha_url, cfg.waha_api_key, cfg.session_name)
    return result


@router.get("/qr")
async def get_qr_code(db: AsyncSession = Depends(get_db)):
    """
    Get QR code image for WhatsApp login.
    Returns PNG image bytes directly (Content-Type: image/png).
    """
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=400, detail="Waha is not configured. Save config first.")

    qr_bytes = await waha_service.get_qr_code(cfg.waha_url, cfg.waha_api_key, cfg.session_name)
    if not qr_bytes:
        raise HTTPException(
            status_code=503,
            detail="Could not fetch QR code. Ensure Waha is running and session is in SCAN_QR_CODE state.",
        )

    return Response(content=qr_bytes, media_type="image/png")


@router.post("/pairing-code")
async def request_pairing_code(body: PairingCodeRequest, db: AsyncSession = Depends(get_db)):
    """Request pairing code for phone-number-based WhatsApp login."""
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=400, detail="Waha is not configured. Save config first.")

    result = await waha_service.request_pairing_code(
        cfg.waha_url, cfg.waha_api_key, cfg.session_name, body.phone_number
    )
    return result


# ─── Groups Endpoint ──────────────────────────────────────────────────────────

@router.get("/groups")
async def list_groups(db: AsyncSession = Depends(get_db)):
    """Fetch all WhatsApp groups the connected account belongs to."""
    res = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=400, detail="Waha is not configured.")

    groups = await waha_service.list_groups(cfg.waha_url, cfg.waha_api_key, cfg.session_name)
    return {"groups": groups, "total": len(groups)}


# ─── Recipients Endpoints ─────────────────────────────────────────────────────

@router.get("/recipients")
async def list_recipients(db: AsyncSession = Depends(get_db)):
    """List all WhatsApp notification recipients."""
    res = await db.execute(select(WhatsappRecipient).order_by(WhatsappRecipient.created_at))
    recipients = res.scalars().all()
    return {
        "items": [
            {
                "id": r.id,
                "chat_id": r.chat_id,
                "label": r.label,
                "type": r.type,
                "is_active": r.is_active,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in recipients
        ],
        "total": len(recipients),
    }


@router.post("/recipients", status_code=201)
async def create_recipient(data: RecipientCreate, db: AsyncSession = Depends(get_db)):
    """Add a new WhatsApp notification recipient."""
    # Check for duplicate chat_id
    existing = await db.execute(
        select(WhatsappRecipient).where(WhatsappRecipient.chat_id == data.chat_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=f"Recipient with chat_id '{data.chat_id}' already exists.")

    recipient = WhatsappRecipient(
        id=str(uuid.uuid4()),
        chat_id=data.chat_id,
        label=data.label,
        type=data.type,
        is_active=data.is_active,
    )
    db.add(recipient)
    await db.commit()
    await db.refresh(recipient)

    return {
        "success": True,
        "data": {
            "id": recipient.id,
            "chat_id": recipient.chat_id,
            "label": recipient.label,
            "type": recipient.type,
            "is_active": recipient.is_active,
        },
    }


@router.put("/recipients/{recipient_id}")
async def update_recipient(
    recipient_id: str, data: RecipientUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a recipient's label, chat_id, type, or active status."""
    res = await db.execute(select(WhatsappRecipient).where(WhatsappRecipient.id == recipient_id))
    recipient = res.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    if data.chat_id is not None:
        recipient.chat_id = data.chat_id
    if data.label is not None:
        recipient.label = data.label
    if data.type is not None:
        recipient.type = data.type
    if data.is_active is not None:
        recipient.is_active = data.is_active

    await db.commit()
    await db.refresh(recipient)

    return {
        "success": True,
        "data": {
            "id": recipient.id,
            "chat_id": recipient.chat_id,
            "label": recipient.label,
            "type": recipient.type,
            "is_active": recipient.is_active,
        },
    }


@router.delete("/recipients/{recipient_id}")
async def delete_recipient(recipient_id: str, db: AsyncSession = Depends(get_db)):
    """Remove a WhatsApp notification recipient."""
    res = await db.execute(select(WhatsappRecipient).where(WhatsappRecipient.id == recipient_id))
    recipient = res.scalar_one_or_none()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")

    await db.delete(recipient)
    await db.commit()
    return {"success": True, "message": f"Recipient '{recipient.label}' deleted"}


# ─── Test Message ─────────────────────────────────────────────────────────────

@router.post("/test")
async def send_test_message(db: AsyncSession = Depends(get_db)):
    """Send a test message to all active recipients."""
    res_cfg = await db.execute(select(WhatsappConfig).where(WhatsappConfig.id == "singleton"))
    cfg = res_cfg.scalar_one_or_none()
    if not cfg:
        raise HTTPException(status_code=400, detail="Waha is not configured.")

    res_rec = await db.execute(
        select(WhatsappRecipient).where(WhatsappRecipient.is_active == True)
    )
    recipients = res_rec.scalars().all()

    if not recipients:
        raise HTTPException(status_code=400, detail="No active recipients configured.")

    results = []
    for r in recipients:
        result = await waha_service.send_test_message(
            cfg.waha_url, cfg.waha_api_key, cfg.session_name, r.chat_id
        )
        results.append({"recipient": r.label, "chat_id": r.chat_id, "result": result})

    return {"success": True, "results": results}
