import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function SearchBar({
  value,
  defaultValue = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  debounceMs = 300,
  shortcutHint = '⌘K',
  className = '',
  size = 'md',
  ...props
}) {
  const [internalValue, setInternalValue] = useState(value ?? defaultValue);
  const [prevValue, setPrevValue] = useState(value);
  const isDirty = useRef(false);
  const inputRef = useRef(null);

  if (value !== undefined && value !== prevValue) {
    setPrevValue(value);
    setInternalValue(value);
  }

  useEffect(() => {
    if (!isDirty.current) return;

    const timer = setTimeout(() => {
      onChange?.(internalValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange]);

  useEffect(() => {
    if (!shortcutHint) return;

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutHint]);

  const handleChange = (e) => {
    isDirty.current = true;
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    isDirty.current = true;
    setInternalValue('');
    onChange?.('');
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div
      role="search"
      className={cn('relative flex items-center w-full', className)}
    >
      <div className="absolute left-3 flex items-center pointer-events-none text-gray-400">
        <Search className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'block w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-colors',
          'focus:outline-none focus:border-[#0E4B2E] focus:ring-1 focus:ring-[#0E4B2E]',
          size === 'sm' ? 'py-1.5 pl-8 pr-16 text-xs' : 'py-2 pl-9 pr-20 text-sm',
          className
        )}
        {...props}
      />

      <div className="absolute right-2.5 flex items-center gap-1.5">
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {shortcutHint && !internalValue && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded select-none">
            {shortcutHint}
          </kbd>
        )}
      </div>
    </div>
  );
}
