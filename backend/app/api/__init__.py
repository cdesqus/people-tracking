from fastapi import APIRouter
from app.api import cameras, faces, persons, alerts, system

api_router = APIRouter(prefix="/api")

# Include routers
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
api_router.include_router(faces.router, prefix="/faces", tags=["faces"])
api_router.include_router(faces.router, prefix="/detections", tags=["detections"])
api_router.include_router(persons.router, prefix="/persons", tags=["persons"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
