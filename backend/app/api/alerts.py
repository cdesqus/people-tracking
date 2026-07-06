from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, cast, String
from app.database import get_db
from app.schemas.alert import AlertCreate, AlertResponse, PaginatedAlertResponse
from app.models.alert import Alert, AlertType
import uuid

router = APIRouter()


@router.get("/", response_model=PaginatedAlertResponse)
async def list_alerts(
    page: int = 1,
    page_size: int = 10,
    skip: int = None,
    limit: int = None,
    search: str = None,
    status: bool = None,
    alert_type: Optional[AlertType] = Query(default=None, alias="type"),
    sort_by: str = "created_at",
    order: str = "desc",
    db: AsyncSession = Depends(get_db)
):
    """List all alerts with pagination, ordered by created_at DESC"""
    # Fallback to skip/limit if page/page_size are not specified
    if skip is not None and limit is not None:
        offset_val = skip
        limit_val = limit
    else:
        offset_val = (page - 1) * page_size
        limit_val = page_size

    # Base query
    query = select(Alert)
    
    if search:
        search_filter = or_(
            Alert.title.ilike(f"%{search}%"),
            Alert.description.ilike(f"%{search}%"),
            Alert.camera_id.ilike(f"%{search}%"),
            cast(Alert.type, String).ilike(f"%{search}%")
        )
        query = query.where(search_filter)
        
    if status is not None:
        query = query.where(Alert.acknowledged == status)

    if alert_type is not None:
        # Parse and validate the public value (for example "match") before
        # comparing it with the database enum.
        query = query.where(Alert.type == alert_type)

    # Get total count
    count_stmt = select(func.count()).select_from(query.subquery())
    count_res = await db.execute(count_stmt)
    total = count_res.scalar() or 0

    # Apply sorting
    if sort_by == "created_at":
        if order == "asc":
            query = query.order_by(Alert.created_at.asc())
        else:
            query = query.order_by(Alert.created_at.desc())
    else:
        query = query.order_by(Alert.created_at.desc())

    # Get items
    stmt = query.offset(offset_val).limit(limit_val)
    res = await db.execute(stmt)
    items = res.scalars().all()

    return {
        "items": items,
        "total": total
    }


@router.post("/", response_model=AlertResponse)
async def create_alert(alert: AlertCreate, db: AsyncSession = Depends(get_db)):
    """Create a new alert"""
    db_alert = Alert(
        id=str(uuid.uuid4()),
        type=alert.type,
        severity=alert.severity,
        title=alert.title,
        description=alert.description,
        camera_id=alert.camera_id,
        person_id=alert.person_id,
        face_id=alert.face_id,
        acknowledged=False
    )
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)
    return db_alert


@router.get("/{alert_id}", response_model=AlertResponse)
async def get_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Get alert by ID"""
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    db_alert = res.scalar_one_or_none()

    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return db_alert


@router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Acknowledge an alert"""
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    db_alert = res.scalar_one_or_none()

    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db_alert.acknowledged = True
    await db.commit()
    await db.refresh(db_alert)
    return db_alert


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an alert"""
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    db_alert = res.scalar_one_or_none()

    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    await db.delete(db_alert)
    await db.commit()
    return {"status": "success", "message": "Alert deleted"}


@router.get("/{alert_id}/image")
async def get_alert_image(alert_id: str, db: AsyncSession = Depends(get_db)):
    """Get the capture image for an alert"""
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    db_alert = res.scalar_one_or_none()

    if not db_alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if db_alert.image_data:
        return Response(content=db_alert.image_data, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=86400"})

    if db_alert.face_id:
        from app.models.face import Face
        face_stmt = select(Face).where(Face.id == db_alert.face_id)
        face_res = await db.execute(face_stmt)
        db_face = face_res.scalar_one_or_none()
        if db_face and db_face.image_data:
            return Response(content=db_face.image_data, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=86400"})

    raise HTTPException(status_code=404, detail="Image not found")
