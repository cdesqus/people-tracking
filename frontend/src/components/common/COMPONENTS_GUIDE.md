# CCTV Dashboard - Common UI Components Library

A comprehensive, production-ready component library built with React, TypeScript, and Tailwind CSS. All components are fully typed, accessible, and ready to use immediately.

## Quick Start

```tsx
import { Button, Card, Alert, Modal } from '@/components/common';

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card title="Settings" subtitle="Configure your preferences">
      <Alert type="success" message="Changes saved!" dismissible />
      
      <Button 
        variant="primary" 
        onClick={() => setIsOpen(true)}
      >
        Open Settings
      </Button>

      <Modal isOpen={isOpen} title="Settings" onClose={() => setIsOpen(false)}>
        <p>Your settings here</p>
      </Modal>
    </Card>
  );
}
```

---

## Component Catalog

### 1. Button

Flexible button with variants, sizes, and states.

**Variants:** `primary` | `secondary` | `danger` | `success`
**Sizes:** `sm` | `md` | `lg`

```tsx
import { Button } from '@/components/common';

// Basic
<Button onClick={handleClick}>Click me</Button>

// With variant and size
<Button variant="danger" size="lg">Delete</Button>

// Loading state
<Button isLoading>Saving...</Button>

// With icons
<Button leftIcon={<SaveIcon />}>Save</Button>

// Full width
<Button fullWidth>Wide Button</Button>

// Disabled
<Button disabled>Disabled</Button>
```

---

### 2. Input

Text input with label, validation, and icon support.

**Sizes:** `sm` | `md` | `lg`

```tsx
import { Input } from '@/components/common';

// Basic
<Input 
  placeholder="Enter text"
  value={text}
  onChange={(e) => setText(e.target.value)}
/>

// With label
<Input 
  label="Username"
  placeholder="Enter username"
/>

// With validation
<Input
  label="Email"
  type="email"
  error={errors.email}
  hasError={!!errors.email}
/>

// With icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search cameras..."
/>

// Helper text
<Input
  label="Password"
  type="password"
  helperText="Must be at least 8 characters"
/>
```

---

### 3. Select

Dropdown with grouping, search, and multi-select.

```tsx
import { Select } from '@/components/common';

// Basic
<Select
  label="Camera"
  options={[
    { value: 'cam1', label: 'Camera 1' },
    { value: 'cam2', label: 'Camera 2' }
  ]}
  value={selectedCamera}
  onChange={setSelectedCamera}
/>

// With grouping
<Select
  options={[
    {
      label: 'Active',
      options: [
        { value: 'cam1', label: 'Camera 1' },
        { value: 'cam2', label: 'Camera 2' }
      ]
    },
    {
      label: 'Inactive',
      options: [
        { value: 'cam3', label: 'Camera 3' }
      ]
    }
  ]}
/>

// Searchable
<Select searchable options={options} />

// Multi-select
<Select isMulti options={options} />

// Loading
<Select isLoading options={options} />
```

---

### 4. Card

Container component with header, title, and actions.

**Padding:** `sm` | `md` | `lg` | `none`
**Shadow:** `none` | `sm` | `md` | `lg`

```tsx
import { Card } from '@/components/common';

// Basic
<Card>
  <p>Card content</p>
</Card>

// With title and subtitle
<Card title="Camera Feed" subtitle="Main Entrance">
  <video src={stream} />
</Card>

// With actions
<Card
  title="Detection"
  actions={<Button size="sm">Edit</Button>}
>
  Detection data here
</Card>

// Clickable card
<Card
  title="Alert"
  clickable
  onClick={() => navigate(`/alerts/${alert.id}`)}
>
  {alert.message}
</Card>

// Custom padding and shadow
<Card padding="lg" shadow="lg">
  Important content
</Card>
```

---

### 5. Alert

Dismissible alert with 4 types.

**Types:** `error` | `warning` | `success` | `info`

```tsx
import { Alert } from '@/components/common';

// Basic success
<Alert type="success" message="Operation completed!" />

// With title
<Alert
  type="error"
  title="Connection Error"
  message="Failed to connect to camera"
/>

// Dismissible
<Alert
  type="warning"
  message="Camera offline"
  dismissible
  onDismiss={() => clearWarning()}
/>

// Auto-dismiss (5 seconds)
<Alert
  type="info"
  message="New alert received"
  autoDismiss={5000}
  onDismiss={handleDismiss}
/>
```

---

### 6. Modal

Dialog/popup with customizable content.

**Sizes:** `sm` | `md` | `lg` | `xl`

```tsx
import { Modal, Button } from '@/components/common';

const [isOpen, setIsOpen] = useState(false);

// Basic
<Modal
  isOpen={isOpen}
  title="Confirm Action"
  onClose={() => setIsOpen(false)}
>
  <p>Are you sure?</p>
</Modal>

// With footer actions
<Modal
  isOpen={isOpen}
  title="Delete Camera"
  onClose={() => setIsOpen(false)}
  footer={
    <>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    </>
  }
>
  <p>This action cannot be undone.</p>
</Modal>

// Large modal
<Modal
  isOpen={isOpen}
  title="Settings"
  size="lg"
  onClose={() => setIsOpen(false)}
>
  <SettingsForm />
</Modal>

// Custom header
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  header={<CustomHeader />}
>
  Content here
</Modal>
```

---

### 7. Loading

Spinner, skeleton, and progress bar variants.

**Variants:** `spinner` | `skeleton` | `progress`

```tsx
import { Loading } from '@/components/common';

// Spinner
<Loading text="Loading data..." />

// Skeleton screen
<Loading variant="skeleton" />

// Progress bar
<Loading
  variant="progress"
  progress={65}
/>

// Custom size
<Loading size={60} />
```

---

### 8. Toast

Notification popup with auto-dismiss.

**Types:** `success` | `error` | `info` | `warning`

```tsx
import { Toast, ToastContainer } from '@/components/common';

const [toasts, setToasts] = useState<ToastProps[]>([]);

const addToast = (toast: Omit<ToastProps, 'id' | 'onDismiss'>) => {
  const id = Date.now().toString();
  setToasts(prev => [...prev, { 
    ...toast, 
    id,
    onDismiss: (id) => setToasts(prev => prev.filter(t => t.id !== id))
  }]);
};

// Render in your app
<ToastContainer
  toasts={toasts}
  onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
/>

// Usage
addToast({
  type: 'success',
  title: 'Success',
  message: 'Changes saved',
  duration: 3000
});

// With action
addToast({
  type: 'info',
  message: 'New alerts available',
  action: { 
    label: 'View',
    onClick: () => navigate('/alerts')
  }
});
```

---

### 9. Table

Data table with sorting and custom rendering.

```tsx
import { Table } from '@/components/common';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Camera Name', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    render: (value) => <Badge color={value === 'active' ? 'green' : 'red'}>{value}</Badge>
  }
];

<Table
  columns={columns}
  data={cameras}
  striped
  hoverable
  onRowClick={(camera) => navigate(`/camera/${camera.id}`)}
  onSort={(key, direction) => handleSort(key, direction)}
/>
```

---

### 10. Badge

Status indicator with color variants.

**Colors:** `green` | `red` | `yellow` | `blue` | `gray`
**Sizes:** `sm` | `md` | `lg`

```tsx
import { Badge } from '@/components/common';

// Status indicators
<Badge color="green">Online</Badge>
<Badge color="red">Offline</Badge>
<Badge color="yellow">Warning</Badge>

// Different sizes
<Badge size="sm">Small</Badge>
<Badge size="lg">Large</Badge>
```

---

### 11. Checkbox

Checkbox input with toggle variant.

```tsx
import { Checkbox } from '@/components/common';

// Standard checkbox
<Checkbox
  label="Remember me"
  checked={remember}
  onChange={(e) => setRemember(e.target.checked)}
/>

// Toggle switch
<Checkbox
  toggle
  label="Enable notifications"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>

// With error
<Checkbox
  label="Agree to terms"
  error={errors.terms}
/>
```

---

### 12. RadioGroup

Radio button group for single selection.

```tsx
import { RadioGroup } from '@/components/common';

<RadioGroup
  name="status"
  label="Camera Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'error', label: 'Error', disabled: true }
  ]}
  value={status}
  onChange={setStatus}
/>

// Horizontal layout with descriptions
<RadioGroup
  name="priority"
  vertical={false}
  options={[
    { value: 'high', label: 'High', description: 'Urgent' },
    { value: 'low', label: 'Low', description: 'Can wait' }
  ]}
/>
```

---

### 13. DatePicker

Date input with optional range selection.

```tsx
import { DatePicker } from '@/components/common';

// Basic
<DatePicker
  label="Date"
  value={date}
  onChange={setDate}
/>

// With min/max
<DatePicker
  label="Detection Date"
  value={date}
  onChange={setDate}
  min={new Date('2024-01-01')}
  max={new Date()}
/>

// Range picker (use two instances)
<DatePicker
  label="Start Date"
  value={startDate}
  onChange={setStartDate}
  range
/>
```

---

### 14. FileUpload

File picker with preview and validation.

```tsx
import { FileUpload } from '@/components/common';

<FileUpload
  label="Upload Camera Photo"
  accept="image/*"
  maxSize={5 * 1024 * 1024} // 5MB
  preview
  onFileChange={setFile}
/>

// Multiple files
<FileUpload
  label="Upload Multiple"
  multiple
  accept=".jpg,.png"
/>
```

---

### 15. Dropdown

Context menu style dropdown.

```tsx
import { Dropdown, Button } from '@/components/common';

<Dropdown
  trigger={<Button>Actions</Button>}
  items={[
    { 
      id: '1', 
      label: 'Edit', 
      onClick: handleEdit 
    },
    { 
      id: '2', 
      label: 'Delete', 
      onClick: handleDelete 
    },
    { id: '3', divider: true },
    { 
      id: '4', 
      label: 'Archive', 
      onClick: handleArchive,
      disabled: true 
    }
  ]}
  align="right"
/>
```

---

### 16. Tabs

Tab navigation with multiple content panels.

**Variants:** `line` | `pill` | `card`

```tsx
import { Tabs } from '@/components/common';

const [activeTab, setActiveTab] = useState('cameras');

<Tabs
  tabs={[
    { id: 'cameras', label: 'Cameras', content: <CameraList /> },
    { id: 'alerts', label: 'Alerts', content: <AlertList /> },
    { id: 'settings', label: 'Settings', content: <Settings /> }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// Pill variant with icons
<Tabs
  variant="pill"
  tabs={[
    { id: '1', label: 'Active', icon: <CheckIcon />, content: <Active /> },
    { id: '2', label: 'Inactive', content: <Inactive /> }
  ]}
/>
```

---

### 17. Pagination

Page navigation with optional quick jumper.

```tsx
import { Pagination } from '@/components/common';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={totalItems}
  onPageChange={setPage}
  showQuickJumper
  showPageSizeSelector
/>
```

---

## Design System

### Colors

All colors are defined in CSS variables (`frontend/src/styles/variables.css`):

```css
--color-primary-500: #0ea5e9 (Sky Blue)
--color-success-500: #22c55e (Green)
--color-warning-500: #eab308 (Yellow)
--color-danger-500: #ef4444 (Red)
```

### Spacing

```typescript
xs: 0.25rem    sm: 0.5rem    md: 1rem    lg: 1.5rem
xl: 2rem       2xl: 3rem     3xl: 4rem
```

### Transitions

```typescript
fast:  150ms    base: 200ms    slow: 300ms
```

---

## Accessibility

All components follow accessibility best practices:

- Proper ARIA labels and roles
- Semantic HTML
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Screen reader friendly

---

## TypeScript Support

All components are fully typed with strict TypeScript:

```tsx
import { ButtonProps, InputProps, CardProps } from '@/components/common';

// Props are fully typed with proper validation
const handleButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
  // Type-safe
};
```

---

## Dark Mode Support

All components automatically support dark mode via Tailwind's `dark:` prefix.

Enable dark mode in your app by adding the `dark` class to your root element or using system preferences.

---

## Best Practices

1. **Use Composition** - Combine components to build complex UIs
2. **Props Validation** - TypeScript will catch type errors at compile time
3. **Controlled Components** - Pass state through props for better control
4. **Error Handling** - Always provide error messages for form validation
5. **Accessibility** - Test with keyboard navigation and screen readers

---

## Component Files

- `Button.tsx` - Button component with variants
- `Input.tsx` - Text input with validation
- `Select.tsx` - Dropdown selector
- `Card.tsx` - Container component
- `Alert.tsx` - Alert/notification banner
- `Modal.tsx` - Dialog/popup
- `Loading.tsx` - Spinner/skeleton/progress
- `Toast.tsx` - Toast notifications
- `Table.tsx` - Data table
- `Badge.tsx` - Status badge
- `Checkbox.tsx` - Checkbox/toggle
- `RadioGroup.tsx` - Radio buttons
- `DatePicker.tsx` - Date picker
- `FileUpload.tsx` - File input
- `Dropdown.tsx` - Context menu
- `Tabs.tsx` - Tab navigation
- `Pagination.tsx` - Page navigation
- `Spinner.tsx` - Loading spinner
- `types.ts` - All TypeScript types
- `constants.ts` - Design system constants
- `index.ts` - Central export file

---

## Development

To add a new component:

1. Create `YourComponent.tsx` in this directory
2. Add types to `types.ts`
3. Add constants to `constants.ts` if needed
4. Export from `index.ts`
5. Document usage here

All components should:
- Be fully typed with TypeScript
- Use Tailwind CSS (no inline styles)
- Support dark mode
- Be accessible (ARIA labels, semantic HTML)
- Have clear JSDoc comments
- Work with React 18+

---

## License

Part of CCTV Dashboard project.
