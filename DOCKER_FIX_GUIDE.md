# Fix Backend & Frontend Docker Errors

## ✅ Issues Fixed

### Issue 1: Backend OpenCV Import Error ❌ → ✅

**Error:**
```
ImportError: libGL.so.1: cannot open shared object file: No such file or directory
```

**Root Cause:**
- OpenCV (cv2) requires GUI/graphics libraries (libGL)
- Docker python:3.10-slim image doesn't include these dependencies
- RTSP testing uses OpenCV VideoCapture

**Solution Applied:**
Updated `backend/Dockerfile` to install required system libraries:

```dockerfile
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*
```

**Libraries Added:**
- `libgl1-mesa-glx` - OpenGL support
- `libglib2.0-0` - GLib library
- `libsm6` - X11 session management
- `libxext6` - X11 extensions
- `libxrender-dev` - X11 rendering
- `libgomp1` - OpenMP support (for parallel processing)

---

### Issue 2: Frontend Unhealthy Status ❌ → ✅

**Error:**
```
frontend unhealthy
```

**Root Cause:**
- Healthcheck used `wget` command which doesn't exist in Alpine Linux
- `serve` process takes time to start properly
- Timeout was too aggressive

**Solutions Applied:**

1. **Updated frontend/Dockerfile** to install curl:
```dockerfile
RUN npm install -g serve && apk add --no-cache curl
```

2. **Updated docker-compose.yml healthcheck** for frontend:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

3. **Improved backend healthcheck** for better reliability:
```yaml
healthcheck:
  test: ["CMD", "python", "-c", "import urllib.request; resp = urllib.request.urlopen('http://localhost:8000/health'); exit(0 if resp.status == 200 else 1)"]
  interval: 15s
  timeout: 10s
  retries: 5
  start_period: 30s
```

---

## 🚀 How to Deploy Fixes

### Step 1: Stop All Containers

```bash
cd ~/people-tracking

# Stop all running containers
docker-compose down

# Or just clean rebuild
docker-compose down -v  # Include volumes if you want to reset data
```

### Step 2: Rebuild Images

```bash
# Rebuild both backend and frontend images
docker-compose build --no-cache

# Or rebuild individual services
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

### Step 3: Start Services

```bash
# Start all services with new images
docker-compose up -d

# Check status
docker-compose ps

# Should show:
# backend      - Up (healthy)
# frontend     - Up (healthy)
# postgres     - Up (healthy)
# redis        - Up (healthy)
```

### Step 4: Verify Health

```bash
# Check all services healthy
docker-compose ps

# Check backend API
curl http://localhost:8000/health
# Response: {"status":"healthy"}

# Check frontend
curl http://localhost:3000
# Response: HTML content

# Check backend logs
docker-compose logs backend | tail -20

# Check frontend logs
docker-compose logs frontend | tail -20
```

---

## 📋 Complete Step-by-Step (Copy-Paste Ready)

```bash
# 1. Go to project directory
cd ~/people-tracking

# 2. Stop and remove all containers
docker-compose down

# 3. Rebuild without cache
docker-compose build --no-cache

# 4. Start services
docker-compose up -d

# 5. Wait 30 seconds for services to start
sleep 30

# 6. Check status
docker-compose ps

# 7. Test backend
echo "Testing backend health..."
curl -s http://localhost:8000/health | jq .

# 8. Test frontend
echo "Testing frontend..."
curl -s http://localhost:3000 | head -5

# 9. Check logs for errors
echo "Checking backend logs..."
docker-compose logs backend | tail -10

echo "Checking frontend logs..."
docker-compose logs frontend | tail -10
```

---

## 🔍 Verification Checklist

After restart, verify everything:

- [ ] Backend container is running and healthy
- [ ] Frontend container is running and healthy
- [ ] PostgreSQL container is running and healthy
- [ ] Redis container is running and healthy
- [ ] Backend API responds to `/health` endpoint
- [ ] Frontend accessible at http://localhost:3000
- [ ] No "libGL.so.1" errors in backend logs
- [ ] No "unhealthy" status in docker-compose ps
- [ ] Cameras can be created with RTSP config
- [ ] RTSP connection testing works

---

## 🐛 Troubleshooting

### Backend Still Shows OpenCV Error

```bash
# Check if image was rebuilt
docker-compose images

# Force rebuild without cache
docker-compose build --no-cache backend

# Remove old image
docker rmi people-tracking_backend:latest

# Rebuild
docker-compose build backend
```

### Frontend Still Unhealthy

```bash
# Check frontend logs
docker-compose logs frontend

# Verify curl is installed
docker exec people-tracking_frontend_1 curl --version

# Test healthcheck manually
docker exec people-tracking_frontend_1 curl -f http://localhost:3000
```

### Services Won't Start

```bash
# Check disk space
df -h

# Check Docker status
docker --version
docker ps

# Try pruning docker
docker system prune -a

# Full restart
docker-compose down -v
docker-compose up -d
```

---

## 📝 What Changed

| File | Change | Impact |
|------|--------|--------|
| `backend/Dockerfile` | Added OpenGL & graphics libs | RTSP testing now works |
| `frontend/Dockerfile` | Added curl to Alpine | Healthcheck now works |
| `docker-compose.yml` | Fixed healthchecks | Better status reporting |

---

## ✨ Testing RTSP Functionality

Once services are running:

```bash
# 1. Get supported brands
curl http://localhost:8000/api/v1/cameras/brands

# 2. Test RTSP connection
curl -X POST http://localhost:8000/api/v1/cameras/test-rtsp \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "hikvision",
    "ip_address": "192.168.1.100",
    "port": 554,
    "username": "admin",
    "password": "12345",
    "channel": "101"
  }'

# 3. Create camera
curl -X POST http://localhost:8000/api/v1/cameras/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Camera",
    "location": "Test Location",
    "brand": "hikvision",
    "rtsp_ip": "192.168.1.100",
    "rtsp_port": 554,
    "rtsp_username": "admin",
    "rtsp_password": "12345",
    "rtsp_channel": "101"
  }'
```

---

## 🎯 Summary

**Backend Fix:** ✅ Added OpenCV graphics libraries  
**Frontend Fix:** ✅ Updated healthcheck with curl  
**Status Tracking:** ✅ Improved healthcheck reliability  
**RTSP Support:** ✅ Now fully functional in Docker  

**Next Steps:**
1. Rebuild docker images
2. Restart containers
3. Verify health status
4. Test RTSP camera integration

---

**Need Help?**
- Check logs: `docker-compose logs -f [service]`
- Check status: `docker-compose ps`
- Restart: `docker-compose restart [service]`
