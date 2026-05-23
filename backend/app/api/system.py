from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """System health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.api_version,
        "environment": settings.app_env,
    }


@router.get("/config")
async def get_config(db: AsyncSession = Depends(get_db)):
    """Get system configuration"""
    return {
        "app_name": settings.api_title,
        "app_version": settings.api_version,
        "debug": settings.debug,
        "max_faces_per_image": settings.max_faces_per_image,
        "confidence_threshold": settings.confidence_threshold,
        "alert_retention_days": settings.alert_retention_days,
    }


@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Get dashboard statistics"""
    # TODO: Implement stats calculation
    return {
        "total_cameras": 0,
        "active_cameras": 0,
        "total_faces_today": 0,
        "total_alerts_today": 0,
        "unique_persons_today": 0,
        "system_health": 100,
    }
