# CCTV Dashboard - UI/UX Specification
## Complete Feature Set & Design

**Project**: CCTV Face Recognition System (AWS Rekognition)  
**Focus**: Web Dashboard for Admins, Managers, Security, Receptionists  
**Tech Stack**: React 18, Tailwind CSS, TypeScript  
**Status**: Design Phase - Ready for Implementation

---

## 📊 Dashboard Overview

### **Dashboard Types & Users**

```
┌─────────────────────────────────────────────────┐
│ ADMIN/MANAGER DASHBOARD                         │
├─────────────────────────────────────────────────┤
│ ├─ System overview                              │
│ ├─ Employee management                          │
│ ├─ Reports & analytics                          │
│ ├─ System settings                              │
│ └─ User management                              │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SECURITY/MONITORING DASHBOARD                   │
├─────────────────────────────────────────────────┤
│ ├─ Real-time camera feeds                       │
│ ├─ Live occupancy map                           │
│ ├─ Alert notifications                          │
│ ├─ Recent detections log                        │
│ └─ Quick search                                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ RECEPTIONIST PORTAL                             │
├─────────────────────────────────────────────────┤
│ ├─ Visitor check-in/check-out                   │
│ ├─ Employee registration                        │
│ ├─ Badge printing                               │
│ ├─ Active visitor list                          │
│ └─ QR code generation                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ EMPLOYEE SELF-SERVICE                           │
├─────────────────────────────────────────────────┤
│ ├─ My attendance                                 │
│ ├─ My location history                          │
│ ├─ My check-in/check-out times                  │
│ └─ My profile                                   │
└─────────────────────────────────────────────────┘
```

---

## 🎨 Dashboard Layouts

### **1. SECURITY MONITORING DASHBOARD** (Main View)

```
┌─────────────────────────────────────────────────────────┐
│ CCTV MONITORING SYSTEM          [Profile] [Logout]      │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────┐ │
│ │ LIVE OVERVIEW                     🔄 Refresh | 📊 ←  │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │  Current Time Occupancy: 24 people                   │ │
│ │  Active Cameras: 38/40 ✅                           │ │
│ │  Alerts (Last 1h): 3 ⚠️                             │ │
│ │  Visitors: 5 👥                                     │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────┐ ┌──────────────────────────┐  │
│ │   CAMERA FEEDS       │ │  ZONE OCCUPANCY HEATMAP  │  │
│ │ (Grid view)          │ │  🔴🔴🔴                   │  │
│ │  [Cam1] [Cam2]       │ │  [Floor Plan Image]      │  │
│ │  [Cam3] [Cam4]       │ │  Red = High traffic      │  │
│ │  [Cam5] [Cam6]       │ │                          │  │
│ │                      │ │  [View Details]          │  │
│ │  [Load More...]      │ │                          │  │
│ └──────────────────────┘ └──────────────────────────┘  │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ RECENT DETECTIONS                  [Last 1h]         │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ Time    │ Person       │ Camera      │ Location       │ │
│ │ 14:32   │ John Doe     │ Cam 1       │ Main Entrance  │ │
│ │ 14:29   │ Jane Smith   │ Cam 2       │ Floor 2        │ │
│ │ 14:25   │ Unknown      │ Cam 3       │ Conference ⚠️  │ │
│ │ 14:22   │ Mike Johnson │ Cam 1       │ Main Entrance  │ │
│ │ 14:18   │ Visitor      │ Cam 2       │ Lobby          │ │
│ │                  [Load More...] [Export]               │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ACTIVE ALERTS                                         │ │
│ ├──────────────────────────────────────────────────────┤ │
│ │ 🔴 CAMERA OFFLINE - Cam 5 (Conference Room)          │ │
│ │    [Resolve]                                          │ │
│ │ 🟡 UNKNOWN PERSON - Cam 3 (Restricted Zone)          │ │
│ │    [Review] [Block]                                   │ │
│ │ 🟢 Visitor overdue - Visitor #V001 (2h 30min)        │ │
│ │    [Check Out] [Extend]                              │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### **2. ADMIN PANEL - EMPLOYEE MANAGEMENT**

```
┌─────────────────────────────────────────────────────────┐
│ CCTV SYSTEM                      [Admin] [Logout]        │
├─────────────────────────────────────────────────────────┤
│ Sidebar:                          Main Content:          │
│ ├─ Dashboard                      ┌───────────────────┐  │
│ ├─ Employees ✓                   │ EMPLOYEE MANAGEMENT   │
│ ├─ Visitors                      ├───────────────────┤  │
│ ├─ Reports                       │ [+ New Employee]      │
│ ├─ Cameras                       │                       │
│ ├─ Alerts                        │ Search: [_____]       │
│ ├─ Settings                      │ Filter: [Department▼] │
│ └─ Logout                        │                       │
│                                  │ Total: 1,245 employees│
│                                  ├───────────────────┤  │
│                                  │ ID | Name | Dept  │   │
│                                  │─────────────────── │   │
│                                  │E001│John  │Sales  │ ✎ │
│                                  │E002│Jane  │IT     │ ✎ │
│                                  │E003│Mike  │HR     │ ✎ │
│                                  │E004│Sarah │Ops    │ ✎ │
│                                  │E005│...   │...    │... │
│                                  │                       │
│                                  │ [< Previous] [1-50]   │
│                                  │ [Next >]              │
│                                  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘

Employee Detail Modal:
┌─────────────────────────────────┐
│ EMPLOYEE: John Doe              │
├─────────────────────────────────┤
│ Photo: [Image]                  │
│ ID: E001                        │
│ Name: John Doe                  │
│ Department: Sales               │
│ Status: Active ✓               │
│ Last Detected: 10:30 AM         │
│ Current Location: Floor 2       │
│                                 │
│ [Edit] [Delete] [View Timeline] │
│ [Close]                         │
└─────────────────────────────────┘
```

---

### **3. RECEPTIONIST PORTAL - VISITOR CHECK-IN**

```
┌─────────────────────────────────────────────────────────┐
│ VISITOR MANAGEMENT               [Receptionist] [Logout] │
├─────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────────┐   │
│ │ QUICK ACTIONS        │ │ ACTIVE VISITORS          │   │
│ ├──────────────────────┤ ├──────────────────────────┤   │
│ │ [+ New Visitor]      │ │ Name | Org | Host | In  │   │
│ │ [+ New Employee]     │ ├──────────────────────────┤   │
│ │ [Print Badge]        │ │ Alice│ABC  │John │14:30 │   │
│ │ [View Reports]       │ │ Bob  │XYZ  │Jane │14:15 │   │
│ │                      │ │ Carol│QRS  │Mike │13:45 │   │
│ └──────────────────────┘ │                        │   │
│                          │ [Check Out Visitor]    │   │
│                          └──────────────────────────┘   │
│                                                         │
│ ┌──────────────────────────────────────────────────┐   │
│ │ NEW VISITOR CHECK-IN                             │   │
│ ├──────────────────────────────────────────────────┤   │
│ │ Name: [_____________________]                    │   │
│ │ Organization: [_____________________]            │   │
│ │ Purpose: [_____________________]                 │   │
│ │ Host Employee: [Search ↓]                        │   │
│ │ Phone: [_____________________]                   │   │
│ │ Email: [_____________________]                   │   │
│ │ Validity: [8 hours ↓]                            │   │
│ │ Photo: [📷 Capture] or [📤 Upload]              │   │
│ │                                                   │   │
│ │ [Cancel] [Register Visitor] ✓                    │   │
│ │                                                   │   │
│ │ Result:                                          │   │
│ │ ✅ Visitor registered: V#001                    │   │
│ │ 🎫 Badge: [QR Code] [Print]                     │   │
│ │ Valid until: 22:30                               │   │
│ └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### **4. REPORTS & ANALYTICS**

```
┌─────────────────────────────────────────────────────────┐
│ REPORTS & ANALYTICS              [Admin] [Logout]        │
├─────────────────────────────────────────────────────────┤
│ Report Type: [Attendance ↓] | Period: [This Month ↓]    │
│ [Generate Report] [Export PDF] [Export Excel]           │
│                                                          │
│ ┌──────────────────────────────────────────────────┐    │
│ │ DAILY ATTENDANCE SUMMARY                          │    │
│ ├──────────────────────────────────────────────────┤    │
│ │ Date: May 22, 2026                                │    │
│ │ Total Present: 1,200 / 1,245 (96.4%)             │    │
│ │ Absent: 45                                        │    │
│ │ Late: 23                                         │    │
│ │ Early Leave: 12                                  │    │
│ │                                                   │    │
│ │ [View Details] [Download]                        │    │
│ └──────────────────────────────────────────────────┘    │
│                                                          │
│ ┌──────────────────────┐ ┌──────────────────────────┐  │
│ │ OCCUPANCY TREND      │ │ CAMERA UPTIME            │  │
│ │ (Line Chart)         │ │ Cam1: 99.9% ✅          │  │
│ │ Y-axis: People       │ │ Cam2: 99.8% ✅          │  │
│ │ X-axis: Time         │ │ Cam3: 98.5% ✅          │  │
│ │ Peak: 2PM (450 ppl)  │ │ Cam4: 97.2% ⚠️          │  │
│ │ Low: 6PM (50 ppl)    │ │ Cam5: 0% 🔴 (Offline)   │  │
│ │                      │ │                          │  │
│ └──────────────────────┘ └──────────────────────────┘  │
│                                                          │
│ ┌──────────────────────────────────────────────────┐    │
│ │ VISITOR ANALYTICS                                 │    │
│ ├──────────────────────────────────────────────────┤    │
│ │ Total Visitors: 450 (this month)                  │    │
│ │ Average Visit Duration: 1.5 hours                 │    │
│ │ Most Visited Host: John Doe (52 visitors)        │    │
│ │ Top Organizations: ABC Corp, XYZ Ltd, QRS Inc    │    │
│ │                                                   │    │
│ │ [View Full Report] [Export]                      │    │
│ └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 All Dashboard Pages/Screens

### **Admin/Manager Dashboard**
```
1. Dashboard (Main)
   ├─ Overview KPIs
   ├─ Live monitoring
   ├─ Recent detections
   └─ Active alerts

2. Employees
   ├─ Employee list
   ├─ Register new
   ├─ Edit/delete
   ├─ View timeline
   └─ Bulk actions

3. Visitors
   ├─ Active visitors
   ├─ Visitor history
   ├─ Check-in/out
   ├─ Reports
   └─ QR badge

4. Cameras
   ├─ Camera list
   ├─ Configure camera
   ├─ Camera status
   ├─ Live feed view
   └─ Health check

5. Alerts & Incidents
   ├─ Active alerts
   ├─ Alert history
   ├─ Configure rules
   ├─ Whitelist/blacklist
   └─ Incident log

6. Reports
   ├─ Attendance
   ├─ Visitor log
   ├─ Camera uptime
   ├─ Security incidents
   ├─ Analytics
   └─ Export options

7. Settings
   ├─ System settings
   ├─ User management
   ├─ Roles & permissions
   ├─ Email config
   ├─ Notification rules
   └─ Data retention

8. Profile
   ├─ My profile
   ├─ Change password
   ├─ Preferences
   └─ Logout
```

### **Security Monitoring Dashboard**
```
1. Live Monitoring (Main)
   ├─ Camera feeds (grid)
   ├─ Occupancy heatmap
   ├─ Recent detections
   ├─ Active alerts
   └─ Quick search

2. Camera Control
   ├─ Select camera
   ├─ Full screen view
   ├─ PTZ controls
   └─ Record/snapshot

3. Alerts
   ├─ Real-time alerts
   ├─ Alert details
   ├─ Acknowledge
   ├─ Resolve
   └─ History

4. Search & Timeline
   ├─ Search by person
   ├─ Search by date/time
   ├─ Timeline view
   ├─ Movement history
   └─ Export

5. Profile
   ├─ My profile
   ├─ Change password
   └─ Logout
```

### **Receptionist Portal**
```
1. Dashboard (Main)
   ├─ Visitor status
   ├─ Employee list
   ├─ Quick actions
   └─ Active visitors

2. Visitor Management
   ├─ Check-in form
   ├─ Check-out form
   ├─ Badge printing
   ├─ QR generation
   └─ Extend validity

3. Employee Management
   ├─ Register employee
   ├─ Edit employee
   ├─ View info
   └─ Camera preview

4. Reports
   ├─ Daily visitor log
   ├─ Employee attendance
   └─ Export

5. Profile
   ├─ My profile
   ├─ Change password
   └─ Logout
```

---

## 🎨 UI Components Needed

### **Layout Components**
```
├─ Navbar/Header
│  ├─ Logo
│  ├─ Navigation links
│  ├─ User profile dropdown
│  └─ Logout button
│
├─ Sidebar
│  ├─ Navigation menu
│  ├─ Active state indicator
│  ├─ Collapse/expand toggle
│  └─ User role indicator
│
└─ Footer
   ├─ Copyright
   ├─ Version
   └─ Support link
```

### **Data Display Components**
```
├─ DataTable
│  ├─ Sortable columns
│  ├─ Filterable rows
│  ├─ Pagination
│  ├─ Bulk actions
│  └─ Export button
│
├─ Card
│  ├─ Stats card
│  ├─ Detail card
│  └─ Action card
│
├─ List
│  ├─ Simple list
│  ├─ Expandable list
│  └─ Virtual list (large datasets)
│
├─ Grid
│  ├─ Camera grid
│  ├─ Employee grid
│  └─ Card grid
│
└─ Timeline
   ├─ Vertical timeline
   ├─ Interactive points
   └─ Date range filter
```

### **Input Components**
```
├─ TextField
│  ├─ Text input
│  ├─ Email input
│  ├─ Password input
│  └─ Search input
│
├─ Select
│  ├─ Dropdown
│  ├─ Searchable select
│  └─ Multi-select
│
├─ DatePicker
│  ├─ Single date
│  ├─ Date range
│  └─ Time picker
│
├─ Checkbox
├─ Radio
├─ Toggle
└─ FileUpload
```

### **Feedback Components**
```
├─ Alert
│  ├─ Error
│  ├─ Warning
│  ├─ Success
│  └─ Info
│
├─ Toast/Notification
│  ├─ Auto-dismiss
│  ├─ Action button
│  └─ Close button
│
├─ Loading
│  ├─ Spinner
│  ├─ Skeleton
│  └─ Progress bar
│
├─ Modal
│  ├─ Confirm dialog
│  ├─ Detail modal
│  ├─ Form modal
│  └─ Alert modal
│
└─ Tooltip
   └─ Hover help text
```

### **Visualization Components**
```
├─ Chart
│  ├─ Line chart (occupancy trend)
│  ├─ Bar chart (attendance)
│  ├─ Pie chart (distribution)
│  └─ Heatmap (zone occupancy)
│
├─ Map
│  ├─ Floor plan
│  ├─ Zone markers
│  └─ Live occupancy overlay
│
└─ Camera Feed
   ├─ Video player
   ├─ Live feed
   └─ Snapshot
```

### **Video Components**
```
├─ VideoPlayer
│  ├─ Play/pause
│  ├─ Timeline scrubber
│  ├─ Volume control
│  ├─ Fullscreen
│  └─ Speed control
│
└─ CameraGrid
   ├─ Multi-camera view
   ├─ Switch focus
   └─ PIP (Picture-in-Picture)
```

---

## 🔄 Key Workflows

### **Workflow 1: Real-Time Monitoring**
```
Security Guard starts Dashboard
    ↓
Sees live camera feeds + heatmap
    ↓
Detects face in real-time
    ↓
System identifies person (auto)
    ↓
If unknown/alert → Pop-up notification
    ↓
Guard can:
├─ View person's details
├─ View person's history
├─ Check if authorized
├─ Acknowledge alert
└─ Take action (if needed)
    ↓
Alert dismissed/resolved
```

### **Workflow 2: Visitor Check-In**
```
Visitor arrives at reception
    ↓
Receptionist clicks [+ New Visitor]
    ↓
Form appears:
├─ Name
├─ Organization
├─ Purpose
├─ Host (search)
└─ Photo (capture or upload)
    ↓
Submit
    ↓
System:
├─ Uploads to AWS
├─ Indexes face
├─ Generates QR code
└─ Prints badge
    ↓
Receptionist gives badge
    ↓
Visitor enters building
    ↓
CCTV auto-detects + tracks
    ↓
Dashboard shows active visitor
    ↓
On exit: Receptionist checks out
    ↓
System logs visit duration
```

### **Workflow 3: Employee Registration**
```
HR submits employee list
    ↓
Admin goes to Employees page
    ↓
Clicks [+ New Employee]
    ↓
Form appears:
├─ ID
├─ Name
├─ Department
├─ Role
└─ Photo (upload)
    ↓
Submit
    ↓
System:
├─ Saves to database
├─ Uploads photo to S3
├─ Indexes face in AWS
└─ Ready for detection
    ↓
Done! Employee registered
    ↓
Next time they appear on camera
    ├─ System detects face
    ├─ Shows employee info
    ├─ Logs location
    └─ Updates attendance
```

---

## 🎯 Feature Details

### **Feature 1: Real-Time Dashboard**
```
Elements:
├─ Live clock (current time)
├─ Occupancy counter (total people)
├─ Camera status (online/offline)
├─ Active alerts count
├─ Visitor count

Update Frequency:
├─ Main metrics: Every 5 seconds
├─ Camera feed: Real-time (RTSP)
├─ Alerts: Real-time (WebSocket)
├─ Detection log: Every 10 seconds
└─ Charts: Every 30 seconds

Connection:
├─ WebSocket for real-time updates
├─ REST API for data fetch
└─ RTSP for video streams
```

### **Feature 2: Camera Grid View**
```
Layout:
├─ Responsive grid (2x2, 3x3, 4x4)
├─ Adjustable grid size
├─ Camera selection
└─ Fullscreen option

Per Camera:
├─ Live video feed
├─ Camera name/ID
├─ Status indicator
├─ Recording indicator
├─ Recent detections count
└─ Click to expand

Interactions:
├─ Click to fullscreen
├─ Right-click for options
├─ Drag to reorder
├─ Resize tiles
└─ Pin favorites
```

### **Feature 3: Occupancy Heatmap**
```
Display:
├─ Floor plan image
├─ Zone boundaries overlaid
├─ Color intensity = occupancy level
├─ Red = high traffic
├─ Yellow = medium
├─ Green = low
└─ Gray = empty

Interactions:
├─ Click zone for details
├─ View current count
├─ View peak times
├─ View recent detections
└─ Historical view (time range)

Data:
├─ Update every 10 seconds
├─ Store for analytics
├─ Show trends
└─ Predict patterns
```

### **Feature 4: Alert System**
```
Alert Types:
├─ 🔴 Critical
│  ├─ Camera offline
│  ├─ Unknown person detected
│  └─ Restricted area violation
│
├─ 🟡 Warning
│  ├─ Low confidence match
│  ├─ Visitor time exceeded
│  └─ Camera quality issue
│
└─ 🟢 Info
   ├─ Visitor arrived
   ├─ Employee checked in
   └─ Device online

Display:
├─ Pop-up notification
├─ Sound alert (configurable)
├─ Dashboard banner
├─ Severity color coding
├─ Details on click
└─ Dismiss/Acknowledge button

Actions:
├─ View full details
├─ View related footage
├─ Investigate person
├─ Whitelist/blacklist
├─ Resolve alert
└─ View history
```

### **Feature 5: Search & Timeline**
```
Search Options:
├─ By person (name/ID)
├─ By date/time range
├─ By location (camera)
├─ By alert type
└─ Combination search

Results Display:
├─ Timeline view (vertical)
├─ List view (table)
├─ Map view (locations)
└─ Gallery view (photos)

Per Detection:
├─ Timestamp
├─ Person info
├─ Camera location
├─ Confidence score
├─ Face photo
├─ Export option
└─ View details button

Timeline:
├─ Drag to zoom
├─ Click event for details
├─ Show movement path
├─ Compare multiple people
└─ Export timeline
```

---

## 📱 Responsive Design

### **Mobile (< 768px)**
```
├─ Single column layout
├─ Collapsible sidebar (hamburger menu)
├─ Stacked cards
├─ Simplified tables (card view)
├─ Full-width forms
├─ Touch-friendly buttons (48px+)
└─ Bottom navigation (mobile)
```

### **Tablet (768px - 1024px)**
```
├─ Two column layout (sidebar + content)
├─ Card grid (2 columns)
├─ Simplified camera grid (2x2)
├─ Condensed tables
├─ Side-by-side forms
└─ Optimized spacing
```

### **Desktop (> 1024px)**
```
├─ Three+ column layout
├─ Full sidebar visible
├─ Card grid (3+ columns)
├─ Full camera grid (4x4+)
├─ Detailed tables
├─ Dashboard widgets
└─ Maximum information density
```

---

## 🎨 Design System

### **Color Palette**
```
Primary:
├─ Blue: #2563EB (actions, links)
├─ Green: #10B981 (success, online)
├─ Red: #EF4444 (critical, offline)
└─ Yellow: #F59E0B (warning, attention)

Neutral:
├─ Dark: #1F2937 (text, dark bg)
├─ Light: #F3F4F6 (light bg)
└─ Gray: #9CA3AF (secondary text)

Status:
├─ Online: Green (#10B981)
├─ Offline: Red (#EF4444)
├─ Away: Yellow (#F59E0B)
├─ Unknown: Gray (#9CA3AF)
└─ Blocked: Red (#DC2626)
```

### **Typography**
```
Headings:
├─ H1: 32px, Bold, Dark
├─ H2: 24px, Bold, Dark
├─ H3: 20px, Bold, Dark
└─ H4: 16px, Semi-bold, Dark

Body:
├─ Regular: 14px, Normal, Gray
├─ Small: 12px, Normal, Gray
└─ Tiny: 10px, Normal, Light Gray

Monospace (for IDs, timestamps):
└─ 12px, Courier New
```

### **Spacing**
```
Consistent 4px grid:
├─ xs: 4px
├─ sm: 8px
├─ md: 16px
├─ lg: 24px
├─ xl: 32px
└─ 2xl: 48px
```

### **Shadows**
```
├─ sm: 0 1px 2px rgba(0,0,0,0.05)
├─ md: 0 4px 6px rgba(0,0,0,0.1)
├─ lg: 0 10px 15px rgba(0,0,0,0.1)
└─ xl: 0 20px 25px rgba(0,0,0,0.1)
```

---

## 🔐 Permission-Based Views

### **Admin Can See:**
```
✅ All employees
✅ All visitors
✅ All reports
✅ System settings
✅ User management
✅ All alerts
✅ All data
```

### **Manager Can See:**
```
✅ All employees (read-only)
✅ All visitors (read-only)
✅ Reports (view only)
❌ System settings
❌ User management
✅ Alerts (view only)
```

### **Security Can See:**
```
✅ Real-time monitoring
✅ Live feeds
✅ Recent detections
✅ Active alerts
✅ Search (limited)
✅ Incident log
❌ Reports
❌ Employee data (limited)
```

### **Receptionist Can See:**
```
✅ Visitor check-in/out
✅ Employee registration
✅ Active visitors
✅ Visitor history
❌ Detailed employee data
❌ Reports
❌ Settings
```

---

## 🚀 Performance Considerations

```
Optimization:
├─ Lazy load camera feeds
├─ Virtual scrolling for large lists
├─ Debounce search input
├─ Cache static data
├─ Compress images
├─ CDN for assets
└─ Service worker for offline

Loading States:
├─ Skeleton screens (while loading)
├─ Progressive image loading
├─ Staggered animation
└─ Estimated load time indicator

Real-Time:
├─ WebSocket for live updates
├─ Delta updates (only changes)
├─ Batch updates (reduce frequency)
└─ Connection status indicator
```

---

## 📋 Page Structure Summary

```
├─ Admin Dashboard
│  ├─ Dashboard (Main Overview)
│  ├─ Employees (CRUD)
│  ├─ Visitors (Management)
│  ├─ Cameras (Config)
│  ├─ Alerts (Management)
│  ├─ Reports (Analytics)
│  ├─ Settings (Config)
│  └─ Profile (User)
│
├─ Security Dashboard
│  ├─ Live Monitoring (Main)
│  ├─ Camera Control
│  ├─ Alerts
│  ├─ Search & Timeline
│  └─ Profile
│
└─ Receptionist Portal
   ├─ Dashboard
   ├─ Visitor Management
   ├─ Employee Management
   ├─ Reports
   └─ Profile
```

---

## 📊 Data Displayed Per Page

```
DASHBOARD (Real-time):
├─ Current occupancy (number)
├─ Active cameras (count + status)
├─ Active alerts (count + severity)
├─ Recent detections (last 10)
├─ Visitor status (active count)
└─ Camera grid (live feeds)

EMPLOYEES:
├─ Employee list (pagination)
├─ Search/filter
├─ Register new form
├─ Employee details
├─ Edit form
└─ Bulk actions

VISITORS:
├─ Active visitors list
├─ Check-in form
├─ Check-out action
├─ Visitor details
├─ Badge printing
└─ History log

REPORTS:
├─ Attendance data (table)
├─ Visitor statistics
├─ Camera uptime
├─ Occupancy trends
└─ Export options

ALERTS:
├─ Active alerts (high priority)
├─ Alert history (searchable)
├─ Details per alert
└─ Resolution actions
```

---

**Document Version**: 1.0 (AWS Edition)  
**Last Updated**: May 2026  
**Status**: ✅ Design Complete - Ready for Implementation
