# Layout Components - Visual Overview

## Application Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        NAVBAR                               │
│  [Logo]        [Title]                [User ▼] [Logout]     │
│  [Menu]                    [Bell] [Settings]  [Avatar]       │
├──────────────┬─────────────────────────────────────────────┤
│              │                                              │
│  SIDEBAR     │              MAIN CONTENT                   │
│              │                                              │
│  [Dashboard] │  ┌────────────────────────────────────────┐ │
│  [Cameras]   │  │                                        │ │
│  [Employees] │  │    <Outlet /> - Page Content          │ │
│  [Visitors]  │  │                                        │ │
│  [Alerts]    │  │    (Dashboard, Cameras, Alerts, etc) │ │
│  [Analytics] │  │                                        │ │
│  [Reports]   │  │                                        │ │
│  [Security]  │  │                                        │ │
│  [Settings]  │  │                                        │ │
│              │  └────────────────────────────────────────┘ │
│              │                                              │
├──────────────┴─────────────────────────────────────────────┤
│                        FOOTER                               │
│  [About] [Links] [Support] [Status]                        │
│  © 2026 CCTV System • Version 1.0.0 • Contact Support     │
└─────────────────────────────────────────────────────────────┘

Desktop (>= 1024px): Sidebar visible on left
Tablet (768-1023px): Sidebar toggles
Mobile (< 768px): Sidebar hidden, bottom navigation appears
```

---

## Navbar Component Structure

```
NAVBAR (Sticky, Full Width)
├── Left Section
│   ├── [Menu] Toggle Button (Mobile only)
│   ├── [CC] Logo
│   └── "CCTV System" Title (Hidden on Mobile)
│
├── Center Section
│   └── "Face Recognition Dashboard" (Hidden on Mobile)
│
└── Right Section
    ├── [Bell Icon] Notification (Hidden on Mobile)
    ├── [Settings Icon] (Hidden on Mobile)
    ├── Profile Dropdown
    │   ├── Avatar with Role Color
    │   ├── User Name (Hidden on Mobile)
    │   ├── Role Label (Hidden on Mobile)
    │   └── [ChevronDown] Arrow
    │
    └── Mobile Menu Toggle (Mobile only)
        └── Mobile Menu (When open)
            ├── User Info Card
            ├── [Bell] Notifications
            ├── [Settings] Settings
            └── [LogOut] Logout (Red)

Profile Dropdown Menu
├── User Info Section
│   ├── Full Name
│   ├── Email
│   └── Role (capitalized)
├── Menu Items
│   ├── [User Icon] My Profile
│   └── [Settings Icon] Settings
└── Logout Section
    └── [LogOut Icon] Logout (Red text)
```

---

## Sidebar Component Structure

### Desktop Sidebar (Left, >= 1024px)
```
SIDEBAR (Width: 64px collapsed, 256px expanded)
├── Logo Section
│   ├── [CC] Logo Badge
│   └── "CCTV System v1.0" (When expanded)
│
├── Navigation Menu
│   ├── [Dashboard Icon] Dashboard ............ (All roles)
│   ├── [Camera Icon] Cameras ................ (Admin, Manager, Op, Security)
│   ├── [Users Icon] Employees .............. (Admin, Manager, Receptionist)
│   ├── [UserCheck Icon] Visitors ........... (Admin, Manager, Receptionist)
│   ├── [Alert Icon] Alerts [3] ............ (Admin, Manager, Op, Security) + Badge
│   ├── [BarChart Icon] Analytics .......... (Admin, Manager)
│   ├── [FileText Icon] Reports ............ (Admin, Manager, Receptionist)
│   ├── [ShieldAlert Icon] Security ....... (Admin only)
│   └── [Settings Icon] Settings ........... (Admin only)
│
│   Active Item Style: bg-blue-600, white text
│   Inactive Style: text-gray-400, hover:text-gray-200
│
└── Footer Section
    ├── Version Number v1.0.0 (When expanded)
    └── "All systems operational" (When expanded)
```

### Mobile Bottom Navigation (< 1024px)
```
BOTTOM NAVIGATION (Fixed, Full Width at bottom)
├── [Dashboard Icon] Dashboard
├── [Camera Icon] Cameras
├── [Alerts Icon] Alerts [3]
├── [BarChart Icon] Analytics
└── [Users Icon] More Menu

Visible: First 5 menu items only
Active Item: Blue text + underline
Inactive: Gray text
```

---

## Sidebar Menu Items (Role-Based)

```
┌──────────────────────────────────────────────────────┐
│ MENU ITEMS BY ROLE                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ADMIN (👤 Red Avatar)                              │
│  ✓ Dashboard                                         │
│  ✓ Cameras                                           │
│  ✓ Employees                                         │
│  ✓ Visitors                                          │
│  ✓ Alerts [3]                                        │
│  ✓ Analytics                                         │
│  ✓ Reports                                           │
│  ✓ Security                                          │
│  ✓ Settings                                          │
│  (9 items)                                           │
│                                                      │
│  MANAGER (👤 Blue Avatar)                           │
│  ✓ Dashboard                                         │
│  ✓ Cameras                                           │
│  ✓ Employees                                         │
│  ✓ Visitors                                          │
│  ✓ Alerts [3]                                        │
│  ✓ Analytics                                         │
│  ✓ Reports                                           │
│  (7 items)                                           │
│                                                      │
│  SECURITY (👤 Purple Avatar)                        │
│  ✓ Dashboard                                         │
│  ✓ Cameras                                           │
│  ✓ Alerts [3]                                        │
│  (3 items)                                           │
│                                                      │
│  RECEPTIONIST (👤 Orange Avatar)                    │
│  ✓ Dashboard                                         │
│  ✓ Employees                                         │
│  ✓ Visitors                                          │
│  ✓ Reports                                           │
│  (4 items)                                           │
│                                                      │
│  OPERATOR (👤 Green Avatar)                         │
│  ✓ Dashboard                                         │
│  ✓ Cameras                                           │
│  ✓ Alerts [3]                                        │
│  (3 items)                                           │
│                                                      │
│  VIEWER (👤 Gray Avatar)                            │
│  ✓ Dashboard                                         │
│  (1 item)                                            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Footer Component Structure

```
FOOTER (Dark gradient background, Full Width)
├── Section 1: About
│   ├── [Info Icon] "About"
│   └── Description text
│
├── Section 2: Quick Links
│   ├── [ExternalLink] Documentation
│   ├── [HelpCircle] Support
│   └── [ExternalLink] System Status
│
├── Section 3: Support
│   ├── [Mail Icon] support@cctv.local
│   ├── Help Center link
│   └── FAQ link
│
└── Section 4: Status
    ├── [Green Dot] All Systems Online
    ├── API: Operational
    └── Database: Connected

DIVIDER ───────────────────────────

Middle Section (3 columns)
├── Version v1.0.0
├── © 2026 CCTV System. All rights reserved.
└── Last Updated: May 22, 2026

DIVIDER ───────────────────────────

Bottom Links (2 columns)
├── Privacy Policy | Terms of Service | Cookie Policy
└── Need help? Contact Support

BOTTOM BAR
└── Powered by AWS Rekognition | Enterprise Surveillance Platform
```

---

## Responsive Breakpoints

### Mobile (< 768px)
```
┌─────────────────┐
│  NAVBAR         │  Height: auto, no hamburger collapse
│  [Menu] TITLE   │
│  [Dropdown]     │
├─────────────────┤
│                 │
│  MAIN CONTENT   │  Full width, no sidebar
│  [Outlet]       │  Padding bottom for nav (80px)
│                 │
│                 │
│                 │
└─────────────────┤
│  FOOTER (Scroll)│  Appears above bottom nav
├─────────────────┤
│  BOTTOM NAV     │  Fixed at bottom
│ [Home][Cam][... │  5 items, height: 80px
└─────────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────────────────┐
│         NAVBAR                   │
│ [Menu] [Logo] [Title] [User] [Log│
├────┬──────────────────────────────┤
│    │                              │
│ SB │      MAIN CONTENT            │
│ D  │      [Outlet]                │
│ B  │                              │
│ R  │                              │
├────┴──────────────────────────────┤
│         FOOTER                    │
├────────────────────────────────────│
│    BOTTOM NAV (5 items)           │ 
│ [Home][Cam][Alert][Analytics][?] │
└────────────────────────────────────┘

Sidebar can toggle/collapse
```

### Desktop (>= 1024px)
```
┌───────────────────────────────────────────┐
│                 NAVBAR                    │
│  [Logo] [Title]     [Bell][Settings][User│
├──────┬────────────────────────────────────┤
│      │                                    │
│      │      MAIN CONTENT                  │
│  SDB │      [Outlet]                      │
│      │                                    │
│  S   │                                    │
│  D   │                                    │
│  B   │                                    │
│      │                                    │
│  A   │                                    │
│  C   │                                    │
│  T   │                                    │
│  I   │                                    │
│  V   │                                    │
│  E   │                                    │
│      │                                    │
├──────┴────────────────────────────────────┤
│             FOOTER                        │
│  About | Links | Support | Status        │
│  Copyright Info                          │
└───────────────────────────────────────────┘

Full sidebar always visible
No bottom navigation
```

---

## User Profile Avatar Colors by Role

```
┌─────────────────────────────────────────┐
│ ROLE COLOR SCHEME                       │
├─────────────────────────────────────────┤
│                                         │
│  [AD] Admin       → Red      (#DC2626) │
│  [MJ] Manager     → Blue     (#2563EB) │
│  [OP] Operator    → Green    (#10B981) │
│  [SC] Security    → Purple   (#8B5CF6) │
│  [RR] Receptionist→ Orange   (#EA580C) │
│  [VW] Viewer      → Gray     (#6B7280) │
│                                         │
│  All avatars:                           │
│  - 40px x 40px (navbar)                │
│  - 36px x 36px (sidebar)                │
│  - Rounded corners                      │
│  - White text with initials             │
│  - Bold font                            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Color Palette

```
┌─────────────────────────────────────────┐
│ DESIGN COLORS                           │
├─────────────────────────────────────────┤
│                                         │
│  PRIMARY ACTIONS                        │
│  ■ Blue           #2563EB               │
│  ■ Blue (hover)   #1D4ED8               │
│                                         │
│  BACKGROUND                             │
│  ■ Navbar         Slate-900 → Slate-800│
│  ■ Sidebar        Slate-900             │
│  ■ Content        Gray-50               │
│  ■ Footer         Slate-900 → Slate-800│
│                                         │
│  TEXT                                   │
│  ■ Light mode     Gray-900              │
│  ■ Dark mode      Gray-100              │
│  ■ Secondary      Gray-600              │
│  ■ Disabled       Gray-400              │
│                                         │
│  STATUS                                 │
│  ■ Success        Green     #10B981     │
│  ■ Error          Red       #EF4444     │
│  ■ Warning        Yellow    #F59E0B     │
│  ■ Info           Blue      #3B82F6     │
│                                         │
│  ROLE AVATARS                           │
│  ■ Admin          Red       #DC2626     │
│  ■ Manager        Blue      #2563EB     │
│  ■ Operator       Green     #10B981     │
│  ■ Security       Purple    #8B5CF6     │
│  ■ Receptionist   Orange    #EA580C     │
│  ■ Viewer         Gray      #6B7280     │
│                                         │
└─────────────────────────────────────────┘
```

---

## Typography Hierarchy

```
┌─────────────────────────────────────────┐
│ FONT SIZES & WEIGHTS                    │
├─────────────────────────────────────────┤
│                                         │
│  Logo Text          16px Bold            │
│  Page Title         20-24px Bold         │
│  Section Header     16px Semibold        │
│  Menu Labels        14px Medium          │
│  Body Text          14px Normal          │
│  Secondary Text     12px Normal          │
│  Small Labels       12px Medium          │
│  Tiny Text          10px Normal (IDs)    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Interactive States

```
BUTTON STATES:

[Default]           [Hover]             [Active/Focus]
Normal styling  →   Darker BG       →   Selected color
Gray-300 text       Gray-200 text       Blue-600 bg

DROPDOWN STATES:

[Closed]            [Open]              [Item Hover]
ChevronDown ↓   →   ChevronDown ↑   →   Hover color
Closed menu         Shows menu           Highlight item

LINK STATES:

[Default]           [Hover]             [Active]
Gray-400        →   Blue-400        →   Blue-600
Underline on hover  Underline           Underline

SIDEBAR ITEM STATES:

[Inactive]          [Hover]             [Active]
Gray-400        →   Gray-200        →   Blue-600 bg
No background       Dark BG             White text
```

---

## Animations & Transitions

```
Component              Duration    Type         Effect
──────────────────────────────────────────────────────
Sidebar collapse       300ms       ease-in-out  Width change
Menu item hover        200ms       ease         Background
Dropdown open/close    200ms       ease         Opacity
Modal overlay          300ms       ease         Fade
Alert badge pulse      Infinite    pulse        Pulsing dot
Avatar initials        200ms       ease         Scale on hover
Transition examples    300ms       ease-all     All properties
```

---

## Accessibility Features

```
┌─────────────────────────────────────────┐
│ ACCESSIBILITY FEATURES                  │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Semantic HTML elements               │
│  ✓ ARIA labels on interactive elements  │
│  ✓ Proper heading hierarchy (h1-h6)     │
│  ✓ Focus indicators on buttons           │
│  ✓ Keyboard navigation support          │
│  ✓ Touch-friendly tap targets (48px)    │
│  ✓ Sufficient color contrast (WCAG AA)  │
│  ✓ Alt text for icons (title attribute) │
│  ✓ Skip to main content link ready      │
│  ✓ Mobile viewport meta tag             │
│                                         │
└─────────────────────────────────────────┘
```

---

## File Organization Diagram

```
frontend/src/
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           ← Top navigation
│   │   ├── Sidebar.tsx          ← Side menu
│   │   ├── Footer.tsx           ← Footer
│   │   ├── Layout.tsx           ← Wrapper
│   │   └── index.ts             ← Exports
│   │
│   ├── ProtectedRoute.tsx       ← Route guard
│   └── ... (other components)
│
├── hooks/
│   ├── useAuth.ts              ← Auth management
│   ├── useSidebar.ts           ← Sidebar state
│   ├── index.ts                ← Exports
│   └── ... (other hooks)
│
├── store/
│   ├── slices/
│   │   ├── authSlice.ts        ← Auth Redux
│   │   └── ... (other slices)
│   └── store.ts                ← Store config
│
├── types/
│   └── index.ts                ← Type defs
│
├── pages/
│   ├── Dashboard.tsx
│   ├── Cameras.tsx
│   └── ... (other pages)
│
└── App.tsx                     ← Entry point
```

---

## Data Flow Diagram

```
USER LOGIN
    ↓
[Login Page]
    ↓
API Request → [Backend Auth]
    ↓
dispatch(setUser())
    ↓
authSlice.user = userData
    ↓
[useAuth() Hook]
    ↓
Components read state:
├─ Navbar → Shows user info
├─ Sidebar → Filters menu
└─ ProtectedRoute → Checks role
    ↓
[Layout Renders with correct UI]
    ↓
User can navigate app
    ↓
dispatch(logout())
    ↓
Clear auth state
    ↓
Redirect to /login
```

---

## Permission Matrix

```
╔════════════╦═════╦═════════╦═══════╦════════════╦═════════════╦═══════╗
║ Permission ║ Admin║Manager  ║ Ops   ║ Security  ║ Receptionist║ Viewer║
╠════════════╬═════╬═════════╬═══════╬════════════╬═════════════╬═══════╣
║ view:all   ║  ✓  ║    ✓    ║   -   ║     -     ║      -      ║   -   ║
║ edit:all   ║  ✓  ║    -    ║   -   ║     -     ║      -      ║   -   ║
║ delete:all ║  ✓  ║    -    ║   -   ║     -     ║      -      ║   -   ║
║ manage:users   ║  ✓  ║    -    ║   -   ║     -     ║      -      ║   -   ║
║ manage:settings║  ✓  ║    -    ║   -   ║     -     ║      -      ║   -   ║
║ view:reports   ║  ✓  ║    ✓    ║   -   ║     -     ║      ✓      ║   ✓   ║
║ edit:employees ║  ✓  ║    ✓    ║   -   ║     -     ║      -      ║   -   ║
║ edit:visitors  ║  ✓  ║    ✓    ║   -   ║     -     ║      -      ║   -   ║
║ view:cameras   ║  ✓  ║    ✓    ║   ✓   ║     ✓     ║      -      ║   -   ║
║ view:alerts    ║  ✓  ║    ✓    ║   ✓   ║     ✓     ║      -      ║   -   ║
║ edit:alerts    ║  ✓  ║    -    ║   ✓   ║     -     ║      -      ║   -   ║
║ view:detections║  ✓  ║    ✓    ║   ✓   ║     ✓     ║      -      ║   -   ║
║ view:timeline  ║  ✓  ║    ✓    ║   -   ║     ✓     ║      -      ║   -   ║
║ manage:visitors║  ✓  ║    -    ║   -   ║     -     ║      ✓      ║   -   ║
║ manage:employees║ ✓  ║    -    ║   -   ║     -     ║      ✓      ║   -   ║
║ view:badges    ║  ✓  ║    -    ║   -   ║     -     ║      ✓      ║   -   ║
║ print:badges   ║  ✓  ║    -    ║   -   ║     -     ║      ✓      ║   -   ║
╚════════════╩═════╩═════════╩═══════╩════════════╩═════════════╩═══════╝
```

---

**Visual Layout Documentation Complete**
**Last Updated:** May 22, 2026
