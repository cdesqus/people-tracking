import asyncio
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db, close_db, seed_users
from app.api import api_router
from app.utils.websocket_manager import ws_manager
from app.services.face_processor import start_face_processor


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    print("Starting up application...")
    await init_db()
    try:
        await seed_users()
    except Exception as e:
        print(f"Error seeding database: {e}")
        
    # Start background face processor task
    face_processor_task = asyncio.create_task(start_face_processor())
    app.state.face_processor_task = face_processor_task
    
    yield
    # Shutdown
    print("Shutting down application...")
    if hasattr(app.state, "face_processor_task"):
        app.state.face_processor_task.cancel()
        try:
            await app.state.face_processor_task
        except asyncio.CancelledError:
            pass
    await close_db()



# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Trust reverse proxy X-Forwarded-Proto header for HTTPS scheme redirection
@app.middleware("http")
async def forward_proxy_headers(request: Request, call_next):
    if request.headers.get("x-forwarded-proto") == "https":
        request.scope["scheme"] = "https"
    return await call_next(request)


# Include API router
app.include_router(api_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CCTV Face Recognition Dashboard API",
        "version": settings.api_version,
        "docs": "/docs",
    }


@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Wait for any incoming messages from client (e.g. ping/heartbeat) to keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
