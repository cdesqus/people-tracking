# CCTV Face Recognition - Quick Start Guide
## AWS Rekognition Edition (Day 1 Implementation)

**Goal**: From zero to working POC in 24 hours  
**Difficulty**: Beginner-friendly  
**Requirements**: Python 3.10+, AWS account, 2-3 cameras

---

## 🚀 Hour 1: AWS Setup (15 minutes)

### **Step 1: Create AWS Account**
```
1. Go to https://aws.amazon.com
2. Click "Create AWS Account"
3. Fill in details:
   ├─ Email: your@company.com
   ├─ Password: strong password
   ├─ Account name: CCTV System
   └─ Card for billing (required)
4. Verify email
5. Done! ✅
```

### **Step 2: Create IAM User**
```bash
# Via AWS Console:
1. Go to IAM → Users
2. Click "Create User"
3. Name: cctv-api
4. Check "Access key"
5. Attach policies:
   ├─ AmazonRekognitionFullAccess
   ├─ AmazonS3FullAccess
   └─ CloudWatchFullAccess
6. Save Access Key & Secret Key (save in .env file!)
7. Done! ✅
```

### **Step 3: Create S3 Bucket**
```bash
# Via AWS Console:
1. Go to S3 → Buckets
2. Click "Create bucket"
3. Name: cctv-faces-YOUR-COMPANY
4. Region: us-east-1
5. Click "Create"
6. Done! ✅
```

### **Step 4: Create Rekognition Collections**
```bash
# Via AWS CLI:
aws rekognition create-collection \
  --collection-id employees \
  --region us-east-1

aws rekognition create-collection \
  --collection-id visitors \
  --region us-east-1

# Check they were created:
aws rekognition list-collections --region us-east-1

# Output should show:
# {
#   "CollectionIds": ["employees", "visitors"]
# }

# Done! ✅
```

**Time Spent: 15 minutes** ⏱️

---

## 🛠️ Hour 2: Development Environment (20 minutes)

### **Step 1: Clone Project Structure**
```bash
# Create project folder
mkdir cctv-system
cd cctv-system

# Create folders
mkdir backend frontend
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn boto3 opencv-python psycopg2-binary redis python-dotenv

# Check installations
python -m pip list | grep -E "fastapi|boto3|opencv"

# Done! ✅
```

### **Step 2: Create .env File**
```bash
# Create .env file in backend/
cat > .env << EOF
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# S3 Bucket
S3_BUCKET=cctv-faces-YOUR-COMPANY

# Database (optional, skip for now)
DATABASE_URL=postgresql://user:pass@localhost/cctv

# Redis
REDIS_URL=redis://localhost:6379

# AWS Rekognition
REKOGNITION_EMPLOYEES_COLLECTION=employees
REKOGNITION_VISITORS_COLLECTION=visitors
EOF

# Don't commit .env to git!
echo ".env" >> .gitignore
```

**Time Spent: 20 minutes** ⏱️

---

## 💻 Hour 3-4: Basic API (45 minutes)

### **Step 1: Create FastAPI App**
```python
# backend/main.py

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Initialize AWS client
rekognition = boto3.client(
    'rekognition',
    region_name=os.getenv('AWS_REGION')
)
s3 = boto3.client('s3')

# FastAPI app
app = FastAPI(title="CCTV Face Recognition API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)

# ============ ENDPOINTS ============

@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy"}

@app.post("/api/employees/register")
async def register_employee(emp_id: str, name: str, photo: UploadFile):
    """Register employee face"""
    
    try:
        # 1. Read photo
        photo_bytes = await photo.read()
        
        # 2. Upload to S3
        s3_key = f"employees/{emp_id}.jpg"
        s3.put_object(
            Bucket=os.getenv('S3_BUCKET'),
            Key=s3_key,
            Body=photo_bytes
        )
        
        # 3. Index in Rekognition
        response = rekognition.index_faces(
            CollectionId=os.getenv('REKOGNITION_EMPLOYEES_COLLECTION'),
            Image={
                'S3Object': {
                    'Bucket': os.getenv('S3_BUCKET'),
                    'Name': s3_key
                }
            },
            ExternalImageId=emp_id,
            MaxFaces=1
        )
        
        logger.info(f"Registered employee {emp_id}")
        
        return {
            'status': 'success',
            'emp_id': emp_id,
            'name': name,
            'face_id': response['FaceRecords'][0]['Face']['FaceId']
        }
    
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        return {'error': str(e)}

@app.post("/api/detect-face")
async def detect_face(frame: UploadFile):
    """Detect and identify face in image"""
    
    try:
        # 1. Read frame
        frame_bytes = await frame.read()
        
        # 2. Search in employee collection
        response = rekognition.search_faces_by_image(
            CollectionId=os.getenv('REKOGNITION_EMPLOYEES_COLLECTION'),
            Image={'Bytes': frame_bytes},
            MaxFaces=5,
            FaceMatchThreshold=70
        )
        
        # 3. Process results
        detections = []
        for match in response['FaceMatches']:
            detections.append({
                'person_id': match['Face']['ExternalImageId'],
                'confidence': float(match['Similarity']),
                'face_id': match['Face']['FaceId']
            })
        
        logger.info(f"Detected {len(detections)} face(s)")
        
        return {'detections': detections}
    
    except Exception as e:
        logger.error(f"Detection failed: {str(e)}")
        return {'error': str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### **Step 2: Run the App**
```bash
# Make sure you're in virtual environment
cd backend
source venv/bin/activate

# Run FastAPI
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Test it
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Time Spent: 45 minutes** ⏱️

---

## 📸 Hour 5: Register Your First Employee (10 minutes)

### **Using curl (command line)**
```bash
# Prepare: Get an employee photo file
# Example: employee.jpg

# Register employee
curl -X POST "http://localhost:8000/api/employees/register" \
  -F "emp_id=emp_001" \
  -F "name=John Doe" \
  -F "photo=@employee.jpg"

# Should return:
# {
#   "status": "success",
#   "emp_id": "emp_001",
#   "name": "John Doe",
#   "face_id": "abc123..."
# }

# Done! ✅
```

### **Using Python**
```python
import requests

# Register employee
response = requests.post(
    'http://localhost:8000/api/employees/register',
    data={'emp_id': 'emp_001', 'name': 'John Doe'},
    files={'photo': open('employee.jpg', 'rb')}
)

print(response.json())
```

**Time Spent: 10 minutes** ⏱️

---

## 🎥 Hour 6: Test Face Detection (15 minutes)

### **Step 1: Get a Test Image**
```bash
# Use a photo with the same person as employee.jpg
# Example: test_face.jpg

# Or use your webcam:
python3 -c "
import cv2
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cv2.imwrite('test_face.jpg', frame)
cap.release()
"
```

### **Step 2: Test Detection**
```bash
# Detect face
curl -X POST "http://localhost:8000/api/detect-face" \
  -F "frame=@test_face.jpg"

# Should return:
# {
#   "detections": [
#     {
#       "person_id": "emp_001",
#       "confidence": 95.5,
#       "face_id": "def456..."
#     }
#   ]
# }

# Done! ✅
```

**Time Spent: 15 minutes** ⏱️

---

## 🎉 Done! Summary (Hour 6)

```
✅ AWS Setup
   ├─ IAM user created
   ├─ S3 bucket created
   └─ Rekognition collections created

✅ Development Environment
   ├─ Python venv setup
   ├─ Dependencies installed
   └─ .env configured

✅ Working API
   ├─ FastAPI running on port 8000
   ├─ Employee registration working
   ├─ Face detection working
   └─ AWS Rekognition integrated

✅ First Employee Registered
   └─ Can detect their face!

TOTAL TIME: ~6 hours for POC ✅
```

---

## 🔄 Day 2: Add More Features (Optional)

### **Add Visitor Check-in**
```python
@app.post("/api/visitors/checkin")
async def visitor_checkin(
    visitor_name: str,
    visitor_org: str,
    host_emp_id: str,
    photo: UploadFile
):
    """Check in visitor"""
    
    visitor_id = f"visitor_{datetime.now().timestamp()}"
    photo_bytes = await photo.read()
    
    # Upload & index same as employee
    s3_key = f"visitors/{visitor_id}.jpg"
    s3.put_object(
        Bucket=os.getenv('S3_BUCKET'),
        Key=s3_key,
        Body=photo_bytes
    )
    
    rekognition.index_faces(
        CollectionId=os.getenv('REKOGNITION_VISITORS_COLLECTION'),
        Image={'S3Object': {'Bucket': os.getenv('S3_BUCKET'), 'Name': s3_key}},
        ExternalImageId=visitor_id,
        MaxFaces=1
    )
    
    return {
        'status': 'checked_in',
        'visitor_id': visitor_id,
        'name': visitor_name,
        'organization': visitor_org,
        'host_emp_id': host_emp_id
    }
```

### **Add Database Storage** (PostgreSQL)
```python
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Create tables
Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"
    
    emp_id = Column(String, primary_key=True)
    name = Column(String)
    registered_at = Column(DateTime, default=datetime.now)

class Detection(Base):
    __tablename__ = "detections"
    
    id = Column(String, primary_key=True)
    person_id = Column(String)
    confidence = Column(float)
    detection_time = Column(DateTime, default=datetime.now)

# Initialize database
engine = create_engine(os.getenv('DATABASE_URL'))
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
```

---

## 💡 Pro Tips

### **Tip 1: Batch Processing**
```python
# Process multiple frames faster
for frame_path in frame_list:
    # Call API in parallel
    response = await detect_face(frame_path)
    # Process result
```

### **Tip 2: Monitor AWS Costs**
```bash
# Check your AWS bill daily
aws ce get-cost-and-usage \
  --time-period Start=2026-05-01,End=2026-05-31 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --region us-east-1
```

### **Tip 3: Error Handling**
```python
# Always wrap AWS calls in try-except
try:
    response = rekognition.search_faces_by_image(...)
except ClientError as e:
    if e.response['Error']['Code'] == 'InvalidParameterException':
        print("Invalid image")
    elif e.response['Error']['Code'] == 'ResourceNotFoundException':
        print("Collection not found")
    else:
        print(f"Error: {e}")
```

### **Tip 4: Test Locally First**
```python
# Create test function
def test_employee_registration():
    response = register_employee(
        emp_id='test_001',
        name='Test User',
        photo=open('test.jpg', 'rb')
    )
    assert response['status'] == 'success'
```

---

## 🐛 Troubleshooting

### **Issue: "InvalidParameterException: Requested image is too small"**
Solution: Use higher resolution photos (min 100x100 pixels)

### **Issue: "ResourceNotFoundException: Collection not found"**
Solution: Check collection name in .env matches created collection

### **Issue: "AccessDenied: User is not authorized"**
Solution: Check IAM permissions, refresh AWS credentials

### **Issue: "ThrottlingException"**
Solution: AWS is rate-limiting, implement exponential backoff

```python
import time
from botocore.exceptions import ClientError

def retry_with_backoff(func, max_retries=3):
    for attempt in range(max_retries):
        try:
            return func()
        except ClientError as e:
            if e.response['Error']['Code'] == 'ThrottlingException':
                wait_time = 2 ** attempt
                print(f"Throttled, waiting {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise
```

---

## 📊 Cost Tracker

```python
# Track API calls for cost monitoring
api_calls = {
    'index_faces': 0,
    'search_faces': 0,
    'detect_faces': 0
}

# After each API call
api_calls['search_faces'] += 1

# Estimate cost
def estimate_cost():
    cost = (
        api_calls['index_faces'] * 0.015 +
        api_calls['search_faces'] * 0.006 +
        api_calls['detect_faces'] * 0.006
    )
    print(f"Estimated cost: ${cost:.2f}")
    
estimate_cost()
```

---

## ✅ Checklist

### **Day 1 (6 hours)**
- [ ] AWS account created
- [ ] IAM user configured
- [ ] S3 bucket created
- [ ] Rekognition collections created
- [ ] Python venv setup
- [ ] FastAPI app running
- [ ] Employee registered
- [ ] Face detection tested

### **Day 2 (optional)**
- [ ] Add visitor check-in
- [ ] Add database storage
- [ ] Add cost tracking
- [ ] Add error handling

### **Week 1 Onwards**
- [ ] Add camera stream processing
- [ ] Add real-time WebSocket
- [ ] Add dashboard
- [ ] Add reporting

---

## 🚀 Next Steps

### **After POC (1 week)**
1. Evaluate accuracy on your cameras
2. Check actual AWS costs
3. Decide to scale or optimize

### **Before Production (2 weeks)**
1. Add camera stream integration
2. Setup PostgreSQL database
3. Add real-time updates
4. Build React dashboard

### **After Production**
1. Monitor costs daily
2. Gather user feedback
3. Plan feature additions
4. Scale to all locations

---

## 📚 Resources

```
Documentation:
├─ AWS Rekognition: https://docs.aws.amazon.com/rekognition
├─ FastAPI: https://fastapi.tiangolo.com
├─ Boto3: https://boto3.amazonaws.com/v1/documentation/api/latest
└─ OpenCV: https://docs.opencv.org

Community:
├─ AWS forums
├─ Stack Overflow
├─ GitHub discussions
└─ Discord communities
```

---

## 🎉 Congratulations!

You now have a working face recognition system! 

Next: Scale it to production 🚀

---

**Quick Start Version**: 1.0  
**Last Updated**: May 2026  
**Estimated Time**: 6 hours
