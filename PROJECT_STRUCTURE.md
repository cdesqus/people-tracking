# CCTV Dashboard - Project Structure Overview

## Complete File Tree

```
cctv-dashboard/
│
├── README.md                           # Main project documentation
├── SETUP_GUIDE.md                      # Setup and installation guide
├── PROJECT_STRUCTURE.md                # This file
├── docker-compose.yml                  # Local development Docker compose
├── .gitignore                          # Git ignore rules
│
├── frontend/                           # React 18 + TypeScript Frontend
│   ├── public/
│   │   └── index.html                 # Main HTML template
│   │
│   ├── src/
│   │   ├── index.tsx                  # Application entry point
│   │   ├── App.tsx                    # Root component with routing
│   │   │
│   │   ├── components/
│   │   │   ├── common/                # Shared components (buttons, cards, etc.)
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx         # Main layout wrapper
│   │   │   │   ├── Header.tsx         # Top navigation header
│   │   │   │   └── Sidebar.tsx        # Side navigation menu
│   │   │   ├── dashboard/             # Dashboard-specific components
│   │   │   ├── camera/                # Camera-related components
│   │   │   └── alerts/                # Alert-related components
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Dashboard page
│   │   │   ├── Cameras.tsx            # Cameras management page
│   │   │   ├── Alerts.tsx             # Alerts page
│   │   │   ├── Analytics.tsx          # Analytics page
│   │   │   ├── Settings.tsx           # Settings page
│   │   │   └── NotFound.tsx           # 404 error page
│   │   │
│   │   ├── services/
│   │   │   └── api.ts                 # API client with endpoints
│   │   │
│   │   ├── store/
│   │   │   ├── store.ts               # Redux store configuration
│   │   │   └── slices/
│   │   │       ├── cameraSlice.ts     # Camera state management
│   │   │       ├── faceSlice.ts       # Face detection state
│   │   │       ├── alertSlice.ts      # Alert state management
│   │   │       └── uiSlice.ts         # UI state (theme, sidebar, etc.)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript type definitions
│   │   │
│   │   ├── hooks/
│   │   │   ├── useCamera.ts           # Camera hook
│   │   │   └── useAlerts.ts           # Alerts hook
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.ts           # Application constants
│   │   │   └── formatters.ts          # Data formatting utilities
│   │   │
│   │   └── styles/
│   │       ├── globals.css            # Global styles
│   │       ├── variables.css          # CSS variables (colors, spacing)
│   │       └── animations.css         # Custom animations
│   │
│   ├── .env.example                   # Environment variables template
│   ├── .gitignore                     # Frontend git ignore
│   ├── package.json                   # Dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── tsconfig.node.json             # TypeScript node configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── Dockerfile                     # Docker image for frontend
│   └── README.md                      # Frontend documentation
│
└── backend/                            # FastAPI Backend
    ├── app/
    │   ├── __init__.py                # Package initialization
    │   ├── main.py                    # Application entry point
    │   ├── config.py                  # Configuration settings
    │   ├── database.py                # Database setup and session
    │   │
    │   ├── api/
    │   │   ├── __init__.py            # API router configuration
    │   │   ├── cameras.py             # Camera endpoints
    │   │   ├── faces.py               # Face detection endpoints
    │   │   ├── persons.py             # Person management endpoints
    │   │   ├── alerts.py              # Alert management endpoints
    │   │   └── system.py              # System/health endpoints
    │   │
    │   ├── models/
    │   │   ├── __init__.py            # Models package
    │   │   ├── camera.py              # Camera model
    │   │   ├── face.py                # Face model
    │   │   ├── person.py              # Person model
    │   │   ├── alert.py               # Alert model
    │   │   └── user.py                # User model
    │   │
    │   ├── schemas/
    │   │   ├── __init__.py            # Schemas package
    │   │   ├── camera.py              # Camera Pydantic schemas
    │   │   ├── face.py                # Face Pydantic schemas
    │   │   ├── person.py              # Person Pydantic schemas
    │   │   ├── alert.py               # Alert Pydantic schemas
    │   │   └── user.py                # User Pydantic schemas
    │   │
    │   ├── services/
    │   │   ├── __init__.py            # Services package
    │   │   └── aws_rekognition.py     # AWS Rekognition service
    │   │
    │   ├── middleware/
    │   │   └── __init__.py            # Custom middleware
    │   │
    │   └── utils/
    │       ├── __init__.py            # Utilities package
    │       └── helpers.py             # Helper functions
    │
    ├── migrations/                     # Alembic database migrations
    │   ├── versions/                   # Migration versions
    │   ├── env.py                      # Migration environment
    │   ├── script.py.mako              # Migration template
    │   └── alembic.ini                 # Alembic configuration
    │
    ├── tests/                          # Test suite
    │   ├── __init__.py
    │   ├── test_cameras.py             # Camera tests
    │   ├── test_faces.py               # Face tests
    │   ├── test_persons.py             # Person tests
    │   ├── test_alerts.py              # Alert tests
    │   └── conftest.py                 # Test configuration
    │
    ├── .env.example                    # Environment variables template
    ├── .gitignore                      # Backend git ignore
    ├── requirements.txt                # Python dependencies
    ├── Dockerfile                      # Docker image for backend
    ├── README.md                       # Backend documentation
    └── alembic.ini                     # Alembic configuration
```

## Architecture Overview

### Frontend Architecture
```
App (Root Router)
├── Layout
│   ├── Header (Navigation & User Menu)
│   ├── Sidebar (Main Navigation)
│   └── Routes
│       ├── Dashboard
│       ├── Cameras
│       ├── Alerts
│       ├── Analytics
│       └── Settings

State Management (Redux)
├── Cameras Slice
├── Faces Slice
├── Alerts Slice
└── UI Slice

Services
└── API Client (Axios)
    ├── Cameras
    ├── Faces
    ├── Persons
    ├── Alerts
    └── System
```

### Backend Architecture
```
FastAPI Application
├── CORS Middleware
├── Routes (API v1)
│   ├── /cameras
│   ├── /faces
│   ├── /persons
│   ├── /alerts
│   └── /system
│
Database Layer
├── SQLAlchemy ORM
└── AsyncSession

Services
├── AWS Rekognition Service
├── Face Recognition
└── Alert Service

Models (Database)
├── Camera
├── Face
├── Person
├── Alert
└── User
```

## Key Files Explained

### Frontend Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Root component with routing |
| `index.tsx` | Application bootstrap |
| `services/api.ts` | Centralized API client |
| `store/store.ts` | Redux store setup |
| `types/index.ts` | TypeScript definitions |
| `utils/constants.ts` | App-wide constants |
| `components/layout/Layout.tsx` | Main layout wrapper |

### Backend Key Files

| File | Purpose |
|------|---------|
| `main.py` | Application factory and startup |
| `config.py` | Settings management |
| `database.py` | Database initialization |
| `api/__init__.py` | API router setup |
| `models/*.py` | Database table definitions |
| `schemas/*.py` | Request/response validation |

## Database Schema

### Tables

1. **cameras**
   - id, name, location, status, stream_url, resolution, fps
   - created_at, updated_at

2. **faces**
   - id, camera_id, person_id, confidence, boundingbox
   - timestamp, image_url, created_at, updated_at

3. **persons**
   - id, name, description, status, face_encodings
   - first_seen, last_seen, encounter_count
   - created_at, updated_at

4. **alerts**
   - id, type, severity, title, description
   - camera_id, person_id, face_id, acknowledged
   - created_at, updated_at

5. **users**
   - id, email, username, full_name, hashed_password
   - role, is_active, created_at, updated_at

## API Endpoints

### Cameras
- `GET /api/cameras` - List cameras
- `POST /api/cameras` - Create camera
- `GET /api/cameras/{id}` - Get camera
- `PUT /api/cameras/{id}` - Update camera
- `DELETE /api/cameras/{id}` - Delete camera

### Faces
- `GET /api/faces` - List faces
- `POST /api/faces` - Create face record
- `GET /api/faces/{id}` - Get face

### Persons
- `GET /api/persons` - List persons
- `POST /api/persons` - Create person
- `GET /api/persons/{id}` - Get person
- `PUT /api/persons/{id}` - Update person
- `DELETE /api/persons/{id}` - Delete person

### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts/{id}` - Get alert
- `PATCH /api/alerts/{id}/acknowledge` - Acknowledge alert
- `DELETE /api/alerts/{id}` - Delete alert

### System
- `GET /api/system/health` - Health check
- `GET /api/system/config` - Get config
- `GET /api/system/stats` - Get stats

## Dependencies Overview

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **React Router**: Navigation
- **date-fns**: Date formatting
- **react-icons**: Icon library
- **Chart.js**: Charts and graphs

### Backend
- **FastAPI**: Web framework
- **SQLAlchemy**: ORM
- **Pydantic**: Data validation
- **boto3**: AWS SDK
- **psycopg2**: PostgreSQL adapter
- **redis**: Caching client
- **alembic**: Database migrations
- **pytest**: Testing

## File Naming Conventions

- Components: PascalCase (e.g., `Camera.tsx`)
- Utilities: camelCase (e.g., `formatters.ts`)
- Models: PascalCase (e.g., `Camera` class)
- Pages: PascalCase (e.g., `Dashboard.tsx`)
- Constants: UPPER_SNAKE_CASE (in constants.ts)

## Getting Started

1. **Review Structure**: Understand folder organization
2. **Check Docs**: Read README files in each section
3. **Follow Setup Guide**: Use SETUP_GUIDE.md for initial setup
4. **Explore Pages**: Start with Dashboard and Cameras
5. **Review Types**: Check TypeScript types in `types/index.ts`
6. **Check API**: Review API endpoints in backend routes

## Next Steps for Development

1. Implement camera CRUD operations
2. Add face detection integration
3. Complete person management
4. Implement alert system
5. Add authentication/authorization
6. Build analytics dashboard
7. Add real-time updates with WebSocket
8. Write comprehensive tests

---

All files are organized for clarity and maintainability. Each module is focused on a specific functionality with proper separation of concerns.
