/**
 * @file Dropdown component
 * Context menu style dropdown with trigger and items
 *
 * @example
 * <Dropdown
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { id: '1', label: 'Edit', onClick: handleEdit },
 *     { id: '2', label: 'Delete', onClick: handleDelete }
 *   ]}
 * />
 *
 * @example
 * // With icons and disabled items
 * <Dropdown
 *   trigger={<MoreIcon />}
 *   align="right"
 *   items={[
 *     { id: '1', label: 'Share', icon: <ShareIcon /> },
 *     { id: '2', label: 'Archive', icon: <ArchiveIcon /> },
 *     { id: '3', divider: true },
 *     { id: '4', label: 'Delete', icon: <DeleteIcon />, disabled: true }
 *   ]}
 * />
 */

import React, { useState, useRef, useEffect } from 'react';
import { DropdownProps } from './types';
import { Z_INDEX, TRANSITIONS } from './constants';

/**
 * Dropdown Component
 *
 * A flexible dropdown menu component with customizable items.
 *
 * @param {DropdownProps} props - Dropdown component props
 * @returns {React.ReactElement} Dropdown element
 */
const Dropdown: React.FC<DropdownProps> = ({
  items,
  trigger,
  align = 'left',
  closeOnClick = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleItemClick = (onClick: () => void) => {
    onClick();
    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute top-full mt-1 min-w-48 bg-white dark:bg-slate-100 border border-gray-200 dark:border-slate-300 rounded-lg shadow-lg ${Z_INDEX.dropdown} ${
            align === 'right' ? 'right-0' : 'left-0'
          } py-1 z-50 ${TRANSITIONS.base}`}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={index}
                  className="my-1 border-t border-gray-200 dark:border-slate-300"
                  role="separator"
                />
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.onClick)}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 ${
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed text-slate-500'
                    : 'text-gray-900 dark:text-slate-900 hover:bg-gray-100 dark:hover:bg-slate-200'
                } ${TRANSITIONS.base}`}
                role="menuitem"
                aria-disabled={item.disabled}
              >
                {item.icon && (
                  <span className="flex items-center justify-center w-5 h-5">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
