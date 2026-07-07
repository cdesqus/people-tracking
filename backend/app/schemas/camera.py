from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime
from typing import Optional, Any


class RTSPConfig(BaseModel):
    """RTSP configuration for a camera"""
    brand: str = Field(..., description="CCTV brand: hikvision, dahua, uniview, axis, tp-link, reolink, generic")
    ip_address: str = Field(..., description="Camera IP address")
    port: int = Field(default=554, description="RTSP port")
    username: str = Field(..., description="RTSP username")
    password: str = Field(..., description="RTSP password")
    channel: Optional[str] = Field(default="1", description="Channel/stream number")
    stream_path: Optional[str] = Field(default=None, description="Stream path for generic RTSP")


class CameraBase(BaseModel):
    name: str
    location: str
    resolution: Optional[str] = None
    fps: Optional[int] = 30
    branch: Optional[str] = "br-hq"
    intrusion_zones: Optional[str] = None  # JSON string of zones
    ai_capabilities: Optional[dict[str, Any]] = None


class CameraCreate(CameraBase):
    """Create camera with RTSP configuration"""
    stream_url: Optional[str] = None  # Will be generated from RTSP config
    main_stream_url: Optional[str] = None
    sub_stream_url: Optional[str] = None
    rtsp_config: Optional[RTSPConfig] = None
    brand: Optional[str] = None
    rtsp_ip: Optional[str] = None
    rtsp_port: Optional[int] = 554
    rtsp_username: Optional[str] = None
    rtsp_password: Optional[str] = None
    rtsp_channel: Optional[str] = None
    rtsp_stream_path: Optional[str] = None


class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    branch: Optional[str] = None
    stream_url: Optional[str] = None
    main_stream_url: Optional[str] = None
    sub_stream_url: Optional[str] = None
    brand: Optional[str] = None
    rtsp_ip: Optional[str] = None
    rtsp_port: Optional[int] = None
    rtsp_username: Optional[str] = None
    rtsp_password: Optional[str] = None
    rtsp_channel: Optional[str] = None
    rtsp_stream_path: Optional[str] = None
    intrusion_zones: Optional[str] = None
    ai_capabilities: Optional[dict[str, Any]] = None


class CameraResponse(CameraBase):
    id: str
    status: str
    stream_url: str
    main_stream_url: Optional[str] = None
    sub_stream_url: Optional[str] = None
    brand: Optional[str] = None
    rtsp_ip: Optional[str] = None
    rtsp_port: Optional[int] = None
    rtsp_username: Optional[str] = None
    rtsp_channel: Optional[str] = None
    last_status_check: Optional[datetime] = None
    connection_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RTSPTestRequest(BaseModel):
    """Request to test RTSP connection"""
    brand: str
    ip_address: str
    port: int = 554
    username: str
    password: str
    channel: Optional[str] = None
    stream_path: Optional[str] = None


class RTSPTestResponse(BaseModel):
    """Response from RTSP connection test"""
    status: str  # "connected", "failed", "error"
    message: str
    resolution: Optional[str] = None  # "1920x1080"
    fps: Optional[float] = None
    rtsp_url: Optional[str] = None  # Generated URL (without credentials for display)


class BrandInfoResponse(BaseModel):
    """Information about a CCTV brand's RTSP configuration"""
    brand: str
    label: str
    template: str
    default_port: int
    default_channel: str
    channel_format: str
    description: str
    example_url: str


class CameraListResponse(BaseModel):
    items: list[CameraResponse]
    total: int


class CameraListEnvelope(BaseModel):
    success: bool = True
    data: CameraListResponse
    message: Optional[str] = None


class CameraEnvelope(BaseModel):
    success: bool = True
    data: CameraResponse
    message: Optional[str] = None


class EmptyEnvelope(BaseModel):
    success: bool = True
    message: Optional[str] = None
