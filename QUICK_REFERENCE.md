# Quick Reference - Employee & Visitor Management

## File Locations

```
frontend/src/
├── pages/
│   ├── Employees.tsx          [NEW]
│   └── Visitors.tsx           [NEW]
├── components/
│   ├── employees/
│   │   ├── EmployeeForm.tsx
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeModal.tsx
│   │   └── EmployeeTimeline.tsx
│   └── visitors/
│       ├── VisitorCheckInForm.tsx
│       ├── VisitorList.tsx
│       ├── VisitorModal.tsx
│       └── VisitorTimeline.tsx
├── store/
│   ├── slices/
│   │   ├── employeeSlice.ts   [NEW]
│   │   ├── visitorSlice.ts    [NEW]
│   │   └── ...
│   └── store.ts               [UPDATED]
├── types/
│   ├── management.ts          [NEW]
│   └── ...
└── App.tsx                    [UPDATED]
```

## Routes

```
/employees  → Employee Management Page
/visitors   → Visitor Management Page
```

## Redux States

### Employee State
```typescript
{
  employees: Employee[]           // List of employees
  selectedEmployee: Employee | null
  loading: boolean
  error: string | null
  success: string | null
  total: number                   // Total count
  currentPage: number             // Pagination
  pageSize: number                // 10 per page
  searchTerm: string              // Search filter
  departmentFilter: string        // Department filter
}
```

### Visitor State
```typescript
{
  visitors: Visitor[]             // List of visitors
  selectedVisitor: Visitor | null
  loading: boolean
  error: string | null
  success: string | null
  total: number                   // Total count
  currentPage: number             // Pagination
  pageSize: number                // 10 per page
  searchTerm: string              // Search filter
  statusFilter: 'all' | 'checked_in' | 'checked_out' | 'expired'
}
```

## API Endpoints

### Employees
```
GET    /api/employees                    List with pagination
POST   /api/employees                    Register new
GET    /api/employees/{id}               Get details
PUT    /api/employees/{id}               Update
DELETE /api/employees/{id}               Delete
GET    /api/employees/departments        List departments
GET    /api/detections?person_id={id}    Timeline
```

### Visitors
```
GET    /api/visitors                     List with pagination
POST   /api/visitors/checkin             Check-in
PUT    /api/visitors/{id}/checkout       Check-out
PUT    /api/visitors/{id}/extend         Extend stay
GET    /api/visitors/{id}/timeline       Movement timeline
DELETE /api/visitors/{id}                Delete record
```

## Component Props

### EmployeeForm
- `onSubmit(data)` - Form submission handler
- `isLoading` - Loading state boolean
- `onCancel()` - Cancel callback

### EmployeeList
- `employees` - Employee array
- `isLoading` - Loading state
- `currentPage, pageSize, total` - Pagination
- `searchTerm, departmentFilter` - Filters
- `onPageChange(page)` - Pagination callback
- `onSearchChange(term)` - Search callback
- `onDepartmentFilterChange(dept)` - Filter callback
- `onRowClick(employee)` - Row click callback
- `onDeleteClick(employee)` - Delete callback
- `departments` - Departments array

### EmployeeModal
- `isOpen` - Modal visibility
- `employee` - Selected employee
- `onClose()` - Close callback
- `onEdit(employee)` - Edit callback
- `onDelete(employee)` - Delete callback
- `isLoading` - Loading state

### EmployeeTimeline
- `employeeId` - Employee ID
- `employeeName` - Employee name
- `onClose()` - Close callback

### VisitorCheckInForm
- `onSubmit(data)` - Form submission handler
- `isLoading` - Loading state
- `onCancel()` - Cancel callback
- `onSuccess(visitor)` - Success callback

### VisitorList
- `visitors` - Visitor array
- `isLoading` - Loading state
- `currentPage, pageSize, total` - Pagination
- `searchTerm, statusFilter` - Filters
- `onPageChange(page)` - Pagination callback
- `onSearchChange(term)` - Search callback
- `onStatusFilterChange(status)` - Status filter callback
- `onRowClick(visitor)` - Row click callback
- `onCheckOut(visitor)` - Check-out callback
- `onExtend(visitor)` - Extend callback

### VisitorModal
- `isOpen` - Modal visibility
- `visitor` - Selected visitor
- `onClose()` - Close callback
- `onCheckOut(visitor)` - Check-out callback
- `onExtend(visitor, hours)` - Extend callback
- `isDelete(visitor)` - Delete callback
- `isLoading` - Loading state

### VisitorTimeline
- `visitorId` - Visitor ID
- `visitorName` - Visitor name

## Redux Actions

### Employee Actions
```typescript
dispatch(fetchEmployeesStart())
dispatch(setCurrentPage(page))
dispatch(setSearchTerm(term))
dispatch(setDepartmentFilter(dept))
dispatch(selectEmployee(employee))
dispatch(clearSuccess())
dispatch(clearError())
dispatch(createEmployeeStart())
dispatch(deleteEmployeeStart())
```

### Visitor Actions
```typescript
dispatch(fetchVisitorsStart())
dispatch(setCurrentPage(page))
dispatch(setSearchTerm(term))
dispatch(setStatusFilter(status))
dispatch(selectVisitor(visitor))
dispatch(clearSuccess())
dispatch(clearError())
dispatch(checkInVisitorStart())
dispatch(checkOutVisitorStart())
dispatch(updateVisitorStart())
```

## Form Data Structures

### Employee Form Data
```typescript
{
  name: string              // Full name
  id: string                // Employee ID
  department: string        // Department
  email?: string            // Email address
  contact?: string          // Phone number
  status: 'active' | 'inactive' | 'on_leave'
  photo?: File              // Photo file
}
```

### Visitor Form Data
```typescript
{
  name: string              // Full name
  organization: string      // Organization
  purpose: string           // Visit purpose
  host: string              // Host name
  phone: string             // Phone number
  email: string             // Email
  expected_checkout?: string // Checkout time
  photo?: File              // Photo file
}
```

## Key Features Summary

### Employee Management
✅ Registration with photo
✅ Search by name/ID
✅ Filter by department
✅ Pagination
✅ View details
✅ Delete with confirmation
✅ Detection timeline
✅ Status tracking

### Visitor Management
✅ Check-in with photo
✅ Badge/QR generation
✅ Print badge
✅ Search and filter
✅ Check-out action
✅ Extend stay
✅ Movement timeline
✅ Duration tracking

## Common Patterns

### Fetch Data
```tsx
useEffect(() => {
  dispatch(fetchStart());
  try {
    const response = await fetch('/api/endpoint');
    dispatch(fetchSuccess(data));
  } catch (err) {
    dispatch(fetchError(err.message));
  }
}, [dependencies]);
```

### Handle Form Submit
```tsx
const handleSubmit = async (formData) => {
  dispatch(actionStart());
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    dispatch(actionSuccess(data));
  } catch (err) {
    dispatch(actionError(err.message));
  }
};
```

### Display Modal
```tsx
const [showModal, setShowModal] = useState(false);

<Button onClick={() => setShowModal(true)}>Open</Button>

<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  Content
</Modal>
```

### Pagination
```tsx
dispatch(setCurrentPage(page));
const totalPages = Math.ceil(total / pageSize);
```

## Styling Classes

### Status Badges
- `success` - Active status (green)
- `danger` - Inactive/Expired (red)
- `warning` - On leave (yellow)
- `secondary` - Checked out (gray)

### Card Backgrounds
- `bg-sky-50 dark:bg-sky-900/20` - Info boxes
- `bg-green-50 dark:bg-green-900/20` - Success boxes
- `bg-red-50 dark:bg-red-900/20` - Error boxes
- `bg-blue-50 dark:bg-blue-900/20` - Alert boxes

## Form Validation Rules

### Employee
- Name: Required, non-empty
- ID: Required, non-empty, unique
- Department: Required
- Email: Optional, must be valid format
- Contact: Optional
- Photo: Optional, max 5MB, image only

### Visitor
- Name: Required
- Phone: Required
- Organization: Required
- Purpose: Required
- Host: Required
- Email: Optional, must be valid format
- Photo: Optional, max 5MB, image only

## Error Handling

```tsx
if (error) {
  <Alert
    type="error"
    title="Error"
    message={error}
    onDismiss={() => dispatch(clearError())}
  />
}
```

## Loading States

```tsx
{loading ? (
  <Loading text="Loading..." />
) : (
  // Content
)}
```

## Responsive Breakpoints

- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large (1280px+)

## Dark Mode

All components use:
- `dark:` prefix for dark mode styles
- `text-gray-900 dark:text-white`
- `bg-white dark:bg-slate-800`
- `border-gray-200 dark:border-slate-700`

## Performance Tips

1. Use pagination for large datasets
2. Memoize expensive computations
3. Use proper dependency arrays
4. Clean up effects and listeners
5. Lazy load images where possible
6. Use virtualization for long lists

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers

## Accessibility

- All forms have associated labels
- Buttons have aria-label attributes
- Modals use aria-modal
- Color not the only indicator
- Keyboard navigation supported
- Dark mode supported
