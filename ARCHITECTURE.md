# Component Library Architecture

## Directory Structure

```
frontend/src/
├── components/
│   ├── common/                    # Reusable component library
│   │   ├── index.ts               # Central export point
│   │   ├── types.ts               # All TypeScript types
│   │   ├── constants.ts           # Design system tokens
│   │   │
│   │   ├── Button.tsx             # Core action component
│   │   ├── Spinner.tsx            # Loading indicator
│   │   │
│   │   ├── Input.tsx              # Form input
│   │   ├── Select.tsx             # Dropdown select
│   │   ├── Checkbox.tsx           # Checkbox + toggle
│   │   ├── RadioGroup.tsx         # Radio buttons
│   │   ├── DatePicker.tsx         # Date input
│   │   ├── FileUpload.tsx         # File picker
│   │   │
│   │   ├── Card.tsx               # Container
│   │   ├── Alert.tsx              # Alert banner
│   │   ├── Badge.tsx              # Status badge
│   │   │
│   │   ├── Modal.tsx              # Dialog
│   │   ├── Toast.tsx              # Toast notifications
│   │   ├── Dropdown.tsx           # Context menu
│   │   │
│   │   ├── Loading.tsx            # Spinner/skeleton/progress
│   │   ├── Table.tsx              # Data table
│   │   │
│   │   ├── Tabs.tsx               # Tab navigation
│   │   ├── Pagination.tsx         # Page navigation
│   │   │
│   │   ├── ComponentShowcase.tsx  # Demo page (dev only)
│   │   ├── COMPONENTS_GUIDE.md    # Usage guide
│   │   │
│   │   ├── layout/                # Layout components (existing)
│   │   └── ... (other component folders)
│   │
│   └── ... (other components)
│
└── ... (rest of frontend)
```

## Component Hierarchy

```
REUSABLE COMPONENTS (@/components/common)
│
├─ CORE COMPONENTS
│  ├─ Button          (action)
│  ├─ Input           (form)
│  ├─ Select          (form)
│  ├─ Card            (container)
│  ├─ Alert           (feedback)
│  └─ Badge           (display)
│
├─ COMPLEX COMPONENTS
│  ├─ Modal           (dialog)
│  ├─ Table           (data display)
│  ├─ Tabs            (navigation)
│  ├─ Pagination      (navigation)
│  └─ Dropdown        (menu)
│
├─ FORM COMPONENTS
│  ├─ Checkbox        (binary input)
│  ├─ RadioGroup      (single selection)
│  ├─ DatePicker      (date input)
│  └─ FileUpload      (file input)
│
└─ FEEDBACK COMPONENTS
   ├─ Toast           (notification)
   ├─ Loading         (loading state)
   └─ Alert           (notification)
```

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│ PAGE COMPONENTS (Dashboard, Cameras, Alerts, etc)   │
└──────────────────┬──────────────────────────────────┘
                   │ import and use
                   ▼
┌─────────────────────────────────────────────────────┐
│         COMMON COMPONENTS (@/components/common)     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  COMPONENTS      │      │  INFRASTRUCTURE  │   │
│  ├──────────────────┤      ├──────────────────┤   │
│  │ • Button         │      │ • index.ts       │   │
│  │ • Input          │      │ • types.ts       │   │
│  │ • Card           │      │ • constants.ts   │   │
│  │ • Modal          │      │ • Spinner.tsx    │   │
│  │ • Table          │      │                  │   │
│  │ • ... (17 more)  │      │                  │   │
│  └──────────────────┘      └──────────────────┘   │
│                                                      │
└─────────────────────┬────────────────────────────────┘
                      │ uses
                      ▼
┌─────────────────────────────────────────────────────┐
│          TAILWIND CSS + CSS VARIABLES               │
│  (frontend/src/styles/globals.css, variables.css)   │
└─────────────────────────────────────────────────────┘
```

## Type System Architecture

```
TYPES.TS (40+ interfaces)
│
├─ Component Props Interfaces
│  ├─ ButtonProps
│  ├─ InputProps
│  ├─ SelectProps
│  ├─ CardProps
│  ├─ AlertProps
│  ├─ ModalProps
│  └─ ... (14 more)
│
├─ Variant Union Types
│  ├─ ButtonVariant
│  ├─ ButtonSize
│  ├─ AlertType
│  ├─ ToastType
│  └─ ... (10 more)
│
└─ Data Structure Types
   ├─ SelectOption
   ├─ TableColumn
   ├─ TabItem
   ├─ DropdownItem
   └─ ... (more)
```

## Design System Architecture

```
CSS VARIABLES (variables.css)
│
├─ Colors
│  ├─ Primary     (--color-primary-50 to 900)
│  ├─ Secondary   (--color-secondary-50 to 900)
│  ├─ Success     (--color-success-500, 600)
│  ├─ Warning     (--color-warning-500, 600)
│  └─ Danger      (--color-danger-500, 600)
│
├─ Layout
│  ├─ Spacing     (--spacing-xs to 3xl)
│  ├─ Border      (--radius-sm to 2xl)
│  └─ Z-index     (--z-dropdown to z-tooltip)
│
├─ Effects
│  ├─ Shadows     (--shadow-sm to xl)
│  └─ Transitions (--transition-fast to slow)
│
└─ Dark Mode
   └─ @media (prefers-color-scheme: dark)
      └─ Override values for dark theme
```

## Component Communication Pattern

```
┌─────────────────────────────────────────┐
│ Parent Component (Page/Feature)         │
└─────────────────────┬───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌────────┐   ┌────────┐
   │ Input  │   │ Button │   │ Table  │
   ├────────┤   ├────────┤   ├────────┤
   │ Props: │   │ Props: │   │ Props: │
   │ value  │   │onClick │   │ data   │
   │onChange│   │variant │   │columns │
   │        │   │size    │   │onSort  │
   │        │   │        │   │        │
   └────────┘   └────────┘   └────────┘
        │             │             │
        └─────────────┼─────────────┘
                      │ onChange/onClick
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   Update Parent State        Handle Events
   (form data, selection)      (submit, delete)
```

## Styling Architecture

```
Tailwind CSS Pipeline
│
├─ @tailwindcss/base        (Browser resets)
├─ @tailwindcss/components  (Component styles)
├─ @tailwindcss/utilities   (Utility classes)
└─ @import variables.css    (CSS variables for colors)

│
└─ Components use:
   ├─ Tailwind utility classes (px-4, py-2, text-sm)
   ├─ CSS variables (--color-primary-500)
   ├─ Dark mode (dark:bg-slate-800)
   └─ Custom classes (via className prop)
```

## State Management Patterns

```
Component-Level State
├─ Form inputs (useState)
├─ Modal visibility (useState)
├─ Dropdown open (useState)
└─ Pagination page (useState)

│
└─ Passed as props to components:
   ├─ value={state}
   ├─ onChange={setState}
   └─ isOpen={state}
   
   (Components are controlled, not storing state)
```

## Dark Mode Architecture

```
System Preference Detection
│
└─ @media (prefers-color-scheme: dark)
   │
   └─ Override CSS variables:
      ├─ --color-bg: #0f172a
      ├─ --color-text: #f3f4f6
      ├─ --color-border: #334155
      └─ ... (all colors)

│
└─ Components use Tailwind dark: prefix:
   ├─ dark:bg-slate-800
   ├─ dark:text-white
   ├─ dark:border-slate-700
   └─ ... (all component styles)
```

## Dependency Graph

```
COMPONENTS (no external dependencies except React)
│
├─ React 18+          (for JSX, hooks)
├─ TypeScript          (for type checking)
├─ Tailwind CSS        (for styling)
└─ CSS Variables       (for theming)

Component Dependencies:
├─ Button
│  └─ Spinner
├─ Input (standalone)
├─ Select (standalone with useRef, useEffect)
├─ Card (standalone)
├─ Alert (standalone with useEffect)
├─ Modal (standalone with useEffect)
├─ Loading
│  └─ Spinner
├─ Toast (standalone with useEffect)
├─ ToastContainer (standalone)
├─ Table (standalone)
├─ Badge (standalone)
├─ Checkbox (standalone)
├─ RadioGroup (standalone)
├─ DatePicker (standalone)
├─ FileUpload (standalone with useRef, useEffect)
├─ Dropdown (standalone with useRef, useEffect)
├─ Tabs (standalone)
└─ Pagination (standalone)
```

## Performance Considerations

```
✅ Optimizations Applied:

┌─────────────────────────────────────┐
│ Component Performance               │
├─────────────────────────────────────┤
│ • React.forwardRef for ref support  │
│ • Stable prop memoization           │
│ • Efficient event handlers          │
│ • Minimal re-renders                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ CSS Performance                     │
├─────────────────────────────────────┤
│ • Tailwind CSS (pre-processed)      │
│ • CSS Variables (no dynamic styles) │
│ • Hardware-accelerated animations   │
│ • No unused CSS (built for production)
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Bundle Impact                       │
├─────────────────────────────────────┤
│ • Tree-shakeable exports            │
│ • No runtime dependencies           │
│ • Minimal TypeScript overhead       │
│ • Pure CSS (no CSS-in-JS runtime)   │
└─────────────────────────────────────┘
```

## Accessibility Architecture

```
WCAG 2.1 AA Compliance
│
├─ Semantic HTML
│  ├─ <button> for buttons
│  ├─ <form>, <input>, <label>
│  ├─ <table>, <thead>, <tbody>, <th>, <td>
│  ├─ <dialog> for modals
│  └─ ... (proper HTML elements)
│
├─ ARIA Attributes
│  ├─ aria-label (screen reader text)
│  ├─ aria-labelledby (associates labels)
│  ├─ aria-describedby (error messages)
│  ├─ aria-disabled (state)
│  ├─ aria-current (active tabs)
│  ├─ role (semantic roles)
│  └─ ... (proper ARIA)
│
├─ Keyboard Navigation
│  ├─ Tab order
│  ├─ Enter key support
│  ├─ Escape key support
│  ├─ Arrow key navigation
│  └─ Focus management
│
└─ Color & Contrast
   ├─ WCAG AA contrast ratio (4.5:1)
   ├─ Color not sole differentiator
   └─ Dark mode support
```

## Integration Points

```
External Integration
│
├─ Pages (Dashboard, Cameras, Alerts, etc)
│  └─ import { Button, Card, Table } from '@/components/common'
│
├─ Stores (Redux slices)
│  └─ Components receive state as props
│
├─ API (services/api.ts)
│  └─ Pages handle API calls, pass data to components
│
└─ Routing
   └─ Modal/Toast can use navigate from react-router
```

## Summary

- **20+ components** fully integrated
- **Single import path** via index.ts
- **Type-safe** with 40+ TypeScript interfaces
- **Design system** based on CSS variables
- **Dark mode** automatic via media query
- **Accessible** WCAG 2.1 AA compliant
- **Zero dependencies** except React + Tailwind
- **Production ready** with no breaking changes ahead

This architecture ensures:
- Easy to use and understand
- Scalable for future components
- Maintainable and documented
- Performant and accessible
- Consistent design system
