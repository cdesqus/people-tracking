/**
 * @file Checkbox component
 * Checkbox input with toggle switch variant
 *
 * @example
 * <Checkbox label="Remember me" checked={checked} onChange={setChecked} />
 *
 * @example
 * // Toggle switch variant
 * <Checkbox toggle label="Enable notifications" checked={enabled} onChange={setEnabled} />
 */

import React, { forwardRef } from 'react';
import { CheckboxProps } from './types';
import { TRANSITIONS } from './constants';

/**
 * Checkbox Component
 *
 * A checkbox input with optional label and toggle variant.
 *
 * @param {CheckboxProps} props - Checkbox component props
 * @returns {React.ReactElement} Checkbox element
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, toggle = false, error, id, className = '', disabled = false, ...rest },
    ref
  ) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    if (toggle) {
      return (
        <div className="flex items-start gap-3">
          <div className="relative inline-flex items-center">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              className="sr-only peer"
              disabled={disabled}
              {...rest}
            />
            <div
              className={`w-11 h-6 rounded-full border-2 transition-colors ${TRANSITIONS.base} ${
                rest.checked
                  ? 'bg-sky-500 border-sky-500 dark:bg-sky-600'
                  : 'bg-gray-300 border-gray-300 dark:bg-slate-600 dark:border-slate-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer peer-focus:ring-2 peer-focus:ring-sky-500 peer-focus:ring-offset-2'}`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md ${TRANSITIONS.base} ${
                  rest.checked ? 'translate-x-5' : ''
                }`}
              />
            </div>
          </div>

          {label && (
            <div>
              <label
                htmlFor={inputId}
                className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${
                  disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {label}
              </label>
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>
      );
    }

    // Standard checkbox
    return (
      <div className="flex items-start gap-3">
        <div className="relative pt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={`w-5 h-5 rounded border-2 border-gray-300 dark:border-slate-600 cursor-pointer accent-sky-500 ${TRANSITIONS.base} ${
              error ? 'border-red-500' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
            {...rest}
          />
        </div>

        {label && (
          <div className="flex-1">
            <label
              htmlFor={inputId}
              className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {label}
            </label>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
