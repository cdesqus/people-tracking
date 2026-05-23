/**
 * @file Input component
 * Text input with label, error handling, and icon support
 *
 * @example
 * <Input
 *   label="Username"
 *   placeholder="Enter username"
 *   error={errors.username}
 *   hasError={!!errors.username}
 * />
 *
 * @example
 * // With icons
 * <Input
 *   label="Search"
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 */

import React, { forwardRef } from 'react';
import { InputProps } from './types';
import { INPUT_SIZES, TRANSITIONS, COMMON_STYLES } from './constants';

/**
 * Input Component
 *
 * A controlled text input field with optional label, error message, and icon support.
 *
 * @param {InputProps} props - Input component props
 * @returns {React.ReactElement} Input element with wrapper
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      size = 'md',
      error,
      hasError = !!error,
      leftIcon,
      rightIcon,
      helperText,
      className = '',
      disabled = false,
      ...rest
    },
    ref
  ) => {
    const sizeStyles = INPUT_SIZES[size];

    const inputClasses = [
      'w-full',
      sizeStyles.padding,
      sizeStyles.fontSize,
      sizeStyles.height,
      'bg-white dark:bg-slate-800',
      'border border-gray-300 dark:border-slate-600',
      'rounded-lg',
      'placeholder-gray-400 dark:placeholder-slate-500',
      'text-gray-900 dark:text-white',
      hasError ? COMMON_STYLES.errorBorder : '',
      disabled ? COMMON_STYLES.disabledInput : '',
      COMMON_STYLES.focusRing,
      TRANSITIONS.base,
      'appearance-none',
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={rest.id}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 dark:text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${rest.id}-error` : helperText ? `${rest.id}-helper` : undefined
            }
            {...rest}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 dark:text-gray-400 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${rest.id}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${rest.id}-helper`}
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
