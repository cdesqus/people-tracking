import asyncio
from app.database import async_session
from sqlalchemy import select
from app.models.employee import Employee
from app.services.face_recognition_factory import rekognition_service
import os

async def main():
    print("Fixing missing face encodings...")
    async with async_session() as session:
        result = await session.execute(select(Employee).where(Employee.face_encoding == None, Employee.photo_data != None))
        employees = result.scalars().all()
        for emp in employees:
            print(f"Fixing encoding for {emp.name} ({emp.id})")
            face_id = await rekognition_service.index_face(
                collection_id="employees",
                image_bytes=emp.photo_data,
                external_id=emp.id
            )
            
            # Since index_face uses its own session to update face_encoding, 
            # we just need to update face_id if one was returned.
            if face_id:
                emp.face_id = face_id
                
        if employees:
            await session.commit()
    print("Done")

if __name__ == "__main__":
    asyncio.run(main())
