from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.face import FaceCreate, FaceResponse

router = APIRouter()


@router.get("/", response_model=list[FaceResponse])
async def list_faces(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all detected faces"""
    # TODO: Implement face listing logic
    return []


@router.post("/", response_model=FaceResponse)
async def create_face(face: FaceCreate, db: AsyncSession = Depends(get_db)):
    """Create a new face detection record"""
    # TODO: Implement face creation logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{face_id}", response_model=FaceResponse)
async def get_face(face_id: str, db: AsyncSession = Depends(get_db)):
    """Get face by ID"""
    # TODO: Implement get face logic
    raise HTTPException(status_code=404, detail="Face not found")
