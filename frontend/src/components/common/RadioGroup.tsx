/**
 * @file RadioGroup component
 * Radio button group with multiple options
 *
 * @example
 * const options = [
 *   { value: 'active', label: 'Active' },
 *   { value: 'inactive', label: 'Inactive' }
 * ];
 *
 * <RadioGroup
 *   name="status"
 *   options={options}
 *   value={status}
 *   onChange={setStatus}
 * />
 *
 * @example
 * // Horizontal layout with descriptions
 * <RadioGroup
 *   name="priority"
 *   options={[
 *     { value: 'high', label: 'High', description: 'Urgent' },
 *     { value: 'low', label: 'Low', description: 'Can wait' }
 *   ]}
 *   vertical={false}
 * />
 */

import React from 'react';
import { RadioGroupProps } from './types';
import { TRANSITIONS } from './constants';

/**
 * RadioGroup Component
 *
 * A group of radio buttons for single selection from multiple options.
 *
 * @param {RadioGroupProps} props - RadioGroup component props
 * @returns {React.ReactElement} RadioGroup element
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  vertical = true,
  className = '',
  disabled = false,
  ...rest
}) => {
  return (
    <fieldset
      className={`${className}`}
      disabled={disabled}
      {...rest}
    >
      {label && (
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
          {rest.required && <span className="text-red-500 ml-0.5">*</span>}
        </legend>
      )}

      <div className={vertical ? 'space-y-3' : 'flex flex-wrap gap-4'}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isSelected = value === option.value;

          return (
            <div
              key={option.value}
              className={`flex items-start gap-3 ${
                !vertical ? 'flex-1 min-w-max' : ''
              }`}
            >
              <div className="pt-0.5">
                <input
                  id={optionId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={option.disabled || disabled}
                  className={`w-5 h-5 cursor-pointer accent-sky-500 ${TRANSITIONS.base} ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-describedby={
                    option.description ? `${optionId}-description` : undefined
                  }
                />
              </div>

              <div className="flex-1">
                <label
                  htmlFor={optionId}
                  className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {option.label}
                </label>

                {option.description && (
                  <p
                    id={`${optionId}-description`}
                    className="text-xs text-gray-500 dark:text-gray-400 mt-1"
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
};

export default RadioGroup;
