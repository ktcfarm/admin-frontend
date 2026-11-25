import React, { useId } from 'react';
import { cn } from '../utils/cn.js';

export function Toggle({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  id,
  ...props
}) {
  const generatedId = useId();
  const toggleId = id || generatedId;

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      {(label || description) && (
        <div className="flex-1 select-none">
          {label && (
            <label
              htmlFor={toggleId}
              onClick={handleToggle}
              className={cn(
                'block text-sm font-medium text-gray-900 cursor-pointer',
                disabled && 'cursor-not-allowed text-gray-400'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              className={cn(
                'text-xs text-gray-500 mt-0.5',
                disabled && 'text-gray-400'
              )}
            >
              {description}
            </p>
          )}
        </div>
      )}

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-[#0E4B2E] focus:ring-offset-2',
          checked ? 'bg-[#0E4B2E]' : 'bg-gray-200',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
