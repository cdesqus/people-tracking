# RTSP Camera Integration Guide

## Overview

This guide explains how to integrate CCTV cameras with different brands using flexible RTSP (Real Time Streaming Protocol) configuration. The system automatically handles different RTSP URL formats for various camera brands.

## Supported CCTV Brands

| Brand | Model Examples | Format | Default Port |
|-------|---|---|---|
| **Hikvision** | DS-2CD2xxx, iDS-2xxx | `rtsp://user:pass@ip:554/Streaming/Channels/101` | 554 |
| **Dahua** | IPC-based cameras | `rtsp://user:pass@ip:554/cam/realmonitor?channel=1&subtype=0` | 554 |
| **Uniview** | IPC5xx, IPC6xx | `rtsp://user:pass@ip:554/video1` | 554 |
| **Axis** | P3xxx, P5xxx | `rtsp://user:pass@ip:554/axis-media/media.amp` | 554 |
| **TP-Link** | VIGI series | `rtsp://user:pass@ip:554/stream1` | 554 |
| **Reolink** | RLC, PoE series | `rtsp://user:pass@ip:554/h264Preview_01_main` | 554 |
| **Hikvision V2** | Newer Hikvision | `rtsp://user:pass@ip:554/ISAPI/Stream/Channels/1/HTTP/Query` | 554 |
| **Generic** | Any RTSP | Custom stream path | 554 |

---

## Quick Start: Add a Camera

### Step 1: Get Camera Information

Before adding a camera, gather these details:

```
- Camera Brand: (e.g., Hikvision, Dahua)
- IP Address: 192.168.1.100
- RTSP Port: 554 (usually default)
- Username: admin
- Password: password123
- Channel/Stream: 1 or 101 (brand-specific)
```

### Step 2: Test RTSP Connection (API)

Before saving, test the connection:

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/cameras/test-rtsp" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "hikvision",
    "ip_address": "192.168.1.100",
    "port": 554,
    "username": "admin",
    "password": "password123",
    "channel": "101"
  }'
```

**Response (Success):**
```json
{
  "status": "connected",
  "message": "RTSP stream is accessible",
  "resolution": "1920x1080",
  "fps": 30.0,
  "rtsp_url": "rtsp://***:***@192.168.1.100:554/Streaming/Channels/101"
}
```

**Response (Failed):**
```json
{
  "status": "failed",
  "message": "Cannot read from stream (credentials or URL may be invalid)",
  "resolution": null,
  "fps": null,
  "rtsp_url": "rtsp://***:***@192.168.1.100:554/Streaming/Channels/101"
}
```

### Step 3: Create Camera

Once connection is verified:

**Request:**
```bash
curl -X POST "http://localhost:8000/api/v1/cameras/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Front Gate Camera",
    "location": "Main Gate",
    "branch": "br-hq",
    "resolution": "1920x1080",
    "fps": 30,
    "brand": "hikvision",
    "rtsp_ip": "192.168.1.100",
    "rtsp_port": 554,
    "rtsp_username": "admin",
    "rtsp_password": "password123",
    "rtsp_channel": "101"
  }'
```

**Response:**
```json
{
  "id": "c7c8f4d3-2b1a-4e9c-8d5f-1a2b3c4d5e6f",
  "name": "Front Gate Camera",
  "location": "Main Gate",
  "status": "inactive",
  "stream_url": "rtsp://admin:password123@192.168.1.100:554/Streaming/Channels/101",
  "resolution": "1920x1080",
  "fps": 30,
  "brand": "hikvision",
  "rtsp_ip": "192.168.1.100",
  "rtsp_port": 554,
  "rtsp_username": "admin",
  "rtsp_channel": "101",
  "created_at": "2026-05-25T10:30:00",
  "updated_at": "2026-05-25T10:30:00"
}
```

---

## Camera-Specific Examples

### Hikvision

**Example URL:**
```
rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101
```

**Configuration:**
```json
{
  "brand": "hikvision",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "12345",
  "channel": "101"
}
```

**Notes:**
- Channel format: 101, 102, 103, ... (not just 1, 2, 3)
- Different from Dahua and other brands
- Works with DS-2CD2xxx, iDS-2xxx series

---

### Dahua

**Example URL:**
```
rtsp://admin:admin123@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
```

**Configuration:**
```json
{
  "brand": "dahua",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "admin123",
  "channel": "1"
}
```

**Notes:**
- `subtype=0` for main stream, `subtype=1` for sub stream
- Automatically added by system
- Channel: 1, 2, 3, ... (simple numbering)

---

### Uniview

**Example URL:**
```
rtsp://admin:password@192.168.1.100:554/video1
```

**Configuration:**
```json
{
  "brand": "uniview",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "password",
  "channel": "1"
}
```

**Notes:**
- Simple video1, video2, video3 format
- Works with IPC5xx, IPC6xx series

---

### Axis

**Example URL:**
```
rtsp://admin:password@192.168.1.100:554/axis-media/media.amp
```

**Configuration:**
```json
{
  "brand": "axis",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "password"
}
```

**Notes:**
- Channel parameter not needed
- Unified stream format
- Works with P3xxx, P5xxx series

---

### Reolink

**Example URL:**
```
rtsp://admin:password@192.168.1.100:554/h264Preview_01_main
```

**Configuration:**
```json
{
  "brand": "reolink",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "password",
  "channel": "1"
}
```

**Notes:**
- Format: `h264Preview_0{channel}_main`
- Channel: 1, 2, 3, ... (converted to 01, 02, 03 internally)

---

### Generic RTSP (Unknown Brand)

If your brand is not listed, use generic:

**Example URL:**
```
rtsp://admin:password@192.168.1.100:554/stream
```

**Configuration:**
```json
{
  "brand": "generic",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "password",
  "stream_path": "/stream"
}
```

**Notes:**
- You must know the exact stream path
- Contact manufacturer for stream path info
- Try common paths: `/stream`, `/live`, `/media/stream1`

---

## API Endpoints

### Get All Supported Brands

```bash
curl "http://localhost:8000/api/v1/cameras/brands"
```

Returns configuration template for each brand.

---

### Get Brand Details

```bash
curl "http://localhost:8000/api/v1/cameras/brands/hikvision"
```

```json
{
  "brand": "hikvision",
  "label": "Hikvision",
  "template": "rtsp://{user}:{password}@{ip}:{port}/Streaming/Channels/{channel}",
  "default_port": 554,
  "default_channel": "101",
  "channel_format": "101, 102, 103, ...",
  "description": "DS-2CD2xxx series, iDS-2xxx series",
  "example_url": "rtsp://admin:12345@192.168.1.100:554/Streaming/Channels/101"
}
```

---

### Test RTSP Connection

This endpoint **MUST** be called before saving a camera to verify connectivity.

```bash
curl -X POST "http://localhost:8000/api/v1/cameras/test-rtsp" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "dahua",
    "ip_address": "192.168.1.100",
    "port": 554,
    "username": "admin",
    "password": "admin123",
    "channel": "1"
  }'
```

---

### List Cameras

```bash
curl "http://localhost:8000/api/v1/cameras/"
curl "http://localhost:8000/api/v1/cameras/?branch=br-hq"
curl "http://localhost:8000/api/v1/cameras/?status=active"
```

---

### Get Single Camera

```bash
curl "http://localhost:8000/api/v1/cameras/{camera_id}"
```

---

### Update Camera

```bash
curl -X PUT "http://localhost:8000/api/v1/cameras/{camera_id}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "rtsp_channel": "102"
  }'
```

**Note:** Changing RTSP parameters will regenerate the stream URL automatically.

---

### Delete Camera

```bash
curl -X DELETE "http://localhost:8000/api/v1/cameras/{camera_id}"
```

---

### Test Single Camera Connection

After camera is created, test its connection:

```bash
curl -X POST "http://localhost:8000/api/v1/cameras/{camera_id}/test-connection"
```

---

### Test All Cameras

Test connectivity for all cameras:

```bash
curl -X POST "http://localhost:8000/api/v1/cameras/test-all/connections"
```

```json
{
  "tested": 3,
  "results": {
    "cam1": {
      "status": "connected",
      "message": "RTSP stream is accessible",
      "resolution": "1920x1080",
      "fps": 30.0
    },
    "cam2": {
      "status": "failed",
      "message": "Cannot read from stream ...",
      "resolution": null,
      "fps": null
    }
  }
}
```

---

## Frontend Integration

### Setup: Get Supported Brands

When adding a new camera, fetch supported brands:

```javascript
const brands = await fetch('/api/v1/cameras/brands').then(r => r.json());
// Populate brand dropdown with brands data
```

### Test Before Save

```javascript
// Step 1: Get form values from user
const formData = {
  brand: 'hikvision',
  ip_address: '192.168.1.100',
  port: 554,
  username: 'admin',
  password: 'password',
  channel: '101'
};

// Step 2: Test connection
const testResult = await fetch('/api/v1/cameras/test-rtsp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
}).then(r => r.json());

if (testResult.status !== 'connected') {
  // Show error to user
  alert(`Connection failed: ${testResult.message}`);
  return;
}

// Step 3: If test passes, save camera
const camera = await fetch('/api/v1/cameras/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: formData.name,
    location: formData.location,
    branch: formData.branch,
    ...formData
  })
}).then(r => r.json());
```

---

## Troubleshooting

### "Cannot read from stream" Error

**Causes & Solutions:**

1. **Wrong credentials**
   - Verify username and password on the camera
   - Test with manufacturer's software first

2. **Wrong channel format**
   - Hikvision uses 101, 102 (not 1, 2)
   - Dahua uses 1, 2, 3
   - Check the examples above for your brand

3. **Wrong IP address**
   - Verify IP with camera's web interface
   - Check network connectivity: `ping 192.168.1.100`

4. **Firewall blocking RTSP port**
   - Ensure RTSP port 554 is open
   - Try: `telnet 192.168.1.100 554`

5. **Camera not accessible from server**
   - Verify camera and server are on same network
   - Try connecting from server terminal first

### How to Find Correct RTSP URL

**For your specific camera model:**

1. Access camera's web interface
2. Go to Settings → Stream or Network Settings
3. Look for "RTSP" or "Stream URL"
4. Copy the URL shown

**If not visible:**

1. Download manufacturer's documentation
2. Search online: `"{brand} {model} RTSP URL"`
3. Test URL from server terminal:
   ```bash
   ffprobe -rtsp_transport tcp rtsp://admin:password@192.168.1.100:554/stream
   ```

### Test Connection Timeout

**If test takes too long (>5 seconds):**

1. Camera might be offline
2. Network might be slow/unstable
3. Try increasing timeout (but not recommended for production)

---

## Security Considerations

⚠️ **Important Security Notes:**

1. **Never hardcode credentials** in frontend
2. **Encrypt passwords** in database (use environment variables)
3. **Use HTTPS** when sending credentials
4. **Change default credentials** on all cameras
5. **Use separate RTSP user** (not admin account if possible)
6. **Firewall configuration**: Only allow RTSP from application server

**Database Security:**
```python
# ✅ DO: Use environment variables
RTSP_PASSWORD = os.getenv("RTSP_PASSWORD")

# ❌ DON'T: Hardcode credentials
RTSP_PASSWORD = "password123"
```

---

## Advanced: Custom RTSP URLs

For unsupported brands, you can use **direct RTSP URL**:

```json
{
  "brand": "generic",
  "ip_address": "192.168.1.100",
  "port": 554,
  "username": "admin",
  "password": "password",
  "stream_path": "/h264/ch1/main/av_stream"
}
```

Contact your camera manufacturer for the exact stream path.

---

## Performance Tips

1. **Use main stream** if available (better performance)
   - Dahua: use `subtype=0` (default)
   - Reolink: use `_main` (default)

2. **Adjust resolution** for bandwidth-limited networks
   - 1920x1080 = high quality, high bandwidth
   - 1280x720 = good quality, lower bandwidth
   - 640x480 = lower quality, minimal bandwidth

3. **Monitor connection status**
   - Set up periodic connection tests
   - Use `/test-all/connections` endpoint

4. **Use TCP transport** if UDP is unreliable
   - Most connections default to UDP
   - Can specify TCP in pipeline if needed

---

## Next Steps

- [Dashboard Usage Guide](./DASHBOARD_README.md)
- [API Documentation](./API_ENDPOINTS_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

---

**Questions?** Check the logs:
```bash
docker-compose logs -f backend | grep -i rtsp
```
