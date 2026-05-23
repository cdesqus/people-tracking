# Quick Deployment - Copy & Paste Commands
## untuk yang sudah tahu cara kerja Docker

**Waktu**: 10 menit  
**Tingkat kesulitan**: Mudah

---

## 🚀 **FASTEST PATH - Copy Paste Langsung**

### Step 1: Login ke Server & Setup (2 menit)

Copy semua command di bawah satu-satu:

```bash
# 1. Login ke server
ssh ubuntu@192.168.1.100
# Ganti IP dengan IP server kamu

# 2. Setup folder
mkdir -p ~/cctv-dashboard
cd ~/cctv-dashboard

# 3. Verifikasi Docker
docker --version
docker-compose --version
```

---

### Step 2: Copy Project dari Laptop (2 menit)

**Dari laptop kamu, buka terminal baru:**

```bash
# Copy project ke server (sambil tetap di laptop)
scp -r ~/cctv-dashboard ubuntu@192.168.1.100:~/

# Atau jika punya key:
scp -i ~/.ssh/id_rsa -r ~/cctv-dashboard ubuntu@192.168.1.100:~/
```

**Balik ke server terminal:**

```bash
# Verify folder ada
ls -la ~/cctv-dashboard/
```

---

### Step 3: Create .env File (1 menit)

```bash
cd ~/cctv-dashboard

# Create .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://cctv_user:cctv_password@postgres:5432/cctv_db
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET=cctv-faces-bucket
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REDIS_URL=redis://redis:6379
DEBUG=False
WORKERS=4
LOG_LEVEL=INFO
EOF

# Generate secure key
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))" >> .env.generated

# Check file
cat .env
```

---

### Step 4: Start Docker Compose (1 menit)

```bash
cd ~/cctv-dashboard

# Start semua service
docker-compose up -d

# Tunggu 30 detik
sleep 30

# Check status
docker-compose ps
```

---

### Step 5: Run Migrations (1 menit)

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Verify health
curl http://localhost:8000/api/v1/health
```

---

### Step 6: Access Dashboard (instant)

```bash
# Di browser, buka:
http://192.168.1.100:3000

# API Docs:
http://192.168.1.100:8000/docs

# Login dengan:
# Email: admin@company.com
# Password: admin123
```

---

## 📋 **Command Reference Sheet**

```bash
# ===== BASIC COMMANDS =====

# Start
docker-compose up -d

# Stop
docker-compose stop

# Status
docker-compose ps

# Logs
docker-compose logs -f backend

# Restart
docker-compose restart

# Stop & Remove
docker-compose down


# ===== TROUBLESHOOTING =====

# Check health
curl http://localhost:8000/api/v1/health

# Database test
docker-compose exec postgres psql -U cctv_user -d cctv_db -c "SELECT 1"

# Rebuild
docker-compose build --no-cache

# Full reset
docker-compose down -v
docker-compose up -d


# ===== USEFUL =====

# Check resource usage
docker stats

# Backup database
docker-compose exec postgres pg_dump -U cctv_user cctv_db > backup.sql

# View all containers
docker ps -a

# Check network
docker network ls
```

---

## ✅ **Verify Everything Works**

```bash
# 1. Containers running?
docker-compose ps
# Semua harus "Up"

# 2. API healthy?
curl http://localhost:8000/api/v1/health

# 3. Database connected?
docker-compose exec postgres psql -U cctv_user -d cctv_db -c "SELECT COUNT(*) FROM users"

# 4. Frontend accessible?
curl http://localhost:3000 | head -20
```

---

## 🔄 **Daily Operations**

### Start day
```bash
docker-compose up -d
sleep 5
docker-compose ps
```

### Check status
```bash
docker-compose ps
docker stats
```

### View logs
```bash
docker-compose logs -f backend
# Ctrl+C untuk exit
```

### Restart after updates
```bash
docker-compose restart
```

### Shutdown
```bash
docker-compose stop
```

---

## 🆘 **Quick Fixes**

### Port already in use
```bash
sudo lsof -i :3000
sudo lsof -i :8000
sudo kill -9 <PID>
docker-compose restart
```

### Container crashed
```bash
docker-compose logs backend | tail -50
docker-compose restart backend
```

### Database error
```bash
docker-compose restart postgres
sleep 10
docker-compose exec backend alembic upgrade head
```

### Memory issue
```bash
docker system prune
docker-compose up -d
```

---

## 📈 **Performance Check**

```bash
# Real-time stats
docker stats

# Disk usage
df -h

# Project size
du -sh ~/cctv-dashboard

# Container logs size
docker-compose exec backend du -sh /app

# Database size
docker-compose exec postgres psql -U cctv_user -d cctv_db -c "SELECT pg_size_pretty(pg_database_size('cctv_db'))"
```

---

## 💾 **Backup & Restore**

### Quick backup
```bash
docker-compose exec postgres pg_dump -U cctv_user cctv_db > /tmp/backup_$(date +%Y%m%d_%H%M%S).sql

# Copy ke laptop
scp ubuntu@192.168.1.100:/tmp/backup_*.sql ~/backups/
```

### Quick restore
```bash
docker-compose exec -T postgres psql -U cctv_user cctv_db < /tmp/backup_20260523_143000.sql
```

---

## 🔐 **Security Checklist**

```bash
# ✅ Change admin password
# (Di app: Settings > Change Password)

# ✅ Update .env SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# ✅ Setup firewall
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw enable

# ✅ Update system
sudo apt-get update && sudo apt-get upgrade -y

# ✅ Check exposed ports
sudo netstat -tulpn | grep LISTEN
```

---

## 🎯 **What's the Status?**

### After Deployment:
- ✅ Frontend running on port 3000
- ✅ Backend running on port 8000
- ✅ PostgreSQL running (internal)
- ✅ Redis running (internal)
- ✅ Database initialized
- ✅ Ready for production use

### You can now:
- Register employees
- Check-in visitors
- View reports
- Track face detection
- Monitor cameras

---

## 📞 **Emergency Commands**

```bash
# Everything is broken - start fresh
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
sleep 30
docker-compose exec backend alembic upgrade head

# Check what's wrong
docker-compose logs | grep -i error

# Get help
docker-compose --help
```

---

## 🎉 **Done!**

Your CCTV Dashboard is now running!

**Access:**
- Dashboard: `http://your_server_ip:3000`
- API: `http://your_server_ip:8000`
- Docs: `http://your_server_ip:8000/docs`

**Next steps:**
1. Register admin user
2. Add employees
3. Configure cameras
4. Test face detection
5. Set up AWS Rekognition

Happy deploying! 🚀

---

**Pro Tips:**
- Keep .env file safe (don't share)
- Regular backups are important
- Monitor logs regularly
- Update Docker regularly
- Use firewall for security
