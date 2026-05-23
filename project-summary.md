# CCTV AI People Tracking System
## Executive Project Summary

**Project Name**: CCTV AI People Tracking System  
**Client**: [Your Client Name]  
**Prepared By**: Haryanto (jayusmansay@gmail.com)  
**Date**: May 2026  
**Status**: Planning Phase - Ready for Development

---

## 📋 Project Overview

Sistem monitoring CCTV berbasis Artificial Intelligence untuk real-time people tracking dengan fitur keamanan terpadu, visitor management, dan employee monitoring.

### 🎯 Primary Objectives

1. **Monitor CCTV feeds** dengan alert otomatis ketika camera tertutup/dimatikan
2. **Track visitors** secara real-time dengan facial recognition
3. **Identify employees** otomatis berdasarkan wajah untuk attendance tracking
4. **Centralized management** dari dashboard dengan reporting capabilities

---

## 🔑 Key Business Requirements

### Requirement 1: Camera Coverage Monitoring
```
Keperluan: Alert ketika camera tertutup (incident prevention)

Solusi Teknis:
├─ Real-time frame quality detection
├─ Automatic blackout/blur detection
├─ Immediate alert to security team
├─ 24/7 monitoring even at night
└─ Audit trail untuk semua alerts

Deliverable:
├─ Dashboard indicator (camera status)
├─ Push notifications
├─ Email alerts
└─ Alert history & analytics
```

### Requirement 2: Visitor Tracking
```
Keperluan: Track dan manage visitor movement within building

Solusi Teknis:
├─ Receptionist check-in/check-out interface
├─ Facial photo capture & embedding
├─ Real-time detection & matching
├─ Movement timeline tracking
├─ Unauthorized area alerts
└─ Automated check-out after time expires

Deliverable:
├─ Visitor registration portal
├─ QR badge generation
├─ Real-time location map
├─ Visit report & analytics
└─ Integration with host notification
```

### Requirement 3: Employee Recognition & Tracking
```
Keperluan: Auto-identify employees & track their location in real-time

Solusi Teknis:
├─ Receptionist registration (initial photo capture)
├─ Multiple photo angles (accuracy improvement)
├─ Face embedding generation & storage
├─ Real-time detection comparison
├─ Location-based zone tracking
└─ Attendance auto-logging

Deliverable:
├─ Employee database with photos
├─ Real-time location dashboard
├─ Attendance reports
├─ Zone occupancy heatmap
└─ Individual movement timeline
```

---

## 💡 Solution Architecture

### High-Level System Flow

```
CCTV Cameras
    ↓
[RTSP Stream Ingestion]
    ↓
[Frame Processing & AI Analysis]
├─ Face Detection (YOLOv8)
├─ Face Recognition (InsightFace/ArcFace)
├─ Camera Status Check
└─ Object Tracking (DeepSORT)
    ↓
[Business Logic Processing]
├─ Employee/Visitor Matching
├─ Location Assignment
├─ Timeline Management
└─ Alert Generation
    ↓
[Data Storage]
├─ PostgreSQL (structured data)
├─ Vector DB (face embeddings)
├─ Redis Cache (real-time)
└─ S3/MinIO (images & snapshots)
    ↓
[User Interfaces]
├─ Web Dashboard (Admin/Security/Receptionist)
├─ Mobile App (alerts & tracking)
└─ Real-time WebSocket updates
```

### System Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Stream Ingestion** | OpenCV + FFmpeg | RTSP/HTTP stream handling |
| **Face Detection** | YOLOv8-face | Real-time face localization |
| **Face Recognition** | InsightFace/ArcFace | Identity matching & embedding |
| **Tracking** | DeepSORT | Multi-person tracking & ID management |
| **Backend** | FastAPI (Python) | REST API & WebSocket server |
| **Database** | PostgreSQL + pgvector | Relational data + vector search |
| **Cache** | Redis | Session & real-time data |
| **Message Queue** | RabbitMQ/Kafka | Event-driven architecture |
| **Storage** | MinIO/S3 | Face images & snapshots |
| **Frontend** | React.js | Web dashboard |
| **Mobile** | React Native/Flutter | Mobile app |
| **Deployment** | Docker + Kubernetes | Containerization & orchestration |

---

## 📊 Core Features

### Feature Set Matrix

```
┌─────────────────────────────────────────────────────────┐
│ FEATURE NAME                    │ PRIORITY │ TIMELINE   │
├─────────────────────────────────────────────────────────┤
│ Employee Registration Panel     │    HIGH  │ Week 1-2   │
│ Visitor Check-in/Check-out      │    HIGH  │ Week 1-2   │
│ Real-time CCTV Feed Display     │   HIGH  │ Week 2-3   │
│ Face Detection & Recognition    │    HIGH  │ Week 3-5   │
│ Live Dashboard (All People)     │    HIGH  │ Week 4-5   │
│ Camera Status Monitoring        │    HIGH  │ Week 5-6   │
│ Alert System (Push/Email)       │    HIGH  │ Week 5-6   │
│ Attendance Reports              │    MED   │ Week 7-8   │
│ Visitor Analytics               │    MED   │ Week 8-9   │
│ Zone-based Heatmap              │    MED   │ Week 9-10  │
│ Mobile App - Basic              │    LOW   │ Week 11-13 │
│ Advanced Analytics              │    LOW   │ Week 14+   │
└─────────────────────────────────────────────────────────┘
```

### 1. Admin Management Panel

**Users**: Security Manager, System Administrator

**Capabilities**:
- Employee database management (CRUD)
- Camera configuration & monitoring
- Alert rules customization
- Report generation & export
- System settings & access control
- User role & permission management

**Key Screens**:
- Dashboard (KPIs & alerts)
- Employee list with photos
- Active cameras status
- Alert history & details
- Reports & analytics
- System configuration

---

### 2. Receptionist Portal

**Users**: Reception Staff, HR Staff

**Capabilities**:
- Employee registration (with photo capture)
- Visitor check-in/check-out
- Badge generation & printing
- Real-time visitor location tracking
- Visit report generation
- Photo upload & verification

**Key Screens**:
- Employee registration form
- Visitor check-in form
- Active visitors list
- Visitor timeline
- Badge printing interface

---

### 3. Real-Time Monitoring Dashboard

**Users**: Security Team, Managers

**Capabilities**:
- Live camera feeds (multi-view)
- Real-time people location (live map)
- Current occupancy per zone
- Active alerts & notifications
- Recent detections log
- Quick search (person/location/time)

**Visualization**:
- Floor plan with live positions
- Zone occupancy heatmap
- Detection timeline
- Alert indicators
- Camera status grid

---

### 4. Camera Coverage Monitoring

**Automated System**:
- Continuous frame quality analysis
- Blackout detection (night camera OFF)
- Lens cover/blur detection
- Connection status monitoring
- Automatic alert triggering
- Recovery notification

**Alert Types**:
- 🔴 **Critical**: Camera offline, complete blackout
- 🟡 **Warning**: Lens covered, signal weak
- 🟢 **Info**: Camera came online, issue resolved

---

### 5. Alert & Notification System

**Alert Categories**:
| Alert Type | Trigger | Severity | Action |
|-----------|---------|----------|--------|
| Camera Down | No signal > 30sec | Critical | Push + Email + SMS |
| Unknown Person | Face not in DB | Warning | Dashboard + Alert |
| Unauthorized Zone | Person in restricted area | Critical | Push + Alert + Log |
| Visitor Time Exceeded | Beyond validity | Warning | Notification + Log |
| Loitering | Same person > 30min | Info | Dashboard |

**Notification Channels**:
- In-app push notifications
- Email alerts
- SMS (optional)
- Slack/Teams integration
- Dashboard indicators
- Audit log (permanent record)

---

### 6. Reporting & Analytics

**Standard Reports**:
- **Attendance Report** (daily/weekly/monthly)
- **Visitor Log** (detailed entry/exit times)
- **Camera Uptime** (availability percentage)
- **Security Incidents** (alerts summary)
- **Occupancy Analysis** (peak times, zone distribution)
- **Compliance Report** (audit trail, regulatory)

**Export Formats**:
- PDF (formatted for printing)
- Excel (data for pivot analysis)
- CSV (integration with other systems)

---

## 🏗️ Technical Architecture

### Microservices Structure

```
┌──────────────────────────────────────────────┐
│          API Gateway & Load Balancer        │
└──────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    ┌────────┐   ┌────────┐   ┌────────┐
    │ Auth   │   │Business│   │AI      │
    │Service │   │Service │   │Service │
    └────────┘   └────────┘   └────────┘
        │             │             │
        └─────────────┼─────────────┘
                      ↓
        ┌──────────────────────────────┐
        │    Message Queue (RabbitMQ)  │
        └──────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    ┌────────┐   ┌────────┐   ┌────────┐
    │Database│   │ Cache  │   │Storage │
    │(PgSQL) │   │(Redis) │   │(S3)    │
    └────────┘   └────────┘   └────────┘
```

### Data Flow Example: Visitor Detection

```
1. Visitor enters building
   └─→ CCTV captures face

2. Frame processed by AI
   ├─→ YOLOv8: Detect face region
   ├─→ Normalize image
   └─→ InsightFace: Generate 128-D vector

3. Vector matching
   ├─→ Query pgvector in PostgreSQL
   ├─→ Find similar face embeddings
   └─→ Return matches with confidence

4. Business logic
   ├─→ Check if match is visitor
   ├─→ Verify validity period
   ├─→ Check authorized zones
   └─→ Assign location zone

5. Storage & notification
   ├─→ Log detection event
   ├─→ Update real-time location
   ├─→ Publish to WebSocket
   ├─→ Notify host (if configured)
   └─→ Archive face snapshot
```

---

## 📈 Project Timeline

### Phase 1: Foundation (Weeks 1-4)
**Setup & Infrastructure**
- Development environment setup (Docker, databases)
- Backend API skeleton
- Database schema & migrations
- CCTV stream ingestion (RTSP)
- Authentication system

**Deliverables**:
- [ ] Docker Compose working
- [ ] PostgreSQL with initial schema
- [ ] Redis cache running
- [ ] Basic API endpoints
- [ ] Stream capture working

---

### Phase 2: Core AI Features (Weeks 5-10)
**AI Implementation**
- Face detection model integration (YOLOv8)
- Face recognition model setup (InsightFace)
- Real-time inference pipeline
- Face embedding storage & retrieval
- Tracking algorithm (DeepSORT)

**Deliverables**:
- [ ] Face detection working real-time
- [ ] Recognition accuracy > 95%
- [ ] Vector database querying
- [ ] Multi-person tracking
- [ ] Performance meets targets

---

### Phase 3: Business Logic (Weeks 8-12)
**Feature Development**
- Employee registration module
- Visitor check-in/check-out system
- Alert system & rule engine
- Camera status monitoring
- Event processing & logging
- Real-time notification system

**Deliverables**:
- [ ] Employee DB with 200+ test records
- [ ] Visitor registration working
- [ ] Alerts triggering correctly
- [ ] Message queue operational
- [ ] Real-time updates via WebSocket

---

### Phase 4: Frontend Development (Weeks 10-14)
**UI/UX Implementation**
- React dashboard design
- Receptionist portal
- Real-time map/heatmap
- Camera feed display
- Report interface
- Mobile app (MVP)

**Deliverables**:
- [ ] Web dashboard fully functional
- [ ] All key screens completed
- [ ] Real-time updates working
- [ ] Mobile app responsive
- [ ] User testing completed

---

### Phase 5: Testing & Optimization (Weeks 14-16)
**QA & Performance**
- Load testing (1000+ req/sec)
- Accuracy validation
- Edge case testing
- Performance optimization
- Security audit
- Bug fixes & refinements

**Deliverables**:
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Security review complete
- [ ] 99.5% uptime validation
- [ ] Documentation complete

---

### Phase 6: Deployment (Weeks 17-18)
**Production Launch**
- Kubernetes setup
- SSL/TLS configuration
- Data migration
- Staff training
- Go-live support
- Monitoring setup

**Deliverables**:
- [ ] Production environment live
- [ ] All staff trained
- [ ] Monitoring dashboards active
- [ ] Support documentation ready
- [ ] Backup/recovery tested

---

## 💰 Resource Requirements

### Team Composition

```
┌─────────────────────────────────────────┐
│ ROLE              │ COUNT │ TIMELINE   │
├─────────────────────────────────────────┤
│ Backend Engineer  │   2   │ Full       │
│ AI/ML Engineer    │   1   │ Full       │
│ Frontend Engineer │   2   │ Week 10+   │
│ DevOps Engineer   │   1   │ Full       │
│ QA Engineer       │   1   │ Week 12+   │
│ Project Manager   │   1   │ Full       │
│ Product Manager   │   1   │ Full       │
├─────────────────────────────────────────┤
│ TOTAL             │   9   │            │
└─────────────────────────────────────────┘
```

### Infrastructure & Tools

```
Development:
├─ Docker Desktop / Rancher Desktop
├─ PostgreSQL 14+ (local)
├─ Redis (local)
├─ Python 3.10+
├─ Node.js 18+
└─ CUDA 11+ (for GPU acceleration)

Production:
├─ Kubernetes cluster (3-5 nodes)
├─ PostgreSQL managed service
├─ Redis managed service
├─ MinIO / AWS S3
├─ Load balancer
├─ Monitoring stack (Prometheus/Grafana)
└─ Log aggregation (ELK)

CCTV Integration:
├─ IP cameras with RTSP support
├─ Network infrastructure
├─ Power supply for cameras
└─ Network storage (optional)
```

---

## 🔒 Security & Compliance

### Data Protection

```
Face Images & Embeddings:
├─ Encrypted at rest (AES-256)
├─ Encrypted in transit (TLS 1.3)
├─ Access control (RBAC)
├─ Audit logging (all access)
└─ Retention policy (deletable)

Personal Information:
├─ GDPR compliance
├─ Data minimization principle
├─ Consent management
├─ Right to deletion implemented
└─ Privacy policy in place
```

### Access Control

```
Roles & Permissions:
├─ Admin: Full system access
├─ Manager: View reports, manage zones
├─ Security: Real-time monitoring, alerts
├─ Receptionist: Register visitors/employees
└─ Employee: View own attendance

Multi-factor Authentication:
├─ Email + Password (primary)
├─ Optional: OTP / Authenticator app
└─ Session timeout: 8 hours
```

### System Security

```
API Security:
├─ JWT token-based auth
├─ Rate limiting (100 req/min per IP)
├─ CORS restrictions
├─ Input validation & sanitization
└─ SQL injection prevention

Network Security:
├─ VPC / Private network
├─ Firewall rules
├─ DDoS protection
├─ Intrusion detection
└─ Security updates (monthly)
```

---

## 📊 Key Performance Indicators

### Technical KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| **Face Detection Latency** | < 200ms | Per frame |
| **Face Recognition Accuracy** | > 95% | On test dataset |
| **System Uptime** | 99.5% | Monthly |
| **API Response Time** | < 500ms (p95) | Real requests |
| **Dashboard Update Latency** | < 2 seconds | Real-time |
| **Camera Monitoring Interval** | 30 seconds | Check frequency |

### Business KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| **User Adoption** | 100% of staff | % who use system |
| **System Downtime Incidents** | < 1 per month | Unplanned outages |
| **Security Alerts Accuracy** | > 90% | False positive rate |
| **Average Response Time to Alerts** | < 5 minutes | Security team |
| **Visitor Tracking Accuracy** | > 98% | Correct identification |

---

## 🎯 Success Criteria

Project is considered successful when:

- ✅ **Functionality**: All requirements implemented & tested
- ✅ **Performance**: All KPIs met or exceeded
- ✅ **Security**: Security audit passed, no critical vulnerabilities
- ✅ **Reliability**: 99.5% uptime in production for 30 days
- ✅ **User Adoption**: 100% of staff trained & actively using
- ✅ **Support**: Support team ready for go-live
- ✅ **Documentation**: Complete technical & user documentation
- ✅ **Compliance**: GDPR & local regulations met

---

## 📝 Next Steps

### Immediate Actions (This Week)

1. **[ ] Review & Approval**
   - Review this planning document
   - Clarify any requirements
   - Get stakeholder sign-off

2. **[ ] Team Mobilization**
   - Assign team members
   - Setup development environment
   - Create project timeline

3. **[ ] Infrastructure Setup**
   - Provision servers
   - Setup version control (Git)
   - Configure CI/CD pipeline

### This Month

4. **[ ] Requirements Finalization**
   - Create detailed technical specifications
   - Design database schema
   - Create API documentation

5. **[ ] Development Kickoff**
   - Start Phase 1 (Foundation)
   - Daily standups begin
   - Weekly stakeholder updates

### Ongoing

6. **[ ] Regular Communication**
   - Weekly progress reports
   - Bi-weekly stakeholder reviews
   - Monthly demos

---

## 📞 Contact & Support

**Project Owner**: Haryanto  
**Email**: jayusmansay@gmail.com  
**Project Status**: Planning Phase (Ready for Development)

**For Questions**:
- Technical: Engineering team lead
- Business: Project manager
- Security: Security officer

---

## 📎 Appendix

### Reference Documents

1. `planning.md` - Detailed system planning & architecture
2. `system-architecture.mermaid` - Visual architecture diagram
3. `process-flows.mermaid` - Process flow diagrams
4. `tech-stack.md` - Technical implementation guide
5. `project-summary.md` - This document

### External Resources

- [YOLOv8 Documentation](https://docs.ultralytics.com)
- [InsightFace GitHub](https://github.com/deepinsight/insightface)
- [PostgreSQL Vector Search](https://github.com/pgvector/pgvector)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Kubernetes Best Practices](https://kubernetes.io/docs)

### Assumptions & Constraints

**Assumptions**:
- Cameras provide RTSP streams
- Building has modern IP camera infrastructure
- Internet connectivity stable for cloud features
- Staff will cooperate with new system

**Constraints**:
- Budget: [To be defined with client]
- Timeline: 18 weeks for full deployment
- Team: 9 resources required
- Server capacity: Scalable to 100+ cameras

---

**Document Version**: 1.0  
**Last Updated**: May 2026  
**Status**: ✅ Ready for Client Review

---

### Approval Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Client | [ ] | [ ] | [ ] |
| Project Manager | [ ] | [ ] | [ ] |
| Technical Lead | [ ] | [ ] | [ ] |

---

**End of Document**
