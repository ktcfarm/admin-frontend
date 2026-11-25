import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn.js';

const variantClasses = {
  primary: 'bg-[#0E4B2E] text-white hover:bg-[#0A3A23] active:bg-[#082a19] focus-visible:ring-[#0E4B2E] shadow-sm',
  secondary: 'bg-[#FACC15] text-[#0E4B2E] font-semibold hover:bg-[#eab308] active:bg-[#ca8a04] focus-visible:ring-[#FACC15] shadow-sm',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-[#0E4B2E] shadow-sm',
  ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-600 shadow-sm',
};

const sizeClasses = {
  sm: 'h-8 px-2.5 text-xs rounded-md gap-1.5',
  md: 'h-9 px-3.5 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-base rounded-lg gap-2.5',
};

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

function renderIcon(Icon, className) {
  if (!Icon) return null;
  if (React.isValidElement(Icon)) return Icon;
  return <Icon className={className} />;
}

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const iconClass = iconSizes[size] || iconSizes.md;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        isDisabled && 'opacity-60 cursor-not-allowed pointer-events-none shadow-none',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn('animate-spin', iconClass)} />
      ) : (
        renderIcon(leftIcon, iconClass)
      )}
      {children}
      {!loading && renderIcon(rightIcon, iconClass)}
    </button>
  );
});
