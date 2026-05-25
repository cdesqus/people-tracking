# RTSP Implementation - Developer Guide

## Code Structure

```
backend/
├── app/
│   ├── models/
│   │   └── camera.py                 # Updated with RTSP fields
│   │
│   ├── schemas/
│   │   └── camera.py                 # Updated with RTSP schemas
│   │
│   ├── services/
│   │   ├── camera_service.py         # [NEW] Camera business logic
│   │   ├── rtsp_service.py           # [NEW] RTSP operations
│   │   └── aws_rekognition.py        # Existing
│   │
│   ├── utils/
│   │   └── rtsp_config.py           # [NEW] Brand configurations
│   │
│   ├── api/
│   │   └── cameras.py                # Updated camera endpoints
│   │
│   └── main.py, config.py, database.py  # Existing
```

---

## Class Diagram

```
Camera (SQLAlchemy Model)
├── id, name, location, status
├── stream_url, resolution, fps, branch
├── brand, rtsp_ip, rtsp_port
├── rtsp_username, rtsp_password
├── rtsp_channel, rtsp_stream_path
└── last_status_check, connection_error

CameraService (Business Logic)
├── create_camera()
├── get_camera()
├── list_cameras()
├── update_camera()
├── delete_camera()
├── test_rtsp_connection()
├── bulk_test_connections()
└── get_brand_suggestions()

RTSPService (RTSP Operations)
├── generate_rtsp_url()
├── test_rtsp_connection()
├── validate_rtsp_params()
├── parse_rtsp_url()
└── _mask_credentials()

RTSPConfig (Configuration)
├── RTSP_FORMATS (dict with brand configs)
├── get_brand_config()
├── get_supported_brands()
└── get_brand_example_url()
```

---

## Key Functions

### 1. Generate RTSP URL

```python
from app.services.rtsp_service import RTSPService

# Generate URL based on brand template
url = RTSPService.generate_rtsp_url(
    brand="hikvision",
    ip_address="192.168.1.100",
    username="admin",
    password="12345",
    channel="101",
    port=554
)
# Returns: rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101
```

### 2. Test RTSP Connection

```python
result = RTSPService.test_rtsp_connection(
    rtsp_url="rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101",
    timeout=5
)

# Returns:
# {
#     "status": "connected|failed|error",
#     "message": "...",
#     "resolution": "1920x1080",
#     "fps": 30.0
# }
```

### 3. Validate Parameters

```python
validation = RTSPService.validate_rtsp_params(
    brand="hikvision",
    ip_address="192.168.1.100",
    username="admin",
    password="12345"
)

# Returns:
# {
#     "valid": True|False,
#     "errors": [...],
#     "warnings": [...]
# }
```

### 4. Parse RTSP URL

```python
parsed = RTSPService.parse_rtsp_url(
    "rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101"
)

# Returns:
# {
#     "protocol": "rtsp",
#     "username": "admin",
#     "password": "12345",
#     "ip": "192.168.1.100",
#     "port": "554",
#     "path": "/Streaming/Channels/101"
# }
```

### 5. Create Camera with RTSP

```python
from app.schemas.camera import CameraCreate

camera_data = CameraCreate(
    name="Front Gate",
    location="Main Entrance",
    brand="hikvision",
    rtsp_ip="192.168.1.100",
    rtsp_port=554,
    rtsp_username="admin",
    rtsp_password="12345",
    rtsp_channel="101"
)

camera = await CameraService.create_camera(db, camera_data)
# stream_url automatically generated: rtsp://admin:12345@192.168.1.100:554/...
```

---

## Adding a New Brand

If you need to add support for a new CCTV brand:

### Step 1: Add Brand Config to `rtsp_config.py`

```python
RTSP_FORMATS["new_brand"] = {
    "label": "New Brand",
    "template": "rtsp://{user}:{password}@{ip}:{port}/stream/{channel}",
    "default_port": 554,
    "default_channel": "1",
    "channel_format": "1, 2, 3, ...",
    "description": "New Brand Camera Series",
    "example_url": "rtsp://admin:password@192.168.1.100:554/stream/1"
}
```

### Step 2: Update Supporting Lists (Auto-detected)

No manual update needed - system auto-discovers from `RTSP_FORMATS`.

### Step 3: Test

```bash
# Test brand info endpoint
curl "http://localhost:8000/api/v1/cameras/brands/new_brand"

# Test connection
curl -X POST "http://localhost:8000/api/v1/cameras/test-rtsp" \
  -d '{
    "brand": "new_brand",
    "ip_address": "192.168.1.100",
    "username": "admin",
    "password": "password",
    "channel": "1"
  }'
```

---

## Extending Camera Service

### Add Custom Camera Validation

```python
# In camera_service.py
@staticmethod
async def validate_camera_for_processing(camera: Camera) -> bool:
    """Add custom validation logic"""
    if camera.resolution not in ["1920x1080", "1280x720"]:
        logger.warning(f"Camera {camera.id} has non-standard resolution")
    return True
```

### Add Connection Retry Logic

```python
@staticmethod
async def test_rtsp_with_retry(
    db: AsyncSession,
    camera_id: str,
    retries: int = 3,
    timeout: int = 5
) -> Dict[str, Any]:
    """Test connection with retry logic"""
    for attempt in range(retries):
        result = await CameraService.test_rtsp_connection(db, camera_id, timeout)
        if result["status"] == "connected":
            return result
        await asyncio.sleep(2 ** attempt)  # Exponential backoff
    return result
```

---

## Database Queries

### Get All Active Cameras

```python
from sqlalchemy import select
from app.models.camera import Camera, CameraStatus

result = await db.execute(
    select(Camera).where(Camera.status == CameraStatus.ACTIVE)
)
active_cameras = result.scalars().all()
```

### Get Cameras by Brand

```python
result = await db.execute(
    select(Camera).where(Camera.brand == "hikvision")
)
hikvision_cameras = result.scalars().all()
```

### Update Camera Status

```python
from datetime import datetime

camera = await CameraService.get_camera(db, camera_id)
camera.status = CameraStatus.ERROR
camera.connection_error = "Network timeout"
camera.last_status_check = datetime.utcnow()
await db.commit()
```

---

## Testing Examples

### Unit Test - RTSP URL Generation

```python
def test_generate_rtsp_url_hikvision():
    url = RTSPService.generate_rtsp_url(
        brand="hikvision",
        ip_address="192.168.1.100",
        username="admin",
        password="12345",
        channel="101",
        port=554
    )
    assert url == "rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101"

def test_generate_rtsp_url_dahua():
    url = RTSPService.generate_rtsp_url(
        brand="dahua",
        ip_address="192.168.1.100",
        username="admin",
        password="admin123",
        channel="1",
        port=554
    )
    assert url == "rtsp://admin:admin123@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0"
```

### Integration Test - Create and Test Camera

```python
async def test_create_camera_and_test_connection():
    # Create camera
    camera_data = CameraCreate(
        name="Test Camera",
        location="Test Location",
        brand="hikvision",
        rtsp_ip="192.168.1.100",
        rtsp_port=554,
        rtsp_username="admin",
        rtsp_password="12345",
        rtsp_channel="101"
    )
    
    camera = await CameraService.create_camera(db, camera_data)
    assert camera.id is not None
    assert camera.brand == "hikvision"
    
    # Test connection
    result = await CameraService.test_rtsp_connection(db, camera.id)
    assert result["status"] in ["connected", "failed", "error"]
```

---

## Common Issues & Solutions

### Issue 1: Special Characters in Credentials

**Problem:** Password with `@`, `:`, or `%` breaks URL parsing

**Solution:** Credentials are URL-encoded automatically:
```python
# Input: password="pass@123"
# Encoded: "pass%40123"
# Full URL: rtsp://admin:pass%40123@192.168.1.100:554/stream
```

### Issue 2: Connection Timeout

**Problem:** Test takes too long or hangs

**Solution:** Increase timeout or check network:
```python
# Increase timeout
result = RTSPService.test_rtsp_connection(url, timeout=10)

# Or test network first
import subprocess
ping = subprocess.run(["ping", "-c", "1", ip_address])
```

### Issue 3: Generic Brand with Unknown Stream Path

**Problem:** Don't know the stream path for custom camera

**Solution:** Try common paths:
```python
common_paths = [
    "/stream",
    "/live",
    "/media/stream1", 
    "/av0_0",
    "/play",
    "/h264"
]

for path in common_paths:
    url = f"rtsp://admin:password@192.168.1.100:554{path}"
    result = RTSPService.test_rtsp_connection(url)
    if result["status"] == "connected":
        print(f"Found working path: {path}")
```

---

## API Response Examples

### Test RTSP - Success

```json
{
  "status": "connected",
  "message": "RTSP stream is accessible",
  "resolution": "1920x1080",
  "fps": 30.0,
  "rtsp_url": "rtsp://***:***@192.168.1.100:554/Streaming/Channels/101"
}
```

### Test RTSP - Failed

```json
{
  "status": "failed",
  "message": "Cannot read from stream (credentials or URL may be invalid)",
  "resolution": null,
  "fps": null,
  "rtsp_url": "rtsp://***:***@192.168.1.100:554/Streaming/Channels/101"
}
```

### Create Camera

```json
{
  "id": "c7c8f4d3-2b1a-4e9c-8d5f-1a2b3c4d5e6f",
  "name": "Front Gate Camera",
  "location": "Main Gate",
  "brand": "hikvision",
  "rtsp_ip": "192.168.1.100",
  "rtsp_port": 554,
  "rtsp_username": "admin",
  "rtsp_channel": "101",
  "resolution": "1920x1080",
  "fps": 30,
  "status": "inactive",
  "stream_url": "rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101",
  "created_at": "2026-05-25T10:30:00",
  "updated_at": "2026-05-25T10:30:00"
}
```

---

## Performance Notes

### Connection Testing

- **Time:** ~1-5 seconds per camera (depending on timeout)
- **Resource:** Minimal CPU/memory
- **Network:** Uses only RTSP port (554 default)

### Bulk Testing

```python
# Test all cameras efficiently
results = await CameraService.bulk_test_connections(db)
# Returns dict with camera_id -> result mapping
```

### Optimization Tips

1. **Cache brand configs**: Already cached in memory
2. **Parallel testing**: Wrap in asyncio for parallel tests
3. **Connection pooling**: Use connection pool for db

```python
async def test_all_parallel(db):
    cameras = await CameraService.list_cameras(db)
    tasks = [CameraService.test_rtsp_connection(db, cam.id) for cam in cameras]
    results = await asyncio.gather(*tasks)
```

---

## Logging

### Enable Debug Logging

```python
# In backend/.env
LOG_LEVEL=DEBUG

# Or in code
import logging
logging.getLogger("app.services.rtsp_service").setLevel(logging.DEBUG)
```

### View RTSP Logs

```bash
# All RTSP operations
docker-compose logs backend | grep -i rtsp

# Connection tests only
docker-compose logs backend | grep "Testing RTSP"

# Errors only
docker-compose logs backend | grep -i "error.*rtsp"
```

---

## Next Steps

1. **Test all endpoints** in Postman
2. **Create sample cameras** with different brands
3. **Monitor logs** during testing
4. **Add to frontend** UI for camera management
5. **Set up alerts** for connection failures (optional)

---

**Questions?** Refer to:
- `RTSP_CAMERA_SETUP.md` - User guide
- `RTSP_IMPLEMENTATION_SUMMARY.md` - Overview
- API Swagger docs: `http://localhost:8000/docs`
