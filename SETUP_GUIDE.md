# CCTV Dashboard - Complete Setup Guide

This guide will help you get the CCTV Face Recognition Dashboard up and running.

## Prerequisites

Before starting, ensure you have:
- Docker & Docker Compose (recommended)
- Node.js 18+ (for local frontend development)
- Python 3.10+ (for local backend development)
- PostgreSQL 12+ (if not using Docker)
- Redis 6+ (if not using Docker)
- AWS Account with Rekognition API enabled

## Quick Start with Docker Compose

The easiest way to get started is using Docker Compose.

### 1. Clone and Setup

```bash
cd cctv-dashboard
```

### 2. Configure Environment

```bash
# Copy environment template
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 3. Edit Environment Files

**frontend/.env:**
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENV=development
```

**backend/.env:**
```env
DATABASE_URL=postgresql://cctv_user:cctv_password@postgres:5432/cctv_db
REDIS_URL=redis://redis:6379

# Add your AWS credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

APP_ENV=development
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
```

### 4. Start Services

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379
- FastAPI backend on port 8000
- React frontend on port 3000

### 5. Access the Application

- Frontend: http://localhost:3000
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Local Development Setup

If you prefer local development without Docker:

### Backend Setup

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Setup database:**
```bash
# Create PostgreSQL database
createdb -U postgres cctv_db

# Run migrations
alembic upgrade head
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database and AWS credentials
```

5. **Start the server:**
```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Start development server:**
```bash
npm start
```

The frontend will be available at http://localhost:3000

## Project Structure

```
cctv-dashboard/
├── frontend/                    # React 18 + TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Redux state management
│   │   ├── types/             # TypeScript types
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utilities
│   │   └── styles/            # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utilities
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── migrations/            # Database migrations
│   ├── tests/                 # Test suite
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml          # Local development compose
└── README.md
```

## Key Features Implemented

### Frontend
- React 18 with TypeScript
- Redux Toolkit state management
- Tailwind CSS styling
- Responsive dashboard layout
- Sidebar navigation
- Page structure for:
  - Dashboard (overview)
  - Cameras (management)
  - Alerts (monitoring)
  - Analytics (reporting)
  - Settings (configuration)

### Backend
- FastAPI with async support
- PostgreSQL database
- Redis caching
- AWS Rekognition integration
- Database models for:
  - Cameras
  - Faces
  - Persons
  - Alerts
  - Users
- RESTful API endpoints
- Pydantic data validation

## Database Setup

### Initial Migration

The database tables are created automatically when the backend starts.

### Manual Migration Commands

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Add new table"

# Apply all migrations
alembic upgrade head

# Revert last migration
alembic downgrade -1

# See migration history
alembic history
```

## AWS Rekognition Setup

1. **Create AWS Account** and enable Rekognition API
2. **Generate API Credentials:**
   - Go to IAM Console
   - Create user with Rekognition permissions
   - Generate access key and secret
3. **Add to .env:**
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   ```

## Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Find and kill process on port 3000 or 8000
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify database exists: `psql -l`

### CORS Errors
- Backend CORS_ORIGINS must include frontend URL
- Check backend/.env CORS settings

### Docker Issues
```bash
# Clean up Docker
docker-compose down -v
docker system prune

# Rebuild containers
docker-compose build --no-cache
```

## Development Workflow

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes:**
   - Update code
   - Run linters/tests
   - Commit changes

3. **Push and Create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

### Backend
```bash
cd backend

# Format with Black
black app/

# Sort imports
isort app/

# Lint
flake8 app/
```

### Frontend
```bash
cd frontend

# Format with Prettier
npm run format

# Lint
npm run lint
```

## Deployment

### Docker Deployment
The project includes Dockerfiles for both frontend and backend.

### Environment-Specific Configuration
- `development`: Debug mode enabled
- `production`: Debug disabled, optimizations enabled

See individual README files for detailed deployment instructions.

## Monitoring & Logs

### Backend Logs
```bash
# See container logs
docker-compose logs backend

# Follow logs
docker-compose logs -f backend
```

### Frontend Logs
```bash
docker-compose logs frontend
```

## Support & Documentation

- Frontend README: `frontend/README.md`
- Backend README: `backend/README.md`
- API Documentation: http://localhost:8000/docs

## Next Steps

1. ✓ Setup environment
2. ✓ Start services
3. ✓ Access dashboard at http://localhost:3000
4. ✓ Explore API at http://localhost:8000/docs
5. ✓ Configure cameras and start testing

## Troubleshooting Checklist

- [ ] All services running (`docker-compose ps`)
- [ ] Database migrations applied (`docker-compose logs backend`)
- [ ] Frontend loading at http://localhost:3000
- [ ] API responding at http://localhost:8000
- [ ] AWS credentials configured
- [ ] No port conflicts

## Get Help

For issues:
1. Check logs: `docker-compose logs`
2. Verify .env files
3. Ensure all services are healthy
4. Check service-specific README files
5. Contact development team

---

Happy coding! The dashboard is now ready for development.
