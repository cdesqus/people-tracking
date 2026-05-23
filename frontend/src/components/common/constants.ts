/**
 * @file Component constants and design system values
 * Centralized design tokens used across all components
 */

/**
 * Size variants for buttons
 */
export const BUTTON_SIZES = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    height: 'h-8',
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
    height: 'h-10',
  },
  lg: {
    padding: 'px-6 py-3',
    fontSize: 'text-lg',
    height: 'h-12',
  },
} as const;

/**
 * Button style variants
 */
export const BUTTON_VARIANTS = {
  primary: {
    base: 'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
  },
  secondary: {
    base: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed',
  },
  danger: {
    base: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
  },
  success: {
    base: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
  },
} as const;

/**
 * Input size variants
 */
export const INPUT_SIZES = {
  sm: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
    height: 'h-8',
  },
  md: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
    height: 'h-10',
  },
  lg: {
    padding: 'px-6 py-3',
    fontSize: 'text-lg',
    height: 'h-12',
  },
} as const;

/**
 * Alert type styles
 */
export const ALERT_STYLES = {
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    titleText: 'text-red-900 dark:text-red-100',
    icon: '⚠️',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    titleText: 'text-yellow-900 dark:text-yellow-100',
    icon: '⚠️',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    titleText: 'text-green-900 dark:text-green-100',
    icon: '✓',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    titleText: 'text-blue-900 dark:text-blue-100',
    icon: 'ℹ️',
  },
} as const;

/**
 * Toast type styles
 */
export const TOAST_STYLES = {
  success: {
    bg: 'bg-green-500 dark:bg-green-600',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500 dark:bg-red-600',
    icon: '✕',
  },
  info: {
    bg: 'bg-blue-500 dark:bg-blue-600',
    icon: 'ℹ️',
  },
  warning: {
    bg: 'bg-yellow-500 dark:bg-yellow-600',
    icon: '⚠️',
  },
} as const;

/**
 * Badge color variants
 */
export const BADGE_COLORS = {
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-300 dark:border-green-700',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-300 dark:border-red-700',
  },
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-300 dark:border-yellow-700',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-300 dark:border-blue-700',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-300 dark:border-gray-600',
  },
} as const;

/**
 * Badge size variants
 */
export const BADGE_SIZES = {
  sm: {
    padding: 'px-2 py-1',
    fontSize: 'text-xs',
  },
  md: {
    padding: 'px-3 py-1.5',
    fontSize: 'text-sm',
  },
  lg: {
    padding: 'px-4 py-2',
    fontSize: 'text-base',
  },
} as const;

/**
 * Card padding variants
 */
export const CARD_PADDING = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-6',
  lg: 'p-8',
} as const;

/**
 * Card shadow variants
 */
export const CARD_SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
} as const;

/**
 * Modal size variants
 */
export const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
} as const;

/**
 * Z-index values for stacking context
 */
export const Z_INDEX = {
  dropdown: 'z-[1000]',
  sticky: 'z-[1020]',
  fixed: 'z-[1030]',
  modal: 'z-[1040]',
  popover: 'z-[1050]',
  tooltip: 'z-[1070]',
} as const;

/**
 * Transitions and animations
 */
export const TRANSITIONS = {
  fast: 'transition-all duration-150 ease-in-out',
  base: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
} as const;

/**
 * Border radius variants
 */
export const BORDER_RADIUS = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const;

/**
 * Common Tailwind classes for components
 */
export const COMMON_STYLES = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2',
  disabledInput: 'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100',
  inputBorder: 'border border-gray-300 dark:border-gray-600',
  errorBorder: 'border-red-500 dark:border-red-400',
} as const;

/**
 * Spacing scale
 */
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  fast: 150,
  base: 200,
  slow: 300,
  slower: 500,
} as const;

/**
 * Default toast duration (3 seconds)
 */
export const DEFAULT_TOAST_DURATION = 3000;

/**
 * Default modal close on backdrop click
 */
export const DEFAULT_MODAL_CLOSE_ON_BACKDROP = true;
