"""
RTSP Service - Handle RTSP stream management, URL generation, and connection testing
"""

import cv2
import asyncio
import logging
from typing import Optional, Dict, Any
from urllib.parse import quote, unquote
from app.utils.rtsp_config import get_brand_config, RTSP_FORMATS

logger = logging.getLogger(__name__)


class RTSPService:
    """Service for managing RTSP streams and connections"""

    @staticmethod
    def generate_rtsp_url(
        brand: str,
        ip_address: str,
        username: str,
        password: str,
        channel: Optional[str] = None,
        port: Optional[int] = None,
        stream_path: Optional[str] = None,
    ) -> str:
        """
        Generate RTSP URL based on brand and credentials
        
        Args:
            brand: Camera brand (hikvision, dahua, uniview, axis, tp-link, reolink, generic)
            ip_address: Camera IP address
            username: RTSP username
            password: RTSP password
            channel: Channel number (brand-specific)
            port: RTSP port (default 554)
            stream_path: Stream path for generic RTSP (use if brand=generic)
            
        Returns:
            Complete RTSP URL
            
        Raises:
            ValueError: If required parameters are missing
        """
        # Validate required parameters
        if not ip_address or not username or not password:
            raise ValueError("IP address, username, and password are required")

        brand_lower = brand.lower()
        config = get_brand_config(brand_lower)
        
        # Use default values if not provided
        port = port or config.get("default_port", 554)
        channel = channel or config.get("default_channel", "1")
        
        # URL encode credentials to handle special characters
        encoded_user = quote(username, safe="")
        encoded_pass = quote(password, safe="")
        
        try:
            # Handle generic brand specially (requires stream_path)
            if brand_lower == "generic":
                if not stream_path:
                    stream_path = "/stream"
                url = f"rtsp://{encoded_user}:{encoded_pass}@{ip_address}:{port}{stream_path}"
            else:
                # Use template for specific brand
                template = config.get("template", "")
                url = template.format(
                    user=encoded_user,
                    password=encoded_pass,
                    ip=ip_address,
                    port=port,
                    channel=channel,
                    stream_path=stream_path or ""
                )
            
            return url
        except KeyError as e:
            raise ValueError(f"Missing required parameter for {brand}: {str(e)}")

    @staticmethod
    def test_rtsp_connection(rtsp_url: str, timeout: int = 5) -> Dict[str, Any]:
        """
        Test if RTSP URL is accessible and returning stream
        
        Args:
            rtsp_url: Complete RTSP URL to test
            timeout: Connection timeout in seconds (default 5)
            
        Returns:
            {
                "status": "connected" | "failed" | "error",
                "message": str,
                "resolution": "width x height" (if connected),
                "fps": float (if connected)
            }
        """
        try:
            logger.info(f"Testing RTSP connection: {RTSPService._mask_credentials(rtsp_url)}")
            
            cap = cv2.VideoCapture(rtsp_url)
            
            # Set connection timeout
            cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSECS, timeout * 1000)
            cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSECS, timeout * 1000)
            
            # Try to read first frame
            ret, frame = cap.read()
            
            if ret and frame is not None:
                # Successfully got a frame
                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                fps = cap.get(cv2.CAP_PROP_FPS)
                
                cap.release()
                
                return {
                    "status": "connected",
                    "message": "RTSP stream is accessible",
                    "resolution": f"{width}x{height}",
                    "fps": float(fps) if fps > 0 else 30.0
                }
            else:
                cap.release()
                return {
                    "status": "failed",
                    "message": "Cannot read from stream (credentials or URL may be invalid)",
                    "resolution": None,
                    "fps": None
                }
                
        except Exception as e:
            logger.error(f"RTSP connection error: {str(e)}")
            return {
                "status": "error",
                "message": f"Connection error: {str(e)}",
                "resolution": None,
                "fps": None
            }
        finally:
            try:
                cap.release()
            except:
                pass

    @staticmethod
    def validate_rtsp_params(
        brand: str,
        ip_address: str,
        username: str,
        password: str,
        port: Optional[int] = None,
        channel: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validate RTSP parameters before using them
        
        Args:
            brand: Camera brand
            ip_address: Camera IP
            username: RTSP username
            password: RTSP password
            port: RTSP port
            channel: Channel number
            
        Returns:
            {
                "valid": bool,
                "errors": list[str],
                "warnings": list[str]
            }
        """
        errors = []
        warnings = []
        
        # Validate brand
        if brand.lower() not in RTSP_FORMATS:
            warnings.append(f"Unknown brand '{brand}', will use generic RTSP")
        
        # Validate IP address (basic check)
        if not ip_address:
            errors.append("IP address is required")
        else:
            parts = ip_address.split(".")
            if len(parts) != 4 or not all(p.isdigit() and 0 <= int(p) <= 255 for p in parts):
                errors.append(f"Invalid IP address format: {ip_address}")
        
        # Validate username and password
        if not username:
            errors.append("Username is required")
        if not password:
            errors.append("Password is required")
        
        # Validate port
        if port and (port < 1 or port > 65535):
            errors.append(f"Port must be between 1 and 65535, got {port}")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

    @staticmethod
    def _mask_credentials(url: str) -> str:
        """Mask credentials in URL for logging purposes"""
        try:
            if "://" in url:
                parts = url.split("://", 1)
                creds_and_host = parts[1]
                if "@" in creds_and_host:
                    creds, host = creds_and_host.split("@", 1)
                    return f"{parts[0]}://***:***@{host}"
            return url
        except:
            return url

    @staticmethod
    def get_brand_info(brand: str) -> Dict[str, Any]:
        """Get detailed information about a CCTV brand's RTSP configuration"""
        return get_brand_config(brand)

    @staticmethod
    def parse_rtsp_url(rtsp_url: str) -> Dict[str, Optional[str]]:
        """
        Parse RTSP URL to extract components
        
        Args:
            rtsp_url: RTSP URL to parse
            
        Returns:
            {
                "protocol": "rtsp",
                "username": str,
                "password": str,
                "ip": str,
                "port": str,
                "path": str
            }
        """
        try:
            # Remove "rtsp://"
            if rtsp_url.startswith("rtsp://"):
                rtsp_url = rtsp_url[7:]
            
            # Split credentials and host
            if "@" in rtsp_url:
                credentials, host_path = rtsp_url.split("@", 1)
                username, password = credentials.split(":", 1) if ":" in credentials else (credentials, "")
                username = unquote(username)
                password = unquote(password)
            else:
                username = None
                password = None
                host_path = rtsp_url
            
            # Split host and path
            if "/" in host_path:
                host, path = host_path.split("/", 1)
                path = "/" + path
            else:
                host = host_path
                path = ""
            
            # Split IP and port
            if ":" in host:
                ip, port = host.rsplit(":", 1)
            else:
                ip = host
                port = "554"
            
            return {
                "protocol": "rtsp",
                "username": username,
                "password": password,
                "ip": ip,
                "port": port,
                "path": path
            }
        except Exception as e:
            logger.error(f"Error parsing RTSP URL: {str(e)}")
            return {
                "protocol": None,
                "username": None,
                "password": None,
                "ip": None,
                "port": None,
                "path": None
            }
