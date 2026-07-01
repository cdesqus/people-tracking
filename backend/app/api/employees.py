from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
import os
from app.database import get_db
from app.models.employee import Employee, EmployeeStatus
from app.services.face_recognition_factory import rekognition_service

router = APIRouter()


@router.get("/")
async def list_employees(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List all registered employees with search, department filters, and pagination"""
    query = select(Employee).where(Employee.deleted_at == None)

    # Filter by department
    if department:
        query = query.where(Employee.department == department)

    # Filter by search term (name or ID)
    if search:
        query = query.where(
            (Employee.name.ilike(f"%{search}%")) | (Employee.id.ilike(f"%{search}%"))
        )

    # Count total items
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Paginate and order by newest first
    query = query.order_by(Employee.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    employees = result.scalars().all()

    items = []
    for emp in employees:
        items.append(
            {
                "id": emp.id,
                "emp_id": emp.emp_id,
                "name": emp.name,
                "department": emp.department,
                "status": emp.status.value
                if hasattr(emp.status, "value")
                else str(emp.status),
                "photo_url": emp.photo_url,
                "badge_id": emp.badge_id,
                "contact": emp.contact,
                "email": emp.email,
                "last_detected": emp.last_detected,
                "current_location": emp.current_location,
                "created_at": emp.created_at,
                "updated_at": emp.updated_at,
            }
        )

    return {"items": items, "total": total}


@router.get("/departments")
async def list_departments(db: AsyncSession = Depends(get_db)):
    """List all unique employee departments along with defaults"""
    stmt = select(Employee.department).where(Employee.deleted_at == None).distinct()
    res = await db.execute(stmt)
    db_depts = [row[0] for row in res.all() if row[0]]

    # Combined default and database departments
    default_depts = ["Engineering", "HR", "Operations", "Sales", "Marketing"]
    all_depts = list(set(default_depts + db_depts))
    all_depts.sort()

    return {"departments": all_depts}


@router.post("/")
async def create_employee(
    id: str = Form(...),
    name: str = Form(...),
    department: str = Form(...),
    status: str = Form("active"),
    email: Optional[str] = Form(None),
    contact: Optional[str] = Form(None),
    badge_id: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
):
    """Register a new employee with photo upload and face indexing"""
    # Check if employee with the same ID already exists
    stmt = select(Employee).where(Employee.id == id, Employee.deleted_at == None)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=400, detail=f"Employee with ID {id} already exists"
        )

    photo_bytes = None
    face_id = None

    if photo:
        photo_bytes = await photo.read()
        collection_id = os.getenv("REKOGNITION_EMPLOYEES_COLLECTION", "employees")
        try:
            # Index face in AWS Rekognition if credentials configured
            face_id = await rekognition_service.index_face(
                collection_id=collection_id,
                image_bytes=photo_bytes,
                external_id=id,
            )
        except Exception as e:
            # Logging warning but not crash registration
            print(f"Warning: Rekognition indexing skipped or failed: {e}")

    employee = Employee(
        id=id,
        emp_id=id,
        name=name,
        department=department,
        status=status,
        email=email,
        contact=contact,
        badge_id=badge_id,
        photo_data=photo_bytes,
        face_id=face_id,
        photo_url=f"/api/employees/{id}/photo" if photo_bytes else None,
    )

    db.add(employee)
    await db.commit()
    await db.refresh(employee)

    return {
        "id": employee.id,
        "emp_id": employee.emp_id,
        "name": employee.name,
        "department": employee.department,
        "status": employee.status.value
        if hasattr(employee.status, "value")
        else str(employee.status),
        "photo_url": employee.photo_url,
        "badge_id": employee.badge_id,
        "contact": employee.contact,
        "email": employee.email,
        "last_detected": employee.last_detected,
        "current_location": employee.current_location,
        "created_at": employee.created_at,
        "updated_at": employee.updated_at,
    }


@router.get("/{employee_id}/photo")
async def get_employee_photo(employee_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve raw employee profile photo image from database"""
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id, Employee.deleted_at == None)
    )
    employee = result.scalar_one_or_none()
    if not employee or not employee.photo_data:
        raise HTTPException(
            status_code=404, detail="Employee profile photo not found"
        )

    # Return raw image response
    return Response(content=employee.photo_data, media_type="image/jpeg")


@router.delete("/{employee_id}")
async def delete_employee(employee_id: str, db: AsyncSession = Depends(get_db)):
    """Soft delete employee"""
    stmt = select(Employee).where(
        Employee.id == employee_id, Employee.deleted_at == None
    )
    res = await db.execute(stmt)
    employee = res.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.deleted_at = func.now()
    await db.commit()

    return {"status": "success", "message": "Employee deleted successfully"}
