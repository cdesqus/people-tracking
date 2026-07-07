from fastapi import APIRouter
from app.api import cameras, faces, persons, employees, alerts, system, reports, auth, whatsapp, settings, kpis

api_router = APIRouter(prefix="/api")

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(cameras.router, prefix="/cameras", tags=["cameras"])
api_router.include_router(faces.router, prefix="/faces", tags=["faces"])
api_router.include_router(faces.router, prefix="/detections", tags=["detections"])
api_router.include_router(persons.router, prefix="/persons", tags=["persons"])
api_router.include_router(employees.router, prefix="/employees", tags=["employees"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(kpis.router, prefix="/kpis", tags=["kpis"])
