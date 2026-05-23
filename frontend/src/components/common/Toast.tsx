/**
 * @file Toast component
 * Notification popup that appears in corner with auto-dismiss
 *
 * @example
 * <Toast
 *   type="success"
 *   title="Success"
 *   message="Operation completed successfully"
 *   duration={3000}
 *   onDismiss={handleDismiss}
 * />
 *
 * @example
 * // Toast with action button
 * <Toast
 *   type="info"
 *   message="New alerts available"
 *   action={{ label: 'View', onClick: handleView }}
 *   onDismiss={handleDismiss}
 * />
 */

import React, { useEffect } from 'react';
import { ToastProps } from './types';
import { TOAST_STYLES, TRANSITIONS } from './constants';

/**
 * Toast Component
 *
 * A compact notification that appears in the corner with auto-dismiss.
 *
 * @param {ToastProps} props - Toast component props
 * @returns {React.ReactElement} Toast element
 */
const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 3000,
  action,
  onDismiss,
}) => {
  useEffect(() => {
    if (!duration || duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onDismiss]);

  const styles = TOAST_STYLES[type];

  return (
    <div
      className={`${styles.bg} text-white rounded-lg shadow-lg p-4 flex items-start gap-3 min-w-72 max-w-md ${TRANSITIONS.base}`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
        {styles.icon}
      </span>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold text-sm">{title}</h4>
        )}
        <p className={`${title ? 'mt-1' : ''} text-sm opacity-90`}>
          {typeof message === 'string' ? message : message}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onDismiss(id);
            }}
            className="text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {action.label}
          </button>
        )}

        <button
          onClick={() => onDismiss(id)}
          className="inline-flex items-center justify-center w-5 h-5 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss notification"
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;

/**
 * Toast Container Component - manages multiple toasts
 *
 * @example
 * const [toasts, setToasts] = useState<Toast[]>([]);
 *
 * const addToast = (toast: Omit<Toast, 'id'>) => {
 *   const id = Date.now().toString();
 *   setToasts(prev => [...prev, { ...toast, id }]);
 * };
 *
 * <ToastContainer
 *   toasts={toasts}
 *   onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
 * />
 */
interface ToastContainerProps {
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
};
