# Manual Copy Files - Windows GUI
## Paling Mudah!

---

## 📁 **STEP 1: Buka File Explorer (Windows)**

Tekan: **Windows Key + E**

Atau klik icon folder di taskbar.

---

## 📂 **STEP 2: Navigate ke Output Folder**

Di File Explorer address bar, paste:
```
C:\Users\Manymore\AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\local-agent-mode-sessions\867a0d78-833a-4703-8b60-19ab2f1639ed\812ee8e7-abb6-4c4c-8144-1c9883f72e7d\local_420434ae-75a1-4253-be96-57778ad66dfb\outputs
```

**Atau lebih gampang:**

1. Buka File Explorer
2. Klik address bar
3. Paste path di atas
4. Tekan Enter

---

## 📋 **STEP 3: Lihat Files yang Ada**

Di outputs folder, harusnya ada:

```
✓ frontend/          (folder)
✓ backend/           (folder)
✓ docker-compose.yml
✓ README.md
✓ docs/              (folder)
✓ (semua .md files)
```

---

## 🎯 **STEP 4: Select & Copy All Files**

1. **Select all files:**
   - Tekan: **Ctrl + A**
   - Atau klik kanan → Select All

2. **Copy:**
   - Tekan: **Ctrl + C**
   - Atau klik kanan → Copy

---

## 📍 **STEP 5: Create Destination Folder**

Pilih di mana mau simpan project:

**Option A: Di User folder**
```
C:\Users\Manymore\cctv-dashboard\
```

**Option B: Di Desktop**
```
C:\Users\Manymore\Desktop\cctv-dashboard\
```

**Option C: Di Documents**
```
C:\Users\Manymore\Documents\cctv-dashboard\
```

### Cara membuat folder:

1. Buka File Explorer
2. Navigate ke lokasi pilihan (contoh: C:\Users\Manymore\)
3. **Klik kanan** → New → Folder
4. Kasih nama: `cctv-dashboard`
5. Enter

---

## 📥 **STEP 6: Paste Files**

1. Buka folder `cctv-dashboard` yang baru dibuat
2. **Klik kanan** → Paste
   - Atau tekan: **Ctrl + V**
3. Tunggu copy selesai (bisa 1-2 menit)

---

## ✅ **STEP 7: Verify Files**

Di folder `cctv-dashboard`, harusnya sekarang ada:

```
cctv-dashboard/
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── ...
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── db/
│   │   └── ...
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── run.py
│   └── ...
├── docker-compose.yml
├── docker-compose.prod.yml
├── README.md
├── .gitignore
├── docs/
│   ├── DEPLOYMENT_STEP_BY_STEP_LINUX.md
│   ├── AWS_REKOGNITION_SETUP.md
│   └── (semua dokumentasi)
└── (files lainnya)
```

---

## 🖥️ **STEP 8: Open PowerShell di Folder Ini**

### Cara 1: Right-click di folder (Windows 11)
1. Buka folder `cctv-dashboard`
2. Klik kanan di kosong
3. Pilih: "Open in Terminal" atau "Open PowerShell here"

### Cara 2: Manual type path di PowerShell
1. Buka PowerShell (Windows Key + S, search "PowerShell")
2. Type: `cd C:\Users\Manymore\cctv-dashboard`
3. Tekan Enter

### Cara 3: Copy path & paste
1. Di folder explorer, klik address bar
2. Copy path yang muncul
3. Buka PowerShell
4. Type: `cd ` (dengan spasi)
5. Paste path
6. Tekan Enter

---

## ✨ **STEP 9: Now Ready untuk Git!**

Sekarang di PowerShell, jalankan:

```powershell
# Verify folder
pwd
# Harusnya output: C:\Users\Manymore\cctv-dashboard

# Verify files
dir
# Harusnya ada: frontend, backend, docker-compose.yml

# Sekarang bisa git!
git init
git add .
git status
```

---

## 📊 **Visual Guide**

```
1. Buka File Explorer
   ↓
2. Navigate ke outputs folder
   ↓
3. Copy all files (Ctrl+A, Ctrl+C)
   ↓
4. Buat folder baru: C:\Users\Manymore\cctv-dashboard\
   ↓
5. Paste files (Ctrl+V)
   ↓
6. Tunggu selesai (1-2 menit)
   ↓
7. Buka PowerShell di folder ini
   ↓
8. Run git commands
   ↓
✅ DONE!
```

---

## 🎯 **Complete Git Commands (After Copy)**

Setelah files sudah ter-copy, di PowerShell jalankan:

```powershell
# 1. Verify location
pwd
# Output: C:\Users\Manymore\cctv-dashboard

# 2. Verify files
dir
# Output: ada frontend, backend, dll

# 3. Create .gitignore
@'
.env
.env.local
.env.*.local
node_modules/
__pycache__/
*.pyc
venv/
env/
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
.dockerignore
*.log
logs/
.aws/
credentials
*.sqlite
*.db
postgres_data/
redis_data/
backup*.sql
*.backup
tmp/
temp/
.cache/
dist/
build/
coverage/
.coverage
'@ | Out-File -FilePath .gitignore -Encoding UTF8

# 4. Initialize git
git init

# 5. Configure (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"

# 6. Add files
git add .

# 7. Check
git status

# 8. Commit
git commit -m "Initial commit: CCTV People Tracking System

- React frontend with dashboard
- FastAPI backend with AWS Rekognition
- PostgreSQL database
- Docker Compose setup
- Complete API endpoints
- 45+ integration tests"

# 9. Add remote
git remote add origin https://github.com/cdesqus/people-tracking.git

# 10. Rename branch
git branch -M main

# 11. Push (akan minta GitHub credentials)
git push -u origin main
```

---

## ⏱️ **Timeline**

```
Langkah 1-3:  Copy files           (5 menit)
Langkah 4:    Create folder        (1 menit)
Langkah 5:    Paste files          (2 menit)
Langkah 6-7:  Verify & open PS     (1 menit)
Langkah 8-11: Run git commands     (3 menit)

Total:                              ~12 menit
```

---

## 🛠️ **Tips**

- Jika copy gagal, coba di-exclude .git folder
- Kalau file terlalu banyak, tunggu progress bar finish
- PowerShell akan auto-complete kalau kamu type jalan
- Tekan Tab untuk autocomplete path

---

## ✅ **Success Checklist**

- [ ] Files sudah ter-copy ke cctv-dashboard folder
- [ ] PowerShell buka di folder tersebut
- [ ] `pwd` menunjukkan C:\Users\Manymore\cctv-dashboard
- [ ] `dir` menunjukkan ada frontend, backend, dll
- [ ] `git init` berjalan tanpa error
- [ ] `git add .` berjalan tanpa error
- [ ] `git status` menunjukkan files ready to commit
- [ ] `git push` ke GitHub berhasil

---

**Selesai! Sekarang bisa push ke GitHub** 🚀

Ikuti copy-paste commands di step 9! ⬆️
