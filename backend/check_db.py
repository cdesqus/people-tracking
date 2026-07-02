import asyncio
from app.database import async_session
from sqlalchemy import select
from app.models.employee import Employee

async def main():
    async with async_session() as session:
        result = await session.execute(select(Employee))
        employees = result.scalars().all()
        print(f"Total employees: {len(employees)}")
        for emp in employees:
            has_encoding = emp.face_encoding is not None
            encoding_len = len(emp.face_encoding) if has_encoding else 0
            print(f"Employee: {emp.name} ({emp.id}) - Has Encoding: {has_encoding} - Encoding length: {encoding_len}")

if __name__ == "__main__":
    asyncio.run(main())
