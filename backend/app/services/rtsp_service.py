"""
RTSP Service - Handle RTSP stream management, URL generation, and connection testing
"""

import cv2
import asyncio
import logging
import os
import time
import numpy as np
from typing import Optional, Dict, Any, Generator
from urllib.parse import quote, unquote
from app.utils.rtsp_config import get_brand_config, RTSP_FORMATS

logger = logging.getLogger(__name__)


class RTSPService:
    """Service for managing RTSP streams and connections"""
    
    last_detections = {}
    latest_frames = {}
    latest_frame_times = {}

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
            
            # Set connection timeout (not available in all OpenCV builds)
            try:
                cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSECS, timeout * 1000)
                cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSECS, timeout * 1000)
            except AttributeError:
                logger.warning("OpenCV build does not support timeout properties, skipping")
            
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
    def get_snapshot(rtsp_url: str, jpeg_quality: int = 60, camera_id: Optional[str] = None) -> Optional[bytes]:
        """
        Get a single JPEG snapshot from the RTSP stream.
        Uses cached frame if available to prevent connection exhaustion.
        """
        if camera_id and camera_id in RTSPService.latest_frames:
            frame = RTSPService.latest_frames[camera_id]
            if frame is not None:
                try:
                    _, buffer = cv2.imencode(
                        '.jpg', frame,
                        [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality]
                    )
                    return buffer.tobytes()
                except Exception as e:
                    logger.error(f"Failed to encode cached frame: {e}")

        # Fallback to direct RTSP capture
        os.environ.setdefault('OPENCV_FFMPEG_CAPTURE_OPTIONS', 'rtsp_transport;tcp|stimeout;5000000')
        cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
        try:
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            ret, frame = cap.read()
            if not ret or frame is None:
                return None
            
            _, buffer = cv2.imencode(
                '.jpg', frame,
                [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality]
            )
            return buffer.tobytes()
        except Exception as e:
            logger.error(f"Failed to get snapshot: {str(e)}")
            return None
        finally:
            try:
                cap.release()
            except:
                pass

    @staticmethod
    def generate_mjpeg_stream(
        rtsp_url: str,
        fps_limit: int = 15,
        jpeg_quality: int = 60,
        camera_id: Optional[str] = None,
        intrusion_zones: Optional[str] = None,
    ) -> Generator[bytes, None, None]:
        """
        Generate MJPEG frames from an RTSP stream for browser display.
        Uses cached frame if available to prevent camera connection limit exhaustion.
        """
        # Parse zones if provided
        zones = []
        if intrusion_zones:
            try:
                import json
                if isinstance(intrusion_zones, str):
                    zones_data = json.loads(intrusion_zones)
                else:
                    zones_data = intrusion_zones
                for polygon in zones_data:
                    pts = []
                    for p in polygon:
                        if isinstance(p, dict):
                            pts.append([int(p.get("x", 0)), int(p.get("y", 0))])
                        else:
                            pts.append([int(p[0]), int(p[1])])
                    if pts:
                        zones.append(np.array(pts, dtype=np.int32))
            except Exception as e:
                logger.error(f"Error parsing intrusion zones in stream: {e}")

        frame_interval = 1.0 / fps_limit

        # --- CACHED STREAMING PATH ---
        if camera_id and camera_id in RTSPService.latest_frames:
            logger.info(f"Serving cached MJPEG stream for camera {camera_id}")
            try:
                while camera_id in RTSPService.latest_frames:
                    start = time.monotonic()
                    frame = RTSPService.latest_frames.get(camera_id)
                    if frame is None:
                        time.sleep(0.1)
                        continue

                    # Copy to avoid mutating cached frame
                    frame_copy = frame.copy()

                    # Check if the cached frame is stale (no update in 8 seconds)
                    import time as py_time
                    last_update = RTSPService.latest_frame_times.get(camera_id, 0)
                    if py_time.time() - last_update > 8.0:
                        # Draw semi-transparent black overlay
                        overlay = frame_copy.copy()
                        cv2.rectangle(overlay, (0, 0), (frame_copy.shape[1], frame_copy.shape[0]), (0, 0, 0), -1)
                        cv2.addWeighted(overlay, 0.6, frame_copy, 0.4, 0, frame_copy)
                        
                        # Draw "RECONNECTING TO CAMERA..." text
                        text = "RECONNECTING TO CAMERA..."
                        font = cv2.FONT_HERSHEY_SIMPLEX
                        text_size = cv2.getTextSize(text, font, 1.0, 2)[0]
                        tx = (frame_copy.shape[1] - text_size[0]) // 2
                        ty = (frame_copy.shape[0] + text_size[1]) // 2
                        cv2.putText(frame_copy, text, (tx, ty), font, 1.0, (0, 0, 255), 2, cv2.LINE_AA)
                    else:
                        # Draw face bounding boxes and names if active detections exist
                        if camera_id in RTSPService.last_detections:
                            from datetime import datetime
                            now = datetime.utcnow()
                            detections = RTSPService.last_detections[camera_id]
                            active_detections = [
                                d for d in detections 
                                if (now - d["timestamp"]).total_seconds() < 4.0
                            ]
                            
                            for d in active_detections:
                                name = d["name"]
                                box = d["box"]
                                
                                h, w, _ = frame_copy.shape
                                left = int(box.get("left", 0.0) * w)
                                top = int(box.get("top", 0.0) * h)
                                width = int(box.get("width", 0.0) * w)
                                height = int(box.get("height", 0.0) * h)
                                
                                right = min(w, left + width)
                                bottom = min(h, top + height)
                                
                                color = (0, 255, 0) if name != "Unknown Subject" else (0, 0, 255)
                                
                                cv2.rectangle(frame_copy, (left, top), (right, bottom), color, 2)
                                
                                label = name
                                label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                                lw, lh = label_size
                                
                                cv2.rectangle(frame_copy, (left, top - lh - 10), (left + lw + 10, top), color, cv2.FILLED)
                                cv2.putText(frame_copy, label, (left + 5, top - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

                        # Draw intrusion zones
                        if zones:
                            cv2.polylines(frame_copy, zones, isClosed=True, color=(0, 0, 255), thickness=2)

                    _, buffer = cv2.imencode(
                        '.jpg', frame_copy,
                        [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality]
                    )

                    frame_latency_ms = int((time.monotonic() - start) * 1000)

                    yield (
                        b'--frame\r\n'
                        b'Content-Type: image/jpeg\r\n'
                        b'X-Frame-Latency: ' + str(frame_latency_ms).encode() + b'\r\n\r\n'
                        + buffer.tobytes()
                        + b'\r\n'
                    )

                    elapsed = time.monotonic() - start
                    if elapsed < frame_interval:
                        time.sleep(frame_interval - elapsed)
            except GeneratorExit:
                logger.info(f"MJPEG cached stream client disconnected for camera {camera_id}")
            return

        # --- DIRECT STREAMING FALLBACK PATH ---
        logger.info(f"Serving direct RTSP MJPEG stream for {rtsp_url}")
        os.environ.setdefault('OPENCV_FFMPEG_CAPTURE_OPTIONS', 'rtsp_transport;tcp|stimeout;5000000')

        cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
        
        # Minimize buffer to always get the latest frame (lowest latency)
        try:
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        except Exception:
            pass

        try:
            while cap.isOpened():
                start = time.monotonic()
                ret, frame = cap.read()
                if not ret:
                    # Try to reconnect once
                    cap.release()
                    cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
                    try:
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    except Exception:
                        pass
                    ret, frame = cap.read()
                    if not ret:
                        break

                # Draw face bounding boxes and names if active detections exist
                if camera_id and camera_id in RTSPService.last_detections:
                    from datetime import datetime
                    now = datetime.utcnow()
                    detections = RTSPService.last_detections[camera_id]
                    active_detections = [
                        d for d in detections 
                        if (now - d["timestamp"]).total_seconds() < 4.0
                    ]
                    
                    for d in active_detections:
                        name = d["name"]
                        box = d["box"]
                        
                        h, w, _ = frame.shape
                        left = int(box.get("left", 0.0) * w)
                        top = int(box.get("top", 0.0) * h)
                        width = int(box.get("width", 0.0) * w)
                        height = int(box.get("height", 0.0) * h)
                        
                        right = min(w, left + width)
                        bottom = min(h, top + height)
                        
                        color = (0, 255, 0) if name != "Unknown Subject" else (0, 0, 255)
                        
                        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                        
                        label = name
                        label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                        lw, lh = label_size
                        
                        cv2.rectangle(frame, (left, top - lh - 10), (left + lw + 10, top), color, cv2.FILLED)
                        cv2.putText(frame, label, (left + 5, top - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

                # Draw intrusion zones
                if zones:
                    cv2.polylines(frame, zones, isClosed=True, color=(0, 0, 255), thickness=2)

                _, buffer = cv2.imencode(
                    '.jpg', frame,
                    [cv2.IMWRITE_JPEG_QUALITY, jpeg_quality]
                )

                # Measure frame processing latency
                frame_latency_ms = int((time.monotonic() - start) * 1000)

                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n'
                    b'X-Frame-Latency: ' + str(frame_latency_ms).encode() + b'\r\n\r\n'
                    + buffer.tobytes()
                    + b'\r\n'
                )

                # Throttle to fps_limit
                elapsed = time.monotonic() - start
                if elapsed < frame_interval:
                    time.sleep(frame_interval - elapsed)
        except GeneratorExit:
            logger.info("MJPEG stream client disconnected")
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
