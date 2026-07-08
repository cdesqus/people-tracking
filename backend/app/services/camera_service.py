"""
Camera Service - Handle camera management with RTSP configuration
"""

import uuid
import asyncio
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from app.models.camera import Camera, CameraStatus
from app.schemas.camera import CameraCreate, CameraUpdate
from app.services.rtsp_service import RTSPService
from app.services.camera_capabilities import normalize_ai_capabilities
from app.utils.rtsp_config import get_brand_config

logger = logging.getLogger(__name__)


class CameraService:
    """Service for managing cameras and their RTSP configurations"""

    @staticmethod
    async def create_camera(
        db: AsyncSession,
        camera_data: CameraCreate
    ) -> Camera:
        """
        Create a new camera with RTSP configuration
        
        Args:
            db: Database session
            camera_data: Camera creation data
            
        Returns:
            Created Camera object
            
        Raises:
            ValueError: If RTSP configuration is invalid
        """
        # Generate RTSP URL if RTSP credentials are provided
        stream_url = camera_data.stream_url
        
        if (camera_data.rtsp_ip and camera_data.rtsp_username and 
            camera_data.rtsp_password and camera_data.brand):
            try:
                stream_url = RTSPService.generate_rtsp_url(
                    brand=camera_data.brand,
                    ip_address=camera_data.rtsp_ip,
                    username=camera_data.rtsp_username,
                    password=camera_data.rtsp_password,
                    channel=camera_data.rtsp_channel,
                    port=camera_data.rtsp_port,
                    stream_path=camera_data.rtsp_stream_path
                )
            except ValueError as e:
                logger.error(f"Error generating RTSP URL: {str(e)}")
                raise
        
        if not stream_url:
            raise ValueError("Either stream_url or complete RTSP configuration is required")
        
        # Create camera instance
        camera = Camera(
            id=str(uuid.uuid4()),
            name=camera_data.name,
            location=camera_data.location,
            stream_url=stream_url,
            main_stream_url=camera_data.main_stream_url or stream_url,
            sub_stream_url=camera_data.sub_stream_url,
            resolution=camera_data.resolution,
            fps=camera_data.fps,
            branch=camera_data.branch,
            brand=camera_data.brand or "generic",
            rtsp_ip=camera_data.rtsp_ip,
            rtsp_port=camera_data.rtsp_port or 554,
            rtsp_username=camera_data.rtsp_username,
            rtsp_password=camera_data.rtsp_password,
            rtsp_channel=camera_data.rtsp_channel,
            rtsp_stream_path=camera_data.rtsp_stream_path,
            intrusion_zones=camera_data.intrusion_zones,
            ai_capabilities=normalize_ai_capabilities(camera_data.ai_capabilities),
            status=CameraStatus.INACTIVE
        )
        
        db.add(camera)
        await db.commit()
        await db.refresh(camera)
        
        # Test connection immediately to set initial active/error status
        try:
            await CameraService.test_rtsp_connection(db, camera.id)
            await db.refresh(camera)
        except Exception as e:
            logger.error(f"Error testing connection for new camera: {e}")
        
        logger.info(f"Created camera: {camera.name} ({camera.id})")
        return camera

    @staticmethod
    async def get_camera(db: AsyncSession, camera_id: str) -> Optional[Camera]:
        """Get camera by ID"""
        result = await db.execute(
            select(Camera).where(Camera.id == camera_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_cameras(
        db: AsyncSession,
        branch: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Camera]:
        """List all cameras with optional filtering"""
        query = select(Camera)
        
        if branch:
            query = query.where(Camera.branch == branch)
        if status:
            query = query.where(Camera.status == status)
        
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def update_camera(
        db: AsyncSession,
        camera_id: str,
        camera_data: CameraUpdate,
        refresh_status: bool = False,
    ) -> Optional[Camera]:
        """Update camera configuration"""
        camera = await CameraService.get_camera(db, camera_id)
        if not camera:
            return None
        
        # Regenerate RTSP URL if any RTSP parameter changed
        update_dict = camera_data.model_dump(exclude_unset=True)
        
        if any(key in update_dict for key in [
            "rtsp_ip", "rtsp_username", "rtsp_password", "rtsp_port", "rtsp_channel", "brand"
        ]):
            rtsp_ip = update_dict.get("rtsp_ip") or camera.rtsp_ip
            rtsp_username = update_dict.get("rtsp_username") or camera.rtsp_username
            rtsp_password = update_dict.get("rtsp_password") or camera.rtsp_password
            brand = update_dict.get("brand") or camera.brand
            
            if rtsp_ip and rtsp_username and rtsp_password and brand:
                try:
                    new_url = RTSPService.generate_rtsp_url(
                        brand=brand,
                        ip_address=rtsp_ip,
                        username=rtsp_username,
                        password=rtsp_password,
                        channel=update_dict.get("rtsp_channel") or camera.rtsp_channel,
                        port=update_dict.get("rtsp_port") or camera.rtsp_port,
                        stream_path=update_dict.get("rtsp_stream_path") or camera.rtsp_stream_path
                    )
                    update_dict["stream_url"] = new_url
                except ValueError as e:
                    logger.error(f"Error updating RTSP URL: {str(e)}")
                    raise
        
        # Update camera fields
        if "ai_capabilities" in update_dict:
            update_dict["ai_capabilities"] = normalize_ai_capabilities(update_dict["ai_capabilities"])

        for key, value in update_dict.items():
            if value is not None:
                setattr(camera, key, value)

        # Update zone cache in real-time
        if "intrusion_zones" in update_dict:
            from app.services.rtsp_service import RTSPService
            RTSPService.camera_zones_cache[camera.id] = update_dict["intrusion_zones"]
        
        camera.updated_at = datetime.utcnow()
        await db.commit()
        await db.refresh(camera)
        
        # Keep camera edits fast. RTSP connection testing can block for seconds,
        # especially over TCP or when the DVR is busy. The explicit
        # /test-connection endpoint and the background offline monitor refresh
        # status without making every metadata/AI-feature save wait on RTSP.
        if refresh_status:
            try:
                await CameraService.test_rtsp_connection(db, camera.id)
                await db.refresh(camera)
            except Exception as e:
                logger.error(f"Error testing connection for updated camera: {e}")
        
        logger.info(f"Updated camera: {camera.name} ({camera.id})")
        return camera

    @staticmethod
    async def delete_camera(db: AsyncSession, camera_id: str) -> bool:
        """Delete a camera"""
        camera = await CameraService.get_camera(db, camera_id)
        if not camera:
            return False
        
        await db.delete(camera)
        await db.commit()
        
        logger.info(f"Deleted camera: {camera_id}")
        return True

    @staticmethod
    async def test_rtsp_connection(
        db: AsyncSession,
        camera_id: str,
        timeout: int = 5
    ) -> Dict[str, Any]:
        """
        Test RTSP connection for a camera
        
        Args:
            db: Database session
            camera_id: Camera ID
            timeout: Connection timeout in seconds
            
        Returns:
            Test result with status and details
        """
        camera = await CameraService.get_camera(db, camera_id)
        if not camera:
            return {"status": "error", "message": "Camera not found"}
        
        loop = asyncio.get_running_loop()
        result = await loop.run_in_executor(
            None, RTSPService.test_rtsp_connection, camera.main_stream_url or camera.stream_url, timeout
        )
        
        # Update camera status based on test result
        if result["status"] == "connected":
            camera.status = CameraStatus.ACTIVE
            camera.connection_error = None
        else:
            if camera.status != CameraStatus.ERROR:
                camera.status = CameraStatus.ERROR
            camera.connection_error = result["message"]
        
        camera.last_status_check = datetime.utcnow()
        
        if result["status"] == "connected":
            # Update resolution and fps if available
            if result.get("resolution"):
                camera.resolution = result["resolution"]
            if result.get("fps"):
                camera.fps = int(result["fps"])
        
        await db.commit()
        
        return result

    @staticmethod
    async def bulk_test_connections(
        db: AsyncSession,
        timeout: int = 5
    ) -> Dict[str, Dict[str, Any]]:
        """
        Test all cameras' RTSP connections
        
        Returns:
            Dictionary with camera_id -> test results
        """
        cameras = await CameraService.list_cameras(db)
        results = {}
        
        for camera in cameras:
            result = await CameraService.test_rtsp_connection(db, camera.id, timeout)
            results[camera.id] = result
        
        return results

    @staticmethod
    def get_brand_suggestions(camera_id: str = None) -> Dict[str, Any]:
        """Get list of supported brands with their configurations"""
        from app.utils.rtsp_config import RTSP_FORMATS
        
        return {
            brand: {
                "label": config["label"],
                "description": config["description"],
                "example_url": config["example_url"],
                "default_port": config["default_port"],
                "default_channel": config["default_channel"]
            }
            for brand, config in RTSP_FORMATS.items()
        }
