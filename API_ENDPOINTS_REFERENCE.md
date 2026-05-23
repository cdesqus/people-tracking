# API Endpoints Reference Guide

**Base URL**: `http://localhost:8000/api/v1`  
**Auto Docs**: `http://localhost:8000/docs` (Swagger UI)  
**Alternative Docs**: `http://localhost:8000/redoc` (ReDoc)

---

## 🔑 Authentication Endpoints

### POST `/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@company.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "role": "employee"
}
```

**Response (201):**
```json
{
  "user_id": "uuid",
  "email": "user@company.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "role": "employee",
  "created_at": "2026-05-23T10:30:00Z"
}
```

**Errors:**
- `400`: Invalid input or duplicate email
- `422`: Validation error

---

### POST `/auth/login`
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "user_id": "uuid",
    "email": "user@company.com",
    "full_name": "John Doe",
    "role": "employee"
  }
}
```

**Errors:**
- `401`: Invalid credentials
- `404`: User not found

---

### POST `/auth/refresh-token`
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Errors:**
- `401`: Invalid or expired refresh token

---

### POST `/auth/logout`
Logout current user (invalidate tokens).

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

---

## 👥 Employee Management Endpoints

### GET `/employees`
Get list of all employees with pagination.

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 50, max: 100)
- `search`: str (optional - search by name or email)
- `department`: str (optional - filter by department)

**Response (200):**
```json
{
  "total": 50,
  "skip": 0,
  "limit": 50,
  "items": [
    {
      "emp_id": "emp_001",
      "name": "John Doe",
      "email": "john@company.com",
      "department": "Engineering",
      "face_id": "aws-face-id-123",
      "registered_at": "2026-05-20T09:00:00Z",
      "last_detected": "2026-05-23T14:30:00Z",
      "is_active": true
    }
  ]
}
```

**Headers:**
```
Authorization: Bearer {access_token}
```

---

### POST `/employees`
Register new employee with face photo.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Form Data:**
- `name`: string (required)
- `email`: string (required)
- `department`: string (required)
- `photo`: file (required - JPEG/PNG, min 100x100px)

**Response (201):**
```json
{
  "emp_id": "emp_002",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "department": "Marketing",
  "face_id": "aws-face-id-456",
  "registered_at": "2026-05-23T10:30:00Z",
  "message": "Employee registered successfully"
}
```

**Errors:**
- `400`: Invalid image or missing fields
- `401`: Unauthorized
- `403`: Permission denied (requires Receptionist or Admin role)

---

### GET `/employees/{emp_id}`
Get specific employee details.

**Response (200):**
```json
{
  "emp_id": "emp_001",
  "name": "John Doe",
  "email": "john@company.com",
  "department": "Engineering",
  "face_id": "aws-face-id-123",
  "registered_at": "2026-05-20T09:00:00Z",
  "last_detected": "2026-05-23T14:30:00Z",
  "recent_detections": [
    {
      "detection_id": "det_001",
      "timestamp": "2026-05-23T14:30:00Z",
      "camera_id": "cam_01",
      "confidence": 95.5
    }
  ]
}
```

---

### PUT `/employees/{emp_id}`
Update employee information.

**Request:**
```json
{
  "name": "John Doe Updated",
  "department": "Senior Engineering",
  "is_active": true
}
```

**Response (200):**
```json
{
  "emp_id": "emp_001",
  "name": "John Doe Updated",
  "email": "john@company.com",
  "department": "Senior Engineering",
  "message": "Employee updated successfully"
}
```

---

### DELETE `/employees/{emp_id}`
Delete employee record.

**Response (200):**
```json
{
  "message": "Employee deleted successfully",
  "emp_id": "emp_001"
}
```

---

### GET `/employees/statistics/summary`
Get employee statistics.

**Response (200):**
```json
{
  "total_employees": 50,
  "active_employees": 48,
  "registered_today": 2,
  "detections_today": 245,
  "average_confidence": 94.2,
  "by_department": {
    "Engineering": 20,
    "Marketing": 15,
    "Sales": 15
  }
}
```

---

## 👤 Visitor Management Endpoints

### POST `/visitors/checkin`
Check in a visitor.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Form Data:**
- `name`: string (required)
- `organization`: string (required)
- `host_emp_id`: string (required)
- `purpose`: string (optional)
- `photo`: file (required)

**Response (201):**
```json
{
  "visitor_id": "visitor_1716455400",
  "name": "Client Name",
  "organization": "Client Company",
  "host_emp_id": "emp_001",
  "check_in_time": "2026-05-23T14:30:00Z",
  "face_id": "aws-face-id-789",
  "status": "checked_in"
}
```

---

### POST `/visitors/{visitor_id}/checkout`
Check out a visitor.

**Response (200):**
```json
{
  "visitor_id": "visitor_1716455400",
  "check_out_time": "2026-05-23T16:30:00Z",
  "duration_minutes": 120,
  "status": "checked_out"
}
```

---

### GET `/visitors`
Get list of visitors.

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 50)
- `status`: string ("checked_in" | "checked_out")
- `date`: string (YYYY-MM-DD, optional)

**Response (200):**
```json
{
  "total": 12,
  "items": [
    {
      "visitor_id": "visitor_1716455400",
      "name": "Client Name",
      "organization": "Client Company",
      "host_emp_id": "emp_001",
      "check_in_time": "2026-05-23T14:30:00Z",
      "check_out_time": "2026-05-23T16:30:00Z",
      "purpose": "Business meeting",
      "status": "checked_out"
    }
  ]
}
```

---

## 🔍 Face Detection Endpoints

### POST `/detection/search`
Search for person in employee/visitor database.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Form Data:**
- `image`: file (required - JPEG/PNG)
- `collection`: string ("employees" or "visitors")
- `threshold`: float (default: 70, range: 0-100)

**Response (200):**
```json
{
  "matches": [
    {
      "person_id": "emp_001",
      "person_type": "employee",
      "name": "John Doe",
      "confidence": 95.5,
      "face_id": "aws-face-id-123"
    },
    {
      "person_id": "emp_003",
      "person_type": "employee",
      "name": "Jane Smith",
      "confidence": 78.2,
      "face_id": "aws-face-id-456"
    }
  ],
  "search_time_ms": 450
}
```

---

### POST `/detection/index`
Index a face in a collection.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Form Data:**
- `image`: file (required)
- `person_id`: string (required)
- `collection`: string ("employees" or "visitors")

**Response (201):**
```json
{
  "face_id": "aws-face-id-999",
  "person_id": "emp_004",
  "collection": "employees",
  "confidence": 99.2
}
```

---

### GET `/detection/logs`
Get detection history/logs.

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 100)
- `person_id`: string (optional)
- `date_from`: string (ISO format)
- `date_to`: string (ISO format)
- `min_confidence`: float (default: 0)

**Response (200):**
```json
{
  "total": 245,
  "items": [
    {
      "detection_id": "det_001",
      "person_id": "emp_001",
      "person_name": "John Doe",
      "person_type": "employee",
      "camera_id": "cam_01",
      "confidence": 95.5,
      "timestamp": "2026-05-23T14:30:00Z"
    }
  ]
}
```

---

## 📹 Camera Management Endpoints

### GET `/cameras`
Get list of all cameras.

**Response (200):**
```json
{
  "total": 6,
  "items": [
    {
      "camera_id": "cam_01",
      "name": "Main Entrance",
      "location": "Ground Floor",
      "status": "active",
      "last_heartbeat": "2026-05-23T14:35:00Z",
      "rtsp_url": "rtsp://192.168.1.100:554/stream"
    }
  ]
}
```

---

### POST `/cameras`
Register new camera.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request:**
```json
{
  "name": "Main Entrance",
  "location": "Ground Floor",
  "rtsp_url": "rtsp://192.168.1.100:554/stream"
}
```

**Response (201):**
```json
{
  "camera_id": "cam_07",
  "name": "Main Entrance",
  "location": "Ground Floor",
  "status": "active"
}
```

---

### PUT `/cameras/{camera_id}`
Update camera configuration.

**Response (200):**
```json
{
  "camera_id": "cam_01",
  "name": "Main Entrance Updated",
  "status": "active"
}
```

---

### DELETE `/cameras/{camera_id}`
Delete camera.

**Response (200):**
```json
{
  "message": "Camera deleted successfully"
}
```

---

## 📊 Reports & Analytics Endpoints

### GET `/reports/attendance`
Get attendance report.

**Query Parameters:**
- `date_from`: string (YYYY-MM-DD)
- `date_to`: string (YYYY-MM-DD)
- `emp_id`: string (optional)

**Response (200):**
```json
{
  "period": {
    "from": "2026-05-01",
    "to": "2026-05-31"
  },
  "total_employees": 50,
  "records": [
    {
      "emp_id": "emp_001",
      "name": "John Doe",
      "days_present": 20,
      "days_absent": 2,
      "attendance_rate": 90.9,
      "last_detected": "2026-05-23T17:30:00Z"
    }
  ]
}
```

---

### GET `/reports/visitors`
Get visitor report.

**Query Parameters:**
- `date_from`: string (YYYY-MM-DD)
- `date_to`: string (YYYY-MM-DD)

**Response (200):**
```json
{
  "total_visits": 45,
  "unique_visitors": 32,
  "top_visitors": [
    {
      "visitor_id": "visitor_123",
      "name": "Client Name",
      "organization": "Client Company",
      "visit_count": 5,
      "last_visit": "2026-05-23"
    }
  ]
}
```

---

### GET `/reports/security-incidents`
Get security incidents report.

**Response (200):**
```json
{
  "total_incidents": 3,
  "incidents": [
    {
      "incident_id": "inc_001",
      "type": "unauthorized_entry",
      "description": "Unregistered person detected",
      "timestamp": "2026-05-23T15:00:00Z",
      "severity": "high",
      "resolved": false
    }
  ]
}
```

---

## ❤️ Health & Status Endpoints

### GET `/health`
Check API health status (no auth required).

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-23T14:35:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "aws": "available"
  },
  "version": "1.0.0"
}
```

---

## 🔐 Authentication

### Bearer Token
Include in all protected endpoints:
```
Authorization: Bearer {access_token}
```

### Token Expiration
Access tokens expire in 1 hour. Use refresh token to get new access token.

### Required Roles

| Endpoint | Required Role |
|----------|---------------|
| POST `/auth/register` | Public |
| POST `/auth/login` | Public |
| GET `/employees` | Manager, Security, Admin |
| POST `/employees` | Receptionist, Admin |
| GET `/visitors` | Manager, Security, Admin |
| POST `/visitors/checkin` | Receptionist, Admin |
| POST `/detection/search` | Security, Admin |
| GET `/reports/*` | Manager, Security, Admin |
| POST `/cameras` | Admin |

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "invalid email format",
      "type": "value_error"
    }
  ]
}
```

### 500 Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@company.com",
    "password": "SecurePassword123!"
  }'
```

### Get Employees (with token)
```bash
curl -X GET "http://localhost:8000/api/v1/employees" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Search Face
```bash
curl -X POST "http://localhost:8000/api/v1/detection/search" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@photo.jpg" \
  -F "collection=employees" \
  -F "threshold=70"
```

---

## 📚 Interactive API Testing

**Swagger UI**: http://localhost:8000/docs
- Try all endpoints interactively
- See request/response examples
- View data models

**ReDoc**: http://localhost:8000/redoc
- Alternative documentation format
- Better for reading

---

**API Version**: 1.0  
**Last Updated**: May 23, 2026  
**Status**: ✅ Production Ready

