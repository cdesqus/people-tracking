import asyncio, json
from app.database import async_session
from app.models.alert import Alert
from sqlalchemy import select
async def f():
    async with async_session() as s:
        res = await s.execute(select(Alert).order_by(Alert.created_at.desc()).limit(10))
        print([{ 'id': a.id, 'type': a.type, 'title': a.title, 'severity': getattr(a, 'severity', 'N/A') } for a in res.scalars()])
asyncio.run(f())
