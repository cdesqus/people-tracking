/**
 * @file Select component
 * Dropdown select with grouping, searching, and multi-select support
 *
 * @example
 * <Select
 *   label="Camera"
 *   options={cameras}
 *   value={selectedCamera}
 *   onChange={setSelectedCamera}
 * />
 *
 * @example
 * // Multi-select with grouping
 * <Select
 *   isMulti
 *   searchable
 *   options={[
 *     { label: 'Active', options: [...] },
 *     { label: 'Inactive', options: [...] }
 *   ]}
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import { SelectProps } from './types';
import { TRANSITIONS } from './constants';
import Spinner from './Spinner';

const isOptionGroup = (
  option: any
): option is { label: string; options: any[] } => {
  return 'options' in option && Array.isArray(option.options);
};

/**
 * Select Component
 *
 * A flexible dropdown component supporting single/multi-select, grouping, and search.
 *
 * @param {SelectProps} props - Select component props
 * @returns {React.ReactElement} Select element
 */
const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  isMulti = false,
  searchable = false,
  isLoading = false,
  error,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filterOptions = (opts: any[]) => {
    if (!searchable || !searchTerm) return opts;
    return opts.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const flatOptions = options.flatMap((opt) =>
    isOptionGroup(opt) ? opt.options : [opt]
  );

  const filteredOptions = options.map((opt) => {
    if (isOptionGroup(opt)) {
      return {
        ...opt,
        options: filterOptions(opt.options),
      };
    }
    return opt;
  });

  const getDisplayValue = () => {
    if (!value) return placeholder;
    if (isMulti && Array.isArray(value)) {
      const labels = value
        .map((v) =>
          flatOptions.find((opt) => opt.value === v)?.label || String(v)
        )
        .join(', ');
      return labels || placeholder;
    }
    return (
      flatOptions.find((opt) => opt.value === value)?.label || placeholder
    );
  };

  const handleSelect = (selectedValue: string | number) => {
    if (isMulti && Array.isArray(value)) {
      const newValue = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue];
      onChange?.(newValue);
    } else {
      onChange?.(selectedValue);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled || isLoading}
          className={`w-full px-4 py-2 h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-left text-gray-900 dark:text-white ${
            isOpen ? 'ring-2 ring-sky-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${TRANSITIONS.base} flex items-center justify-between`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{getDisplayValue()}</span>
          {isLoading ? (
            <Spinner size={16} />
          ) : (
            <svg
              className={`w-4 h-4 ${isOpen ? 'rotate-180' : ''} ${TRANSITIONS.base}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          )}
        </button>

        {isOpen && !isLoading && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
            role="listbox"
          >
            {searchable && (
              <div className="sticky top-0 p-2 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                No options available
              </div>
            ) : (
              filteredOptions.map((item, index) => {
                if (isOptionGroup(item)) {
                  return (
                    <div key={`group-${index}`}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700">
                        {item.label}
                      </div>
                      {item.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSelect(opt.value)}
                          disabled={opt.disabled}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            isMulti && Array.isArray(value)
                              ? value.includes(opt.value)
                                ? 'bg-sky-100 dark:bg-sky-900 text-gray-900 dark:text-white'
                                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                              : value === opt.value
                              ? 'bg-sky-100 dark:bg-sky-900 text-gray-900 dark:text-white'
                              : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                          } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${TRANSITIONS.base}`}
                          role="option"
                          aria-selected={
                            isMulti && Array.isArray(value)
                              ? value.includes(opt.value)
                              : value === opt.value
                          }
                        >
                          {isMulti && Array.isArray(value) && (
                            <input
                              type="checkbox"
                              checked={value.includes(opt.value)}
                              readOnly
                              className="mr-2 inline-block"
                              aria-hidden="true"
                            />
                          )}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.value}
                    onClick={() => handleSelect(item.value)}
                    disabled={item.disabled}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      isMulti && Array.isArray(value)
                        ? value.includes(item.value)
                          ? 'bg-sky-100 dark:bg-sky-900'
                          : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                        : value === item.value
                        ? 'bg-sky-100 dark:bg-sky-900'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${TRANSITIONS.base} text-gray-900 dark:text-white`}
                    role="option"
                    aria-selected={
                      isMulti && Array.isArray(value)
                        ? value.includes(item.value)
                        : value === item.value
                    }
                  >
                    {isMulti && Array.isArray(value) && (
                      <input
                        type="checkbox"
                        checked={value.includes(item.value)}
                        readOnly
                        className="mr-2 inline-block"
                        aria-hidden="true"
                      />
                    )}
                    {item.label}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;
