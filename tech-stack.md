# CCTV AI People Tracking - Technical Stack & Implementation Guide

## 1. Technology Stack Details

### 1.1 Backend Services

#### Primary Backend Framework
```
FastAPI (Python) - RECOMMENDED
├── Async/await support
├── Built-in OpenAPI documentation
├── High performance (near NodeJS speed)
├── Great for AI/ML integration
├── Easy middleware implementation
└── WebSocket support

Alternative: Express.js (Node.js)
├── If team is JavaScript-focused
├── More ecosystem packages
├── Good for real-time apps
└── Slightly lower ML integration ease
```

#### CCTV Stream Processing
```python
# Dependencies
OpenCV (cv2)          # Frame extraction & image processing
FFmpeg              # Video codec handling
rtstream             # RTSP stream handling
numpy               # Numerical operations
Pillow              # Image manipulation

# Pseudocode Structure
while stream_active:
    frame = capture_frame()  # 30fps
    if frame_quality_check():
        # Queue for processing
        process_queue.put(frame)
    else:
        trigger_camera_alert()
```

#### Face Detection
```
YOLOv8 (RECOMMENDED)
├── Real-time performance
├── High accuracy (95%+)
├── Fast inference (<50ms)
├── TensorRT/ONNX export support
└── Active development

Alternative Options:
├── RetinaFace - Ultra lightweight
├── MTCNN - Traditional but stable
└── MediaPipe - Mobile-friendly
```

#### Face Recognition
```
InsightFace (RECOMMENDED)
├── ArcFace model pre-trained
├── 128-D embedding vector
├── 99.8% LFW accuracy
├── Fast inference (<100ms)
├── Good for real-time

Alternative Options:
├── FaceNet (TensorFlow)
├── DeepFace (Facebook)
└── VGGFace2
```

#### Object Tracking
```
DeepSORT Algorithm
├── Real-time multi-object tracking
├── Handles occlusions
├── Person re-identification
├── Maintains consistent IDs
└── Good for crowd scenes

Libraries:
├── yolov8-deepsort
├── mmtracking
└── Custom implementation
```

---

### 1.2 Database Architecture

#### PostgreSQL Configuration
```yaml
Primary Database: PostgreSQL 14+
├── Employees Table (indexed on emp_id)
├── Visitors Table (indexed on check_in_time)
├── Detections Table (partitioned by date)
├── Camera_Status Table
├── Alerts Table
└── Movement_History Table

Extensions Required:
├── pgvector (vector similarity search)
├── uuid-ossp (UUID generation)
└── timescaledb (optional, for time-series)

Performance Tuning:
├── Connection pooling (PgBouncer)
├── Indexes on frequently queried columns
├── Partitioning for large tables (detections)
└── Query optimization & EXPLAIN analysis
```

#### Vector Database (Face Embeddings)
```
Option 1: pgvector (RECOMMENDED)
├── Native PostgreSQL extension
├── 128-D vector storage
├── L2/IP/cosine similarity
├── IVFFlat/HNSW indexing
└── Integrated with main DB

Option 2: Separate Vector DB
├── Pinecone (cloud)
├── Milvus (self-hosted)
├── Weaviate
└── FAISS (local, lightweight)

Embedding Structure:
{
  id: UUID,
  person_id: UUID,
  person_type: 'employee' | 'visitor',
  embedding: vector[128],  # 128-dimensional vector
  confidence: float,
  created_at: timestamp
}
```

#### Caching Strategy
```
Redis Cache Layers:

1. Session Cache (TTL: 24h)
   └── user_sessions:{user_id}

2. Real-time Tracking (TTL: 5min)
   ├── employee:location:{emp_id}
   ├── visitor:location:{visitor_id}
   └── zone:occupancy:{zone_name}

3. Face Embedding Cache (TTL: 1h)
   └── face_embedding:{person_id}

4. Alert Cache (TTL: 1h)
   └── active_alerts:{alert_type}

5. Feature Flags (TTL: varies)
   └── feature:{feature_name}

Operations:
├── Cache-aside pattern for read-heavy
├── Write-through for critical data
└── Cache invalidation on updates
```

---

### 1.3 Message Queue & Event Processing

#### Message Queue Setup
```
RabbitMQ (RECOMMENDED)

Exchange Types:
├── detection_exchange (topic)
│   └── detection.employee
│   └── detection.visitor
│   └── detection.unknown
├── camera_exchange (direct)
│   └── camera.alert
│   └── camera.status
└── alert_exchange (fanout)
    └── broadcast to all consumers

Queue Consumers:
├── detection_processor
├── alert_notifier
├── timeline_updater
└── analytics_aggregator

Configuration:
├── Prefetch: 10 messages
├── Durability: enabled
├── TTL: 24 hours
└── Dead letter exchange: enabled
```

#### Event Stream Processing
```
Apache Kafka Alternative:

Topics:
├── detections (10 partitions)
├── camera-status (3 partitions)
├── alerts (5 partitions)
└── movements (10 partitions)

Consumer Groups:
├── detection-logger
├── analytics-processor
├── real-time-dashboard
└── report-generator
```

---

### 1.4 Object Storage

#### File Storage Structure
```
MinIO / AWS S3 Layout:

s3://cctv-system/
├── faces/
│   ├── employees/{emp_id}/{timestamp}.jpg
│   └── visitors/{visitor_id}/{timestamp}.jpg
├── snapshots/
│   ├── detections/{detection_id}.jpg
│   └── alerts/{alert_id}.jpg
├── streams/
│   ├── camera_{camera_id}/{date}/video.mp4
│   └── (archived videos)
└── reports/
    ├── pdf/{report_id}.pdf
    └── csv/{report_id}.csv

S3 Configuration:
├── Bucket versioning: enabled
├── Encryption: AES-256
├── Lifecycle policies:
│   ├── Delete snapshots after 30 days
│   ├── Move archived streams to Glacier after 90 days
│   └── Keep face photos indefinitely
└── Access control: Bucket policy + IAM roles
```

---

## 2. Infrastructure Setup

### 2.1 Docker Compose Development Environment

```yaml
version: '3.8'
services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cctv_system
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/
    ports:
      - "5432:5432"

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Message Queue
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI

  # MinIO (Object Storage)
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"  # Console
    volumes:
      - minio_data:/data

  # Backend API
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://admin:password@postgres:5432/cctv_system
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672/
      MINIO_URL: http://minio:9000
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
      - rabbitmq
      - minio
    volumes:
      - ./backend:/app

  # AI Processing Service
  ai_service:
    build:
      context: ./ai_service
      dockerfile: Dockerfile
    environment:
      MODEL_PATH: /models
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://admin:admin@rabbitmq:5672/
    volumes:
      - ./ai_service:/app
      - ./models:/models
    depends_on:
      - redis
      - rabbitmq

  # Frontend Development
  frontend:
    image: node:18-alpine
    working_dir: /app
    command: npm start
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

---

### 2.2 Kubernetes Deployment

```yaml
# deployment.yaml for production

apiVersion: v1
kind: ConfigMap
metadata:
  name: cctv-config
data:
  environment: production
  log_level: info

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cctv-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cctv-api
  template:
    metadata:
      labels:
        app: cctv-api
    spec:
      containers:
      - name: api
        image: cctv-system:api-latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: cctv-secrets
              key: database_url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: cctv-api-service
spec:
  selector:
    app: cctv-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cctv-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cctv-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## 3. API Implementation Example

### 3.1 FastAPI Skeleton

```python
# main.py
from fastapi import FastAPI, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_extended import JWTManager
import uvicorn
from contextlib import asynccontextmanager

# Database & Caching
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
import redis.asyncio as redis

# Import routers
from routes import employees, visitors, detections, cameras, alerts

# Global variables
db_engine = None
redis_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global db_engine, redis_client
    
    db_engine = create_async_engine(DATABASE_URL)
    redis_client = await redis.from_url(REDIS_URL)
    
    yield
    
    # Shutdown
    await db_engine.dispose()
    await redis_client.close()

# Initialize FastAPI
app = FastAPI(
    title="CCTV AI People Tracking",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
jwt = JWTManager(app)

# Include Routers
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(visitors.router, prefix="/api/visitors", tags=["visitors"])
app.include_router(detections.router, prefix="/api/detections", tags=["detections"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["cameras"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])

# Health Check
@app.get("/health")
async def health():
    return {"status": "healthy"}

# WebSocket for Real-time Updates
@app.websocket("/ws/dashboard/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    
    # Subscribe to Redis channel
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(f"dashboard:{user_id}")
    
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                await websocket.send_json(json.loads(message["data"]))
    finally:
        await pubsub.unsubscribe(f"dashboard:{user_id}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 3.2 Detection Service

```python
# services/detection_service.py
import cv2
import numpy as np
from ultralytics import YOLO
from insightface.app import FaceAnalysis
import asyncio
from datetime import datetime

class FaceDetectionService:
    def __init__(self):
        # Load models
        self.yolo = YOLO('yolov8n-face.pt')  # Lightweight
        self.face_analyzer = FaceAnalysis(
            name='buffalo_l',
            providers=['CUDAExecutionProvider']
        )
        self.face_analyzer.prepare(ctx_id=0, det_size=(640, 640))
    
    async def process_frame(self, frame: np.ndarray, camera_id: str):
        """Process single frame for face detection"""
        
        # Check camera status
        if not self._is_frame_valid(frame):
            await self._trigger_camera_alert(camera_id)
            return None
        
        # YOLOv8 Face Detection
        results = self.yolo(frame, conf=0.5)
        detections = []
        
        for detection in results[0].boxes:
            x1, y1, x2, y2 = detection.xyxy[0]
            conf = detection.conf[0]
            
            # Extract face region
            face_crop = frame[int(y1):int(y2), int(x1):int(x2)]
            
            # Generate embedding
            embedding = await self._generate_embedding(face_crop)
            
            detections.append({
                'bbox': (x1, y1, x2, y2),
                'confidence': float(conf),
                'embedding': embedding,
                'timestamp': datetime.now(),
                'camera_id': camera_id
            })
        
        return detections
    
    async def _generate_embedding(self, face_crop):
        """Generate face embedding using InsightFace"""
        faces = self.face_analyzer.get(face_crop)
        
        if len(faces) == 0:
            return None
        
        # Return 128-D embedding
        return faces[0].embedding.tolist()
    
    async def _match_face(self, embedding, threshold=0.6):
        """Match face embedding against database"""
        
        # Query vector database
        results = await db.search_similar_faces(
            embedding=embedding,
            limit=5,
            threshold=threshold
        )
        
        return results
    
    def _is_frame_valid(self, frame):
        """Check if frame is valid (not black/blurred)"""
        
        # Check if frame is mostly black
        if np.mean(frame) < 30:
            return False
        
        # Check blur (Laplacian variance)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = laplacian.var()
        
        if variance < 100:  # Threshold for blur
            return False
        
        return True
    
    async def _trigger_camera_alert(self, camera_id):
        """Trigger camera coverage alert"""
        
        alert = {
            'type': 'CAMERA_COVERAGE_LOST',
            'camera_id': camera_id,
            'severity': 'CRITICAL',
            'timestamp': datetime.now()
        }
        
        # Queue to alert service
        await rabbitmq.publish('camera_exchange', alert)
```

---

## 4. AI Model Specifications

### 4.1 Face Detection Model

```yaml
Model: YOLOv8n-face
├── Size: 3.3 MB
├── Inference: ~30ms (CPU), ~10ms (GPU)
├── Accuracy: 95%+ on common datasets
├── Input: 640x640 images
└── Output: Bounding boxes + confidence

Alternative Lightweight Options:
├── RetinaFace: 100MB, 95%+ accuracy
├── MTCNN: 470MB, 97% accuracy
└── MediaPipe Face Detection: Very fast, mobile-friendly
```

### 4.2 Face Recognition Model

```yaml
Model: ArcFace (InsightFace)
├── Embedding Dimension: 128 or 512
├── Inference: ~50-100ms
├── Accuracy: 99.8% LFW (Labeled Faces in the Wild)
├── Model Size: 100-200MB
└── Training Data: 58 million identities

Embedding Generation:
├── Input: Detected face image (112x112)
├── Processing: Normalization + ResNet backbone
└── Output: 128-D vector (float32)

Vector Similarity Matching:
├── Distance Metric: L2 norm (Euclidean)
├── Threshold: 0.6 (tunable per deployment)
└── Similarity Score: 1 - (L2_distance / 2)
```

---

## 5. Performance Optimization

### 5.1 GPU Acceleration

```python
# TensorRT Optimization for YOLOv8
from ultralytics import YOLO

model = YOLO('yolov8n-face.pt')
# Export to TensorRT (3-5x faster inference)
model.export(format='engine', device=0)

# Load optimized model
optimized_model = YOLO('yolov8n-face.engine')
```

### 5.2 Batch Processing

```python
# Process multiple frames in parallel
async def batch_process_frames(frames: List[np.ndarray]):
    """Process multiple frames in batches"""
    
    batch_size = 8
    for i in range(0, len(frames), batch_size):
        batch = frames[i:i+batch_size]
        
        # Parallel processing
        tasks = [
            process_frame(frame, camera_id) 
            for frame, camera_id in batch
        ]
        
        results = await asyncio.gather(*tasks)
        
        # Yield results as they complete
        for result in results:
            yield result
```

### 5.3 Connection Pooling

```python
# Database connection pooling
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import QueuePool

engine = create_async_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,  # Number of connections
    max_overflow=40,  # Overflow connections
    pool_pre_ping=True,  # Test connections
    echo=False
)

# Redis connection pooling
redis_pool = redis.ConnectionPool.from_url(
    REDIS_URL,
    max_connections=50,
    decode_responses=True
)
redis_client = redis.Redis(connection_pool=redis_pool)
```

---

## 6. Monitoring & Observability

### 6.1 Prometheus Metrics

```python
# Metrics collection
from prometheus_client import Counter, Histogram, Gauge

# Define metrics
detection_counter = Counter(
    'detections_total',
    'Total detections',
    ['camera_id', 'person_type']
)

inference_duration = Histogram(
    'face_inference_ms',
    'Face inference duration in milliseconds',
    buckets=(50, 100, 200, 500, 1000)
)

active_alerts = Gauge(
    'active_alerts',
    'Number of active alerts'
)

# Usage
detection_counter.labels(camera_id='cam_1', person_type='employee').inc()
inference_duration.observe(inference_time_ms)
active_alerts.set(count)
```

### 6.2 Logging Configuration

```python
# Structured logging with ELK
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
logHandler = logging.FileHandler('logs/app.log')
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)

# Log detection events
logger.info('face_detected', extra={
    'camera_id': camera_id,
    'person_id': person_id,
    'confidence': confidence,
    'timestamp': datetime.now().isoformat()
})
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

```python
# tests/test_detection_service.py
import pytest
import numpy as np

@pytest.fixture
def detection_service():
    return FaceDetectionService()

@pytest.mark.asyncio
async def test_process_frame_with_faces(detection_service):
    # Create test frame
    frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    
    result = await detection_service.process_frame(frame, 'cam_1')
    
    assert isinstance(result, list)

@pytest.mark.asyncio
async def test_invalid_frame_detection(detection_service):
    # Black frame
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    result = await detection_service.process_frame(frame, 'cam_1')
    
    assert result is None
```

### 7.2 Load Testing

```bash
# Using Apache JMeter or Locust
locust -f locustfile.py --host=http://localhost:8000

# Test scenarios:
# - 100 concurrent users
# - 1000 requests/second
# - Sustained for 5 minutes
```

---

## 8. Security Hardening

### 8.1 API Security

```python
# CORS & Security Headers
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware import Middleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

middleware = [
    Middleware(TrustedHostMiddleware, 
               allowed_hosts=["yourdomain.com"]),
    Middleware(CORSMiddleware,
               allow_origins=ALLOWED_ORIGINS,
               allow_credentials=True,
               allow_methods=["GET", "POST", "PUT"],
               allow_headers=["*"],
    ),
]

app = FastAPI(middleware=middleware)

# Rate limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/api/detections")
@limiter.limit("100/minute")
async def get_detections(request: Request):
    pass
```

### 8.2 Data Encryption

```python
# Encrypt face embeddings at rest
from cryptography.fernet import Fernet

cipher_suite = Fernet(encryption_key)

# Store encrypted embedding
encrypted_embedding = cipher_suite.encrypt(
    json.dumps(embedding).encode()
)

# Retrieve and decrypt
decrypted = json.loads(
    cipher_suite.decrypt(encrypted_embedding).decode()
)
```

---

## 9. Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates installed
- [ ] Monitoring dashboards created
- [ ] Backup & recovery tested
- [ ] Rate limiting configured
- [ ] Logging aggregation working
- [ ] Health checks verified
- [ ] Load balancer configured
- [ ] Firewall rules updated
- [ ] API documentation published
- [ ] Staff training completed

---

**Last Updated**: May 2026  
**Tech Stack Version**: 1.0  
**Recommended Deployment**: Docker + Kubernetes (production)
