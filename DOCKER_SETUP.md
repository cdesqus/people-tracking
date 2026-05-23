# Docker Setup Guide - One Command Development Environment

## 📦 What's Included

The `docker-compose.yml` sets up a complete development environment:

```
┌─────────────────────────────────────┐
│   Frontend (React + Vite)           │
│   http://localhost:3000             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Backend (FastAPI)                 │
│   http://localhost:8000             │
│   API Docs: /docs                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   localhost:5432                    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   Redis Cache                       │
│   localhost:6379                    │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
```bash
# Install Docker and Docker Compose
# macOS/Linux: https://docs.docker.com/desktop/
# Windows: https://docs.docker.com/desktop/install/windows-install/

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone or Navigate to Project
```bash
cd cctv-dashboard-project
```

### 3. Set Up Environment Files
```bash
# Copy example files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit backend/.env with your AWS credentials
# (Or skip and use mock AWS for testing)
```

### 4. Start All Services
```bash
# Start in background
docker-compose up -d

# Watch logs (optional)
docker-compose logs -f

# Or start in foreground for development
docker-compose up
```

### 5. Verify Services Are Running
```bash
# Check status
docker-compose ps

# Should show 4 containers running:
# - cctv-frontend
# - cctv-backend
# - cctv-postgres
# - cctv-redis
```

### 6. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🛑 Stop Services

### Stop All Containers (Data Preserved)
```bash
docker-compose stop
```

### Remove Containers (Data Preserved)
```bash
docker-compose down
```

### Remove Everything (Reset to Fresh)
```bash
docker-compose down -v
```

---

## 📊 Database Initialization

### First Time Setup
```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create sample data (optional)
docker-compose exec backend python app/scripts/init_db.py
```

### Access PostgreSQL Directly
```bash
# Connect to database
docker-compose exec postgres psql -U cctv_user -d cctv_db

# List tables
\dt

# Exit
\q
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U cctv_user cctv_db > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U cctv_user cctv_db < backup.sql
```

---

## 🔧 Development Workflow

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Real-time logs
docker-compose logs -f backend

# Last 50 lines
docker-compose logs --tail=50 backend
```

### Run Commands Inside Container
```bash
# Backend Python
docker-compose exec backend python app/main.py

# Backend Shell
docker-compose exec backend bash

# Frontend Node
docker-compose exec frontend npm install

# Frontend Shell
docker-compose exec frontend sh
```

### Install New Dependencies

#### Backend
```bash
# Add dependency
docker-compose exec backend pip install package_name

# Update requirements.txt
docker-compose exec backend pip freeze > requirements.txt

# Rebuild image
docker-compose build backend
docker-compose up -d backend
```

#### Frontend
```bash
# Add dependency
docker-compose exec frontend npm install package_name

# Rebuild image
docker-compose build frontend
docker-compose up -d frontend
```

---

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check error logs
docker-compose logs backend

# Rebuild specific container
docker-compose build --no-cache backend

# Restart
docker-compose up -d backend
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000   # Frontend
lsof -i :8000   # Backend
lsof -i :5432   # Database

# Kill the process
kill -9 <PID>
```

### Database Connection Failed
```bash
# Wait for database to be ready
docker-compose exec backend python app/wait_for_db.py

# Check database is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres
```

### Frontend Not Updating
```bash
# Rebuild without cache
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Clear Everything and Start Fresh
```bash
# Stop all containers
docker-compose down -v

# Remove images
docker-compose rm -f

# Start fresh
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head
```

---

## 📈 Performance Tips

### Increase Resource Limits
Edit `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Enable Auto-reload for Development
Backend already has auto-reload via Uvicorn.
Frontend has hot-reload via Vite.

---

## 🔒 Production Considerations

⚠️ **NOT FOR PRODUCTION USE** - This Docker setup is for development only.

For production, you should:
- [ ] Use separate, hardened images
- [ ] Enable HTTPS/TLS
- [ ] Use proper secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] Set up proper logging (ELK stack, CloudWatch)
- [ ] Configure backups
- [ ] Use load balancing
- [ ] Enable monitoring (Prometheus, Datadog)
- [ ] Set up CI/CD pipeline

See `DEPLOYMENT.md` for production setup guide.

---

## 📚 Docker Compose Reference

### Full Command Reference
```bash
# Start services
docker-compose up                 # foreground
docker-compose up -d              # background

# Stop services
docker-compose stop               # graceful
docker-compose down               # remove containers
docker-compose down -v            # remove volumes (data)

# View status
docker-compose ps                 # list containers
docker-compose logs               # view logs
docker-compose logs -f            # follow logs

# Execute commands
docker-compose exec service cmd   # run command in service
docker-compose run service cmd    # run command in new container

# Build images
docker-compose build              # build all
docker-compose build service      # build specific
docker-compose build --no-cache   # build without cache

# Clean up
docker-compose rm                 # remove stopped containers
docker image prune                # remove unused images
docker volume prune               # remove unused volumes
```

---

## ✅ Verification Checklist

After starting services, verify everything works:

```bash
# 1. Services running
docker-compose ps
# ✓ All containers should show "Up"

# 2. Frontend accessible
curl http://localhost:3000
# ✓ Should get HTML response

# 3. Backend accessible
curl http://localhost:8000/health
# ✓ Should get {"status":"healthy"}

# 4. Database accessible
docker-compose exec postgres psql -U cctv_user -d cctv_db -c "SELECT 1"
# ✓ Should return "1"

# 5. Redis accessible
docker-compose exec redis redis-cli ping
# ✓ Should return "PONG"

# 6. API Documentation
curl http://localhost:8000/docs
# ✓ Should get Swagger UI HTML
```

---

**Docker Setup Complete** ✅  
**Ready for Development** 🚀

