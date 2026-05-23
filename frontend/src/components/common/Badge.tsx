/**
 * @file Badge component
 * Status indicator with color variants
 *
 * @example
 * // Camera status badge
 * <Badge color="green">Online</Badge>
 * <Badge color="red">Offline</Badge>
 * <Badge color="yellow">Warning</Badge>
 *
 * @example
 * // Alert status
 * <Badge color="blue" size="lg">Critical Alert</Badge>
 */

import React from 'react';
import { BadgeProps } from './types';
import { BADGE_COLORS, BADGE_SIZES } from './constants';

/**
 * Badge Component
 *
 * A small status indicator component for displaying tags or status.
 *
 * @param {BadgeProps} props - Badge component props
 * @returns {React.ReactElement} Badge element
 */
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { color = 'blue', size = 'md', className = '', children, ...rest },
    ref
  ) => {
    const colorStyles = BADGE_COLORS[color];
    const sizeStyles = BADGE_SIZES[size];

    const badgeClasses = [
      'inline-flex items-center font-medium rounded-full border',
      colorStyles.bg,
      colorStyles.text,
      colorStyles.border,
      sizeStyles.padding,
      sizeStyles.fontSize,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={badgeClasses} {...rest}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
