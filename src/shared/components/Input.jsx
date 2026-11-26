import React, { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn.js';

function renderIcon(Icon, className) {
  if (!Icon) return null;
  if (React.isValidElement(Icon)) return Icon;
  return <Icon className={className} />;
}

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    prefix,
    suffix,
    type = 'text',
    isPassword = false,
    className = '',
    id,
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center rounded-lg shadow-sm w-full min-w-0">
        {prefix && (
          <span className="inline-flex items-center shrink-0 px-2.5 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm select-none">
            {prefix}
          </span>
        )}

        <div className="relative flex-1 min-w-0 flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
              {renderIcon(leftIcon, 'w-4 h-4')}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            disabled={disabled}
            required={required}
            className={cn(
              'block w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors',
              'focus:outline-none focus:border-[#0E4B2E] focus:ring-1 focus:ring-[#0E4B2E]',
              leftIcon && 'pl-9',
              (rightIcon || isPassword) && 'pr-9',
              prefix && 'rounded-l-none',
              suffix && 'rounded-r-none',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900',
              disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200',
              className
            )}
            {...props}
          />

          {isPassword && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {!isPassword && rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-gray-400">
              {renderIcon(rightIcon, 'w-4 h-4')}
            </div>
          )}
        </div>

        {suffix && (
          <span className="inline-flex items-center shrink-0 px-2.5 py-2 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-xs font-medium select-none">
            {suffix}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
});
