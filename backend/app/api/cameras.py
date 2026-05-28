from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.camera import (
    CameraCreate,
    CameraUpdate,
    CameraResponse,
    RTSPTestRequest,
    RTSPTestResponse,
    BrandInfoResponse,
    CameraListEnvelope,
    CameraEnvelope,
    EmptyEnvelope
)
from app.services.camera_service import CameraService
from app.services.rtsp_service import RTSPService
from app.utils.rtsp_config import get_brand_config, get_supported_brands

router = APIRouter()


@router.get("/brands", response_model=dict[str, dict])
async def get_supported_brands_endpoint():
    """Get list of all supported CCTV brands with their configurations"""
    brands = {}
    for brand in get_supported_brands():
        config = get_brand_config(brand)
        brands[brand] = {
            "label": config.get("label"),
            "description": config.get("description"),
            "example_url": config.get("example_url"),
            "default_port": config.get("default_port"),
            "default_channel": config.get("default_channel"),
            "channel_format": config.get("channel_format")
        }
    return brands


@router.get("/brands/{brand}", response_model=BrandInfoResponse)
async def get_brand_info(brand: str):
    """Get detailed information about a specific CCTV brand"""
    config = get_brand_config(brand)
    if not config:
        raise HTTPException(status_code=404, detail=f"Brand '{brand}' not found")
    
    return BrandInfoResponse(
        brand=brand,
        label=config.get("label", brand),
        template=config.get("template"),
        default_port=config.get("default_port", 554),
        default_channel=config.get("default_channel", "1"),
        channel_format=config.get("channel_format"),
        description=config.get("description"),
        example_url=config.get("example_url")
    )


@router.post("/test-rtsp", response_model=RTSPTestResponse)
async def test_rtsp_connection(request: RTSPTestRequest):
    """
    Test RTSP connection before saving camera configuration
    
    This endpoint validates the RTSP URL and tests connectivity
    """
    # Validate parameters
    validation = RTSPService.validate_rtsp_params(
        brand=request.brand,
        ip_address=request.ip_address,
        username=request.username,
        password=request.password,
        port=request.port,
        channel=request.channel
    )
    
    if not validation["valid"]:
        raise HTTPException(
            status_code=400,
            detail={"errors": validation["errors"], "warnings": validation["warnings"]}
        )
    
    # Generate RTSP URL
    try:
        rtsp_url = RTSPService.generate_rtsp_url(
            brand=request.brand,
            ip_address=request.ip_address,
            username=request.username,
            password=request.password,
            channel=request.channel,
            port=request.port,
            stream_path=request.stream_path
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Test connection
    test_result = RTSPService.test_rtsp_connection(rtsp_url, timeout=5)
    
    # Return result with masked URL
    return RTSPTestResponse(
        status=test_result["status"],
        message=test_result["message"],
        resolution=test_result.get("resolution"),
        fps=test_result.get("fps"),
        rtsp_url=RTSPService._mask_credentials(rtsp_url)
    )


@router.get("/", response_model=CameraListEnvelope)
async def list_cameras(
    db: AsyncSession = Depends(get_db),
    branch: str = Query(None),
    status: str = Query(None)
):
    """List all cameras with optional filtering by branch or status"""
    cameras = await CameraService.list_cameras(db, branch=branch, status=status)
    return {
        "success": True,
        "data": {
            "items": cameras,
            "total": len(cameras)
        }
    }


@router.post("/", response_model=CameraEnvelope, status_code=201)
async def create_camera(
    camera: CameraCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new camera with RTSP configuration"""
    try:
        new_camera = await CameraService.create_camera(db, camera)
        return {
            "success": True,
            "data": new_camera
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating camera: {str(e)}")


@router.get("/{camera_id}", response_model=CameraEnvelope)
async def get_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    """Get camera by ID"""
    camera = await CameraService.get_camera(db, camera_id)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {
        "success": True,
        "data": camera
    }


@router.put("/{camera_id}", response_model=CameraEnvelope)
async def update_camera(
    camera_id: str,
    camera_update: CameraUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update camera configuration"""
    try:
        updated_camera = await CameraService.update_camera(db, camera_id, camera_update)
        if not updated_camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        return {
            "success": True,
            "data": updated_camera
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating camera: {str(e)}")


@router.delete("/{camera_id}", response_model=EmptyEnvelope)
async def delete_camera(camera_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a camera"""
    success = await CameraService.delete_camera(db, camera_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {
        "success": True,
        "message": "Camera deleted successfully"
    }


@router.post("/{camera_id}/test-connection")
async def test_camera_connection(
    camera_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Test RTSP connection for a specific camera"""
    result = await CameraService.test_rtsp_connection(db, camera_id)
    if result["status"] == "error" and "not found" in result.get("message", "").lower():
        raise HTTPException(status_code=404, detail=result["message"])
    return result


@router.post("/test-all/connections")
async def test_all_connections(db: AsyncSession = Depends(get_db)):
    """Test RTSP connections for all cameras"""
    results = await CameraService.bulk_test_connections(db)
    return {
        "tested": len(results),
        "results": results
    }


@router.get("/brands-list/all", response_model=dict[str, dict])
async def get_all_brands():
    """Get list of all available brands (alternative endpoint)"""
    return CameraService.get_brand_suggestions()

