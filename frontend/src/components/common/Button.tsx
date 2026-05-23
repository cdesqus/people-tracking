/**
 * @file Button component
 * Reusable button with multiple variants, sizes, and states
 *
 * @example
 * // Primary button
 * <Button onClick={handleClick}>Click me</Button>
 *
 * @example
 * // Loading state with icon
 * <Button variant="success" size="lg" isLoading leftIcon={<Icon />}>
 *   Save Changes
 * </Button>
 *
 * @example
 * // Danger button
 * <Button variant="danger" onClick={handleDelete}>Delete</Button>
 */

import React, { forwardRef } from 'react';
import { ButtonProps } from './types';
import { BUTTON_SIZES, BUTTON_VARIANTS, TRANSITIONS } from './constants';
import Spinner from './Spinner';

/**
 * Button Component
 *
 * A flexible, accessible button component supporting multiple variants and states.
 *
 * @param {ButtonProps} props - Button component props
 * @returns {React.ReactElement} Button element
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const sizeStyles = BUTTON_SIZES[size];
    const variantStyles = BUTTON_VARIANTS[variant];

    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed';

    const classes = [
      baseStyles,
      sizeStyles.padding,
      sizeStyles.fontSize,
      sizeStyles.height,
      variantStyles.base,
      variantStyles.disabled,
      TRANSITIONS.base,
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...rest}
      >
        {isLoading ? (
          <>
            <Spinner size={size === 'lg' ? 20 : size === 'md' ? 16 : 14} />
            <span className="ml-2">{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
