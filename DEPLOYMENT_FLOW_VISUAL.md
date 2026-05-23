# Deployment Flow - Visual Guide

---

## 📊 **Complete Deployment Path**

```
START HERE
    ↓
┌─────────────────────────────────┐
│ 1. CHECK SERVER (5 menit)       │
│  ✓ SSH ke server                │
│  ✓ Verify Docker installed      │
│  ✓ Check disk space (min 5GB)   │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 2. SETUP PROJECT (5 menit)      │
│  ✓ Create folder                │
│  ✓ Copy files dari laptop       │
│  ✓ Verify structure             │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 3. CREATE .env (5 menit)        │
│  ✓ Copy template                │
│  ✓ Generate SECRET_KEY          │
│  ✓ Save file                    │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 4. START DOCKER (3 menit)       │
│  ✓ docker-compose up -d         │
│  ✓ Wait for healthy status      │
│  ✓ Verify all containers        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 5. INIT DATABASE (2 menit)      │
│  ✓ Run migrations               │
│  ✓ Verify tables created        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ 6. VERIFY & TEST (5 menit)      │
│  ✓ Health check API             │
│  ✓ Open dashboard in browser    │
│  ✓ Login & test features        │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ ✅ DONE! (Total: 25 menit)      │
│                                 │
│ Dashboard: http://ip:3000       │
│ API: http://ip:8000             │
│ Docs: http://ip:8000/docs       │
└─────────────────────────────────┘
```

---

## 🎯 **Step-by-Step Timeline**

### **Minute 0-5: Check & Setup**
```
00:00 │ Login ke server (ssh)
01:00 │ Create folder, copy files
02:00 │ Verify Docker
03:00 │ List project files
04:00 │ Ready untuk next step
```

### **Minute 5-10: Environment**
```
05:00 │ Create .env file
06:00 │ Generate SECRET_KEY
07:00 │ Save credentials
08:00 │ Verify .env format
09:00 │ Ready untuk start Docker
```

### **Minute 10-15: Docker Startup**
```
10:00 │ docker-compose up -d
10:30 │ Containers starting...
11:00 │ Postgres ready
11:30 │ Redis ready
12:00 │ Backend ready
13:00 │ Frontend ready
14:00 │ All services healthy
15:00 │ Ready untuk database init
```

### **Minute 15-20: Database Init**
```
15:00 │ Run migrations
15:30 │ Tables created
16:00 │ Indexes created
17:00 │ Database ready
18:00 │ Ready untuk testing
```

### **Minute 20-25: Testing**
```
20:00 │ curl health check
20:30 │ Open browser
21:00 │ Login to dashboard
22:00 │ Test features
23:00 │ Everything working!
```

---

## 🔄 **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR LAPTOP                           │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Browser                                            │  │
│ │ http://server_ip:3000                            │  │
│ │ http://server_ip:8000/docs                       │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       │
┌──────────────────────v──────────────────────────────────┐
│              LINUX SERVER (Docker)                       │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │          Frontend Container (React)             │   │
│  │  Port 3000 - React Dashboard                   │   │
│  │  - Login page                                  │   │
│  │  - Employee management                        │   │
│  │  - Visitor tracking                           │   │
│  │  - Reports & analytics                        │   │
│  │  - Settings                                   │   │
│  └────────────┬────────────────────────────────────┘   │
│               │ HTTP API Calls                         │
│  ┌────────────v────────────────────────────────────┐   │
│  │         Backend Container (FastAPI)            │   │
│  │  Port 8000 - REST API                         │   │
│  │  - Authentication endpoints                  │   │
│  │  - Employee CRUD                            │   │
│  │  - Visitor check-in/out                     │   │
│  │  - Face detection search                    │   │
│  │  - Reports & analytics                      │   │
│  │  - WebSocket real-time                      │   │
│  └────────────┬─────────────────────────────────┘   │
│               │ SQL Queries                         │
│  ┌────────────v─────────────────────────────────┐   │
│  │    PostgreSQL Container (Database)            │   │
│  │  Port 5432 (internal only)                   │   │
│  │  - Users table                               │   │
│  │  - Employees table                           │   │
│  │  - Visitors table                            │   │
│  │  - Detections table                          │   │
│  │  - Cameras table                             │   │
│  │  - Alerts table                              │   │
│  │  - Audit logs table                          │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │      Redis Container (Cache)                  │   │
│  │  Port 6379 (internal only)                   │   │
│  │  - Session cache                             │   │
│  │  - Face detection cache                      │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS API
                   │
        ┌──────────v──────────┐
        │   AWS Rekognition   │
        │  - Face detection   │
        │  - Face indexing    │
        │  - Face search      │
        │  - Collections      │
        └────────────────────┘
```

---

## 📋 **Command Cheat Sheet by Phase**

### **Phase 1: Check (Minute 0-5)**
```bash
# Login
ssh ubuntu@192.168.1.100

# Verify Docker
docker --version
docker-compose --version

# Create folder
mkdir -p ~/cctv-dashboard
cd ~/cctv-dashboard
```

### **Phase 2: Setup (Minute 5-10)**
```bash
# Copy project
scp -r ~/cctv-dashboard ubuntu@192.168.1.100:~/

# Verify
ls -la ~/cctv-dashboard/

# Create .env
cat > .env << 'EOF'
...content...
EOF
```

### **Phase 3: Docker (Minute 10-15)**
```bash
# Start
docker-compose up -d

# Check
docker-compose ps

# Wait
sleep 30

# Verify
curl http://localhost:8000/api/v1/health
```

### **Phase 4: Database (Minute 15-20)**
```bash
# Migrations
docker-compose exec backend alembic upgrade head

# Verify
docker-compose exec postgres psql -U cctv_user -d cctv_db -c "SELECT COUNT(*) FROM users"
```

### **Phase 5: Test (Minute 20-25)**
```bash
# Browser
# http://192.168.1.100:3000

# API Docs
# http://192.168.1.100:8000/docs

# Login
# Email: admin@company.com
# Password: admin123
```

---

## ⏱️ **Timeline Per Skill Level**

### **Beginner (Baru pertama kali)**
```
Total: 30-45 menit

1. Read docs thoroughly         (10 menit)
2. Setup & copy files           (10 menit)
3. Create .env carefully        (5 menit)
4. Start Docker                 (3 menit)
5. Wait & verify                (5 menit)
6. Test & troubleshoot          (5 menit)
```

### **Intermediate (Sudah tahu Docker)**
```
Total: 15-20 menit

1. Copy files                   (3 menit)
2. Create .env                  (2 menit)
3. docker-compose up            (3 menit)
4. Run migrations               (2 menit)
5. Test                         (5 menit)
```

### **Advanced (DevOps pro)**
```
Total: 5-10 menit

docker-compose up -d && \
docker-compose exec backend alembic upgrade head && \
curl http://localhost:8000/api/v1/health
```

---

## ✅ **Verification Checklist**

```
Minute 0-5:   ☐ SSH working
              ☐ Docker available
              ☐ Folder created

Minute 5-10:  ☐ Files copied
              ☐ .env created
              ☐ SECRET_KEY generated

Minute 10-15: ☐ docker-compose up done
              ☐ All containers running
              ☐ No error logs

Minute 15-20: ☐ Migrations successful
              ☐ Database tables exist
              ☐ Health check passing

Minute 20-25: ☐ Dashboard accessible
              ☐ Can login
              ☐ API docs working
              ☐ All features accessible

FINAL: ✅ READY FOR PRODUCTION
```

---

## 🎯 **Success Indicators**

### ✅ Services Running
```bash
$ docker-compose ps

STATUS               PORTS
Up (healthy)        5432/tcp
Up (healthy)        6379/tcp
Up                  0.0.0.0:8000->8000/tcp
Up                  0.0.0.0:3000->3000/tcp
```

### ✅ API Healthy
```bash
$ curl http://localhost:8000/api/v1/health

{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "aws": "available"
  }
}
```

### ✅ Dashboard Accessible
```
Browser: http://server_ip:3000
Login works
Dashboard shows
All pages accessible
```

### ✅ Database Ready
```bash
$ docker-compose exec postgres psql -U cctv_user -d cctv_db -c "\dt"

                  List of relations
Schema |     Name      | Type  |   Owner
-------+---------------+-------+----------
public | users         | table | cctv_user
public | employees     | table | cctv_user
public | visitors      | table | cctv_user
public | detections    | table | cctv_user
public | cameras       | table | cctv_user
public | alerts        | table | cctv_user
public | audit_logs    | table | cctv_user
```

---

## 🚀 **From Deploy to Production**

```
Day 1:  Deploy & test
Day 2:  Register employees
Day 3:  Setup cameras
Day 4:  Configure AWS Rekognition
Day 5:  Run full system test
Day 6-7: Staff training
Week 2: Go live!
```

---

## 📞 **If Something Goes Wrong**

```
Problem: Can't SSH to server
→ Check IP address
→ Check SSH key permissions
→ Try without key first

Problem: Docker not found
→ Run: sudo apt-get install docker.io
→ Add user to docker group: sudo usermod -aG docker $USER

Problem: Container won't start
→ Check logs: docker-compose logs service_name
→ Rebuild: docker-compose build --no-cache
→ Restart: docker-compose restart

Problem: Database error
→ Check: docker-compose logs postgres
→ Restart: docker-compose restart postgres
→ Re-init: docker-compose exec backend alembic upgrade head

Problem: Can't access dashboard
→ Check: docker-compose ps (all running?)
→ Check firewall: sudo ufw status
→ Try: curl http://localhost:3000
```

---

## 🎉 **You're Ready!**

Pick one guide and start:
1. **First time?** → Read `DEPLOYMENT_STEP_BY_STEP_LINUX.md`
2. **Already know Docker?** → Use `QUICK_DEPLOYMENT_COPY_PASTE.md`
3. **Need AWS?** → Follow `AWS_REKOGNITION_SETUP.md`

**Total time: 25 minutes to production!** ⚡

---

**Deployment Status**: ✅ READY
**Difficulty**: 🟢 EASY  
**Time**: ⏱️ 25 minutes

Good luck! 🚀
