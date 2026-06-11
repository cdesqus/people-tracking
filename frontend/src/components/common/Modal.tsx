/**
 * @file Modal component
 * Dialog/popup modal with customizable content and actions
 *
 * @example
 * <Modal isOpen={isOpen} title="Confirm Delete" onClose={handleClose}>
 *   <p>Are you sure you want to delete this item?</p>
 *   <footer>
 *     <Button variant="danger" onClick={handleDelete}>Delete</Button>
 *     <Button onClick={handleClose}>Cancel</Button>
 *   </footer>
 * </Modal>
 *
 * @example
 * // Large modal with custom header
 * <Modal isOpen={isOpen} size="lg" onClose={handleClose}>
 *   <header>Custom Header</header>
 *   <p>Modal content goes here</p>
 * </Modal>
 */

import React, { useEffect } from 'react';
import { ModalProps } from './types';
import { MODAL_SIZES, Z_INDEX, TRANSITIONS } from './constants';

/**
 * Modal Component
 *
 * A flexible modal/dialog component with backdrop and customizable content.
 *
 * @param {ModalProps} props - Modal component props
 * @returns {React.ReactElement | null} Modal element or null if closed
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  size = 'md',
  onClose,
  closeOnBackdrop = true,
  header,
  children,
  footer,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalSizeClass = MODAL_SIZES[size];

  return (
    <div
      className={`fixed inset-0 ${Z_INDEX.modal} ${TRANSITIONS.base}`}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 dark:bg-black/70 ${TRANSITIONS.base}`}
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`bg-white dark:bg-slate-100 rounded-lg shadow-xl ${modalSizeClass} w-full max-h-[90vh] overflow-y-auto ${TRANSITIONS.base}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {header ? (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-300">
              {header}
            </div>
          ) : title ? (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-300">
              <h2
                id="modal-title"
                className="text-xl font-semibold text-gray-900 dark:text-slate-900"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-slate-200 transition-colors"
                aria-label="Close modal"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : null}

          {/* Body */}
          <div className="px-6 py-4 text-gray-900 dark:text-slate-900">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-300 bg-gray-50 dark:bg-slate-200/50 flex items-center justify-end gap-3 rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
