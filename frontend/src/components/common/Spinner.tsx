/**
 * @file Spinner component
 * Animated loading spinner
 *
 * @example
 * <Spinner size={24} />
 */

import React from 'react';

interface SpinnerProps {
  /** Spinner size in pixels */
  size?: number;
  /** Spinner color (tailwind class or hex) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Spinner Component
 *
 * An animated loading spinner used by other components
 *
 * @param {SpinnerProps} props - Spinner props
 * @returns {React.ReactElement} SVG spinner element
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`inline-block animate-spin ${className}`}
      aria-label="Loading"
      role="status"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default Spinner;
