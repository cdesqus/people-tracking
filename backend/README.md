# CCTV Dashboard - Backend API

FastAPI backend for the CCTV Face Recognition Dashboard with AWS Rekognition integration.

## Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL 12+
- Redis 6+
- AWS Account with Rekognition API access

### Installation

1. **Create virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Run database migrations:**
```bash
alembic upgrade head
```

5. **Start the server:**
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

## Project Structure

```
backend/
├── app/
│   ├── api/                 # API endpoints
│   │   ├── cameras.py      # Camera management
│   │   ├── faces.py        # Face detection endpoints
│   │   ├── persons.py      # Person management
│   │   ├── alerts.py       # Alert management
│   │   └── system.py       # System endpoints
│   ├── models/             # Database models
│   │   ├── camera.py
│   │   ├── face.py
│   │   ├── person.py
│   │   ├── alert.py
│   │   └── user.py
│   ├── schemas/            # Pydantic schemas
│   ├── services/           # Business logic
│   │   └── aws_rekognition.py
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── config.py           # Configuration
│   ├── database.py         # Database setup
│   └── main.py             # Application entry
├── migrations/             # Alembic migrations
├── tests/                  # Test suite
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── Dockerfile             # Docker configuration
└── README.md              # This file
```

## Key Features

### API Endpoints

#### Cameras
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Create new camera
- `GET /api/cameras/{id}` - Get camera details
- `PUT /api/cameras/{id}` - Update camera
- `DELETE /api/cameras/{id}` - Delete camera

#### Faces
- `GET /api/faces` - List detected faces
- `POST /api/faces` - Create face record
- `GET /api/faces/{id}` - Get face details

#### Persons
- `GET /api/persons` - List persons
- `POST /api/persons` - Create person
- `GET /api/persons/{id}` - Get person details
- `PUT /api/persons/{id}` - Update person
- `DELETE /api/persons/{id}` - Delete person

#### Alerts
- `GET /api/alerts` - List alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts/{id}` - Get alert details
- `PATCH /api/alerts/{id}/acknowledge` - Acknowledge alert
- `DELETE /api/alerts/{id}` - Delete alert

#### System
- `GET /api/system/health` - Health check
- `GET /api/system/config` - System configuration
- `GET /api/system/stats` - Dashboard statistics

## Configuration

Environment variables are loaded from `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cctv_db

# Redis
REDIS_URL=redis://localhost:6379

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# Application
APP_ENV=development
DEBUG=True
SECRET_KEY=your-secret-key

# Other settings
MAX_UPLOAD_SIZE=52428800
CONFIDENCE_THRESHOLD=0.9
ALERT_RETENTION_DAYS=30
```

## Database

### Models

- **Camera**: Video stream sources
- **Face**: Detected faces in video streams
- **Person**: Identified persons with face encodings
- **Alert**: System alerts and notifications
- **User**: System users and roles

### Migrations

Create new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback:
```bash
alembic downgrade -1
```

## Testing

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=app tests/
```

### Run specific test file
```bash
pytest tests/test_cameras.py
```

## AWS Rekognition Integration

The service uses AWS Rekognition for:
- Face detection in images
- Face matching against person collections
- Face indexing for recognition

### Setup AWS

1. Create AWS account with Rekognition access
2. Set AWS credentials in `.env`
3. Create Rekognition collections for person groups

### Configuration

```python
# app/services/aws_rekognition.py
rekognition_service = RekognitionService()

# Detect faces
faces = await rekognition_service.detect_faces(image_bytes)

# Search faces
matches = await rekognition_service.search_faces_by_image(
    collection_id="my-collection",
    image_bytes=image_bytes
)
```

## Logging

Logs are written to `./logs` directory. Configure logging level in `.env`:

```env
LOG_LEVEL=INFO
LOG_DIR=./logs
```

## Performance Optimization

- Use Redis for caching frequently accessed data
- Index important database columns
- Implement pagination for list endpoints
- Use connection pooling for database

## Security Considerations

1. Use environment variables for sensitive data
2. Implement API authentication (JWT tokens)
3. Enable CORS appropriately
4. Validate all input data
5. Use HTTPS in production
6. Regular security audits

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL is correct
- Ensure database exists

### AWS Rekognition Error
- Verify AWS credentials
- Check API permissions
- Ensure AWS_REGION is correct

### Port Already in Use
```bash
# Use different port
uvicorn app.main:app --port 8001
```

## Development

### Code Style
```bash
# Format with Black
black app/

# Sort imports
isort app/

# Lint with Flake8
flake8 app/
```

### Type Checking
```bash
mypy app/
```

## Deployment

See deployment guide for production setup with Docker, Kubernetes, or cloud platforms.

## Contributing

1. Create feature branch
2. Make changes with tests
3. Run linters and tests
4. Submit pull request

## Support

For issues and questions, contact the development team.
