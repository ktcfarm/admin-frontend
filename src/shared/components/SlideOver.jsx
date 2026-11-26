import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-2xl lg:max-w-3xl',
  '2xl': 'max-w-4xl',
};

export function SlideOver({
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
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div
          className={cn(
            'w-screen bg-white shadow-2xl border-l border-gray-200 flex flex-col h-full',
            sizeClasses[size] || sizeClasses.md,
            className
          )}
        >
          <div className="shrink-0 flex items-start justify-between px-6 py-5 border-b border-gray-100 bg-white">
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
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex-1 px-6 py-5 overflow-y-auto">
            {children}
          </div>

          {footer && (
            <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/90 border-t border-gray-100">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
