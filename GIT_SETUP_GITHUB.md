# Git Setup & Push to GitHub
## Untuk CCTV People Tracking Project

**Durasi**: 10 menit  
**Kesulitan**: Mudah

---

## 🚀 **STEP 1: Setup Git di Laptop (5 menit)**

### 1.1 Navigate ke Folder Project
```bash
cd ~/cctv-dashboard
# atau di mana pun folder project kamu

# Verify struktur
ls -la
# Harusnya ada: frontend/, backend/, docker-compose.yml, dll
```

---

### 1.2 Create .gitignore File (PENTING!)
**Jangan commit .env dan file sensitif lainnya!**

```bash
# Create .gitignore
cat > .gitignore << 'EOF'
# Environment variables (JANGAN PUSH INI!)
.env
.env.local
.env.*.local

# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
env/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Docker
.dockerignore

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# AWS credentials (JANGAN PUSH!)
.aws/
credentials

# Database
*.sqlite
*.db
postgres_data/
redis_data/

# Backups
backup*.sql
*.backup

# Temporary
tmp/
temp/
.cache/

# Built files
dist/
build/

# Coverage
coverage/
.coverage
EOF

# Verify file created
cat .gitignore
```

---

## 💾 **STEP 2: Initialize Git Repository**

### 2.1 Initialize Git
```bash
# Pastikan di folder project root
cd ~/cctv-dashboard

# Initialize git
git init

# Output:
# Initialized empty Git repository in /home/username/cctv-dashboard/.git/
```

---

### 2.2 Configure Git User (jika first time)
```bash
# Set your name
git config --global user.name "Your Name"
# Contoh: git config --global user.name "John Doe"

# Set your email
git config --global user.email "your.email@example.com"
# Contoh: git config --global user.email "john@company.com"

# Verify
git config --global user.name
git config --global user.email
```

---

### 2.3 Add All Files to Git
```bash
# Add semua files (respect .gitignore)
git add .

# Verify apa yang akan di-commit
git status

# Output harusnya menunjukkan:
# Changes to be committed:
#   new file: frontend/...
#   new file: backend/...
#   new file: docker-compose.yml
#   etc

# IMPORTANT: Jangan ada .env di list!
```

---

## 📝 **STEP 3: Create Initial Commit**

```bash
# Commit dengan meaningful message
git commit -m "Initial commit: CCTV People Tracking System

- React frontend with dashboard
- FastAPI backend with AWS Rekognition integration
- PostgreSQL database with 7 tables
- Docker Compose setup
- Complete API endpoints
- 45+ integration tests"

# Output:
# [main (root-commit) abc1234] Initial commit: ...
#  XX files changed, XX insertions(+)
#  create mode 100644 frontend/...
#  create mode 100644 backend/...
```

---

## 🌐 **STEP 4: Setup GitHub Remote**

### 4.1 Verify SSH Key Setup
```bash
# Check if SSH key exists
ls -la ~/.ssh/

# Jika ada id_rsa, bagus!
# Jika tidak ada, create:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Add SSH key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa

# Copy public key
cat ~/.ssh/id_rsa.pub
# Copy output ini
```

---

### 4.2 Add SSH Key ke GitHub

1. Go to GitHub: `https://github.com/settings/keys`
2. Click "New SSH key"
3. Paste content dari `id_rsa.pub`
4. Click "Add SSH key"

**Atau** gunakan HTTPS (lebih simpel):
```bash
# Jika prefer HTTPS, gunakan Personal Access Token
# Go to: https://github.com/settings/tokens
# Create token dengan scope: repo
```

---

### 4.3 Add Remote Repository

**Option A: SSH (jika sudah setup SSH key)**
```bash
# Add remote
git remote add origin git@github.com:cdesqus/people-tracking.git

# Verify
git remote -v
# Output:
# origin  git@github.com:cdesqus/people-tracking.git (fetch)
# origin  git@github.com:cdesqus/people-tracking.git (push)
```

**Option B: HTTPS (lebih mudah)**
```bash
# Add remote dengan HTTPS
git remote add origin https://github.com/cdesqus/people-tracking.git

# Verify
git remote -v
```

---

### 4.4 Rename Branch to Main (jika perlu)
```bash
# Check current branch
git branch

# Rename ke main (jika masih master)
git branch -M main

# Verify
git branch
# Output: * main
```

---

## 🚀 **STEP 5: Push ke GitHub**

### 5.1 Push Initial Commit
```bash
# Push ke GitHub
git push -u origin main

# Jika HTTPS, masukkan username & password (atau personal token)
# Jika SSH, biasanya langsung jalan

# Output:
# Enumerating objects: XX, done.
# Counting objects: 100%, done.
# Writing objects: 100%, done.
# Total XX (delta X), reused X (delta X)
# To github.com:cdesqus/people-tracking.git
#  * [new branch]      main -> main
# Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

### 5.2 Verify di GitHub
```bash
# Check GitHub repository
# Browser: https://github.com/cdesqus/people-tracking

# Harusnya ada:
# - frontend/ folder
# - backend/ folder  
# - docker-compose.yml
# - README.md
# - dll semua files

# Tapi TIDAK ada:
# - .env (jangan push ini!)
# - node_modules/ (gitignore)
# - __pycache__/ (gitignore)
# - venv/ (gitignore)
```

---

## 📋 **Complete Command Summary**

Copy-paste langsung (one by one):

```bash
# 1. Navigate
cd ~/cctv-dashboard

# 2. Create .gitignore
cat > .gitignore << 'EOF'
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
EOF

# 3. Initialize git
git init

# 4. Configure user (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"

# 5. Add files
git add .

# 6. Commit
git commit -m "Initial commit: CCTV People Tracking System

- React frontend with dashboard
- FastAPI backend with AWS Rekognition
- PostgreSQL database
- Docker Compose setup
- Complete API endpoints
- 45+ integration tests"

# 7. Setup remote
git remote add origin git@github.com:cdesqus/people-tracking.git
# Atau untuk HTTPS:
# git remote add origin https://github.com/cdesqus/people-tracking.git

# 8. Rename branch
git branch -M main

# 9. Push
git push -u origin main
```

---

## ✅ **Verify Successful Push**

```bash
# Check status
git status
# Output: On branch main, nothing to commit, working tree clean

# Check remote
git remote -v
# Output: origin git@github.com:cdesqus/people-tracking.git (fetch/push)

# Check branches
git branch -a
# Output: * main
#         remotes/origin/main

# Check log
git log --oneline
# Output: abc1234 Initial commit: CCTV People Tracking System
```

---

## 📝 **Create a Good README.md**

Buat README yang bagus untuk GitHub:

```bash
# Edit README.md
nano README.md
```

Paste ini:
```markdown
# CCTV People Tracking System

Advanced face recognition system for employee tracking and visitor management using AWS Rekognition.

## 🎯 Features

- **Real-time Face Detection** - Automatic employee/visitor identification
- **Employee Management** - Register and track employees
- **Visitor Tracking** - Check-in/check-out system
- **AWS Rekognition** - 99.9% accuracy face recognition
- **Real-time Dashboard** - Live monitoring and alerts
- **Reports & Analytics** - Attendance and visitor statistics
- **Role-based Access** - Admin, Manager, Receptionist, Security roles

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: FastAPI + PostgreSQL + Redis
- **Cloud**: AWS Rekognition + S3
- **DevOps**: Docker + Docker Compose
- **Testing**: 45+ integration tests

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- AWS Account (optional, for face recognition)
- Linux Server (recommended Ubuntu 20.04+)

### Local Development
```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production Deployment
See [DEPLOYMENT_STEP_BY_STEP_LINUX.md](docs/DEPLOYMENT_STEP_BY_STEP_LINUX.md)

## 📚 Documentation

- [Setup Guide](docs/PROJECT_SETUP_GUIDE.md)
- [Docker Setup](docs/DOCKER_SETUP.md)
- [API Reference](docs/API_ENDPOINTS_REFERENCE.md)
- [Deployment](docs/DEPLOYMENT_STEP_BY_STEP_LINUX.md)
- [AWS Rekognition](docs/AWS_REKOGNITION_SETUP.md)

## 🔐 Security

- JWT authentication
- Role-based access control
- Password hashing
- Environment variable configuration
- SQL injection prevention

## 📊 Project Statistics

- **Total Files**: 80+
- **Lines of Code**: 8,000+
- **API Endpoints**: 18+
- **Database Tables**: 7
- **Docker Services**: 4
- **Test Cases**: 45+

## 👥 Default Login

```
Email: admin@company.com
Password: admin123
```

**IMPORTANT**: Change password after first login!

## 🔄 Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```

## 📈 Cost Estimation

- **Setup**: $2,000-3,000 (one-time)
- **Monthly**: $1,600-2,500 (with AWS Rekognition)
- **First 12 months**: AWS Free Tier (up to 1M face detections)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 📞 Support

For support, contact: jayusmansay@gmail.com

## 🎉 Status

✅ Production Ready
✅ Fully Tested
✅ Complete Documentation
✅ Ready to Deploy

---

**Made with ❤️ by Haryanto**
```

---

## 🔄 **Future Commits (for later)**

```bash
# Edit file
nano backend/app/main.py

# Check changes
git status

# Add changes
git add backend/app/main.py

# Commit
git commit -m "Fix: improve error handling in detection endpoint"

# Push
git push origin main
```

---

## 🌳 **Git Workflow (setelah awal)**

```bash
# 1. Buat branch baru untuk fitur
git checkout -b feature/new-feature

# 2. Make changes
# ... edit files ...

# 3. Stage & commit
git add .
git commit -m "Add: new feature description"

# 4. Push ke GitHub
git push origin feature/new-feature

# 5. Create Pull Request di GitHub
# (di browser, GitHub akan tanya untuk create PR)

# 6. After merge, delete branch
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

---

## 🆘 **Common Issues**

### Forgot to .gitignore .env
```bash
# Remove from git history (tapi keep di local)
git rm --cached .env
git commit -m "Remove .env from version control"
git push origin main

# Optional: purge dari git history (dangerous!)
# Jangan lakukan ini jika sudah public
```

### Want to Undo Last Commit (belum push)
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### SSH Key Not Working
```bash
# Test SSH connection
ssh -T git@github.com

# If error, check key:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# Add to ssh-agent
ssh-add ~/.ssh/id_rsa

# Copy and add to GitHub again
cat ~/.ssh/id_rsa.pub
```

### HTTPS Requires Password Every Time
```bash
# Use Personal Access Token
# 1. Create token: https://github.com/settings/tokens
# 2. Use as password when pushing

# Or setup SSH instead (better)
```

---

## ✅ **Final Checklist**

- [ ] .gitignore created
- [ ] Git initialized
- [ ] All files added (except sensitive ones)
- [ ] Initial commit made
- [ ] Remote added
- [ ] Branch renamed to main
- [ ] Pushed to GitHub
- [ ] Verify files on GitHub
- [ ] README.md updated
- [ ] No .env, node_modules, venv, __pycache__ di GitHub

---

## 🎉 **Done!**

Repository sekarang ada di GitHub siap untuk:
- ✅ Team collaboration
- ✅ Version control
- ✅ Backup
- ✅ CI/CD integration
- ✅ Issue tracking
- ✅ Pull request reviews

**Link**: `https://github.com/cdesqus/people-tracking`

---

## 📞 **Next Steps**

1. **Invite team members** - Go to Settings > Collaborators
2. **Setup branch protection** - Require PR reviews
3. **Setup CI/CD** - GitHub Actions untuk auto-test
4. **Enable issues** - For bug tracking
5. **Create project board** - For kanban workflow

---

**Git setup complete!** 🚀

Happy coding! 💻
