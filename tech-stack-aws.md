# CCTV AI People Tracking - Technical Stack & Implementation
## AWS Rekognition Edition (Simplified, No GPU)

**Focus**: Cloud-based face recognition using AWS, minimal on-prem infrastructure

---

## 1. Simplified Technology Stack

### **What Changed?**

```
❌ REMOVED (GPU Approach):
├─ NVIDIA GPU (RTX, A10, A100)
├─ CUDA/cuDNN setup
├─ YOLOv8 face detection model
├─ InsightFace face recognition
├─ pgvector (face embeddings)
├─ Model optimization (TensorRT)
└─ GPU monitoring & maintenance

✅ ADDED (AWS Rekognition):
├─ AWS SDK (boto3)
├─ AWS IAM authentication
├─ S3 bucket for face photos
├─ Rekognition collections
└─ CloudWatch monitoring

✅ SIMPLIFIED:
├─ No ML model management
├─ No inference server
├─ Just REST API calls
├─ AWS handles everything
└─ Easy to understand
```

---

## 2. Backend Stack

### **FastAPI Application** (Same as before)

```python
# main.py - Much simpler without GPU!

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import boto3
import asyncio
from datetime import datetime

app = FastAPI(title="CCTV Tracking API")

# AWS Client (instead of GPU inference)
rekognition = boto3.client('rekognition', region_name='us-east-1')
s3 = boto3.client('s3')

# Database
from sqlalchemy import create_engine
db_engine = create_engine('postgresql://user:pass@localhost/cctv')

# Cache
import redis
redis_client = redis.Redis(host='localhost')

# ============ SIMPLIFIED FACE DETECTION ============
@app.post("/api/detect-face")
async def detect_face(frame_bytes: bytes):
    """
    Instead of:
    1. Load model (YOLOv8)
    2. Preprocess frame
    3. Run inference
    4. Generate embedding (InsightFace)
    5. Search vector DB
    
    Now do:
    1. Call AWS API
    2. Done!
    """
    
    response = rekognition.search_faces_by_image(
        CollectionId='employees',
        Image={'Bytes': frame_bytes},
        MaxFaces=5,
        FaceMatchThreshold=70
    )
    
    results = []
    for match in response['FaceMatches']:
        results.append({
            'person_id': match['Face']['ExternalImageId'],
            'confidence': float(match['Similarity']),
            'timestamp': datetime.now()
        })
    
    # Save to DB
    if results:
        for r in results:
            db_engine.execute(
                "INSERT INTO detections (person_id, confidence) VALUES (%s, %s)",
                (r['person_id'], r['confidence'])
            )
    
    return results
```

### **Complete Backend Stack**

```yaml
Language: Python 3.10+

Web Framework:
  ├─ FastAPI
  ├─ Uvicorn (ASGI server)
  ├─ Pydantic (validation)
  └─ python-multipart (file upload)

Cloud Integration:
  ├─ boto3 (AWS SDK)
  │  ├─ Rekognition (face detection/search)
  │  └─ S3 (face image storage)
  └─ botocore (AWS authentication)

Image Processing:
  ├─ OpenCV (cv2)
  │  ├─ Frame capture from RTSP
  │  ├─ Frame quality check
  │  ├─ Resize/preprocess
  │  └─ JPEG encoding
  └─ Pillow (PIL) - image manipulation

Database:
  ├─ SQLAlchemy (ORM)
  ├─ psycopg2 (PostgreSQL driver)
  └─ sqlalchemy-utils (helpers)

Caching:
  ├─ redis (Python client)
  └─ aioredis (async Redis)

Real-time:
  ├─ websockets (WebSocket server)
  └─ python-socketio (alternative)

Utilities:
  ├─ python-dotenv (config)
  ├─ pydantic-settings (settings)
  ├─ python-logging-loki (structured logging)
  └─ prometheus-client (metrics)

NO CHANGES NEEDED:
├─ Flask/Django (still same)
├─ Request handling (same)
├─ Database queries (same)
└─ Real-time updates (same)
```

---

## 3. Infrastructure - Much Simpler!

### **What You Need (On-Premise)**

```
BEFORE (GPU Approach):
├─ GPU Server (NVIDIA A10): $2,000-3,000/month
├─ CPU: 16 core Xeon
├─ RAM: 128GB
├─ Storage: 1TB NVMe
└─ TOTAL: $2,500-3,500/month

AFTER (AWS Approach):
├─ Server (CPU-ONLY): $300-400/month
├─ CPU: 8 core Xeon (enough!)
├─ RAM: 64GB (enough!)
├─ Storage: 500GB SSD
└─ TOTAL: $400-600/month + AWS API costs

SAVINGS: ~$1,900-3,000/month! 🎉
```

### **Server Specifications**

```yaml
Hardware:
  CPU:
    ├─ Intel Xeon E5-2680 v4 (8-16 cores)
    ├─ OR AMD Epyc 7302 (16 cores)
    └─ Frequency: 2.4-3.6 GHz

  RAM:
    ├─ Minimum: 32GB
    ├─ Recommended: 64GB
    └─ For: Database buffer + caching

  Storage:
    ├─ Boot: 250GB SSD
    ├─ Database: 500GB-1TB SSD
    └─ RAID: Optional (for reliability)

  Network:
    ├─ Bandwidth: 100Mbps minimum
    ├─ Latency: <50ms to AWS
    └─ Redundancy: Dual ISP preferred

  GPU:
    └─ NOT NEEDED! ✅

Cost:
  ├─ New server: $3,000-5,000
  ├─ Used/Refurb: $1,500-2,500 ⭐
  ├─ Monthly (electricity): $150-250
  └─ TOTAL: $1,650-2,750 upfront
```

### **Docker Compose Setup**

```yaml
version: '3.8'

services:
  # API Server (the only thing you host)
  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/cctv
      REDIS_URL: redis://redis:6379
      AWS_ACCESS_KEY_ID: ${AWS_KEY}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET}
      AWS_REGION: us-east-1
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app
    networks:
      - cctv-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cctv
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - cctv-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - cctv-network

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:8000
    networks:
      - cctv-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
      - frontend
    networks:
      - cctv-network

volumes:
  postgres_data:

networks:
  cctv-network:
    driver: bridge
```

**Key Difference**: NO GPU SERVICE! ✅

---

## 4. AWS Rekognition API Usage

### **Core Functions**

```python
import boto3
from botocore.exceptions import ClientError

class FaceRecognitionService:
    
    def __init__(self):
        self.rekognition = boto3.client(
            'rekognition',
            region_name='us-east-1'
        )
        self.s3 = boto3.client('s3')
    
    # ======= SETUP (One-time) =======
    
    def create_collection(self, collection_name):
        """Create collection for faces"""
        try:
            response = self.rekognition.create_collection(
                CollectionId=collection_name
            )
            return response
        except self.rekognition.exceptions.ResourceAlreadyExistsException:
            print(f"Collection {collection_name} already exists")
            return None
    
    # ======= EMPLOYEE REGISTRATION =======
    
    def register_employee(self, emp_id, employee_name, photo_bytes):
        """Register employee face"""
        
        # 1. Upload photo to S3
        s3_key = f'employees/{emp_id}.jpg'
        self.s3.put_object(
            Bucket='cctv-faces',
            Key=s3_key,
            Body=photo_bytes
        )
        
        # 2. Index face in Rekognition
        response = self.rekognition.index_faces(
            CollectionId='employees',
            Image={
                'S3Object': {
                    'Bucket': 'cctv-faces',
                    'Name': s3_key
                }
            },
            ExternalImageId=emp_id,
            MaxFaces=1,
            QualityFilter='AUTO'
        )
        
        # 3. Log cost
        # Cost: $0.015 per indexed face (once per employee)
        
        return {
            'status': 'success',
            'face_id': response['FaceRecords'][0]['Face']['FaceId'],
            'cost': '$0.015'
        }
    
    # ======= REAL-TIME DETECTION =======
    
    def search_face(self, frame_bytes):
        """Search for face in collection"""
        
        response = self.rekognition.search_faces_by_image(
            CollectionId='employees',
            Image={'Bytes': frame_bytes},
            MaxFaces=5,
            FaceMatchThreshold=70  # 70% confidence
        )
        
        # Cost: $0.006 per search
        
        results = []
        for match in response['FaceMatches']:
            results.append({
                'person_id': match['Face']['ExternalImageId'],
                'confidence': match['Similarity'],
                'face_id': match['Face']['FaceId']
            })
        
        return results
    
    # ======= BONUS: FACE ATTRIBUTES =======
    
    def get_face_attributes(self, frame_bytes):
        """Get age, gender, emotion, etc"""
        
        response = self.rekognition.detect_faces(
            Image={'Bytes': frame_bytes},
            Attributes=['ALL']  # age, gender, emotion, etc
        )
        
        # Cost: $0.006 per detection
        
        attributes = []
        for face in response['FaceDetails']:
            attributes.append({
                'age': face['AgeRange'],
                'gender': face['Gender'],
                'emotions': face['Emotions'],
                'landmarks': face['Landmarks']
            })
        
        return attributes
    
    # ======= VISITOR MANAGEMENT =======
    
    def register_visitor(self, visitor_id, name, photo_bytes):
        """Register temporary visitor face"""
        
        # Same as employee, but different collection
        s3_key = f'visitors/{visitor_id}.jpg'
        self.s3.put_object(
            Bucket='cctv-faces',
            Key=s3_key,
            Body=photo_bytes
        )
        
        response = self.rekognition.index_faces(
            CollectionId='visitors',  # Separate collection!
            Image={'S3Object': {'Bucket': 'cctv-faces', 'Name': s3_key}},
            ExternalImageId=visitor_id,
            MaxFaces=1
        )
        
        # Cost: $0.015 per visitor
        
        return response
```

### **API Call Costs**

```
Operation                  Cost        Example
─────────────────────────────────────────────────
Face Detection            $0.006/image  1,000 images = $6
Face Search              $0.006/search  1,000 searches = $6
Face Indexing            $0.015/face    1,000 faces = $15
Detect Faces (attr)      $0.006/image   1,000 images = $6
Compare Faces            $0.006/comp    Not needed (use search)
─────────────────────────────────────────────────

MONTHLY ESTIMATE (20-40 cameras):
├─ 10,000 face searches/day × $0.006 = $60/day
├─ 50 visitor registrations/day × $0.015 = $0.75/day
├─ Face attribute detection (optional) = $0/day (if not used)
└─ TOTAL: ~$1,830/month for AWS only
```

---

## 5. Database Schema (No pgvector needed!)

```sql
-- MUCH SIMPLER without embeddings!

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    department VARCHAR(100),
    -- NO embedding column needed!
    aws_face_id VARCHAR(255),  -- Rekognition manages this
    registered_at TIMESTAMP DEFAULT NOW()
);

-- Visitors
CREATE TABLE visitors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    organization VARCHAR(255),
    purpose TEXT,
    host_emp_id UUID REFERENCES employees(id),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    validity_hours INT DEFAULT 8,
    aws_face_id VARCHAR(255),
    status VARCHAR(20)  -- 'checked_in' or 'checked_out'
);

-- Detections (lightweight, no embedding search needed)
CREATE TABLE detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id VARCHAR(50),
    person_id VARCHAR(100),  -- emp_id or visitor_id
    person_type VARCHAR(20),  -- 'employee' or 'visitor'
    aws_confidence FLOAT,  -- AWS returns this
    detection_time TIMESTAMP,
    face_image_url VARCHAR(500)  -- S3 URL
);

-- Indexes
CREATE INDEX idx_detections_person ON detections(person_id);
CREATE INDEX idx_detections_time ON detections(detection_time DESC);
CREATE INDEX idx_detections_camera ON detections(camera_id);

-- NO VECTOR SEARCH NEEDED! ✅
-- AWS handles face matching in the cloud
```

---

## 6. Real-Time Processing Pipeline

### **Simplified Flow**

```
CCTV Frame (RTSP)
    ↓
[OpenCV - Local]
├─ Decode frame
├─ Check quality
└─ JPEG encode
    ↓
[FastAPI - Local]
├─ Buffer frame
└─ Call AWS API
    ↓
[AWS Rekognition - Cloud]
├─ Detect face
├─ Search collection
└─ Return matches
    ↓
[FastAPI - Local]
├─ Log to PostgreSQL
├─ Broadcast via WebSocket
└─ Cache in Redis
    ↓
[Dashboard - Browser]
├─ Real-time update
├─ Show detection
└─ Display alert
```

### **Code Example**

```python
import asyncio
import cv2
from fastapi import FastAPI
import boto3

app = FastAPI()
rekognition = boto3.client('rekognition')

async def process_camera_stream(camera_id: str):
    """Process CCTV stream continuously"""
    
    cap = cv2.VideoCapture(f'rtsp://camera-{camera_id}')
    
    while True:
        ret, frame = cap.read()
        
        if not ret:
            await asyncio.sleep(1)
            continue
        
        # Process every 3rd frame (to reduce costs)
        if frame_count % 3 == 0:
            # Encode to JPEG
            _, jpg_bytes = cv2.imencode('.jpg', frame)
            
            # Call AWS (takes ~300ms)
            try:
                response = rekognition.search_faces_by_image(
                    CollectionId='employees',
                    Image={'Bytes': jpg_bytes.tobytes()},
                    MaxFaces=5,
                    FaceMatchThreshold=70
                )
                
                # Process results (instant)
                detections = [
                    {
                        'person_id': match['Face']['ExternalImageId'],
                        'confidence': match['Similarity']
                    }
                    for match in response['FaceMatches']
                ]
                
                # Save & broadcast (instant)
                if detections:
                    db.save_detections(detections)
                    await websocket_broadcast(detections)
                    
                    # Log for cost tracking
                    log_aws_call('search_faces_by_image', 1)
            
            except Exception as e:
                logger.error(f"AWS call failed: {str(e)}")
                continue
        
        frame_count += 1
        await asyncio.sleep(0.033)  # ~30fps
```

---

## 7. AWS IAM Setup

### **Required Permissions**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RekognitionAccess",
      "Effect": "Allow",
      "Action": [
        "rekognition:IndexFaces",
        "rekognition:SearchFacesByImage",
        "rekognition:DetectFaces",
        "rekognition:CreateCollection",
        "rekognition:ListCollections",
        "rekognition:DescribeCollection"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3FaceStorage",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cctv-faces",
        "arn:aws:s3:::cctv-faces/*"
      ]
    }
  ]
}
```

### **Setup Steps**

```bash
# 1. Create IAM user
aws iam create-user --user-name cctv-api

# 2. Attach policy
aws iam put-user-policy --user-name cctv-api \
  --policy-name cctv-api-policy \
  --policy-document file://policy.json

# 3. Create access key
aws iam create-access-key --user-name cctv-api

# 4. Create S3 bucket
aws s3 mb s3://cctv-faces --region us-east-1

# 5. Enable S3 encryption
aws s3api put-bucket-encryption --bucket cctv-faces \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# 6. Create Rekognition collections
aws rekognition create-collection --collection-id employees --region us-east-1
aws rekognition create-collection --collection-id visitors --region us-east-1
```

---

## 8. Monitoring & Cost Tracking

### **CloudWatch Monitoring**

```python
import boto3
from datetime import datetime, timedelta

cloudwatch = boto3.client('cloudwatch')

def track_aws_costs():
    """Monitor AWS API usage"""
    
    response = cloudwatch.get_metric_statistics(
        Namespace='AWS/Rekognition',
        MetricName='UserErrorCount',
        StartTime=datetime.now() - timedelta(hours=1),
        EndTime=datetime.now(),
        Period=3600,
        Statistics=['Sum']
    )
    
    print(f"Errors in last hour: {response['Datapoints']}")

# Log each API call for cost tracking
def log_api_call(operation):
    """Track API calls for billing"""
    
    # Store in local database
    db.insert_api_call({
        'operation': operation,
        'timestamp': datetime.now(),
        'cost': OPERATION_COSTS[operation]
    })
    
    # Also send to CloudWatch
    cloudwatch.put_metric_data(
        Namespace='CCTV/AWS',
        MetricData=[{
            'MetricName': f'{operation}_calls',
            'Value': 1,
            'Unit': 'Count'
        }]
    )
```

### **Cost Estimation Dashboard**

```python
def get_monthly_cost_estimate():
    """Estimate current month's AWS cost"""
    
    from datetime import datetime
    
    # Get calls from database
    calls = db.query("""
        SELECT operation, COUNT(*) as count
        FROM api_calls
        WHERE DATE(timestamp) >= DATE_TRUNC('month', NOW())
        GROUP BY operation
    """)
    
    # Calculate cost
    total_cost = 0
    for call in calls:
        op = call['operation']
        count = call['count']
        cost_per_call = OPERATION_COSTS.get(op, 0)
        total_cost += count * cost_per_call
    
    days_into_month = datetime.now().day
    estimated_monthly = (total_cost / days_into_month) * 30
    
    return {
        'current': total_cost,
        'estimated_monthly': estimated_monthly,
        'breakdown': {
            'search_faces': calls.get('search_faces_by_image', {}).get('count', 0) * 0.006,
            'index_faces': calls.get('index_faces', {}).get('count', 0) * 0.015,
            'detect_faces': calls.get('detect_faces', {}).get('count', 0) * 0.006
        }
    }
```

---

## 9. Performance Targets

```
Metric                  Target          Notes
─────────────────────────────────────────────────
Face Detection Accuracy  99%+           AWS Rekognition standard
Face Search Latency      200-500ms      AWS API + network
API Response Time        < 1 second     FastAPI should be instant
Detection Throughput     10-20 fps      Per camera (depends on AWS)
Dashboard Update         < 2 seconds    WebSocket broadcast
System Uptime            99%+           AWS SLA: 99.99%
Cost per Detection       ~$0.01         $0.006-0.015 depending
Monthly Cost             ~$2,000        For 20-40 cameras
```

---

## 10. Deployment Checklist

### **Local Setup**
- [ ] Docker & Docker Compose installed
- [ ] Python 3.10+ installed
- [ ] PostgreSQL running
- [ ] Redis running
- [ ] FastAPI running on port 8000

### **AWS Setup**
- [ ] AWS account created
- [ ] IAM user created with permissions
- [ ] S3 bucket created & encrypted
- [ ] Rekognition collections created
- [ ] Access keys generated

### **Testing**
- [ ] Can register employee
- [ ] Can search face
- [ ] Can register visitor
- [ ] Dashboard updates real-time
- [ ] Cost tracking working

### **Production**
- [ ] SSL/TLS configured
- [ ] DNS updated
- [ ] Monitoring active
- [ ] Alerts configured
- [ ] Backup system ready

---

**Tech Stack Version**: 2.0 (AWS Rekognition)  
**Last Updated**: May 2026  
**Status**: ✅ Simplified & Ready to Implement
