# Available Exports from @/components/common

Complete list of everything you can import from the component library.

## Components (20 Total)

### Display Components
```tsx
import {
  Card,      // Container with title, actions, padding variants
  Badge,     // Status indicator (green, red, yellow, blue, gray)
  Alert,     // Alert banner (error, warning, success, info)
} from '@/components/common';
```

### Form Components
```tsx
import {
  Input,     // Text input with label and validation
  Select,    // Dropdown select with search/grouping
  Checkbox,  // Checkbox + toggle switch variant
  RadioGroup,// Radio button group
  DatePicker,// Date picker input
  FileUpload,// File picker with preview
} from '@/components/common';
```

### Action Components
```tsx
import {
  Button,    // Button (primary, secondary, danger, success)
  Dropdown,  // Context menu dropdown
  Modal,     // Dialog/popup modal
} from '@/components/common';
```

### Feedback Components
```tsx
import {
  Toast,         // Single toast notification
  ToastContainer,// Toast container for managing multiple
  Loading,       // Spinner, skeleton, progress bar
} from '@/components/common';
```

### Data Components
```tsx
import {
  Table,      // Data table with sorting
  Pagination, // Page navigation
} from '@/components/common';
```

### Navigation Components
```tsx
import {
  Tabs,       // Tab navigation (line, pill, card)
} from '@/components/common';
```

### Internal Utilities
```tsx
import {
  Spinner,    // SVG loading spinner (used by other components)
} from '@/components/common';
```

---

## Type Exports (40+ Types)

### Component Props
```tsx
import {
  ButtonProps,
  InputProps,
  SelectProps,
  CardProps,
  AlertProps,
  ModalProps,
  LoadingProps,
  ToastProps,
  TableProps,
  BadgeProps,
  CheckboxProps,
  RadioGroupProps,
  DatePickerProps,
  FileUploadProps,
  DropdownProps,
  TabsProps,
  PaginationProps,
} from '@/components/common';
```

### Type Variants
```tsx
import {
  ButtonVariant,  // 'primary' | 'secondary' | 'danger' | 'success'
  ButtonSize,     // 'sm' | 'md' | 'lg'
  InputSize,      // 'sm' | 'md' | 'lg'
  AlertType,      // 'error' | 'warning' | 'success' | 'info'
  ToastType,      // 'success' | 'error' | 'info' | 'warning'
  BadgeColor,     // 'green' | 'red' | 'yellow' | 'blue' | 'gray'
  BadgeSize,      // 'sm' | 'md' | 'lg'
  ModalSize,      // 'sm' | 'md' | 'lg' | 'xl'
  ShadowVariant,  // 'none' | 'sm' | 'md' | 'lg'
} from '@/components/common';
```

### Data Types
```tsx
import {
  SelectOption,      // { value: string | number; label: string; disabled?: boolean }
  SelectOptionGroup, // { label: string; options: SelectOption[] }
  TableColumn,       // Column definition with render function
  RadioOption,       // { value: string | number; label: string; disabled?: boolean }
  TabItem,           // { id: string; label: string; content: React.ReactNode }
  DropdownItem,      // { id: string; label: string; onClick: () => void }
} from '@/components/common';
```

---

## Constants Exports (20+ Values)

### Button & Input
```tsx
import {
  BUTTON_SIZES,   // { sm, md, lg }
  BUTTON_VARIANTS,// { primary, secondary, danger, success }
  INPUT_SIZES,    // { sm, md, lg }
} from '@/components/common';
```

### Colors & Styles
```tsx
import {
  ALERT_STYLES,    // { error, warning, success, info }
  TOAST_STYLES,    // { success, error, info, warning }
  BADGE_COLORS,    // { green, red, yellow, blue, gray }
  BADGE_SIZES,     // { sm, md, lg }
} from '@/components/common';
```

### Layout & Design
```tsx
import {
  CARD_PADDING,    // { none, sm, md, lg }
  CARD_SHADOWS,    // { none, sm, md, lg }
  MODAL_SIZES,     // { sm, md, lg, xl }
  BORDER_RADIUS,   // { sm, md, lg, xl, '2xl', full }
  Z_INDEX,         // { dropdown, sticky, fixed, modal, popover, tooltip }
} from '@/components/common';
```

### Animations & Timing
```tsx
import {
  TRANSITIONS,           // { fast, base, slow }
  ANIMATION_DURATIONS,   // { fast, base, slow, slower } in ms
  SPACING,               // { xs, sm, md, lg, xl, '2xl', '3xl' }
  COMMON_STYLES,         // { focusRing, disabledInput, inputBorder, errorBorder }
  DEFAULT_TOAST_DURATION,// 3000 ms
  DEFAULT_MODAL_CLOSE_ON_BACKDROP, // true
} from '@/components/common';
```

---

## Import Examples

### Single Import
```tsx
import { Button } from '@/components/common';

<Button>Click</Button>
```

### Multiple Imports
```tsx
import { Button, Card, Table } from '@/components/common';

<Card>
  <Button>Action</Button>
  <Table columns={cols} data={data} />
</Card>
```

### With Types
```tsx
import { Button, ButtonProps } from '@/components/common';

const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};
```

### With Constants
```tsx
import { BUTTON_SIZES, ALERT_STYLES } from '@/components/common';

// Use in your custom components
const buttonClass = BUTTON_SIZES.lg.padding;
const alertClass = ALERT_STYLES.error.bg;
```

### Everything at Once
```tsx
import * as UI from '@/components/common';

// Access as UI.Button, UI.Card, etc.
<UI.Button>Click</UI.Button>
```

---

## Component Props Summary

### Button Props
```tsx
<Button
  variant="primary"      // 'primary' | 'secondary' | 'danger' | 'success'
  size="md"              // 'sm' | 'md' | 'lg'
  isLoading={false}      // Show loading spinner
  leftIcon={<Icon />}    // Icon on left
  rightIcon={<Icon />}   // Icon on right
  fullWidth={false}      // Full width
  disabled={false}       // Disabled state
  onClick={handleClick}  // Click handler
/>
```

### Input Props
```tsx
<Input
  label="Label"          // Display label
  placeholder="..."      // Placeholder text
  size="md"              // 'sm' | 'md' | 'lg'
  type="text"            // Input type
  error="Error msg"      // Error message
  hasError={false}       // Show error styling
  leftIcon={<Icon />}    // Icon on left
  rightIcon={<Icon />}   // Icon on right
  helperText="Help"      // Helper text below
  value={value}          // Input value
  onChange={handleChange}// Change handler
  disabled={false}       // Disabled state
/>
```

### Select Props
```tsx
<Select
  label="Label"          // Display label
  options={options}      // Array of options or groups
  value={value}          // Selected value(s)
  onChange={handleChange}// Change handler
  isMulti={false}        // Enable multi-select
  searchable={false}     // Enable search
  isLoading={false}      // Show loading state
  error="Error msg"      // Error message
  placeholder="..."      // Placeholder text
  disabled={false}       // Disabled state
/>
```

### Card Props
```tsx
<Card
  title="Title"          // Card title
  subtitle="Subtitle"    // Card subtitle
  actions={<Button />}   // Action buttons
  padding="md"           // 'sm' | 'md' | 'lg' | 'none'
  shadow="md"            // 'none' | 'sm' | 'md' | 'lg'
  clickable={false}      // Make card clickable
  onClick={handleClick}  // Click handler
/>
```

### Alert Props
```tsx
<Alert
  type="info"            // 'error' | 'warning' | 'success' | 'info'
  title="Title"          // Optional title
  message="Message"      // Alert message
  dismissible={true}     // Show dismiss button
  autoDismiss={false}    // Auto-dismiss after ms
  onDismiss={handleDismiss}
/>
```

### Modal Props
```tsx
<Modal
  isOpen={true}          // Modal visibility
  title="Title"          // Modal title
  size="md"              // 'sm' | 'md' | 'lg' | 'xl'
  onClose={handleClose}  // Close handler
  closeOnBackdrop={true} // Click backdrop to close
  header={<Header />}    // Custom header
  footer={<Footer />}    // Custom footer
/>
```

### Table Props
```tsx
<Table
  columns={columns}      // Column definitions
  data={data}            // Table data
  striped={false}        // Alternating row colors
  hoverable={true}       // Hover effect
  isLoading={false}      // Loading state
  sortable={true}        // Enable sorting
  onSort={handleSort}    // Sort handler
  onRowClick={handleClick}
/>
```

### Toast Props
```tsx
<Toast
  id="unique-id"         // Unique identifier
  type="success"         // 'success' | 'error' | 'info' | 'warning'
  title="Title"          // Optional title
  message="Message"      // Toast message
  duration={3000}        // Auto-dismiss delay in ms
  action={{ label: 'Action', onClick: fn }}
  onDismiss={handleDismiss}
/>
```

---

## Common Patterns

### Form with Validation
```tsx
import { Input, Button, Alert } from '@/components/common';

<form>
  <Input
    label="Email"
    type="email"
    error={errors.email}
    hasError={!!errors.email}
    value={formData.email}
    onChange={(e) => setFormData({...formData, email: e.target.value})}
  />
  {errors.submit && <Alert type="error" message={errors.submit} />}
  <Button type="submit">Submit</Button>
</form>
```

### Data Table
```tsx
import { Table, Badge, Pagination } from '@/components/common';

<div>
  <Table
    columns={[
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status', render: s => <Badge color={s === 'active' ? 'green' : 'red'}>{s}</Badge> }
    ]}
    data={items}
  />
  <Pagination currentPage={page} totalPages={10} onPageChange={setPage} />
</div>
```

### Modal Dialog
```tsx
import { Modal, Button, Alert } from '@/components/common';

<Modal
  isOpen={isOpen}
  title="Confirm"
  onClose={() => setIsOpen(false)}
  footer={
    <>
      <Button variant="danger" onClick={handleConfirm}>Delete</Button>
      <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    </>
  }
>
  <Alert type="warning" message="This action cannot be undone" />
  <p>Are you sure?</p>
</Modal>
```

### Notifications
```tsx
import { Toast, ToastContainer } from '@/components/common';

const [toasts, setToasts] = useState([]);

const showToast = (type, message) => {
  const id = Date.now().toString();
  setToasts(prev => [...prev, {
    id, type, message, duration: 3000,
    onDismiss: (id) => setToasts(p => p.filter(t => t.id !== id))
  }]);
};

<ToastContainer toasts={toasts} onDismiss={...} />
```

---

## Import Paths

All components are exported from a single location:

```tsx
// All of these work:
import { Button } from '@/components/common';
import { Button } from '@/components/common/index';
import * as UI from '@/components/common';
```

No individual file imports needed:
```tsx
// ❌ Don't do this:
import Button from '@/components/common/Button';

// ✅ Do this instead:
import { Button } from '@/components/common';
```

---

## TypeScript Support

All exports are fully typed:

```tsx
import { Button, ButtonProps, ButtonVariant, ButtonSize } from '@/components/common';

// Props are checked at compile time
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};

// Type checking
const variant: ButtonVariant = 'primary'; // ✅ OK
const variant: ButtonVariant = 'invalid'; // ❌ TypeScript error
```

---

## What's NOT Exported

- Individual component files (use index.ts)
- Internal utilities (Spinner is available but not needed directly)
- Tailwind classes (use className prop)
- CSS files (handled by globals.css)

---

## Next Steps

1. Choose a component from this list
2. Import it: `import { Component } from '@/components/common'`
3. Use it with proper props
4. TypeScript will help you get the props right
5. That's it!

---

**Happy building! 🚀**
