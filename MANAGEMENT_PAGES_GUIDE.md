# Employee & Visitor Management Pages - Implementation Guide

## Overview

Complete implementation of two comprehensive management pages for the CCTV system:
- **Employee Management Page** - Register, manage, and track employees
- **Visitor Management Page** - Check-in/check-out visitors and track movements

## File Structure

### Redux Store
- `frontend/src/store/slices/employeeSlice.ts` - Employee state management
- `frontend/src/store/slices/visitorSlice.ts` - Visitor state management
- `frontend/src/store/store.ts` - Updated with new slices

### Types
- `frontend/src/types/management.ts` - TypeScript interfaces for employees and visitors

### Employee Components
- `frontend/src/pages/Employees.tsx` - Main employee management page
- `frontend/src/components/employees/EmployeeForm.tsx` - Registration form with photo upload
- `frontend/src/components/employees/EmployeeList.tsx` - Searchable, filterable employee list
- `frontend/src/components/employees/EmployeeModal.tsx` - Employee details with edit/delete
- `frontend/src/components/employees/EmployeeTimeline.tsx` - Detection history timeline

### Visitor Components
- `frontend/src/pages/Visitors.tsx` - Main visitor management page
- `frontend/src/components/visitors/VisitorCheckInForm.tsx` - Check-in form with badge generation
- `frontend/src/components/visitors/VisitorList.tsx` - Active visitors with check-out/extend
- `frontend/src/components/visitors/VisitorModal.tsx` - Visitor details and actions
- `frontend/src/components/visitors/VisitorTimeline.tsx` - Movement tracking timeline

## Features

### Employee Management

#### Employee List
- ✅ Table with ID, Name, Department, Status, Actions columns
- ✅ Pagination (10 rows/page)
- ✅ Search by name or ID
- ✅ Filter by department
- ✅ Sort columns
- ✅ Photo thumbnails
- ✅ Last detection timestamp
- ✅ Real-time status updates

#### Register New Employee
- ✅ Form with Name, ID, Department, Email, Contact, Status
- ✅ Photo capture/upload with preview
- ✅ Form validation
- ✅ API POST to `/api/employees`
- ✅ Success toast notification
- ✅ File upload limit (5MB)

#### Employee Details Modal
- ✅ Name, ID, Department, Photo, Status
- ✅ Email and contact information
- ✅ Last detected time and location
- ✅ Edit button (for future implementation)
- ✅ Delete button with confirmation
- ✅ View timeline of detections

#### Detection Timeline
- ✅ Chronological list of all detections
- ✅ Camera, location, timestamp for each detection
- ✅ Confidence scores displayed as progress bars
- ✅ Date range filtering
- ✅ Statistics: total detections, unique locations, average confidence

### Visitor Management

#### Active Visitors List
- ✅ Real-time table with Name, Organization, Host, Check-in, Duration, Status
- ✅ Pagination with quick jumper
- ✅ Search functionality
- ✅ Status filtering (checked-in, checked-out, expired)
- ✅ Check-out button for active visitors
- ✅ Extend validity button
- ✅ View details button
- ✅ Duration calculation in real-time

#### Visitor Check-In Form
- ✅ Form: Name, Organization, Purpose, Host, Phone, Email, Photo
- ✅ Expected checkout datetime
- ✅ Photo preview
- ✅ API POST to `/api/visitors/checkin`
- ✅ Badge/QR code generation and display
- ✅ Print badge functionality
- ✅ Success confirmation with visitor details
- ✅ Form validation

#### Visitor Details Modal
- ✅ Full visitor information display
- ✅ QR code display
- ✅ Real-time current location
- ✅ Check-out action
- ✅ Extend stay with hours input
- ✅ Movement timeline tab
- ✅ Duration tracking

#### Visitor Movement Timeline
- ✅ All recorded locations and movements
- ✅ Event types: check-in, movement, check-out
- ✅ Camera and timestamp information
- ✅ Color-coded badges for event types
- ✅ Summary statistics

## Data Models

### Employee
```typescript
{
  id: string;
  name: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  photo_url?: string;
  badge_id?: string;
  contact?: string;
  email?: string;
  last_detected?: string;
  current_location?: string;
  created_at: string;
  updated_at: string;
}
```

### Visitor
```typescript
{
  id: string;
  name: string;
  organization: string;
  purpose: string;
  host: string;
  phone: string;
  email: string;
  photo_url?: string;
  check_in_time: string;
  check_out_time?: string;
  expected_checkout?: string;
  status: 'checked_in' | 'checked_out' | 'expired';
  current_location?: string;
  badge_number?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}
```

## API Endpoints Required

### Employee Endpoints
- `GET /api/employees` - List employees with pagination
- `POST /api/employees` - Register new employee
- `GET /api/employees/{id}` - Get employee details
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/departments` - Get list of departments
- `GET /api/detections?person_id={id}` - Get employee detection history

### Visitor Endpoints
- `GET /api/visitors` - List visitors with pagination
- `POST /api/visitors/checkin` - Check-in visitor
- `PUT /api/visitors/{id}/checkout` - Check-out visitor
- `PUT /api/visitors/{id}/extend` - Extend visitor stay
- `GET /api/visitors/{id}/timeline` - Get visitor movement timeline
- `DELETE /api/visitors/{id}` - Delete visitor record

## State Management (Redux)

### employeeSlice
- `fetchEmployeesStart/Success/Error` - Fetch employees
- `createEmployeeStart/Success/Error` - Register new employee
- `updateEmployeeStart/Success/Error` - Update employee
- `deleteEmployeeStart/Success/Error` - Delete employee
- `selectEmployee` - Select employee for modal
- `setCurrentPage` - Pagination control
- `setSearchTerm` - Search filter
- `setDepartmentFilter` - Department filter
- `updateEmployeeRealtime` - WebSocket updates

### visitorSlice
- `fetchVisitorsStart/Success/Error` - Fetch visitors
- `checkInVisitorStart/Success/Error` - Check-in visitor
- `checkOutVisitorStart/Success/Error` - Check-out visitor
- `updateVisitorStart/Success/Error` - Update visitor
- `selectVisitor` - Select visitor for modal
- `setCurrentPage` - Pagination control
- `setSearchTerm` - Search filter
- `setStatusFilter` - Status filter
- `updateVisitorRealtime` - WebSocket updates

## Components Integration

### Common Components Used
- `Table` - Data display with sorting
- `Card` - Container component
- `Button` - Action buttons with states
- `Modal` - Details and confirmations
- `Input` - Form inputs
- `Select` - Dropdowns
- `FileUpload` - Photo uploads
- `Pagination` - Page navigation
- `Badge` - Status indicators
- `Tabs` - Tab navigation
- `Alert` - Success/error messages

## Routes

- `/employees` - Employee management page
- `/visitors` - Visitor management page

## Key Features

### Form Validation
- Required field validation
- Email format validation
- File size limits (5MB for photos)
- Date/time validation

### Real-Time Updates
- WebSocket integration ready
- Auto-refresh on data changes
- Real-time duration calculation

### UX/DX Features
- Auto-dismiss success/error messages (3 seconds)
- Photo previews before upload
- Print badge functionality
- Quick search and filtering
- Responsive design
- Dark mode support

### Data Management
- Pagination with configurable page size
- Search across multiple fields
- Multi-column filtering
- Sorting capabilities
- Confirmation dialogs for destructive actions

## Implementation Notes

1. **Photo Upload Handling**
   - Uses FormData for multipart form submissions
   - Supports image preview before upload
   - Validates file size (5MB max)

2. **Timeline Displays**
   - Visual timeline with chronological ordering
   - Color-coded events
   - Confidence/accuracy indicators
   - Summary statistics

3. **Badge Generation**
   - QR codes for visitor badges
   - Badge number assignment
   - Print-friendly format

4. **Error Handling**
   - API error messages displayed to user
   - Form validation feedback
   - Network error recovery
   - Loading states on all async operations

5. **Performance Optimization**
   - Pagination to limit data loading
   - Memoized components where needed
   - Efficient state updates
   - Lazy-loaded timelines

## Future Enhancements

1. **Bulk Operations**
   - Bulk employee registration
   - Bulk visitor check-out
   - Export to CSV/PDF

2. **Advanced Features**
   - Visitor notifications/reminders
   - Access control integration
   - Threat level assessment
   - Anomaly detection

3. **Reporting**
   - Daily visitor logs
   - Employee attendance reports
   - Heat maps of movement
   - Compliance reports

4. **Integrations**
   - Email notifications on check-in/out
   - SMS alerts for expired visitors
   - Calendar integrations
   - Database sync

## Testing Checklist

- [ ] Employee registration with photo
- [ ] Employee search and filtering
- [ ] Employee deletion with confirmation
- [ ] Employee timeline display
- [ ] Visitor check-in with badge
- [ ] Visitor check-out
- [ ] Visitor stay extension
- [ ] Visitor timeline display
- [ ] Pagination navigation
- [ ] Form validation
- [ ] Error message display
- [ ] Responsive design on mobile
- [ ] Dark mode styling
- [ ] API error handling

## Troubleshooting

### Images not loading
- Verify photo_url and qr_code fields in API response
- Check CORS settings on image server
- Ensure photo upload endpoint returns correct URL

### Timeline not showing
- Verify `/api/detections` endpoint returns correct format
- Check date filtering parameters
- Ensure person_id/visitor_id is correct

### Badge print not working
- Check QR code generation in check-in response
- Verify browser print settings
- Test in different browsers

### Form submission failing
- Check API endpoint availability
- Verify FormData construction for file uploads
- Check Content-Type headers
- Review network tab for errors
