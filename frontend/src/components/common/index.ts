/**
 * @file Common components index
 * Central export point for all reusable UI components
 *
 * @example
 * import { Button, Card, Alert, Modal } from '@/components/common';
 *
 * export default function App() {
 *   return (
 *     <Card title="Settings">
 *       <Button variant="primary">Save</Button>
 *       <Alert type="success" message="Saved successfully!" />
 *     </Card>
 *   );
 * }
 */

// Core components
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Card } from './Card';
export { default as Alert } from './Alert';
export { default as Modal } from './Modal';
export { default as Loading } from './Loading';
export { default as Toast, ToastContainer } from './Toast';
export { default as Table } from './Table';
export { default as Badge } from './Badge';

// Form components
export { default as Checkbox } from './Checkbox';
export { default as RadioGroup } from './RadioGroup';
export { default as DatePicker } from './DatePicker';
export { default as FileUpload } from './FileUpload';

// Navigation & layout components
export { default as Dropdown } from './Dropdown';
export { default as Tabs } from './Tabs';
export { default as Pagination } from './Pagination';

// Internal utilities (not typically imported directly)
export { default as Spinner } from './Spinner';

// Types
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  InputSize,
  SelectProps,
  SelectOption,
  SelectOptionGroup,
  CardProps,
  AlertProps,
  AlertType,
  ModalProps,
  ModalSize,
  LoadingProps,
  ToastProps,
  ToastType,
  TableProps,
  TableColumn,
  BadgeProps,
  BadgeColor,
  BadgeSize,
  CheckboxProps,
  RadioGroupProps,
  RadioOption,
  DatePickerProps,
  FileUploadProps,
  DropdownProps,
  DropdownItem,
  TabsProps,
  TabItem,
  PaginationProps,
  ShadowVariant,
} from './types';

// Constants
export {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  INPUT_SIZES,
  ALERT_STYLES,
  TOAST_STYLES,
  BADGE_COLORS,
  BADGE_SIZES,
  CARD_PADDING,
  CARD_SHADOWS,
  MODAL_SIZES,
  Z_INDEX,
  TRANSITIONS,
  BORDER_RADIUS,
  COMMON_STYLES,
  SPACING,
  ANIMATION_DURATIONS,
  DEFAULT_TOAST_DURATION,
  DEFAULT_MODAL_CLOSE_ON_BACKDROP,
} from './constants';
