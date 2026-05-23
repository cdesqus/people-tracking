# Layout Components - Quick Start Guide

## Installation & Setup

### 1. Install Lucide React Icons
```bash
npm install lucide-react
```

### 2. Verify Dependencies (Already Installed)
```bash
npm list react react-router-dom @reduxjs/toolkit tailwindcss
```

### 3. Start Development Server
```bash
npm start
```

The layout components will automatically render when you navigate to the app.

---

## Directory Structure

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx              ← Top navigation
│   │   ├── Sidebar.tsx             ← Side navigation
│   │   ├── Footer.tsx              ← Footer
│   │   ├── Layout.tsx              ← Main wrapper
│   │   └── index.ts                ← Exports
│   ├── ProtectedRoute.tsx           ← Route guard
│   └── ...
├── hooks/
│   ├── useAuth.ts                  ← Auth hook
│   ├── useSidebar.ts               ← Sidebar hook
│   ├── index.ts                    ← Exports
│   └── ...
├── store/
│   ├── slices/
│   │   ├── authSlice.ts            ← Auth state
│   │   └── ...
│   └── store.ts                    ← Store config
├── types/
│   └── index.ts                    ← Type definitions
└── App.tsx                         ← Already configured
```

---

## Key Files & Their Purpose

| File | Purpose | Lines |
|------|---------|-------|
| **Navbar.tsx** | Top navigation bar with profile | 250+ |
| **Sidebar.tsx** | Role-based menu navigation | 200+ |
| **Footer.tsx** | Footer with links & status | 180+ |
| **Layout.tsx** | Main layout wrapper | 60 |
| **useAuth.ts** | Auth & permission management | 80 |
| **useSidebar.ts** | Sidebar state control | 20 |
| **ProtectedRoute.tsx** | Route protection component | 50 |
| **authSlice.ts** | Redux auth state | 60 |

---

## Usage Examples

### Use the Layout (Already Configured)
```tsx
// App.tsx is already set up like this:
<Routes>
  <Route element={<Layout />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/cameras" element={<Cameras />} />
    {/* ...other routes */}
  </Route>
</Routes>
```

### Check User Authorization
```tsx
import { useAuth } from '@hooks/useAuth';

export function AdminPanel() {
  const { user, hasRole, hasPermission } = useAuth();

  if (!hasRole('admin')) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      Welcome {user?.full_name}!
      {hasPermission('manage:users') && <ManageUsers />}
    </div>
  );
}
```

### Protect Routes by Role
```tsx
import ProtectedRoute from '@components/ProtectedRoute';

<Route
  path="/settings"
  element={
    <ProtectedRoute requiredRoles={['admin']}>
      <Settings />
    </ProtectedRoute>
  }
/>
```

### Control Sidebar
```tsx
import { useSidebar } from '@hooks/useSidebar';

export function MyComponent() {
  const { sidebarOpen, toggle } = useSidebar();

  return (
    <button onClick={toggle}>
      Sidebar: {sidebarOpen ? 'Open' : 'Closed'}
    </button>
  );
}
```

---

## Testing the Layout

### Test at Different Screen Sizes
```bash
# Mobile (320px)
# Tablet (768px)
# Desktop (1024px)
# Wide (1920px)
```

### Test Different Roles
Change the role in `frontend/src/store/slices/authSlice.ts`:
```typescript
const initialState: AuthState = {
  user: {
    // ... change role to test different menus
    role: 'admin', // or 'manager', 'security', 'receptionist', 'operator', 'viewer'
  },
  // ...
};
```

### Test Profile Dropdown
Click the profile avatar in the navbar top-right

### Test Mobile Navigation
Shrink browser window to < 768px
Bottom navigation appears with 5 menu items

---

## Component Breakdown

### Navbar Features
- ✅ Logo & branding
- ✅ User profile dropdown with logout
- ✅ Notification bell
- ✅ Settings button
- ✅ Mobile hamburger menu
- ✅ Role-based avatar color

### Sidebar Features
- ✅ Role-based menu filtering
- ✅ Active page highlighting
- ✅ Alert badges
- ✅ Smooth transitions
- ✅ Desktop sidebar (left)
- ✅ Mobile bottom navigation

### Footer Features
- ✅ 4-section layout
- ✅ Quick links
- ✅ Support contact
- ✅ System status
- ✅ Version info
- ✅ Privacy/Terms links

### Layout Features
- ✅ Responsive grid
- ✅ Proper spacing
- ✅ Mobile overlay
- ✅ Scroll management
- ✅ Sticky navbar

---

## Role-Based Menu Items

```
ADMIN      → All 9 items
MANAGER    → Dashboard, Cameras, Employees, Visitors, Alerts, Analytics, Reports
OPERATOR   → Dashboard, Cameras, Alerts
SECURITY   → Dashboard, Cameras, Alerts
RECEPTIONIST → Dashboard, Employees, Visitors, Reports
VIEWER     → Dashboard
```

---

## Permissions by Role

### Admin
```
✓ view:all
✓ edit:all
✓ delete:all
✓ manage:users
✓ manage:settings
✓ view:reports
```

### Manager
```
✓ view:all
✓ edit:employees
✓ edit:visitors
✓ view:reports
```

### Operator
```
✓ view:cameras
✓ view:alerts
✓ edit:alerts
✓ view:detections
```

### Security
```
✓ view:cameras
✓ view:alerts
✓ view:detections
✓ view:timeline
```

### Receptionist
```
✓ manage:visitors
✓ manage:employees
✓ view:badges
✓ print:badges
```

### Viewer
```
✓ view:dashboard
✓ view:reports
```

---

## Redux State Structure

```typescript
// Auth State
state.auth = {
  user: {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: 'admin' | 'manager' | 'operator' | 'security' | 'receptionist' | 'viewer';
    created_at: string;
  },
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI State
state.ui = {
  sidebarOpen: boolean;
  // ... other UI settings
}
```

---

## Styling Reference

**Colors:**
- Primary Blue: #2563EB
- Dark BG: #0F172A (Slate-900)
- Light BG: #F9FAFB (Gray-50)
- Success: #10B981 (Green)
- Error: #EF4444 (Red)
- Warning: #F59E0B (Yellow)

**Responsive Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: >= 1024px

**Typography:**
- Headings: font-bold
- Body: text-sm, font-normal
- Labels: text-xs, font-medium

---

## Troubleshooting

### Icons Not Showing
```bash
npm install lucide-react
npm start
```

### Redux State Not Updating
- Check `store.ts` includes authReducer
- Verify authSlice actions are exported
- Check component imports are correct

### Sidebar Not Responsive
- Check Tailwind `lg:` breakpoint is 1024px
- Verify window resize listener in Layout
- Check CSS media queries in compiled CSS

### Profile Dropdown Not Working
- Verify useState is imported from React
- Check z-index values (should be z-50)
- Check click event handler is attached

### Mobile Navigation Not Showing
- Test in actual mobile browser (not just resize)
- Check bottom-navigation z-index
- Verify padding-bottom in main content area

---

## Next Steps

### For Backend Integration
1. Create `/pages/Login.tsx` for authentication
2. Connect to actual auth API
3. Store JWT token in localStorage
4. Implement token refresh logic
5. Create user profile endpoint

### For Feature Expansion
1. Create Employees CRUD pages
2. Create Visitor management pages
3. Create Reports/Analytics pages
4. Implement real-time camera feeds
5. Add notification center

### For Polish
1. Add loading skeletons
2. Add error boundaries
3. Add toast notifications
4. Implement dark mode toggle
5. Add keyboard shortcuts

---

## File Checklist

- [x] Navbar.tsx (250+ lines)
- [x] Sidebar.tsx (200+ lines)
- [x] Footer.tsx (180+ lines)
- [x] Layout.tsx (60 lines)
- [x] useAuth.ts (80 lines)
- [x] useSidebar.ts (20 lines)
- [x] ProtectedRoute.tsx (50 lines)
- [x] authSlice.ts (60 lines)
- [x] store.ts (updated)
- [x] types/index.ts (updated)
- [x] components/layout/index.ts
- [x] hooks/index.ts

---

## Quick Commands

```bash
# Install dependencies
npm install lucide-react

# Start development
npm start

# Build for production
npm build

# Run tests
npm test

# Check types
npm run type-check
```

---

## Support & Documentation

- **Full Guide:** `LAYOUT_COMPONENTS_GUIDE.md`
- **Completion Summary:** `TASK2_COMPLETION_SUMMARY.md`
- **This Quick Start:** `QUICK_START.md`

---

**Status:** ✅ Ready to Use
**Last Updated:** May 22, 2026
**Version:** 1.0.0
