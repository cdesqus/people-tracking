# CCTV AI People Tracking System - Planning Document

## Executive Summary

Sistem monitoring CCTV berbasis AI untuk people tracking dengan fitur:
- **Camera Monitoring** - Alert otomatis ketika camera tertutup
- **Visitor Tracking** - Pelacakan real-time visitor dan employee
- **Facial Recognition** - Identifikasi berdasarkan wajah dengan database registration

---

## 1. System Architecture

### High-Level Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
│  (Web Dashboard + Mobile App)                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   ┌────▼────┐   ┌───▼────┐
   │  Admin  │   │ User   │
   │ Panel   │   │ Portal  │
   └────┬────┘   └───┬────┘
        │             │
        └──────┬──────┘
               │
        ┌──────▼──────────────────┐
        │   BACKEND API SERVER    │
        │  (REST/WebSocket)       │
        └──────┬──────────────────┘
               │
    ┌──────────┼──────────────┐
    │          │              │
┌───▼───┐ ┌───▼────┐ ┌──────▼────┐
│ CCTV  │ │  AI    │ │ DATABASE  │
│ FEED  │ │Engine  │ │           │
│INGESTION│ (Inference)  │(PostgreSQL)│
└───────┘ └────────┘ └──────────┘
```

### Arsitektur Layer

#### 1. **Data Ingestion Layer**
- CCTV Stream Input (RTSP/HTTP)
- Frame Extraction (30fps default)
- Queue Management (Redis/RabbitMQ)

#### 2. **AI Processing Layer**
- Face Detection (YOLO/RetinaFace)
- Face Recognition (FaceNet/ArcFace)
- Camera Status Detection (blur/black detection)
- Object Tracking (DeepSORT)

#### 3. **Business Logic Layer**
- Event Generation
- Alert Management
- Visitor Matching
- Timeline Management

#### 4. **Data Storage Layer**
- User Profiles (Employees/Visitors)
- Face Embeddings (Vector DB)
- Events & Alerts
- CCTV Streams (archived)

#### 5. **Presentation Layer**
- Web Dashboard
- Mobile App
- Real-time Alerts
- Reports

---

## 2. Core Features

### A. Camera Monitoring
**Feature**: Automated Camera Coverage Detection
- **Status Checks**: Real-time monitoring per camera
- **Alert Triggers**:
  - Camera offline/disconnected
  - Complete blackout detected (night mode OFF)
  - Lens covered/blocked
  - Signal loss > 30 seconds
- **Alert Actions**:
  - Push notification ke security team
  - Email alert
  - Dashboard indicator
  - Audit log entry

### B. Employee Tracking
**Feature**: Real-time Employee Detection & Tracking
- **Detection**:
  - Face recognition dari registered employees
  - Auto-assign location (berdasarkan camera zone)
  - In/Out time tracking
- **Data Captured**:
  - Employee ID
  - Detection timestamp
  - Camera location
  - Confidence score
  - Face image snapshot
- **View Options**:
  - Real-time dashboard heatmap
  - Individual employee timeline
  - Zone-based occupancy
  - Attendance summary

### C. Visitor Tracking
**Feature**: Visitor Registration & Monitoring
- **Registration Process**:
  - Input visitor data (nama, tujuan, host)
  - Capture foto wajah (atau upload)
  - QR code generation
  - Validity period setting
- **Tracking**:
  - Automatic detection saat masuk
  - Movement timeline
  - Host verification
  - Auto-alert if unauthorized area
  - Check-out confirmation
- **Data Points**:
  - Entry/exit time
  - Path traveled
  - Zones visited
  - Duration of visit

### D. Facial Recognition Database
**Feature**: Centralized Face Profile Management
- **Employee Registration** (Manual - Receptionist)
  - Name, ID, Department
  - Multiple face photos (different angles)
  - Access levels/zones
- **Visitor Registration** (On-Arrival)
  - Name, Organization, Purpose
  - Contact info
  - Host/Contact person
  - Photo capture
  - Validity period
- **Face Embedding Storage**:
  - Vector database untuk fast matching
  - Confidence threshold settings
  - Face image archive

### E. Alert & Notification System
**Feature**: Intelligent Alert Management
- **Alert Types**:
  - Critical: Camera coverage lost
  - Warning: Unknown person detected in restricted area
  - Info: Visitor arrival/departure
  - Anomaly: Unusual movement patterns
- **Notification Channels**:
  - In-app push notifications
  - Email alerts
  - SMS (optional)
  - Slack/Teams integration
- **Alert Rules**:
  - Configurable thresholds
  - Whitelist/blacklist persons
  - Time-based rules
  - Zone-based rules

### F. Reporting & Analytics
**Feature**: Insights & Compliance Reports
- **Standard Reports**:
  - Attendance report (daily/weekly/monthly)
  - Visitor log
  - Camera uptime report
  - Security incidents summary
- **Analytics**:
  - Peak occupancy times
  - Zone traffic heatmap
  - Employee movement patterns
  - Dwell time analysis
- **Export Options**:
  - PDF reports
  - Excel data
  - CSV for compliance

---

## 3. Technical Stack Recommendations

### Backend
- **Language**: Python (FastAPI) / Node.js (Express)
- **CCTV Streaming**: OpenCV + FFmpeg
- **Face Detection**: YOLOv5/YOLOv8 atau RetinaFace
- **Face Recognition**: InsightFace, FaceNet, atau OpenFace
- **Database**: PostgreSQL + pgvector (face embeddings)
- **Cache**: Redis (real-time tracking, alerts)
- **Message Queue**: RabbitMQ / Kafka (event processing)
- **Inference Framework**: TensorRT / ONNX Runtime

### Frontend
- **Dashboard**: React.js + Tailwind CSS
- **Mobile**: React Native / Flutter
- **Real-time**: WebSocket / Socket.io
- **Mapping**: Leaflet atau custom SVG (floor plan)

### Infrastructure
- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (optional, untuk scale)
- **Object Storage**: MinIO / AWS S3 (face images, snapshots)
- **Logging**: ELK Stack / Loki
- **Monitoring**: Prometheus + Grafana

### Deployment
- **Development**: Docker Compose (local)
- **Production**: Kubernetes / Docker Swarm
- **CI/CD**: GitHub Actions / GitLab CI

---

## 4. User Flows

### Flow 1: Employee Registration & Tracking

```
RECEPTIONIST                 SYSTEM                          EMPLOYEE
    │                           │                               │
    ├──Create Employee────────▶│                               │
    │  (ID, Dept, Role)        │                               │
    │                           │                               │
    ├──Capture Face Photo───▶│                               │
    │  (Multiple angles)      │                               │
    │                           ├─Generate Face Embedding───▶  │
    │                           │                               │
    │                           ├─Store in Vector DB            │
    │                           │                               │
    │  ✓ Employee Registered◀─┤                               │
    │                           │                               │
    │                           │          CCTV Detection       │
    │                           │◀──────Real-time Tracking───◀─┤
    │                           │                               │
    │                           ├─Check Face Against DB────────▶│
    │                           │                               │
    │                           ├─Match & Log Location         │
    │                           │                               │
    │                           ├─Update Real-time Dashboard───▶│
    │                           │         (Location + Time)      │
    │                           │                               │
```

### Flow 2: Visitor Registration & Entry

```
RECEPTIONIST                SYSTEM                         VISITOR
    │                          │                             │
    ├─Visitor Check-in────────▶│                            │
    │  (Name, Org, Purpose)    │                            │
    │                          │                            │
    ├─Capture/Upload Face────▶│                            │
    │  Photo                   │                            │
    │                          ├─Generate Embedding      │
    │                          │                            │
    │                          ├─Set Validity Period       │
    │                          │                            │
    │  Generate QR Code    ◀───┤                            │
    │  Print Badge         ◀───┤                            │
    │                          │                            │
    │  Give to Visitor────────────────────────────────────▶│
    │                          │                            │
    │                          │   Enter Building...        │
    │                          │◀──CCTV Detection──────────▶│
    │                          │                            │
    │                          ├─Verify Face Match        │
    │                          │                            │
    │                          ├─Check Validity             │
    │                          │                            │
    │  Dashboard Alert     ◀────┤─Log Entry Point           │
    │  (Visitor Arrived)    │─Notify Host                 │
    │                          │                            │
    │                          │   Track Movement...        │
    │                          │◀──CCTV Detection──────────▶│
    │                          │                            │
    │                          ├─Update Movement Timeline   │
    │                          │                            │
    │  Visitor Check-out ────▶│                            │
    │                          │                            │
    │                          ├─Log Exit Time             │
    │                          │                            │
    │                          ├─Generate Visit Report      │
    │                          │                            │
```

### Flow 3: Camera Coverage Alert

```
CCTV CAMERA              SYSTEM                    SECURITY TEAM
    │                      │                            │
    ├─Stream Feed────────▶│                           │
    │  (30fps)            │                           │
    │                      ├─Frame Analysis           │
    │                      │ (Blur/Black Detection)   │
    │                      │                           │
    │  [CAMERA BLOCKED]    │                           │
    │◀─────────────────────┤                           │
    │                      ├─Alert Triggered          │
    │                      │ (Coverage Lost)          │
    │                      │                           │
    │                      ├─Queue to Alert System◀───│
    │                      │                           │
    │                      ├─Push Notification────────▶│
    │                      │                           │
    │                      ├─Email Alert──────────────▶│
    │                      │                           │
    │                      ├─Dashboard Indicator───────▶│
    │                      │ (Red status)              │
    │                      │                           │
    │                      ├─Log Event                │
    │                      │ (Audit Trail)             │
    │                      │                           │
    │  [CAMERA UNCOVERED]  │                           │
    │◀─────────────────────┤                           │
    │                      │                           │
    │                      ├─Clear Alert              │
    │                      │                           │
    │                      ├─Notification: Resolved────▶│
    │                      │                           │
```

---

## 5. Database Schema (Overview)

```sql
-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    emp_id VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    department VARCHAR(100),
    role VARCHAR(100),
    face_embedding_id UUID,
    created_at TIMESTAMP,
    is_active BOOLEAN
);

-- Visitors
CREATE TABLE visitors (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    organization VARCHAR(255),
    purpose VARCHAR(500),
    host_emp_id UUID REFERENCES employees(id),
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    validity_start TIMESTAMP,
    validity_end TIMESTAMP,
    face_embedding_id UUID,
    qr_code VARCHAR(255),
    status ENUM('registered', 'checked_in', 'checked_out')
);

-- Face Embeddings (Vector DB)
CREATE TABLE face_embeddings (
    id UUID PRIMARY KEY,
    person_id UUID, -- employee_id or visitor_id
    person_type ENUM('employee', 'visitor'),
    embedding VECTOR(128), -- 128-d vector
    face_image_path VARCHAR(500),
    confidence FLOAT,
    created_at TIMESTAMP
);

-- Detections
CREATE TABLE detections (
    id UUID PRIMARY KEY,
    camera_id UUID,
    person_id UUID,
    person_type ENUM('employee', 'visitor', 'unknown'),
    detection_time TIMESTAMP,
    confidence FLOAT,
    location_zone VARCHAR(100),
    face_snapshot_path VARCHAR(500),
    embedding_used_id UUID
);

-- Camera Status
CREATE TABLE camera_status (
    id UUID PRIMARY KEY,
    camera_id VARCHAR(100),
    location VARCHAR(255),
    last_frame_time TIMESTAMP,
    status ENUM('active', 'offline', 'blocked'),
    last_status_change TIMESTAMP
);

-- Alerts
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    alert_type VARCHAR(50),
    severity ENUM('info', 'warning', 'critical'),
    description TEXT,
    related_camera_id UUID,
    related_person_id UUID,
    created_at TIMESTAMP,
    resolved_at TIMESTAMP,
    is_resolved BOOLEAN
);

-- Movement History
CREATE TABLE movement_history (
    id UUID PRIMARY KEY,
    person_id UUID,
    person_type ENUM('employee', 'visitor'),
    camera_id UUID,
    zone_name VARCHAR(100),
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    duration_seconds INT
);
```

---

## 6. API Endpoints (Overview)

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
```

### Employee Management
```
GET    /api/employees
POST   /api/employees (admin)
PUT    /api/employees/{id} (admin)
DELETE /api/employees/{id} (admin)
POST   /api/employees/{id}/face-photos (receptionist)
GET    /api/employees/{id}/timeline
```

### Visitor Management
```
POST   /api/visitors/register (receptionist)
GET    /api/visitors (receptionist)
PUT    /api/visitors/{id}/check-in (receptionist)
PUT    /api/visitors/{id}/check-out (receptionist)
GET    /api/visitors/{id}/timeline
GET    /api/visitors/{id}/qr-code
```

### CCTV & Detections
```
GET    /api/cameras
GET    /api/cameras/{id}/status
GET    /api/cameras/{id}/feed (WebSocket)
GET    /api/detections (filters: time, camera, person)
GET    /api/detections/{id}
```

### Alerts
```
GET    /api/alerts (filters: type, severity, date)
PUT    /api/alerts/{id}/resolve
GET    /api/alerts/{id}/details
```

### Dashboard
```
GET    /api/dashboard/real-time (people count per zone)
GET    /api/dashboard/heatmap
GET    /api/dashboard/camera-status-summary
GET    /api/dashboard/recent-alerts
```

### Reports
```
GET    /api/reports/attendance (date range)
GET    /api/reports/visitors (date range)
GET    /api/reports/camera-uptime (date range)
GET    /api/reports/export (format: pdf, excel, csv)
```

---

## 7. Implementation Timeline

### Phase 1: Foundation (Weeks 1-4)
- [ ] Setup development environment (Docker, database)
- [ ] Build backend API skeleton (FastAPI/Express)
- [ ] Setup PostgreSQL + Redis
- [ ] Implement basic CCTV streaming (RTSP)
- [ ] Create database schema
- [ ] Setup authentication system

### Phase 2: Core Features (Weeks 5-10)
- [ ] Implement face detection (YOLOv8)
- [ ] Implement face recognition (InsightFace)
- [ ] Build employee registration module
- [ ] Build visitor registration module
- [ ] Implement real-time detection & tracking
- [ ] Create alert system

### Phase 3: UI/UX (Weeks 11-14)
- [ ] Design dashboard mockups
- [ ] Build React dashboard
- [ ] Implement real-time updates (WebSocket)
- [ ] Build mobile app (basic MVP)
- [ ] Create reporting interface
- [ ] User permission & role management

### Phase 4: Testing & Optimization (Weeks 15-16)
- [ ] Load testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] UAT with client
- [ ] Bug fixes

### Phase 5: Deployment & Training (Weeks 17-18)
- [ ] Production deployment
- [ ] Staff training
- [ ] Documentation
- [ ] Go-live support

---

## 8. Security Considerations

### Data Security
- [ ] Encrypt face images at rest (AES-256)
- [ ] HTTPS/TLS for all communications
- [ ] JWT token-based authentication
- [ ] Row-level security (RLS) for PostgreSQL
- [ ] PII data access logging

### Access Control
- [ ] Role-based access control (RBAC)
- [ ] Admin, Receptionist, Security, Employee roles
- [ ] Principle of least privilege
- [ ] Activity audit trails

### Privacy
- [ ] GDPR/Local compliance
- [ ] Face data retention policies
- [ ] User consent management
- [ ] Right to deletion implementation
- [ ] Privacy policy integration

### System Security
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF protection
- [ ] Rate limiting on APIs
- [ ] DDoS protection
- [ ] Regular security updates

---

## 9. Performance Targets

| Metric | Target |
|--------|--------|
| Face Detection Latency | < 200ms per frame |
| Face Recognition Matching | < 100ms |
| Detection Accuracy | > 95% (employees), > 90% (visitors) |
| API Response Time | < 500ms (95th percentile) |
| Dashboard Real-time Update | < 2 seconds |
| System Uptime | 99.5% |
| Camera Coverage Check | Every 30 seconds |

---

## 10. Deployment Checklist

- [ ] Infrastructure provisioning (servers, storage)
- [ ] SSL/TLS certificates
- [ ] Database backup strategy
- [ ] Monitoring & alerting setup
- [ ] Logging infrastructure
- [ ] API documentation
- [ ] User documentation
- [ ] Support contact setup
- [ ] SLA agreement
- [ ] Go-live plan

---

## Notes & Considerations

1. **Scalability**: Desain untuk support multiple cameras (10-100+) dengan parallel processing
2. **Accuracy Tuning**: Confidence thresholds perlu di-tune berdasarkan environment
3. **Privacy First**: Transparent tentang face recognition usage, besar enkripsi data
4. **Maintenance**: Regular model updates, database optimization, camera calibration
5. **Integration**: Siapkan webhook untuk integrasi dengan sistem existing (HRM, door access, etc)

---

**Last Updated**: May 2026  
**Version**: 1.0 - Initial Planning  
**Status**: Ready for Development Phase
