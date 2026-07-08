from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Create async engine
db_url = settings.get_database_url()
if db_url.startswith("sqlite"):
    engine = create_async_engine(
        db_url,
        echo=settings.echo_sql,
        future=True,
    )
else:
    engine = create_async_engine(
        db_url,
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
    # Import all models so SQLAlchemy metadata is populated before create_all
    from app.models import alert, camera, employee, face, person, user  # noqa: F401
    from app.models import whatsapp_config, whatsapp_recipient  # noqa: F401
    from app.models import system_settings  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Manual migration to add image_data column to faces if not exists
    from sqlalchemy import text
    async with async_session() as session:
        try:
            db_dialect = session.bind.dialect.name
            if db_dialect == "postgresql":
                await session.execute(text("ALTER TABLE faces ADD COLUMN IF NOT EXISTS image_data BYTEA;"))
                
                try:
                    await session.execute(text("ALTER TABLE whatsapp_configs ADD COLUMN IF NOT EXISTS alert_types JSONB;"))
                except Exception as e:
                    print(f"Migration warning whatsapp_configs alert_types: {e}")
                    
                try:
                    await session.execute(text("ALTER TABLE cameras ADD COLUMN IF NOT EXISTS intrusion_zones TEXT;"))
                except Exception as e:
                    print(f"Migration warning cameras intrusion_zones: {e}")

                for ddl in [
                    "ALTER TABLE cameras ADD COLUMN IF NOT EXISTS main_stream_url VARCHAR(500);",
                    "ALTER TABLE cameras ADD COLUMN IF NOT EXISTS sub_stream_url VARCHAR(500);",
                ]:
                    try:
                        await session.execute(text(ddl))
                    except Exception as e:
                        print(f"Migration warning cameras stream profiles: {e}")

                try:
                    await session.execute(text("ALTER TABLE cameras ADD COLUMN IF NOT EXISTS ai_capabilities JSONB;"))
                except Exception as e:
                    print(f"Migration warning cameras ai_capabilities: {e}")

                for ddl in [
                    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS obstruction_dark_mean_threshold DOUBLE PRECISION NOT NULL DEFAULT 20.0;",
                    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS obstruction_flat_stddev_threshold DOUBLE PRECISION NOT NULL DEFAULT 10.0;",
                    "ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS obstruction_consecutive_frames INTEGER NOT NULL DEFAULT 8;",
                ]:
                    try:
                        await session.execute(text(ddl))
                    except Exception as e:
                        print(f"Migration warning system_settings obstruction column: {e}")

                for ddl in [
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMP WITH TIME ZONE;",
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;",
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMP WITH TIME ZONE;",
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;",
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS false_positive BOOLEAN NOT NULL DEFAULT FALSE;",
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS resolution_note TEXT;",
                    "ALTER TABLE alerts ADD COLUMN IF NOT EXISTS metadata JSONB;",
                    "UPDATE alerts SET first_seen_at = COALESCE(first_seen_at, created_at), last_seen_at = COALESCE(last_seen_at, created_at);",
                ]:
                    try:
                        await session.execute(text(ddl))
                    except Exception as e:
                        print(f"Migration warning alerts phase1 column: {e}")
                
                # Correct foreign keys to point to employees instead of persons
                try:
                    await session.execute(text("ALTER TABLE faces DROP CONSTRAINT IF EXISTS faces_person_id_fkey;"))
                    await session.execute(text("ALTER TABLE faces ADD CONSTRAINT faces_person_id_fkey FOREIGN KEY (person_id) REFERENCES employees(id) ON DELETE SET NULL;"))
                except Exception as fk_err1:
                    print(f"Migration warning faces FK: {fk_err1}")
                    
                try:
                    await session.execute(text("ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_person_id_fkey;"))
                    await session.execute(text("ALTER TABLE alerts ADD CONSTRAINT alerts_person_id_fkey FOREIGN KEY (person_id) REFERENCES employees(id) ON DELETE SET NULL;"))
                except Exception as fk_err2:
                    print(f"Migration warning alerts FK: {fk_err2}")
                    
                try:
                    await session.commit()
                    async with engine.connect() as conn:
                        autocommit_conn = await conn.execution_options(
                            isolation_level="AUTOCOMMIT"
                        )
                        for value in [
                            # SQLAlchemy Enum stores Python enum *names* by default.
                            "INTRUSION",
                            "CAMERA_OBSTRUCTION",
                            "CAMERA_OFFLINE",
                            "UNAUTHORIZED_ACCESS",
                            "LOITERING",
                            "DOOR_LEFT_OPEN",
                            "CROWD_DETECTED",
                            # Keep value labels too for older manual migrations/configs.
                            "intrusion",
                            "camera_obstruction",
                            "camera_offline",
                            "unauthorized_access",
                            "loitering",
                            "door_left_open",
                            "crowd_detected",
                        ]:
                            await autocommit_conn.execute(
                                text(f"ALTER TYPE alerttype ADD VALUE IF NOT EXISTS '{value}';")
                            )
                except Exception as e:
                    print(f"Migration warning alerts alerttype: {e}")

                # Recognized employees are stored in alert history as informational
                # records, not as low/medium/high/critical security incidents.
                try:
                    async with engine.connect() as conn:
                        autocommit_conn = await conn.execution_options(
                            isolation_level="AUTOCOMMIT"
                        )
                        await autocommit_conn.execute(
                            text("ALTER TYPE alertseverity ADD VALUE IF NOT EXISTS 'INFO';")
                        )
                except Exception as e:
                    print(f"Migration warning alerts alertseverity INFO: {e}")

                # Make the alerts->faces FK deferrable so it's checked at COMMIT
                # time instead of INSERT time. This permanently prevents FK
                # violations caused by inserting Face and Alert in separate
                # statements within the same transaction.
                try:
                    async with engine.connect() as conn:
                        autocommit_conn = await conn.execution_options(
                            isolation_level="AUTOCOMMIT"
                        )
                        await autocommit_conn.execute(
                            text(
                                "ALTER TABLE alerts "
                                "DROP CONSTRAINT IF EXISTS alerts_face_id_fkey;"
                            )
                        )
                        await autocommit_conn.execute(
                            text(
                                "ALTER TABLE alerts "
                                "ADD CONSTRAINT alerts_face_id_fkey "
                                "FOREIGN KEY (face_id) REFERENCES faces(id) "
                                "ON DELETE SET NULL "
                                "DEFERRABLE INITIALLY DEFERRED;"
                            )
                        )
                    print("Migration: alerts_face_id_fkey is now DEFERRABLE INITIALLY DEFERRED")
                except Exception as fk_defer_err:
                    print(f"Migration warning (deferrable FK): {fk_defer_err}")
            elif db_dialect == "sqlite":
                try:
                    await session.execute(text("ALTER TABLE faces ADD COLUMN image_data BLOB;"))
                except Exception:
                    pass
                
                try:
                    await session.execute(text("ALTER TABLE whatsapp_configs ADD COLUMN alert_types TEXT;"))
                except Exception:
                    pass
                    
                try:
                    await session.execute(text("ALTER TABLE cameras ADD COLUMN intrusion_zones TEXT;"))
                except Exception:
                    pass

                for ddl in [
                    "ALTER TABLE cameras ADD COLUMN main_stream_url VARCHAR(500);",
                    "ALTER TABLE cameras ADD COLUMN sub_stream_url VARCHAR(500);",
                ]:
                    try:
                        await session.execute(text(ddl))
                    except Exception:
                        pass
                    
                try:
                    await session.execute(text("ALTER TABLE cameras ADD COLUMN ai_capabilities JSON;"))
                except Exception:
                    pass

                for ddl in [
                    "ALTER TABLE system_settings ADD COLUMN obstruction_dark_mean_threshold REAL DEFAULT 20.0;",
                    "ALTER TABLE system_settings ADD COLUMN obstruction_flat_stddev_threshold REAL DEFAULT 10.0;",
                    "ALTER TABLE system_settings ADD COLUMN obstruction_consecutive_frames INTEGER DEFAULT 8;",
                ]:
                    try:
                        await session.execute(text(ddl))
                    except Exception:
                        pass

                for ddl in [
                    "ALTER TABLE alerts ADD COLUMN first_seen_at DATETIME;",
                    "ALTER TABLE alerts ADD COLUMN last_seen_at DATETIME;",
                    "ALTER TABLE alerts ADD COLUMN acknowledged_at DATETIME;",
                    "ALTER TABLE alerts ADD COLUMN resolved_at DATETIME;",
                    "ALTER TABLE alerts ADD COLUMN false_positive BOOLEAN DEFAULT 0;",
                    "ALTER TABLE alerts ADD COLUMN resolution_note TEXT;",
                    "ALTER TABLE alerts ADD COLUMN metadata JSON;",
                ]:
                    try:
                        await session.execute(text(ddl))
                    except Exception:
                        pass
                try:
                    await session.execute(text("UPDATE alerts SET first_seen_at = COALESCE(first_seen_at, created_at), last_seen_at = COALESCE(last_seen_at, created_at);"))
                except Exception:
                    pass
            await session.commit()
        except Exception as e:
            print(f"Migration warning: Could not run migrations: {e}")


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
