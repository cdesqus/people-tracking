# Dashboard Quick Reference Guide

## File Locations

### Dashboard Page
```
frontend/src/pages/Dashboard.tsx
```

### Dashboard Components
```
frontend/src/components/dashboard/
├── DashboardOverview.tsx      # KPI cards
├── CameraGrid.tsx             # Camera grid
├── RecentDetections.tsx       # Detection table
├── AlertPanel.tsx             # Alert panel
└── index.ts                   # Exports
```

### Hooks
```
frontend/src/hooks/useDashboardData.ts
```

### Redux
```
frontend/src/store/slices/dashboardSlice.ts
```

### Types
```
frontend/src/types/dashboard.ts
```

### Utils
```
frontend/src/utils/formatTime.ts
```

---

## Common Tasks

### Add a New KPI Card
Edit `DashboardOverview.tsx` - add new card in grid:
```tsx
<Card>
  <div className="p-6">
    <p className="text-sm text-gray-600">New Metric</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
</Card>
```

### Update Camera Grid Size
In `Dashboard.tsx`:
```tsx
<CameraGrid
  cameras={cameraStatuses}
  maxCameras={24}  // Change this number
/>
```

### Add New WebSocket Message Type
In `useDashboardData.ts`, update `handleWebSocketMessage()`:
```tsx
case 'new_message_type':
  // Handle new message
  break;
```

### Change Real-Time Update Interval
In `Dashboard.tsx`:
```tsx
const { ... } = useDashboardData({
  kpiUpdateInterval: 10000,        // Change to 10 seconds
  detectionUpdateInterval: 20000,  // Change to 20 seconds
});
```

### Update KPI Calculation
In `Dashboard.tsx`, update the `useEffect` that sets `kpiStats`:
```tsx
useEffect(() => {
  const customValue = calculateCustomMetric(cameras, alerts);
  setKpiStats({
    ...kpiStats,
    customField: customValue,
  });
}, [cameras, alerts]);
```

### Add New Alert Severity Level
In `AlertPanel.tsx`, update `getSeverityColor()`:
```tsx
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'very_high':  // New level
      return 'orange';
    // ... rest
  }
};
```

### Customize Camera Card Display
Edit `CameraGrid.tsx` in the camera card rendering section:
```tsx
<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t">
  {/* Add custom fields here */}
</div>
```

### Modify Detection Table Columns
In `RecentDetections.tsx`, update the `columns` array:
```tsx
const columns = [
  // Add new column:
  {
    key: 'newField',
    label: 'New Column',
    sortable: true,
    render: (value) => <span>{value}</span>,
  },
];
```

### Add Pagination to Camera Grid
Update `CameraGrid.tsx`:
```tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 12;
const paginatedCameras = cameras.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

---

## Import Examples

### Import Dashboard Components
```tsx
import DashboardOverview from '@components/dashboard/DashboardOverview';
import { CameraGrid, RecentDetections, AlertPanel } from '@components/dashboard';
```

### Import Custom Hook
```tsx
import { useDashboardData } from '@hooks/useDashboardData';
```

### Import Types
```tsx
import { DashboardKPIs, CameraStatus } from '@types/dashboard';
```

### Import Redux
```tsx
import { useAppDispatch, useAppSelector } from '@store/store';
import { updateKPIs } from '@store/slices/dashboardSlice';
```

### Import Utilities
```tsx
import { formatRelativeTime, formatDateTime } from '@utils/formatTime';
```

---

## Component Props Cheat Sheet

### DashboardOverview
```tsx
<DashboardOverview
  occupancy={5}
  activeCameras={8}
  totalCameras={10}
  activeAlerts={2}
  currentVisitors={3}
  loading={false}
/>
```

### CameraGrid
```tsx
<CameraGrid
  cameras={cameraArray}
  loading={false}
  onCameraClick={(camera) => console.log(camera)}
  maxCameras={12}
/>
```

### RecentDetections
```tsx
<RecentDetections
  detections={faceArray}
  loading={false}
  onDetectionClick={(detection) => console.log(detection)}
/>
```

### AlertPanel
```tsx
<AlertPanel
  alerts={alertArray}
  loading={false}
  onAlertClick={(alert) => console.log(alert)}
  onAcknowledge={(alertId) => acknowledgeAlert(alertId)}
/>
```

---

## Redux Actions

### Dashboard Slice
```tsx
import {
  updateKPIs,
  wsConnected,
  wsDisconnected,
  setError,
  clearError,
} from '@store/slices/dashboardSlice';

// Usage
dispatch(updateKPIs({ occupancy: 10, activeCameras: 8 }));
dispatch(wsConnected());
dispatch(wsDisconnected());
dispatch(setError('Connection failed'));
dispatch(clearError());
```

### Camera Slice
```tsx
import { 
  fetchCamerasSuccess,
  updateCameraSuccess,
} from '@store/slices/cameraSlice';

dispatch(fetchCamerasSuccess({ cameras, total }));
dispatch(updateCameraSuccess(updatedCamera));
```

### Alert Slice
```tsx
import {
  fetchAlertsSuccess,
  addAlert,
  acknowledgeAlertSuccess,
} from '@store/slices/alertSlice';

dispatch(fetchAlertsSuccess({ alerts, total }));
dispatch(addAlert(newAlert));
dispatch(acknowledgeAlertSuccess(alertId));
```

---

## Time Formatting

```tsx
import { formatRelativeTime, formatDateTime, formatDate, formatTime } from '@utils/formatTime';

formatRelativeTime('2024-01-15T10:30:00Z')  // "2 minutes ago"
formatDateTime('2024-01-15T10:30:00Z')      // "1/15/2024, 10:30:00 AM"
formatDate('2024-01-15T10:30:00Z')          // "1/15/2024"
formatTime('2024-01-15T10:30:00Z')          // "10:30:00 AM"
```

---

## useEffect Patterns

### On Component Mount
```tsx
useEffect(() => {
  // Initialize dashboard
}, []);
```

### On Data Change
```tsx
useEffect(() => {
  // Update KPI cards
  setKpiStats({
    activeCameras: cameras.filter(c => c.isOnline).length,
  });
}, [cameras, alerts, faces]);
```

### Cleanup
```tsx
useEffect(() => {
  const timer = setInterval(() => {
    // Do something
  }, 5000);

  return () => clearInterval(timer);
}, []);
```

---

## Conditional Rendering

### Loading State
```tsx
{loading ? <Skeleton /> : <Content />}
```

### Empty State
```tsx
{items.length === 0 ? <EmptyMessage /> : <ItemsList />}
```

### Error State
```tsx
{error ? <Alert type="error" message={error} /> : null}
```

### Conditional Classes
```tsx
<div className={`
  ${isOnline ? 'bg-green-100' : 'bg-red-100'}
  ${isExpanded ? 'h-96' : 'h-64'}
`}>
```

---

## Tailwind Classes Reference

### Colors
```
bg-green-500   # Green background
text-red-600   # Red text
border-yellow-400  # Yellow border
bg-blue-50     # Light blue
```

### Responsive
```
md:col-span-2  # 2 columns on medium screens and up
lg:grid-cols-4 # 4 columns on large screens
hidden lg:block # Hide on small, show on large
```

### Animations
```
animate-pulse   # Pulsing animation
animate-spin    # Spinning animation
transition-all  # Smooth transitions
duration-300    # 300ms duration
hover:shadow-lg # Shadow on hover
```

### Spacing
```
p-6     # Padding 24px
gap-4   # Gap 16px
mt-2    # Margin-top 8px
mb-4    # Margin-bottom 16px
```

---

## Debugging Tips

### Check Redux State
```tsx
const debug = useAppSelector(state => {
  console.log('Redux state:', state);
  return state;
});
```

### Check WebSocket Messages
```tsx
// In useDashboardData.ts
wsRef.current.onmessage = (event) => {
  console.log('WebSocket message:', event.data);
  // ... rest
};
```

### Check Component Props
```tsx
const MyComponent = (props) => {
  console.log('Props:', props);
  return <div>...</div>;
};
```

### Check Render Count
```tsx
useEffect(() => {
  console.log('Component rendered');
}, []);
```

---

## Performance Tips

### Memoize Components
```tsx
export default React.memo(MyComponent);
```

### Memoize Callbacks
```tsx
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### Lazy Load
```tsx
const MyComponent = lazy(() => import('./MyComponent'));
```

### Reduce Re-renders
```tsx
// Use selector for specific state
const cameras = useAppSelector(state => state.cameras.cameras);
```

---

## Common Errors & Fixes

### WebSocket Won't Connect
- Check backend /ws/dashboard is running
- Check firewall allows WebSocket
- Check CORS headers

### Redux State Not Updating
- Verify action is dispatched
- Check reducer has the action case
- Check selector is using correct slice

### Components Not Rendering
- Check imports are correct
- Check all required props are passed
- Check conditional rendering logic

### Styling Not Applied
- Check Tailwind classes are correct
- Check dark: prefix for dark mode
- Run `npm run build` to see errors

---

## Useful Links

- Tailwind CSS: https://tailwindcss.com
- Redux Toolkit: https://redux-toolkit.js.org
- React Docs: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## Version Info

- React: 18+
- Redux Toolkit: 1.9+
- TypeScript: 5+
- Tailwind CSS: 3+

---

This reference guide covers the most common tasks and patterns used in the CCTV Dashboard. For more details, refer to the full documentation in DASHBOARD_IMPLEMENTATION.md.
