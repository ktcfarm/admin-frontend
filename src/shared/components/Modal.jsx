import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className = '',
}) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative w-full bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-10 my-8 flex flex-col',
          sizeClasses[size] || sizeClasses.md,
          className
        )}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            {title && (
              <h3 id={titleId} className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {description && (
              <p id={descId} className="text-sm text-gray-500 mt-0.5">
                {description}
              </p>
            )}
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/75 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
