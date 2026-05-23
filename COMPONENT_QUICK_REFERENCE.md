# Component Library - Quick Reference

## 1-Minute Setup

```tsx
import { Button, Card, Input, Alert } from '@/components/common';

// That's it! All components are ready to use.
```

---

## Compact Component Reference

### Button
```tsx
<Button>Click</Button>
<Button variant="danger" size="lg">Delete</Button>
<Button isLoading leftIcon={<Icon />}>Saving</Button>
<Button fullWidth disabled>Disabled</Button>
```

### Input
```tsx
<Input label="Name" placeholder="Enter name" />
<Input type="email" error="Invalid email" hasError />
<Input leftIcon={<Search />} placeholder="Search..." />
```

### Select
```tsx
<Select label="Camera" options={opts} value={val} onChange={setVal} />
<Select isMulti searchable options={opts} />
<Select options={groupedOpts} isLoading />
```

### Card
```tsx
<Card><p>Content</p></Card>
<Card title="Title" subtitle="Subtitle"><p>Content</p></Card>
<Card title="Title" actions={<Button>Edit</Button>}><p>Content</p></Card>
<Card clickable onClick={handleClick}><p>Clickable</p></Card>
```

### Alert
```tsx
<Alert type="success" message="Success!" />
<Alert type="error" title="Error" message="Something went wrong" />
<Alert type="warning" message="Warning" dismissible autoDismiss={5000} />
```

### Modal
```tsx
<Modal isOpen={open} title="Title" onClose={() => setOpen(false)}>
  <p>Content</p>
</Modal>

<Modal isOpen={open} onClose={close} footer={<Button>OK</Button>}>
  <p>Content</p>
</Modal>
```

### Loading
```tsx
<Loading />
<Loading variant="skeleton" />
<Loading variant="progress" progress={65} />
<Loading text="Loading..." size={50} />
```

### Toast (in component)
```tsx
const [toasts, setToasts] = useState([]);

const addToast = (msg) => {
  const id = Date.now().toString();
  setToasts(prev => [...prev, {
    id, type: 'success', message: msg,
    onDismiss: (id) => setToasts(p => p.filter(t => t.id !== id))
  }]);
};

<ToastContainer toasts={toasts} onDismiss={...} />
```

### Table
```tsx
<Table
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', render: (v) => <b>{v}</b> }
  ]}
  data={items}
  striped
  hoverable
  onRowClick={handleClick}
/>
```

### Badge
```tsx
<Badge color="green">Online</Badge>
<Badge color="red" size="lg">Offline</Badge>
<Badge color="yellow">Warning</Badge>
```

### Checkbox
```tsx
<Checkbox label="Remember me" checked={c} onChange={e => setC(e.target.checked)} />
<Checkbox toggle label="Enable" checked={e} onChange={e => setE(e.target.checked)} />
```

### RadioGroup
```tsx
<RadioGroup
  name="status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  value={val}
  onChange={setVal}
/>
```

### DatePicker
```tsx
<DatePicker label="Date" value={date} onChange={setDate} />
<DatePicker min={new Date('2024-01-01')} max={new Date()} />
```

### FileUpload
```tsx
<FileUpload
  label="Upload"
  accept="image/*"
  maxSize={5*1024*1024}
  preview
  onFileChange={setFile}
/>
```

### Dropdown
```tsx
<Dropdown
  trigger={<Button>Actions</Button>}
  items={[
    { id: '1', label: 'Edit', onClick: handleEdit },
    { id: '2', label: 'Delete', onClick: handleDelete }
  ]}
/>
```

### Tabs
```tsx
<Tabs
  tabs={[
    { id: '1', label: 'Tab 1', content: <Content1 /> },
    { id: '2', label: 'Tab 2', content: <Content2 /> }
  ]}
  activeTab={active}
  onTabChange={setActive}
/>
```

### Pagination
```tsx
<Pagination
  currentPage={page}
  totalPages={10}
  onPageChange={setPage}
  showQuickJumper
/>
```

---

## Common Props

### All Form Components
```tsx
// Available on: Input, Select, DatePicker, FileUpload
label="Label"      // Display label above
error="Error msg"  // Show error message
disabled           // Disable interaction
required           // Mark as required (*)
```

### All Interactive Components
```tsx
// Available on: Button, Input, Select, Modal, etc.
onClick={fn}       // Click handler
disabled           // Disable
className="custom" // Additional classes
```

### Sizes
- Button, Input: `size="sm" | "md" | "lg"`
- Badge: `size="sm" | "md" | "lg"`
- Modal: `size="sm" | "md" | "lg" | "xl"`
- Loading: `size={number}` (pixels)

### Colors/Variants
- Button: `variant="primary" | "secondary" | "danger" | "success"`
- Alert: `type="error" | "warning" | "success" | "info"`
- Badge: `color="green" | "red" | "yellow" | "blue" | "gray"`
- Toast: `type="success" | "error" | "info" | "warning"`
- Card: `shadow="none" | "sm" | "md" | "lg"`, `padding="sm" | "md" | "lg" | "none"`
- Tabs: `variant="line" | "pill" | "card"`

---

## Real-World Examples

### Form
```tsx
import { Button, Input, Select, Card } from '@/components/common';

<Card title="Create Camera">
  <div className="space-y-4">
    <Input label="Name" placeholder="Camera name" />
    <Input label="Location" placeholder="Location" />
    <Select label="Type" options={typeOpts} />
    <Button fullWidth variant="primary">Create</Button>
  </div>
</Card>
```

### List with Actions
```tsx
<Card title="Cameras">
  <Table
    columns={[
      { key: 'name', label: 'Camera' },
      { key: 'status', label: 'Status', render: s => <Badge color={s === 'active' ? 'green' : 'red'}>{s}</Badge> },
      { key: 'actions', label: '', render: r => <Dropdown trigger={<Button size="sm">...</Button>} items={[...]} /> }
    ]}
    data={cameras}
  />
</Card>
```

### Modal Dialog
```tsx
<Modal isOpen={open} title="Confirm Delete" onClose={close} footer={
  <>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
    <Button onClick={close}>Cancel</Button>
  </>
}>
  <p>Are you sure?</p>
</Modal>
```

### With Notifications
```tsx
const [toasts, setToasts] = useState([]);

const handleSave = async () => {
  try {
    await api.save(data);
    addToast('success', 'Saved!');
  } catch (err) {
    addToast('error', err.message);
  }
};

// In render:
<ToastContainer toasts={toasts} onDismiss={removeToast} />
```

---

## Dark Mode

All components automatically support dark mode. Just let them handle it!

```tsx
// Automatic in dark mode (uses system preference or CSS class)
<Button>Works in light and dark</Button>
```

---

## Accessibility

All components are accessible by default. For custom content:

```tsx
<Alert type="error" message="Error" />
// ✓ Auto-generated ARIA labels
// ✓ Semantic HTML
// ✓ Keyboard navigation
// ✓ Screen reader friendly
```

---

## File Locations

- Components: `frontend/src/components/common/*.tsx`
- Types: `frontend/src/components/common/types.ts`
- Constants: `frontend/src/components/common/constants.ts`
- Full Guide: `frontend/src/components/common/COMPONENTS_GUIDE.md`

---

## Import Everything

```tsx
// Individual imports (recommended)
import { Button, Card } from '@/components/common';

// Or get types
import { ButtonProps, CardProps } from '@/components/common';

// Or get constants
import { BUTTON_SIZES, ALERT_STYLES } from '@/components/common';
```

---

## Common Patterns

### Loading State
```tsx
const [loading, setLoading] = useState(false);
<Button isLoading={loading}>Submit</Button>
```

### Error Handling
```tsx
const [error, setError] = useState('');
<Input error={error} hasError={!!error} />
```

### Form State
```tsx
const [formData, setFormData] = useState({});
<Input 
  value={formData.name || ''}
  onChange={e => setFormData({...formData, name: e.target.value})}
/>
```

### Modal Control
```tsx
const [isOpen, setIsOpen] = useState(false);
<Button onClick={() => setIsOpen(true)}>Open</Button>
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>...</Modal>
```

---

## That's It!

You have 20+ production-ready components. Start building! 🚀
