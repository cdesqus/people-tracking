from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.camera import CameraCreate, CameraUpdate, CameraResponse

router = APIRouter()


@router.get("/", response_model=list[CameraResponse])
async def list_cameras(db: AsyncSession = Depends(get_db)):
    """List all cameras"""
    # TODO: Implement camera listing logic
    return []


@router.post("/", response_model=CameraResponse)
async def create_camera(camera: CameraCreate, db: AsyncSession = Depends(get_db)):
    """Create a new camera"""
    # TODO: Implement camera creation logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    """Get camera by ID"""
    # TODO: Implement get camera logic
    raise HTTPException(status_code=404, detail="Camera not found")


@router.put("/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: str, camera: CameraUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a camera"""
    # TODO: Implement camera update logic
    raise HTTPException(status_code=404, detail="Camera not found")


@router.delete("/{camera_id}")
async def delete_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a camera"""
    # TODO: Implement camera deletion logic
    raise HTTPException(status_code=404, detail="Camera not found")
