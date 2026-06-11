/**
 * @file Card component
 * Container component with optional header, title, and actions
 *
 * @example
 * <Card title="Camera Feed" subtitle="Main Entrance">
 *   <video src={stream} />
 * </Card>
 *
 * @example
 * // Clickable card
 * <Card
 *   title="Alert"
 *   clickable
 *   onClick={() => navigate(`/alerts/${alert.id}`)}
 * >
 *   {alert.message}
 * </Card>
 *
 * @example
 * // Card with actions
 * <Card
 *   title="Detection"
 *   actions={<Button size="sm">Edit</Button>}
 * >
 *   {content}
 * </Card>
 */

import React from 'react';
import { CardProps } from './types';
import { CARD_PADDING, CARD_SHADOWS, TRANSITIONS } from './constants';

/**
 * Card Component
 *
 * A flexible container component for grouping related content.
 *
 * @param {CardProps} props - Card component props
 * @returns {React.ReactElement} Card element
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      actions,
      padding = 'md',
      shadow = 'md',
      clickable = false,
      onClick,
      children,
      className = '',
      ...rest
    },
    ref
  ) => {
    const paddingClass = CARD_PADDING[padding];
    const shadowClass = CARD_SHADOWS[shadow];

    const cardClasses = [
      'bg-white dark:bg-slate-100',
      'border border-gray-200 dark:border-slate-300',
      'rounded-lg',
      shadowClass,
      clickable
        ? `cursor-pointer hover:shadow-lg ${TRANSITIONS.base}`
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={clickable ? onClick : undefined}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        onKeyPress={
          clickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onClick?.();
                }
              }
            : undefined
        }
        {...rest}
      >
        {(title || subtitle || actions) && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-300 flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-slate-500 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        )}

        <div className={padding !== 'none' ? paddingClass : ''}>{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
