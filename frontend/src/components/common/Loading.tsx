/**
 * @file Loading component
 * Spinner, skeleton screen, and progress bar variants
 *
 * @example
 * <Loading text="Loading data..." />
 *
 * @example
 * // Skeleton screen
 * <Loading variant="skeleton" />
 *
 * @example
 * // Progress bar
 * <Loading variant="progress" progress={65} />
 */

import React from 'react';
import { LoadingProps } from './types';
import Spinner from './Spinner';

/**
 * Loading Component
 *
 * A versatile loading indicator with multiple variants.
 *
 * @param {LoadingProps} props - Loading component props
 * @returns {React.ReactElement} Loading element
 */
const Loading: React.FC<LoadingProps> = ({
  text = 'Loading...',
  size = 40,
  variant = 'spinner',
  progress = 0,
  className = '',
  ...rest
}) => {
  if (variant === 'skeleton') {
    return (
      <div
        className={`space-y-4 animate-pulse ${className}`}
        role="status"
        aria-label="Loading skeleton"
        {...rest}
      >
        <div className="h-12 bg-gray-200 dark:bg-slate-200 rounded-lg" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-slate-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-slate-200 rounded w-4/6" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-slate-200 rounded w-1/4" />
      </div>
    );
  }

  if (variant === 'progress') {
    return (
      <div
        className={`w-full ${className}`}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        {...rest}
      >
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-500 min-w-12 text-right">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    );
  }

  // Default spinner variant
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-label={text}
      {...rest}
    >
      <Spinner size={size} />
      {text && (
        <p className="text-gray-600 dark:text-slate-500 text-sm font-medium">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
