# Quotation - CCTV AI People Tracking System

## Ringkasan Project

**CCTV AI People Tracking System** adalah platform monitoring CCTV berbasis AI untuk membantu tim security, receptionist, HR, dan management memantau orang, kamera, alert, serta laporan operasional secara terpusat.

Sistem ini menggunakan dashboard web, backend API, database, pemrosesan RTSP camera, face recognition, alert engine, KPI security, serta integrasi notifikasi WhatsApp. Project saat ini mendukung opsi face recognition lokal menggunakan InsightFace atau cloud menggunakan AWS Rekognition.

## Tujuan Utama

1. Memantau kondisi CCTV secara real-time, termasuk kamera offline, blackout, blur, atau tertutup.
2. Mengenali employee dan mencatat riwayat deteksi/kehadiran secara otomatis.
3. Mengelola visitor check-in/check-out dan tracking pergerakan berdasarkan kamera/zona.
4. Memberikan alert keamanan untuk unknown person, unauthorized access, loitering, crowd, dan door left open.
5. Menyediakan dashboard KPI, reporting, audit trail, dan notifikasi operasional.

## Fitur Project

### Dashboard dan Monitoring

- Dashboard utama untuk ringkasan kamera, alert, deteksi terakhir, dan KPI.
- Live camera grid dan preview RTSP/MJPEG.
- Real-time update melalui WebSocket.
- Analytics security dan KPI operasional.
- Camera uptime dan status monitoring.

### Camera Management

- CRUD data kamera.
- Konfigurasi RTSP stream.
- Main stream dan sub stream profile.
- Health check kamera.
- Camera offline alert dan auto-resolve saat kamera kembali normal.
- Per-camera AI feature checklist.

### Face Recognition

- Enrollment employee dengan foto wajah.
- Face detection dan face matching.
- Opsi backend lokal InsightFace.
- Opsi AWS Rekognition jika credential AWS tersedia.
- Unknown person detection.
- Riwayat deteksi wajah.
- Update last detected dan current location employee.

### Visitor Management

- Visitor registration/check-in.
- Visitor check-out.
- Visitor list dan detail.
- Visitor timeline.
- Tracking berdasarkan detection history.

### Employee Management

- Employee database.
- Employee profile dan foto.
- Employee timeline.
- Attendance/detection report.
- Current location berdasarkan deteksi terakhir.

### AI Security Features

- Camera obstruction detection.
- Camera offline detection.
- Unauthorized area access detection.
- Loitering detection.
- Crowd detection.
- Door left open detection basic berbasis visual baseline.
- Zone editor untuk restricted area, loitering area, crowd area, dan door area.
- Alert lifecycle: acknowledge, resolve, false positive, resolution note, first seen, last seen.

### Alert dan Notification

- Alert dashboard.
- Alert history.
- Severity dan status management.
- WhatsApp notification via WAHA.
- Alert type whitelist untuk notifikasi.
- Audit trail incident.

### Reports

- Attendance report.
- Visitor report.
- Security incident report.
- Camera uptime report.
- Consolidated report.
- Export/report generation backend.

### System dan Admin

- Login dan protected routes.
- Role/permission-based access.
- User management.
- System settings.
- Notification settings.
- Data retention policy.
- Health check endpoint.
- Docker Compose deployment.

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React 18, TypeScript, Tailwind CSS, Redux Toolkit |
| Backend | FastAPI, Python, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Cache/Realtime | Redis, WebSocket |
| AI/Computer Vision | OpenCV, YOLO/Ultralytics, InsightFace, AWS Rekognition optional |
| Notification | WAHA WhatsApp Gateway |
| Deployment | Docker, Docker Compose |
| Testing | Pytest, React Testing Library |

## Quotation Project Implementation

> Harga di bawah adalah draft item quotation. Nominal final perlu disesuaikan berdasarkan jumlah kamera, lokasi deployment, server yang digunakan, durasi support, kebutuhan SLA, dan integrasi tambahan.

| No | Item | Scope | Qty | Estimasi |
|---:|---|---|---:|---:|
| 1 | Project Discovery dan Requirement Finalization | Kickoff, mapping kebutuhan, finalisasi flow security/receptionist/admin, validasi jumlah kamera dan zona | 1 paket | Rp [isi] |
| 2 | System Architecture dan Technical Design | Arsitektur aplikasi, database, camera pipeline, AI processing strategy, deployment plan | 1 paket | Rp [isi] |
| 3 | Backend API Development | FastAPI API untuk auth, camera, face, employee, visitor/person, alert, report, KPI, settings, user | 1 paket | Rp [isi] |
| 4 | Frontend Dashboard Development | Dashboard web, camera page, alert page, analytics, employee, visitor, branch, reports, settings | 1 paket | Rp [isi] |
| 5 | Face Recognition Module | Enrollment, detection, matching, unknown person, detection history, local InsightFace/AWS Rekognition mode | 1 paket | Rp [isi] |
| 6 | RTSP Camera Integration | Stream ingestion, snapshot, MJPEG preview, frame cache, main/sub stream handling | Per kamera | Rp [isi] |
| 7 | AI Security Rules | Camera obstruction, camera offline, unauthorized zone, loitering, crowd, door left open basic | 1 paket | Rp [isi] |
| 8 | Zone Editor dan Per-Camera AI Configuration | Polygon zone setup, camera AI checklist, rule activation per kamera | 1 paket | Rp [isi] |
| 9 | Alert Lifecycle dan WhatsApp Notification | Acknowledge, resolve, false positive, WhatsApp WAHA integration, recipient/config management | 1 paket | Rp [isi] |
| 10 | Reporting dan KPI Security | Attendance, visitor, camera uptime, security incident, consolidated report, KPI endpoint/dashboard | 1 paket | Rp [isi] |
| 11 | Docker Deployment Setup | Dockerfile, Docker Compose, environment setup, PostgreSQL, Redis, WAHA, health check | 1 paket | Rp [isi] |
| 12 | Testing dan UAT Support | Functional test, integration test, camera test, issue fixing selama UAT | 1 paket | Rp [isi] |
| 13 | Documentation dan Handover | Technical documentation, setup guide, admin/user guide, environment guide | 1 paket | Rp [isi] |
| 14 | Training User | Training admin, security, receptionist, dan operator | 1 sesi | Rp [isi] |
| 15 | Go-Live Support | Assistance saat production launch dan stabilization awal | 1 paket | Rp [isi] |

### Optional Add-On Implementation

| No | Item | Scope | Estimasi |
|---:|---|---|---:|
| 1 | AWS Rekognition Production Setup | IAM, Rekognition collection, S3 bucket, credential setup, cost monitoring | Rp [isi] |
| 2 | Multi-Branch Deployment | Konfigurasi branch/site, camera grouping, role access per branch | Rp [isi] |
| 3 | Advanced Analytics | Heatmap, trend analysis, custom KPI, executive dashboard | Rp [isi] |
| 4 | Custom Object Detection | PPE, asset removal, weapon/object detection, model tuning/PoC | Rp [isi] |
| 5 | Mobile App / PWA | Alert notification dan monitoring mobile | Rp [isi] |
| 6 | High Availability Setup | Reverse proxy, SSL, backup, monitoring stack, failover planning | Rp [isi] |
| 7 | Integration with HR/Access Control | API integration dengan HRIS, access door, attendance system, atau SSO | Rp [isi] |

## Managed Services Quotation

Managed services bersifat recurring bulanan dan dapat dipilih sesuai kebutuhan operasional.

| No | Service | Scope | Frekuensi | Estimasi/Bulan |
|---:|---|---|---|---:|
| 1 | Basic Application Support | Bug fixing minor, remote support, guidance penggunaan, health check manual | Business hours | Rp [isi] |
| 2 | System Monitoring | Monitoring uptime aplikasi, database, Redis, WAHA, API health, camera status dashboard | Harian | Rp [isi] |
| 3 | Camera Health Monitoring | Review camera offline/obstruction alert, rekomendasi konfigurasi RTSP, eskalasi issue kamera | Harian/Mingguan | Rp [isi] |
| 4 | AI Performance Tuning | Review false positive, threshold tuning, camera AI capability tuning, zone refinement | Mingguan | Rp [isi] |
| 5 | Database Maintenance | Backup check, cleanup data retention, query health, storage monitoring | Mingguan | Rp [isi] |
| 6 | Security Maintenance | Patch dependency, credential review, access review, log review | Bulanan | Rp [isi] |
| 7 | Report dan KPI Review | Monthly report untuk uptime, incident, false positive, response time, workload reduction | Bulanan | Rp [isi] |
| 8 | WhatsApp Gateway Maintenance | WAHA session monitoring, webhook check, recipient/config support | Harian/Mingguan | Rp [isi] |
| 9 | Cloud Cost Monitoring | AWS Rekognition/S3/API usage review dan rekomendasi optimasi biaya | Bulanan | Rp [isi] |
| 10 | SLA Priority Support | Prioritas response, incident escalation, emergency remote troubleshooting | Sesuai SLA | Rp [isi] |

### Paket Managed Services

| Paket | Cocok Untuk | Include | Estimasi/Bulan |
|---|---|---|---:|
| Basic | Pilot/POC atau penggunaan terbatas | Basic support, monthly health check, minor bug fix | Rp [isi] |
| Standard | Production normal | Monitoring, camera health review, database maintenance, WhatsApp maintenance, monthly KPI report | Rp [isi] |
| Premium | Production kritikal | Semua Standard, AI tuning rutin, security maintenance, cloud cost monitoring, SLA priority support | Rp [isi] |

## Asumsi Quotation

- CCTV sudah mendukung RTSP dan dapat diakses oleh server aplikasi.
- Network antar kamera dan server stabil.
- Server production disediakan oleh client atau dibeli terpisah.
- Domain, SSL, public IP/VPN, dan network firewall disediakan oleh client kecuali dimasukkan ke add-on.
- Biaya AWS Rekognition, S3, internet, server, listrik, dan WhatsApp gateway tidak termasuk biaya development kecuali dinyatakan lain.
- Akurasi AI bergantung pada kualitas kamera, angle, pencahayaan, resolusi, FPS, dan posisi wajah.
- Untuk deployment CPU-only banyak kamera, face recognition disarankan aktif hanya di access point penting seperti lobby, entrance, dan area kritikal.

## Exclusion

- Pengadaan CCTV, NVR/DVR, kabel, switch, rack, dan instalasi fisik kamera.
- Biaya cloud provider, domain, SSL berbayar, SMS gateway, email gateway, dan lisensi pihak ketiga.
- Custom AI model training besar tanpa scope PoC terpisah.
- Integrasi sistem eksternal yang belum disebutkan dalam scope.
- On-site support di luar kota, kecuali disepakati terpisah.

## Recommended Next Step

1. Finalisasi jumlah kamera, lokasi, zona, dan fitur AI per kamera.
2. Tentukan mode face recognition: local InsightFace, AWS Rekognition, atau hybrid.
3. Validasi server dan network readiness.
4. Isi nominal quotation final per item.
5. Jalankan pilot dengan 2-4 kamera sebelum full rollout.
