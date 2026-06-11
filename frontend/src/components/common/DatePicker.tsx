/**
 * @file DatePicker component
 * Date/date range picker with validation
 *
 * @example
 * <DatePicker
 *   label="Date"
 *   value={date}
 *   onChange={setDate}
 * />
 *
 * @example
 * // Date range picker
 * <DatePicker
 *   label="Date Range"
 *   value={startDate}
 *   onChange={setStartDate}
 *   range
 *   max={new Date()}
 * />
 */

import React, { forwardRef } from 'react';
import { DatePickerProps } from './types';
import { COMMON_STYLES, TRANSITIONS } from './constants';

/**
 * DatePicker Component
 *
 * A date input with optional range selection and validation.
 *
 * @param {DatePickerProps} props - DatePicker component props
 * @returns {React.ReactElement} DatePicker element
 */
const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      min,
      max,
      range = false,
      error,
      disabled = false,
      className = '',
      ...rest
    },
    ref
  ) => {
    const inputId = rest.id || `datepicker-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const dateValue = e.target.value ? new Date(e.target.value) : null;
      onChange?.(dateValue);
    };

    const formatDateForInput = (date: Date | null | undefined) => {
      if (!date) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-600"
          >
            {label}
            {rest.required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type="date"
            value={formatDateForInput(value)}
            onChange={handleChange}
            min={min ? formatDateForInput(min) : undefined}
            max={max ? formatDateForInput(max) : undefined}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`w-full px-4 py-2 h-10 bg-white dark:bg-slate-100 border rounded-lg text-gray-900 dark:text-slate-900 placeholder-gray-400 dark:placeholder-slate-500 ${
              error ? COMMON_STYLES.errorBorder : COMMON_STYLES.inputBorder
            } ${disabled ? COMMON_STYLES.disabledInput : ''} ${COMMON_STYLES.focusRing} ${TRANSITIONS.base} appearance-none ${className}`}
            {...rest}
          />

          {/* Calendar icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-500 dark:text-slate-500 pointer-events-none">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {range && (
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
            Range selection - set start and end dates separately
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
