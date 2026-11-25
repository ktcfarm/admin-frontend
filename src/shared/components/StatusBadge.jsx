import React from 'react';
import { cn } from '../utils/cn.js';

const statusVariants = {
  success: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/60',
    dot: 'bg-emerald-500',
  },
  warning: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200/60',
    dot: 'bg-amber-500',
  },
  danger: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/60',
    dot: 'bg-rose-500',
  },
  error: {
    badge: 'bg-rose-50 text-rose-800 border-rose-200/60',
    dot: 'bg-rose-500',
  },
  info: {
    badge: 'bg-blue-50 text-blue-800 border-blue-200/60',
    dot: 'bg-blue-500',
  },
  neutral: {
    badge: 'bg-gray-100 text-gray-700 border-gray-200/60',
    dot: 'bg-gray-400',
  },
  gold: {
    badge: 'bg-[#FEF9C3] text-[#0E4B2E] border-[#FDE047]',
    dot: 'bg-[#FACC15]',
  },
};

const sizeClasses = {
  sm: 'text-[11px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const dotSizes = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export function StatusBadge({
  status = 'neutral',
  label,
  dot = true,
  size = 'md',
  icon: Icon,
  className = '',
  children,
}) {
  const normalizedStatus = String(status).toLowerCase();
  const variant = statusVariants[normalizedStatus] || statusVariants.neutral;
  const content = children ?? label ?? status;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border select-none',
        variant.badge,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    >
      {dot && !Icon && (
        <span
          className={cn(
            'rounded-full flex-shrink-0',
            variant.dot,
            dotSizes[size] || dotSizes.md
          )}
          aria-hidden="true"
        />
      )}
      {Icon && (
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      )}
      <span>{content}</span>
    </span>
  );
}
