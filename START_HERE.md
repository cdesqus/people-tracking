# CCTV Dashboard - START HERE

Welcome to the CCTV Face Recognition Dashboard project! This document will guide you through everything you need to know.

## What Was Created

A complete, production-ready project structure for a real-time face recognition and tracking system with:
- Modern React 18 frontend with TypeScript
- FastAPI backend with PostgreSQL and Redis
- AWS Rekognition integration
- Docker containerization
- Professional folder organization

**Total: 77 files created, ready for development**

---

## Read These First (In Order)

### 1. README.md
Main project overview with tech stack and features.
- Overview of the project
- Quick start instructions
- Tech stack details
- Database information
- File structure

### 2. SETUP_GUIDE.md
Complete setup and installation instructions.
- Prerequisites checklist
- Docker Compose quick start
- Local development setup
- Configuration guide
- Troubleshooting

### 3. PROJECT_STRUCTURE.md
Detailed architecture and file organization.
- Complete file tree
- Architecture diagrams
- API endpoints reference
- Database schema
- Naming conventions

### 4. PROJECT_INITIALIZATION_SUMMARY.md
What was created and current status.
- File manifest
- Technology stack
- Implemented features
- Next steps

---

## Quick Start (5 minutes)

### Option A: Docker Compose (Recommended)

```bash
# Navigate to project
cd cctv-dashboard

# Setup environment
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit backend/.env and add your AWS credentials

# Start everything
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Option B: Local Development

**Frontend:**
```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload
# API at http://localhost:8000
```

---

## Project Structure at a Glance

```
cctv-dashboard/
├── frontend/              # React 18 + TypeScript UI
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page-level components
│   │   ├── services/     # API service layer
│   │   ├── store/        # Redux state management
│   │   ├── types/        # TypeScript definitions
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # Global styling
│   └── [Config files]
│
├── backend/               # FastAPI + SQLAlchemy backend
│   ├── app/
│   │   ├── api/          # REST API endpoints
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic validation
│   │   ├── services/     # Business logic (AWS integration)
│   │   ├── utils/        # Helper functions
│   │   ├── config.py     # Configuration
│   │   ├── database.py   # Database setup
│   │   └── main.py       # Application factory
│   └── [Config files]
│
├── docker-compose.yml     # Multi-service Docker setup
├── README.md              # Project overview
├── SETUP_GUIDE.md         # Setup instructions
└── PROJECT_STRUCTURE.md   # Architecture details
```

---

## What's Included

### Frontend Features
- React 18 with TypeScript for type safety
- Redux Toolkit for state management
- Tailwind CSS for professional styling
- Responsive layout (desktop-first)
- Navigation & routing
- API integration layer
- Custom hooks for data management
- Component templates for all pages

### Backend Features
- FastAPI with async/await support
- SQLAlchemy ORM for database
- Pydantic for data validation
- PostgreSQL database setup
- Redis integration
- AWS Rekognition service
- RESTful API endpoints
- Database migrations (Alembic)

### Infrastructure
- Docker containers for all services
- Docker Compose for local development
- Environment-based configuration
- Health check endpoints
- API documentation (Swagger)

---

## Core Concepts

### Frontend Architecture
```
App (Routes)
  ├── Layout (Sidebar + Header)
  │   ├── Dashboard
  │   ├── Cameras
  │   ├── Alerts
  │   ├── Analytics
  │   └── Settings
  └── Store (Redux)
      ├── Cameras
      ├── Faces
      ├── Alerts
      └── UI
```

### Backend Architecture
```
FastAPI App
  ├── Routes (/api)
  │   ├── /cameras
  │   ├── /faces
  │   ├── /persons
  │   ├── /alerts
  │   └── /system
  ├── Database
  │   ├── Camera table
  │   ├── Face table
  │   ├── Person table
  │   ├── Alert table
  │   └── User table
  └── Services
      └── AWS Rekognition
```

---

## Available Pages

1. **Dashboard** (`/`) - Overview with statistics
2. **Cameras** (`/cameras`) - Camera management
3. **Alerts** (`/alerts`) - Alert monitoring
4. **Analytics** (`/analytics`) - Data visualization
5. **Settings** (`/settings`) - Configuration

---

## API Endpoints

### Cameras
```
GET    /api/cameras              List all cameras
POST   /api/cameras              Create camera
GET    /api/cameras/{id}         Get camera details
PUT    /api/cameras/{id}         Update camera
DELETE /api/cameras/{id}         Delete camera
```

### Faces
```
GET    /api/faces                List detected faces
POST   /api/faces                Create face record
GET    /api/faces/{id}           Get face details
```

### Persons
```
GET    /api/persons              List persons
POST   /api/persons              Create person
GET    /api/persons/{id}         Get person
PUT    /api/persons/{id}         Update person
DELETE /api/persons/{id}         Delete person
```

### Alerts
```
GET    /api/alerts               List alerts
POST   /api/alerts               Create alert
GET    /api/alerts/{id}          Get alert
PATCH  /api/alerts/{id}/acknowledge  Acknowledge alert
DELETE /api/alerts/{id}          Delete alert
```

### System
```
GET    /api/system/health        Health check
GET    /api/system/config        Get configuration
GET    /api/system/stats         Get dashboard stats
```

---

## Environment Variables

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENV=development
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cctv_db
REDIS_URL=redis://localhost:6379
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

See `.env.example` files for all options.

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.2.0 |
| Frontend | TypeScript | 5.3.3 |
| Frontend | Redux Toolkit | 1.9.7 |
| Frontend | Tailwind CSS | 3.3.6 |
| Backend | FastAPI | 0.104.1 |
| Backend | SQLAlchemy | 2.0.23 |
| Backend | Pydantic | 2.5.0 |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |
| AWS | boto3 | 1.34.3 |
| DevOps | Docker | Latest |

---

## Development Commands

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm start               # Start dev server
npm run build           # Build for production
npm test                # Run tests
npm run lint            # Lint code
npm run type-check      # Check TypeScript
```

### Backend
```bash
cd backend
pip install -r requirements.txt  # Install dependencies
uvicorn app.main:app --reload    # Start dev server
pytest                           # Run tests
pytest --cov=app                 # Coverage report
black app/                       # Format code
```

### Docker
```bash
docker-compose up --build        # Build and start
docker-compose down              # Stop all
docker-compose logs backend      # View logs
docker-compose ps                # Check status
```

---

## Folder Organization

### Frontend
```
frontend/
├── src/
│   ├── components/      - Reusable UI components
│   ├── pages/          - Full page components
│   ├── services/       - API communication
│   ├── store/          - Redux state
│   ├── types/          - TypeScript types
│   ├── hooks/          - Custom React hooks
│   ├── utils/          - Utility functions
│   └── styles/         - CSS and theming
└── public/             - Static assets
```

### Backend
```
backend/
├── app/
│   ├── api/           - REST endpoints
│   ├── models/        - Database tables
│   ├── schemas/       - Request/response validation
│   ├── services/      - Business logic
│   ├── utils/         - Helper functions
│   ├── config.py      - Configuration
│   ├── database.py    - DB setup
│   └── main.py        - Application
├── migrations/        - Database migrations
├── tests/            - Test suite
└── requirements.txt   - Dependencies
```

---

## Common Tasks

### Add a New API Endpoint
1. Create schema in `backend/app/schemas/`
2. Update model in `backend/app/models/` if needed
3. Create endpoint in `backend/app/api/`
4. Document in README

### Add a New Page
1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation in `frontend/src/components/layout/Sidebar.tsx`

### Connect Frontend to Backend
1. Add API call in `frontend/src/services/api.ts`
2. Create Redux slice for state
3. Create custom hook
4. Use in component

### Deploy to Production
See deployment guides in individual README files.

---

## Support & Debugging

### Check If Services Are Running
```bash
# Docker
docker-compose ps

# Browser
http://localhost:3000    # Frontend
http://localhost:8000    # Backend API
http://localhost:8000/docs  # API Documentation
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow in real-time
docker-compose logs -f backend
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Check `docker-compose ps`, kill process, or use different port |
| Database connection error | Verify DATABASE_URL, ensure PostgreSQL is running |
| CORS errors | Check CORS_ORIGINS in backend .env |
| Frontend can't reach API | Verify REACT_APP_API_BASE_URL points to correct backend |

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| README.md | Project overview and quick start |
| SETUP_GUIDE.md | Detailed setup instructions |
| PROJECT_STRUCTURE.md | Architecture and file organization |
| PROJECT_INITIALIZATION_SUMMARY.md | What was created |
| frontend/README.md | Frontend-specific documentation |
| backend/README.md | Backend-specific documentation |

---

## What's Next?

1. **Setup** - Follow SETUP_GUIDE.md to get everything running
2. **Explore** - Check out the frontend at http://localhost:3000
3. **API Docs** - View API at http://localhost:8000/docs
4. **Develop** - Start implementing features
5. **Test** - Write tests as you go
6. **Deploy** - Follow deployment guides when ready

---

## Key Metrics

- **Frontend Files**: 44
- **Backend Files**: 28
- **Total Files**: 77
- **Configuration Files**: 5
- **Ready for Development**: YES ✓

---

## Team Quick Reference

### For Frontend Developers
- Focus: `frontend/src/`
- Key: Redux store, API integration
- Start: `npm start` in frontend folder
- Docs: `frontend/README.md`

### For Backend Developers
- Focus: `backend/app/`
- Key: API endpoints, database models
- Start: `uvicorn app.main:app --reload`
- Docs: `backend/README.md`

### For DevOps/Infra
- Focus: Docker files, environment config
- Key: docker-compose.yml, .env files
- Start: `docker-compose up --build`
- Docs: SETUP_GUIDE.md

---

## Remember

- **Type Safety**: Use TypeScript on frontend, type hints in Python
- **Error Handling**: Implement proper error handling in all layers
- **Testing**: Write tests as you develop
- **Documentation**: Keep code and docs in sync
- **Clean Code**: Follow conventions in existing code
- **Security**: Never commit secrets, use .env files
- **Performance**: Monitor and optimize as needed

---

## Success Checklist

- [ ] Read this document
- [ ] Read README.md
- [ ] Read SETUP_GUIDE.md
- [ ] Setup environment files
- [ ] Start Docker containers (or local servers)
- [ ] Access frontend at http://localhost:3000
- [ ] Check API at http://localhost:8000/docs
- [ ] Explore project structure
- [ ] Ready to code!

---

## Questions?

1. Check the relevant README file
2. Look at existing code examples
3. Review PROJECT_STRUCTURE.md for architecture
4. Check git history for patterns
5. Contact development team

---

**Let's build something awesome!** 🚀

The project structure is complete and ready for development. All you need to do is:
1. Setup your environment
2. Start the services
3. Begin coding

Happy coding! 🎉
