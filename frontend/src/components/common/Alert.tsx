/**
 * @file Alert component
 * Dismissible alert/notification banner with 4 types (error, warning, success, info)
 *
 * @example
 * <Alert type="success" message="Settings saved successfully!" />
 *
 * @example
 * // With auto-dismiss
 * <Alert
 *   type="error"
 *   title="Connection Error"
 *   message="Failed to connect to server"
 *   autoDismiss={5000}
 *   onDismiss={() => clearError()}
 * />
 *
 * @example
 * // Dismissible alert
 * <Alert
 *   type="warning"
 *   message="Camera offline"
 *   dismissible
 *   onDismiss={handleDismiss}
 * />
 */

import React, { useState, useEffect } from 'react';
import { AlertProps } from './types';
import { ALERT_STYLES, TRANSITIONS } from './constants';

/**
 * Alert Component
 *
 * A flexible alert component supporting multiple types with auto-dismiss capability.
 *
 * @param {AlertProps} props - Alert component props
 * @returns {React.ReactElement} Alert element
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      type = 'info',
      title,
      message,
      dismissible = true,
      autoDismiss = false,
      onDismiss,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    // Auto-dismiss functionality
    useEffect(() => {
      if (!autoDismiss || !isVisible) return;

      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }, [autoDismiss, isVisible, onDismiss]);

    if (!isVisible) return null;

    const styles = ALERT_STYLES[type];

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    const alertClasses = [
      'flex items-start gap-3 p-4 rounded-lg border',
      styles.bg,
      styles.border,
      styles.text,
      TRANSITIONS.base,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={alertClasses}
        role="alert"
        aria-live="polite"
        {...rest}
      >
        <span className="text-xl flex-shrink-0 mt-0.5">{styles.icon}</span>

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`font-semibold ${styles.titleText}`}>{title}</h4>
          )}
          <p className={`${title ? 'mt-0.5' : ''} text-sm`}>
            {typeof message === 'string' ? message : message}
          </p>
          {children}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded hover:bg-black/10 dark:hover:bg-white/10 ${TRANSITIONS.base}`}
            aria-label="Dismiss alert"
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
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
