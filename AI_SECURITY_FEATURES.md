# AI Security Features Installed

Dokumen ini merangkum fitur AI/security yang sudah terpasang di project CCTV Face Recognition Dashboard, termasuk cara kerja singkat, konfigurasi, KPI yang bisa diukur, dan catatan performa untuk deployment banyak kamera.

## Ringkasan status

| Area | Status | Catatan |
|---|---:|---|
| Face Recognition Employee | Sudah ada | Local InsightFace / AWS Rekognition, dengan employee enrollment. |
| Unknown Person Detection | Sudah ada | Membuat alert untuk wajah yang tidak cocok dengan employee. |
| Camera Obstruction Detection | Sudah ada | Deteksi feed terlalu gelap/flat/tertutup. |
| Camera Offline Detection | Sudah ada | Background monitor RTSP dan auto-resolve saat kamera kembali online. |
| Unauthorized Area Access | Sudah ada | YOLO person detection + polygon zone. |
| Loitering Detection | Sudah ada | Aktif per kamera/zone, alert jika orang berada terlalu lama di zone. |
| Crowd Detection | Sudah ada | Aktif per kamera/zone, alert jika jumlah orang melewati threshold. |
| Door Left Open Detection | Sudah ada basic | Visual baseline per `door_area`, aktif hanya pada kamera/zone yang dipilih. |
| KPI Security Dashboard | Sudah ada | Endpoint `/api/kpis/security` dan KPI cards di Analytics. |
| Alert Lifecycle | Sudah ada | Acknowledge, resolve, false-positive, timestamps KPI. |
| WhatsApp Notification | Sudah ada | WAHA integration + alert type whitelist. |
| Per-Camera AI Feature Checklist | Sudah ada | Setiap kamera bisa memilih fitur AI yang aktif. |

## Per-camera AI Feature Checklist

Setiap kamera sekarang punya konfigurasi `ai_capabilities` untuk memilih fitur mana yang aktif. Ini penting untuk deployment 32 kamera agar fitur berat hanya berjalan di kamera yang memang butuh.

Default yang disarankan:

```json
{
  "camera_offline": true,
  "camera_obstruction": true,
  "face_recognition": false,
  "unknown_person": false,
  "unauthorized_access": false,
  "loitering": false,
  "crowd_detected": false,
  "door_left_open": false
}
```

Penjelasan:

- `camera_offline`: cek kesehatan RTSP, ringan, aman aktif untuk hampir semua kamera.
- `camera_obstruction`: deteksi kamera tertutup/gelap/flat, relatif ringan.
- `face_recognition`: fitur berat CPU, aktifkan hanya untuk entrance/lobby/access point.
- `unknown_person`: butuh face analysis, biasanya aktif bersama `face_recognition`.
- `unauthorized_access`: butuh zone restricted.
- `loitering`: butuh zone loitering.
- `crowd_detected`: butuh zone crowd.
- `door_left_open`: butuh zone `door_area`, aktif hanya untuk kamera yang punya pintu.

## Zone-based rules

Zone digambar melalui ZoneEditor per kamera. Zone bisa memiliki tipe:

| Zone type | Capability yang dibutuhkan | Fungsi |
|---|---|---|
| `restricted_area` | `unauthorized_access` | Alert saat orang masuk area terlarang. |
| `loitering_area` | `loitering` | Alert saat orang terlalu lama berada di area. |
| `crowd_area` | `crowd_detected` | Alert saat jumlah orang melewati threshold. |
| `door_area` | `door_left_open` | Alert saat area pintu terlihat terbuka melebihi threshold. |

Catatan penting: zone bisa disimpan walau capability kamera belum aktif, tapi rule tidak diproses sampai checklist fitur kamera dicentang.

## Feature detail

### 1. Face Recognition Employee

Fungsi:

- Mengenali employee berdasarkan foto enrollment.
- Menyimpan detection record.
- Membuat alert history `match` sebagai informational record.
- Update `last_detected` dan `current_location` employee.

Backend:

- Local mode memakai InsightFace.
- AWS mode memakai AWS Rekognition jika credential dikonfigurasi.

Env penting:

```env
FACE_RECOGNITION_BACKEND=local
INSIGHTFACE_MODEL=buffalo_sc
FACE_MATCH_THRESHOLD=0.40
FACE_CROWD_MODE=auto
FACE_CROWD_MIN_WIDTH=1280
FACE_TILE_OVERLAP=0.15
```

Env RTSP production yang disarankan:

```env
OPENCV_FFMPEG_CAPTURE_OPTIONS=rtsp_transport;tcp|timeout;5000000
OPENCV_FFMPEG_LOGLEVEL=8
```

Model rekomendasi untuk 32 kamera CPU-only:

- Default: `buffalo_sc`
- Jangan jadikan `buffalo_l` global default tanpa GPU.

### 2. Unknown Person Detection

Fungsi:

- Jika wajah terdeteksi tapi tidak match employee, sistem membuat alert `unknown_face`.
- Alert menyimpan crop image langsung agar tidak bergantung FK face record.

Catatan performa:

- Aktifkan hanya di kamera access point, lobby, entrance, atau area kritikal.
- Jangan aktifkan semua 32 kamera jika CPU-only.

### 3. Camera Obstruction Detection

Fungsi:

- Menganalisis area tengah frame.
- Jika frame terlalu gelap atau terlalu flat beberapa kali berturut-turut, sistem membuat alert `camera_obstruction`.
- Alert auto-resolve saat feed terlihat normal lagi.

KPI terkait:

- Incident detected AI.
- CCTV uptime/quality.
- Response time security.

### 4. Camera Offline Detection

Fungsi:

- Background monitor mengetes RTSP.
- Jika gagal beberapa kali berturut-turut, membuat alert `camera_offline`.
- Jika kamera kembali online beberapa kali berturut-turut, alert auto-resolve.

Env:

```env
CAMERA_OFFLINE_CHECK_INTERVAL_SECONDS=30
CAMERA_OFFLINE_RTSP_TIMEOUT_SECONDS=5
CAMERA_OFFLINE_FAIL_THRESHOLD=3
CAMERA_OFFLINE_RECOVER_THRESHOLD=2
```

KPI terkait:

- CCTV uptime.
- Offline incidents.
- Investigation/response time.

### 5. Unauthorized Area Access

Fungsi:

- YOLO mendeteksi `person`.
- Sistem cek apakah person masuk polygon restricted zone.
- Alert type: `unauthorized_access`.

Butuh:

- Camera capability `unauthorized_access=true`.
- Zone type `restricted_area`.

### 6. Loitering Detection

Fungsi:

- Sistem tracking sederhana durasi occupancy per zone.
- Jika orang berada di zone lebih lama dari threshold, membuat alert `loitering`.

Butuh:

- Camera capability `loitering=true`.
- Zone type `loitering_area`.

Default threshold:

- `loitering_threshold_seconds`: 60 detik.

### 7. Crowd Detection

Fungsi:

- Menghitung jumlah person dalam zone.
- Jika jumlah orang melewati threshold selama beberapa waktu, membuat alert `crowd_detected`.

Butuh:

- Camera capability `crowd_detected=true`.
- Zone type `crowd_area`.

Default:

- `crowd_threshold`: 5 orang.
- `crowd_duration_seconds`: 10 detik.

### 8. Door Left Open Detection

Fungsi:

- Visual baseline sederhana untuk area pintu.
- Jika area pintu berubah dari baseline lebih lama dari threshold, alert `door_left_open`.

Butuh:

- Camera capability `door_left_open=true`.
- Zone type `door_area`.
- Kamera fixed.
- Saat backend mulai, kondisi pintu idealnya normal/tertutup sebagai baseline.

Catatan:

- Ini basic visual detection. Untuk akurasi terbaik, gunakan door contact sensor/access control jika tersedia.

## Alert lifecycle

Alert sekarang mendukung lifecycle untuk KPI:

- `acknowledged`
- `acknowledged_at`
- `resolved_at`
- `false_positive`
- `resolution_note`
- `first_seen_at`
- `last_seen_at`
- `metadata`

Operator bisa:

- Acknowledge alert.
- Resolve alert.
- Mark false positive.

## KPI yang bisa diukur

Endpoint:

```http
GET /api/kpis/security?from=YYYY-MM-DD&to=YYYY-MM-DD
```

KPI:

| KPI | Status | Cara hitung |
|---|---:|---|
| Jumlah incident terdeteksi AI | Sudah bisa | Count alert non-`match`, exclude false positive. |
| Response time security | Sudah bisa | `acknowledged_at - created_at`. |
| Unauthorized access prevented | Sudah bisa basic | Unauthorized alert yang acknowledged/resolved. |
| CCTV uptime | Sudah bisa basic | Camera status + offline alert duration. |
| Area coverage AI | Sudah bisa | Jumlah kamera/zone dengan capability aktif. |
| False positive rate | Sudah bisa | Alert marked false positive / total incidents. |
| Security workload reduction | Estimasi | AI incidents × estimated manual review minutes. |
| Incident investigation time reduction | Estimasi | Resolved duration vs baseline. |

## WhatsApp notification

WhatsApp notification via WAHA sudah mendukung alert type:

- `match`
- `unknown_face`
- `suspicious_activity`
- `intrusion`
- `system_error`
- `camera_obstruction`
- `camera_offline`
- `unauthorized_access`
- `loitering`
- `door_left_open`
- `crowd_detected`

## RTSP/video stability improvements

Yang sudah dipasang:

- Shared RTSP frame reader/cache: snapshot, MJPEG stream, dan AI bisa memakai frame cache yang sama sehingga tidak perlu membuka decoder berkali-kali untuk kamera yang sama.
- Main/sub stream profile:
  - `main_stream_url` untuk face recognition / detail wajah.
  - `sub_stream_url` untuk preview, snapshot, dan zone analytics jika tersedia.
- RTSP over TCP default melalui `OPENCV_FFMPEG_CAPTURE_OPTIONS`.
- OpenCV timeout property fallback agar tidak crash pada build OpenCV tertentu.
- RTSP frame quality guard untuk slicing artifact.
- MJPEG stream response dengan `Content-Length`.
- Browser stream retry logic.
- Snapshot/stream cache.
- Watchdog timestamp fix agar tidak muncul false hung duration besar.

Masih perlu setting DVR/camera yang benar agar H.264 decoder bersih:

- H.264 standard.
- H.264+/H.265+ OFF.
- CBR.
- 1080p 10–12 FPS untuk kamera face penting.
- Bitrate 4096–6144 Kbps untuk 1080p crowded.
- I-frame/GOP sama dengan FPS.
- Smart Codec OFF.
- SVC OFF.

## Rekomendasi deployment 32 kamera

Untuk server CPU-only 12 vCPU / 20GB RAM:

- Gunakan `INSIGHTFACE_MODEL=buffalo_sc`.
- Aktifkan `camera_offline` dan `camera_obstruction` untuk mayoritas kamera.
- Aktifkan `face_recognition` dan `unknown_person` hanya di entrance/lobby/access point.
- Aktifkan YOLO zone analytics hanya pada area restricted/crowd/door/loitering yang memang perlu.
- Kamera general monitoring cukup health + stream.

Contoh pembagian:

| Camera group | Fitur aktif |
|---|---|
| Lobby / entrance | `face_recognition`, `unknown_person`, `camera_offline`, `camera_obstruction` |
| Server room | `unauthorized_access`, `door_left_open`, `camera_offline`, `camera_obstruction` |
| Staff area | `crowd_detected`, optional `face_recognition` |
| Hallway/general | `camera_offline`, `camera_obstruction` |

## Known limitations

- Tanpa GPU, semua kamera tidak disarankan menjalankan face recognition berat secara bersamaan.
- Door-left-open visual baseline sensitif terhadap perubahan angle/cahaya.
- Fight/fall/abnormal behavior belum masuk production feature; sebaiknya PoC dengan sample video customer.
- Asset removal dan PPE belum production feature; butuh definisi object/ROI/model custom.

## Next improvement candidates

Tanpa mengurangi fitur, performance bisa ditingkatkan dengan:

1. Per-feature scan interval yang konservatif.
2. Camera priority profile untuk dashboard/queue, bukan untuk menurunkan kamera kritikal.
3. Fixed AI worker pool dengan priority queue.
4. Adaptive processing saat CPU tinggi.
5. Worker process horizontal scaling jika semua 32 kamera perlu AI aktif.
