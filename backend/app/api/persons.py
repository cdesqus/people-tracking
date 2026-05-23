from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.person import PersonCreate, PersonUpdate, PersonResponse

router = APIRouter()


@router.get("/", response_model=list[PersonResponse])
async def list_persons(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    """List all persons"""
    # TODO: Implement person listing logic
    return []


@router.post("/", response_model=PersonResponse)
async def create_person(person: PersonCreate, db: AsyncSession = Depends(get_db)):
    """Create a new person"""
    # TODO: Implement person creation logic
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/{person_id}", response_model=PersonResponse)
async def get_person(person_id: str, db: AsyncSession = Depends(get_db)):
    """Get person by ID"""
    # TODO: Implement get person logic
    raise HTTPException(status_code=404, detail="Person not found")


@router.put("/{person_id}", response_model=PersonResponse)
async def update_person(
    person_id: str, person: PersonUpdate, db: AsyncSession = Depends(get_db)
):
    """Update a person"""
    # TODO: Implement person update logic
    raise HTTPException(status_code=404, detail="Person not found")


@router.delete("/{person_id}")
async def delete_person(person_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a person"""
    # TODO: Implement person deletion logic
    raise HTTPException(status_code=404, detail="Person not found")
