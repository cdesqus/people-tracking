# Deployment Step-by-Step untuk Linux Server dengan Docker
## Panduan untuk Pemula

**Durasi**: ~30 menit  
**Kesulitan**: Sangat Mudah  
**Requirements**: Linux server dengan Docker sudah terinstall

---

## 📋 Pre-Deployment Checklist

Sebelum mulai, pastikan:
- [ ] Sudah punya Linux server (Ubuntu 20.04+ recommended)
- [ ] Docker sudah terinstall di server
- [ ] Punya akses SSH ke server
- [ ] AWS account sudah ada (untuk AWS Rekognition)

---

## 🔍 **STEP 1: Check Docker di Server (5 menit)**

### 1.1 Login ke Server
```bash
# Di laptop/komputer kamu, buka terminal
ssh username@server_ip_address

# Contoh:
ssh ubuntu@192.168.1.100

# Atau kalau punya private key:
ssh -i /path/to/private/key.pem ubuntu@192.168.1.100
```

**Penjelasan**: `ssh` = secure shell, cara aman untuk remote ke server

---

### 1.2 Verifikasi Docker Sudah Ada
```bash
# Cek versi Docker
docker --version

# Output harusnya seperti:
# Docker version 20.10.12, build e91ed57

# Cek versi Docker Compose
docker-compose --version

# Output harusnya seperti:
# Docker Compose version 2.2.1
```

**Jika error**: 
```bash
# Install Docker (jika belum)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose -y
```

---

## 📂 **STEP 2: Setup Project di Server (5 menit)**

### 2.1 Buat Folder Project
```bash
# Buat folder untuk project
mkdir -p ~/cctv-dashboard
cd ~/cctv-dashboard

# Verifikasi sudah masuk folder
pwd
# Harusnya output: /home/username/cctv-dashboard
```

**Penjelasan**: 
- `mkdir` = buat folder baru
- `-p` = buat folder parent jika belum ada
- `~` = home directory user

---

### 2.2 Download Project Files

**Opsi A: Dari GitHub (jika sudah di-push)**
```bash
git clone https://github.com/your-username/cctv-dashboard.git
cd cctv-dashboard
```

**Opsi B: Copy Manual dari Laptop (PALING MUDAH untuk pemula)**

Di laptop kamu:
```bash
# Copy project ke server
scp -r /path/to/cctv-dashboard username@server_ip:~/

# Contoh:
scp -r ~/cctv-dashboard ubuntu@192.168.1.100:~/
```

Atau jika punya private key:
```bash
scp -i /path/to/key.pem -r ~/cctv-dashboard ubuntu@192.168.1.100:~/
```

---

### 2.3 Verifikasi File Sudah Ada
```bash
# Di server, cek file project
ls -la ~/cctv-dashboard/

# Harusnya ada:
# frontend/
# backend/
# docker-compose.yml
# docker-compose.prod.yml
# README.md
```

---

## 🔧 **STEP 3: Setup Environment Variables (5 menit)**

### 3.1 Buat File .env
```bash
# Masuk ke folder project
cd ~/cctv-dashboard

# Buat file .env
nano .env
```

**Penjelasan**: `nano` = text editor di terminal

---

### 3.2 Copy Isi Ke File .env

Paste ini ke dalam nano (klik kanan paste):

```env
# DATABASE
DATABASE_URL=postgresql://cctv_user:cctv_password@postgres:5432/cctv_db

# AWS (OPTIONAL - gunakan nanti setelah berhasil jalan)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET=cctv-faces-bucket

# SECURITY (PENTING: GANTI INI!)
SECRET_KEY=change-this-to-random-key-in-production-12345678901234567890
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# SERVER
DEBUG=False
WORKERS=4
LOG_LEVEL=INFO

# REDIS
REDIS_URL=redis://redis:6379

# APP
APP_NAME=CCTV Dashboard
APP_VERSION=1.0.0
```

---

### 3.3 Save File
```bash
# Tekan: Ctrl + O (untuk save)
# Tekan: Enter (confirm)
# Tekan: Ctrl + X (exit nano)
```

---

### 3.4 Generate SECRET_KEY yang Aman
```bash
# Generate key yang random
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Hasilnya contoh: ZT8-K-9aBcDeFgHiJkLmNoPqRsTuVwXyZ1a2b3c

# Edit file .env lagi
nano .env

# Ganti "change-this-to-random-key-in-production-12345678901234567890"
# dengan hasil generate di atas
```

---

## 🐳 **STEP 4: Run Docker Compose (3 menit)**

### 4.1 Start Aplikasi
```bash
# Pastikan di folder project
cd ~/cctv-dashboard

# Start semua service
docker-compose up -d

# Penjelasan:
# docker-compose = command Docker Compose
# up = jalankan service
# -d = detached mode (jalan di background)
```

**Output harusnya:**
```
Creating postgres ... done
Creating redis ... done
Creating backend ... done
Creating frontend ... done
```

---

### 4.2 Tunggu Service Siap
```bash
# Lihat status container
docker-compose ps

# Output harusnya:
# NAME                COMMAND             STATUS              PORTS
# postgres            "docker-entrypoint" Up (healthy)        5432/tcp
# redis               "docker-entrypoint" Up (healthy)        6379/tcp
# backend             "uvicorn app..."    Up                  0.0.0.0:8000->8000/tcp
# frontend            "serve -s dist"     Up                  0.0.0.0:3000->3000/tcp
```

**Tunggu sampai semua "Up" (±1-2 menit)**

---

### 4.3 Check Logs (untuk pastikan tidak ada error)
```bash
# Lihat log backend
docker-compose logs backend | tail -20

# Lihat log frontend
docker-compose logs frontend | tail -20

# Lihat semua log
docker-compose logs | tail -50
```

**Penjelasan**: `tail -20` = tampilkan 20 baris terakhir

---

## ✅ **STEP 5: Verifikasi Aplikasi Jalan (3 menit)**

### 5.1 Test Backend API
```bash
# Di server, test API health check
curl http://localhost:8000/api/v1/health

# Harusnya output:
# {"status":"healthy","timestamp":"2026-05-23T...","services":{"database":"connected","redis":"connected","aws":"available"},"version":"1.0.0"}
```

---

### 5.2 Test dari Laptop/Browser
```bash
# Di laptop kamu, buka browser
# Frontend: http://server_ip:3000
# Contoh: http://192.168.1.100:3000

# Backend API: http://server_ip:8000
# Contoh: http://192.168.1.100:8000

# API Documentation: http://server_ip:8000/docs
# Contoh: http://192.168.1.100:8000/docs
```

---

### 5.3 Test Login
```bash
# Di browser, buka http://server_ip:3000
# Login dengan:
# Email: admin@company.com
# Password: admin123

# Jika berhasil, kamu akan lihat dashboard
```

---

## 🗄️ **STEP 6: Setup Database (2 menit)**

### 6.1 Run Database Migrations
```bash
# Di server terminal, run migrations
docker-compose exec backend alembic upgrade head

# Output harusnya:
# INFO [alembic.runtime.migration] Context impl PostgresqlImpl()
# INFO [alembic.runtime.migration] Will assume transactional DDL.
# INFO [alembic.runtime.migration] Running upgrade -> xxxxx
```

---

### 6.2 Verifikasi Database
```bash
# Connect ke database
docker-compose exec postgres psql -U cctv_user -d cctv_db

# List tables
\dt

# Harusnya ada: users, employees, visitors, detections, cameras, alerts, audit_logs

# Exit
\q
```

---

## 🔐 **STEP 7: Setup AWS Rekognition (OPSIONAL - buat nanti)**

### 7.1 Jika Ingin Gunakan AWS Recognition

```bash
# 1. Buka AWS Console di browser
# 2. Go ke IAM > Users
# 3. Create user "cctv-api" dengan programmatic access
# 4. Attach policy: "AmazonRekognitionFullAccess"
# 5. Save Access Key dan Secret Key

# 6. Edit file .env di server
nano .env

# 7. Ganti AWS credentials:
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=your-bucket-name

# 8. Save dan restart backend
docker-compose restart backend
```

---

## 📊 **STEP 8: Verifikasi Semuanya Jalan (2 menit)**

### 8.1 Checklist Final
```bash
# 1. Container jalan?
docker-compose ps
# Status harus "Up" untuk semua

# 2. Logs clean (no error)?
docker-compose logs | grep -i error
# Harusnya tidak ada output (no error)

# 3. API respond?
curl http://localhost:8000/api/v1/health
# Harusnya: {"status":"healthy"...}

# 4. Frontend bisa diakses?
curl http://localhost:3000
# Harusnya: HTML response (tidak error)

# 5. Database terhubung?
docker-compose exec postgres psql -U cctv_user -d cctv_db -c "SELECT 1"
# Harusnya: output "1"
```

---

## 📱 **STEP 9: Akses dari Laptop/Phone**

### 9.1 Dari Browser
```
Frontend: http://server_ip_address:3000
Backend API: http://server_ip_address:8000/docs
```

**Contoh:**
- `http://192.168.1.100:3000` → Dashboard
- `http://192.168.1.100:8000/docs` → API docs

### 9.2 First Time Setup
1. Open `http://server_ip:3000`
2. Click "Register" atau login dengan user default
3. Register first employee dengan foto
4. Test face detection
5. Check reports

---

## 🛑 **STEP 10: Management Commands (untuk sehari-hari)**

### Stop Aplikasi (tanpa hapus data)
```bash
cd ~/cctv-dashboard
docker-compose stop

# Harusnya semua container berhenti
docker-compose ps
# Status akan "Exited"
```

---

### Start Ulang Aplikasi
```bash
cd ~/cctv-dashboard
docker-compose start

# Tunggu beberapa detik
sleep 5

# Verify
docker-compose ps
# Status akan "Up"
```

---

### Restart Aplikasi (jika ada bug)
```bash
cd ~/cctv-dashboard
docker-compose restart

# atau specific service:
docker-compose restart backend
docker-compose restart frontend
```

---

### Lihat Log Real-time
```bash
# Follow log (real-time)
docker-compose logs -f backend

# Tekan Ctrl+C untuk exit
```

---

### Hapus Semuanya (HATI-HATI - akan hapus DATA)
```bash
cd ~/cctv-dashboard

# Stop dan remove containers
docker-compose down

# Remove data juga (HATI-HATI!)
docker-compose down -v
```

---

## 🆘 **TROUBLESHOOTING - Jika Ada Masalah**

### Port Sudah Digunakan
```bash
# Cek apa yang pakai port 3000
sudo lsof -i :3000

# Cek port 8000
sudo lsof -i :8000

# Kill process yang pakai port
sudo kill -9 <PID>

# Atau ganti port di docker-compose.yml
# Ganti "3000:3000" jadi "3001:3000"
nano docker-compose.yml
```

---

### Container Error (tidak jalan)
```bash
# Lihat error log
docker-compose logs backend

# Rebuild image
docker-compose build --no-cache

# Start ulang
docker-compose up -d
```

---

### Database Connection Error
```bash
# Check database container
docker-compose ps postgres

# Lihat log postgres
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait 5 detik
sleep 5

# Run migrations lagi
docker-compose exec backend alembic upgrade head
```

---

### Frontend Blank/Error
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose build --no-cache frontend

# Restart
docker-compose up -d frontend
```

---

### API Error 500
```bash
# Cek backend logs
docker-compose logs backend | tail -50

# Restart backend
docker-compose restart backend

# Check health
curl http://localhost:8000/api/v1/health
```

---

## 💾 **BACKUP & RESTORE (PENTING!)**

### Backup Database
```bash
# Backup database ke file
docker-compose exec postgres pg_dump -U cctv_user cctv_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Hasilnya file "backup_20260523_143000.sql"
```

---

### Restore Database
```bash
# Restore dari backup
docker-compose exec -T postgres psql -U cctv_user cctv_db < backup_20260523_143000.sql
```

---

### Backup Semua Data
```bash
# Copy postgres volume
docker cp cctv-dashboard_postgres_1:/var/lib/postgresql/data ./postgres_backup

# Copy redis data
docker cp cctv-dashboard_redis_1:/data ./redis_backup
```

---

## 📈 **MONITORING (Lihat performa)**

### Check Resource Usage
```bash
# Lihat CPU, memory setiap container
docker stats

# Output:
# CONTAINER             CPU %       MEM USAGE
# cctv-backend          0.12%       245MB
# cctv-frontend         0.00%       85MB
# cctv-postgres         0.05%       156MB
# cctv-redis            0.01%       8MB
```

---

### Check Disk Usage
```bash
# Cek disk server
df -h

# Output akan menunjukkan total, used, available

# Cek folder project size
du -sh ~/cctv-dashboard
```

---

## 🔒 **SECURITY (Penting!)**

### Jangan Lakukan:
```bash
# ❌ JANGAN: Share .env file
# ❌ JANGAN: Gunakan password default di production
# ❌ JANGAN: Jalankan sebagai root user
# ❌ JANGAN: Buka port tanpa firewall
```

---

### Yang Harus Dilakukan:
```bash
# ✅ LAKUKAN: Set strong password di .env
SECRET_KEY=<random-string-panjang>

# ✅ LAKUKAN: Ganti default admin password setelah login
# (di aplikasi, menu Settings > Change Password)

# ✅ LAKUKAN: Setup firewall
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw enable

# ✅ LAKUKAN: Update system
sudo apt-get update && sudo apt-get upgrade -y
```

---

## 📞 **RINGKASAN COMMAND PENTING**

```bash
# Start aplikasi
docker-compose up -d

# Stop aplikasi
docker-compose stop

# Lihat status
docker-compose ps

# Lihat logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop dan hapus
docker-compose down

# Cek health
curl http://localhost:8000/api/v1/health

# Access dashboard
# Browser: http://server_ip:3000
```

---

## ✅ **DONE! Aplikasi Siap Digunakan**

Sekarang kamu bisa:
- ✅ Access dashboard dari browser
- ✅ Register karyawan
- ✅ Track visitor
- ✅ Lihat reports
- ✅ Integrate dengan AWS Rekognition

**Selamat! Aplikasi CCTV kamu sudah jalan!** 🎉

---

## 📚 **Dokumentasi Lanjutan**

Untuk info lebih detail:
- Setup AWS Rekognition → baca `AWS_REKOGNITION_SETUP.md`
- Kustomisasi → baca `DOCKER_SETUP.md`
- Production deployment → baca `DEPLOYMENT_GUIDE.md`

---

**Butuh bantuan?**
- Check logs: `docker-compose logs`
- Check status: `docker-compose ps`
- Restart: `docker-compose restart`

**Happy deploying! 🚀**
