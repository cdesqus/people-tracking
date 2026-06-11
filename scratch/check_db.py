import asyncio
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.database import async_session
from app.models.camera import Camera
from sqlalchemy import select

async def main():
    async with async_session() as session:
        result = await session.execute(select(Camera))
        cameras = result.scalars().all()
        print(f"Found {len(cameras)} cameras:")
        for c in cameras:
            print(f"Name: {c.name}")
            print(f"ID: {c.id}")
            print(f"Stream URL: {c.stream_url}")
            print(f"Intrusion Zones: {c.intrusion_zones}")
            print("-" * 40)

if __name__ == "__main__":
    asyncio.run(main())
