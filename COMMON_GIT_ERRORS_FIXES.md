# Common Git Errors & Fixes

---

## ❌ **Error: Git Dalam Folder Output Saja**

### Problem
```powershell
PS C:\Users\Manymore\...\outputs> git add .
# Error: fatal: not a git repository (or any of the parent directories): .git
```

### Reason
❌ Kamu di folder `outputs/` (tempat dokumentasi)  
❌ Folder ini bukan repository  
❌ Harus ke folder `cctv-dashboard/` (tempat project)

---

## ✅ **Solution: Navigate ke Folder Project**

### Step 1: Find Project Folder

**Di mana project kamu?**

Option A: Di C:\Users\Manymore\cctv-dashboard
```powershell
cd C:\Users\Manymore\cctv-dashboard
```

Option B: Di C:\Users\Manymore\Desktop\cctv-dashboard
```powershell
cd C:\Users\Manymore\Desktop\cctv-dashboard
```

Option C: Di home folder
```powershell
cd ~\cctv-dashboard
# atau
cd $PROFILE/../cctv-dashboard
```

---

### Step 2: Verify Structure

```powershell
# Pastikan ada folder frontend, backend, dll
dir

# Output harusnya:
# Mode                 Name
# ----                 ----
# d-----         frontend
# d-----         backend
# -a---          docker-compose.yml
# -a---          README.md
# dll
```

---

### Step 3: Copy Project Files

Kalau project belum ada di laptop, copy dulu dari outputs ke project folder:

```powershell
# 1. Navigate ke outputs
cd C:\Users\Manymore\...\outputs

# 2. Copy semua files ke project folder
copy-item -Path * -Destination C:\Users\Manymore\cctv-dashboard -Recurse

# 3. Navigate ke project folder
cd C:\Users\Manymore\cctv-dashboard
```

---

## 🔧 **Complete Correct Process**

### 1. Open PowerShell / Terminal
```powershell
# Buka PowerShell atau Command Prompt
```

---

### 2. Navigate ke Project Folder
```powershell
# Find the right folder
cd C:\Users\Manymore\cctv-dashboard

# Verify (must see frontend, backend folders)
dir
```

---

### 3. Create .gitignore
```powershell
# Create .gitignore file
@'
.env
.env.local
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

# Verify
Get-Content .gitignore
```

---

### 4. Initialize Git
```powershell
# Initialize git repository
git init

# Output:
# Initialized empty Git repository in C:\Users\Manymore\cctv-dashboard\.git\
```

---

### 5. Configure Git (First Time Only)
```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@company.com"

# Verify
git config --global user.name
git config --global user.email
```

---

### 6. Add All Files
```powershell
# Add all files (respecting .gitignore)
git add .

# Check what will be added
git status

# Output harusnya menunjukkan semua files KECUALI:
# - .env (if exists)
# - node_modules/
# - venv/
# dll (sesuai .gitignore)
```

---

### 7. Initial Commit
```powershell
# Commit dengan meaningful message
git commit -m "Initial commit: CCTV People Tracking System

- React frontend with dashboard
- FastAPI backend with AWS Rekognition
- PostgreSQL database
- Docker Compose setup
- Complete API endpoints
- 45+ integration tests"

# Output:
# [main (root-commit) ...] Initial commit: ...
```

---

### 8. Add GitHub Remote
```powershell
# Option A: HTTPS (lebih mudah di Windows)
git remote add origin https://github.com/cdesqus/people-tracking.git

# Option B: SSH (jika sudah setup)
# git remote add origin git@github.com:cdesqus/people-tracking.git

# Verify
git remote -v
```

---

### 9. Rename Branch
```powershell
# Rename to main
git branch -M main

# Verify
git branch
```

---

### 10. Push to GitHub
```powershell
# Push ke GitHub
git push -u origin main

# Jika HTTPS, masukkan:
# - Username: cdesqus
# - Password: (personal access token, bukan password)

# atau buat personal token dulu:
# https://github.com/settings/tokens
```

---

## 💡 **Windows-Specific Tips**

### Using PowerShell (Recommended)
```powershell
# Better path handling
# Use backslash: C:\Users\...\cctv-dashboard
# Or forward slash: C:/Users/.../cctv-dashboard

# Check current folder
pwd

# List files
dir
# atau
ls
```

### Using Command Prompt (CMD)
```cmd
# Navigate
cd C:\Users\Manymore\cctv-dashboard

# List files
dir

# Create file
type nul > .gitignore
```

### Using WSL (Windows Subsystem Linux)
```bash
# Lebih mirip Linux
cd ~/cctv-dashboard

# Use normal Linux commands
git init
git add .
git commit -m "..."
git push origin main
```

---

## ✅ **Step-by-Step PowerShell Commands**

Copy-paste satu per satu:

```powershell
# 1. Navigate
cd C:\Users\Manymore\cctv-dashboard
# Ganti path sesuai project kamu

# 2. Verify
dir
# Check: ada frontend, backend, docker-compose.yml?

# 3. Create .gitignore
@'
.env
node_modules/
__pycache__/
*.pyc
venv/
env/
.vscode/
.idea/
.DS_Store
.aws/
credentials
postgres_data/
redis_data/
'@ | Out-File -FilePath .gitignore -Encoding UTF8

# 4. Init git
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

- React frontend
- FastAPI backend
- PostgreSQL database
- Docker setup
- 45+ tests"

# 9. Add remote
git remote add origin https://github.com/cdesqus/people-tracking.git

# 10. Branch
git branch -M main

# 11. Push (will ask for credentials)
git push -u origin main
```

---

## 📂 **Folder Structure Check**

Before `git add .`, verify folder structure:

```powershell
# Current folder harus punya ini:
C:\cctv-dashboard\
├── frontend\
│   ├── src\
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── backend\
│   ├── app\
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
├── README.md
├── .gitignore
└── docs\
    ├── DEPLOYMENT_STEP_BY_STEP_LINUX.md
    ├── AWS_REKOGNITION_SETUP.md
    └── ...
```

If missing, you need to copy files first!

---

## 🚨 **If Still Getting Error**

```powershell
# 1. Check current folder
pwd
# Output: C:\Users\Manymore\cctv-dashboard

# 2. Check for .git folder
dir -Hidden

# Output harusnya ada: .git folder

# 3. Check git status
git status

# Output harusnya:
# On branch main
# Changes to be committed: ...
# atau
# On branch main
# nothing to commit, working tree clean
```

---

## 🔄 **Quick Fix Checklist**

- [ ] Current folder = project folder (bukan outputs)
- [ ] Folder punya frontend/ dan backend/
- [ ] .gitignore file ada
- [ ] Git initialized (`git init` sudah dijalankan)
- [ ] User configured (`git config --global` sudah set)
- [ ] No error saat `git status`

---

## 💻 **Verify Everything Works**

```powershell
# 1. Check git working
git --version

# 2. Check current folder
Get-Location
# Output: C:\Users\Manymore\cctv-dashboard

# 3. Check git status
git status
# Output: On branch main, nothing to commit

# 4. Check commits
git log --oneline
# Output: abc1234 Initial commit: ...

# 5. Check remote
git remote -v
# Output: origin https://github.com/cdesqus/people-tracking.git (fetch)
#         origin https://github.com/cdesqus/people-tracking.git (push)
```

---

## ✅ **SUCCESS Indicators**

✅ `git status` shows no errors  
✅ `git log` shows your commits  
✅ `git remote -v` shows GitHub URL  
✅ Repo on GitHub: https://github.com/cdesqus/people-tracking  

---

**Still stuck?** Comment below exactly:
1. Current folder path
2. What error you get
3. Output of `git status`

I'll help! 🚀

---

**Problem Solved!** ✅
