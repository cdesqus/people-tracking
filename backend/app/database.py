from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create async engine
engine = create_async_engine(
    settings.get_database_url(),
    echo=settings.echo_sql,
    future=True,
    pool_pre_ping=True,
)

# Create async session factory
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base for models
Base = declarative_base()


async def get_db():
    """Dependency for getting database session"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_users():
    """Seed initial database users if table is empty"""
    from app.models.user import User, UserRole
    from app.utils.auth import get_password_hash
    from sqlalchemy import select
    import uuid

    async with async_session() as session:
        # Check if users exist
        result = await session.execute(select(User))
        users = result.scalars().all()

        if not users:
            print("No users found in database. Seeding default users...")
            default_users = [
                User(
                    id=str(uuid.uuid4()),
                    email="admin@cctv.local",
                    username="admin",
                    full_name="Administrator",
                    hashed_password=get_password_hash("adminpassword"),
                    role=UserRole.ADMIN,
                    is_active="1"
                ),
                User(
                    id=str(uuid.uuid4()),
                    email="operator@cctv.local",
                    username="operator",
                    full_name="Operator User",
                    hashed_password=get_password_hash("operatorpassword"),
                    role=UserRole.OPERATOR,
                    is_active="1"
                ),
                User(
                    id=str(uuid.uuid4()),
                    email="viewer@cctv.local",
                    username="viewer",
                    full_name="Viewer User",
                    hashed_password=get_password_hash("viewerpassword"),
                    role=UserRole.VIEWER,
                    is_active="1"
                )
            ]

            for user in default_users:
                session.add(user)
            await session.commit()
            print("Successfully seeded default users!")


async def close_db():
    """Close database connection"""
    await engine.dispose()

