import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models.face import Face
from app.models.employee import Employee
from app.models.camera import Camera
from app.schemas.face import FaceCreate, FaceResponse

router = APIRouter()


@router.get("/", response_model=list[FaceResponse])
async def list_faces(
    skip: int = 0,
    limit: int = 100,
    camera_id: Optional[str] = None,
    person_id: Optional[str] = None,
    date: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """List all detected faces, joined with camera location and employee names"""
    query = select(Face)
    if camera_id:
        query = query.where(Face.camera_id == camera_id)
    if person_id:
        query = query.where(Face.person_id == person_id)
    if date:
        try:
            from sqlalchemy import cast, Date
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
            query = query.where(cast(Face.timestamp, Date) == target_date)
        except ValueError:
            pass

    query = query.order_by(Face.timestamp.desc()).offset(skip).limit(limit)
    res = await db.execute(query)
    faces = res.scalars().all()

    items = []
    for f in faces:
        person_name = "Unknown Subject"
        location_name = f"Camera {f.camera_id}"
        camera_name = location_name
        image_url = f.image_url
        if f.image_data:
            image_url = f"/api/detections/{f.id}/image"

        # Fetch employee name if recognized
        if f.person_id:
            emp_stmt = select(Employee).where(Employee.id == f.person_id, Employee.deleted_at == None)
            emp_res = await db.execute(emp_stmt)
            employee = emp_res.scalar_one_or_none()
            if employee:
                person_name = employee.name
                if not image_url:
                    image_url = employee.photo_url

        # Fetch camera location
        cam_stmt = select(Camera).where(Camera.id == f.camera_id)
        cam_res = await db.execute(cam_stmt)
        camera = cam_res.scalar_one_or_none()
        if camera:
            camera_name = camera.name
            location_name = camera.name

        items.append(
            FaceResponse(
                id=f.id,
                camera_id=f.camera_id,
                person_id=f.person_id,
                person_name=person_name,
                camera_name=camera_name,
                location=location_name,
                confidence=f.confidence,
                face_match=f.face_match,
                has_image=f.has_image,
                boundingbox=f.boundingbox,
                timestamp=f.timestamp,
                image_url=image_url,
                created_at=f.created_at,
                updated_at=f.updated_at
            )
        )

    return items


@router.post("/", response_model=FaceResponse)
async def create_face(face: FaceCreate, db: AsyncSession = Depends(get_db)):
    """Create a new face detection record"""
    face_id = str(uuid.uuid4())
    db_face = Face(
        id=face_id,
        camera_id=face.camera_id,
        person_id=face.person_id,
        confidence=face.confidence,
        face_match=face.face_match,
        boundingbox=face.boundingbox.model_dump(),
        timestamp=face.timestamp or datetime.utcnow(),
        image_url=face.image_url
    )
    db.add(db_face)
    await db.commit()
    await db.refresh(db_face)
    return db_face


@router.get("/{face_id}", response_model=FaceResponse)
async def get_face(face_id: str, db: AsyncSession = Depends(get_db)):
    """Get face detection by ID"""
    result = await db.execute(select(Face).where(Face.id == face_id))
    face = result.scalar_one_or_none()
    if not face:
        raise HTTPException(status_code=404, detail="Face detection not found")
    if face.image_data and not face.image_url:
        face.image_url = f"/api/detections/{face.id}/image"
    return face


@router.get("/{face_id}/image")
async def get_face_image(face_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve raw face detection captured image from database"""
    result = await db.execute(select(Face).where(Face.id == face_id))
    face = result.scalar_one_or_none()
    if not face or not face.image_data:
        raise HTTPException(
            status_code=404, detail="Face detection captured image not found"
        )
    return Response(content=face.image_data, media_type="image/jpeg", headers={"Cache-Control": "public, max-age=86400"})
