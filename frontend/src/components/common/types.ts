/**
 * @file Common component types and interfaces
 * Shared TypeScript definitions for all UI components
 */

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputSize = 'sm' | 'md' | 'lg';
export type AlertType = 'error' | 'warning' | 'success' | 'info';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type BadgeColor = 'green' | 'red' | 'yellow' | 'blue' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type ShadowVariant = 'none' | 'sm' | 'md' | 'lg';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Button component props
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Icon element (left side) */
  leftIcon?: React.ReactNode;
  /** Icon element (right side) */
  rightIcon?: React.ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Button content */
  children: React.ReactNode;
}

/**
 * Input component props
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;
  /** Input size */
  size?: InputSize;
  /** Error message to display */
  error?: string;
  /** Show validation error styling */
  hasError?: boolean;
  /** Icon on the left side */
  leftIcon?: React.ReactNode;
  /** Icon on the right side */
  rightIcon?: React.ReactNode;
  /** Helper text below input */
  helperText?: string;
}

/**
 * Select component props
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  /** Select label */
  label?: string;
  /** Available options */
  options: (SelectOption | SelectOptionGroup)[];
  /** Selected value(s) */
  value?: string | number | (string | number)[];
  /** Enable multi-select */
  isMulti?: boolean;
  /** Show search/filter */
  searchable?: boolean;
  /** Show loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string;
  /** Change handler */
  onChange?: (
    value: string | number | (string | number)[]
  ) => void;
}

/**
 * Card component props
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Action buttons in header */
  actions?: React.ReactNode;
  /** Padding level */
  padding?: 'sm' | 'md' | 'lg' | 'none';
  /** Shadow variant */
  shadow?: ShadowVariant;
  /** Card is clickable */
  clickable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Card content */
  children: React.ReactNode;
}

/**
 * Alert component props
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Alert type determines color and icon */
  type?: AlertType;
  /** Alert title/heading */
  title?: string;
  /** Alert message content */
  message: React.ReactNode;
  /** Show dismiss button */
  dismissible?: boolean;
  /** Auto-dismiss after X milliseconds */
  autoDismiss?: number | false;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Alert content */
  children?: React.ReactNode;
}

/**
 * Modal component props
 */
export interface ModalProps {
  /** Modal is open */
  isOpen: boolean;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: ModalSize;
  /** Close handler */
  onClose: () => void;
  /** Allow backdrop click to close */
  closeOnBackdrop?: boolean;
  /** Modal header content */
  header?: React.ReactNode;
  /** Modal body content */
  children: React.ReactNode;
  /** Modal footer content */
  footer?: React.ReactNode;
}

/**
 * Loading component props
 */
export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Loading text to display */
  text?: string;
  /** Spinner size in pixels */
  size?: number;
  /** Show skeleton screen */
  variant?: 'spinner' | 'skeleton' | 'progress';
  /** Progress bar value (0-100) */
  progress?: number;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  /** Toast ID (unique) */
  id: string;
  /** Toast type */
  type?: ToastType;
  /** Toast title/heading */
  title?: string;
  /** Toast message */
  message: React.ReactNode;
  /** Auto-dismiss delay in ms (0 = no auto-dismiss) */
  duration?: number;
  /** Action button config */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Dismiss handler */
  onDismiss: (id: string) => void;
}

/**
 * Table component props
 */
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
  width?: string | number;
}

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  /** Table columns */
  columns: TableColumn[];
  /** Table data rows */
  data: any[];
  /** Striped rows */
  striped?: boolean;
  /** Show hover effect */
  hoverable?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Sortable columns */
  sortable?: boolean;
  /** Sort handler */
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  /** Row click handler */
  onRowClick?: (row: any) => void;
}

/**
 * Badge component props
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Badge color variant */
  color?: BadgeColor;
  /** Badge size */
  size?: BadgeSize;
  /** Badge text content */
  children: React.ReactNode;
}

/**
 * Checkbox component props
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Checkbox label */
  label?: string;
  /** Is toggle switch variant */
  toggle?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Radio group component props
 */
export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface RadioGroupProps
  extends Omit<React.FieldSetHTMLAttributes<HTMLFieldSetElement>, 'onChange'> {
  /** Radio group name */
  name: string;
  /** Available options */
  options: RadioOption[];
  /** Selected value */
  value?: string | number;
  /** Change handler */
  onChange?: (value: string | number) => void;
  /** Group label */
  label?: string;
  /** Error message */
  error?: string;
  /** Vertical layout (default true) */
  vertical?: boolean;
}

/**
 * DatePicker component props
 */
export interface DatePickerProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Selected date */
  value?: Date | null;
  /** Date change handler */
  onChange?: (date: Date | null) => void;
  /** Label text */
  label?: string;
  /** Min date */
  min?: Date;
  /** Max date */
  max?: Date;
  /** Range picker mode */
  range?: boolean;
  /** Error message */
  error?: string;
}

/**
 * FileUpload component props
 */
export interface FileUploadProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Label text */
  label?: string;
  /** Accepted file types */
  accept?: string;
  /** Show file preview */
  preview?: boolean;
  /** Max file size in bytes */
  maxSize?: number;
  /** File change handler */
  onFileChange?: (file: File | null) => void;
  /** Error message */
  error?: string;
  /** Multiple files */
  multiple?: boolean;
}

/**
 * Dropdown context menu props
 */
export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  /** Dropdown items */
  items: DropdownItem[];
  /** Trigger element */
  trigger: React.ReactNode;
  /** Align direction */
  align?: 'left' | 'right';
  /** Close on item click */
  closeOnClick?: boolean;
}

/**
 * Tabs component props
 */
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tab items */
  tabs: TabItem[];
  /** Active tab ID */
  activeTab: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Tab variant */
  variant?: 'line' | 'pill' | 'card';
}

/**
 * Pagination component props
 */
export interface PaginationProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Current page number */
  currentPage: number;
  /** Total pages */
  totalPages: number;
  /** Items per page */
  pageSize?: number;
  /** Total items count */
  totalItems?: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Show quick jumper */
  showQuickJumper?: boolean;
  /** Show page size selector */
  showPageSizeSelector?: boolean;
}
