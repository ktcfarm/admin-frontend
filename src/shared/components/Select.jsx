import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn.js';

function normalizeOptions(options = []) {
  return options.map((option) => {
    if (typeof option === 'object' && option !== null) {
      return {
        value: option.value,
        label: option.label ?? String(option.value ?? ''),
        subtitle: option.subtitle ?? option.description ?? null,
        disabled: Boolean(option.disabled)
      };
    }
    return {
      value: option,
      label: String(option ?? ''),
      subtitle: null,
      disabled: false
    };
  });
}

function findNextEnabledIndex(options, startIndex, direction) {
  if (!options.length) return -1;
  let index = startIndex;
  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;
    if (!options[index].disabled) {
      return index;
    }
  }
  return -1;
}

export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option',
    value,
    onChange,
    className = '',
    id,
    name,
    disabled = false,
    required = false,
    leftIcon: LeftIcon,
    size = 'md',
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const labelId = `${selectId}-label`;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const normalizedOptions = useMemo(() => normalizeOptions(options), [options]);

  const selectedIndex = useMemo(
    () => normalizedOptions.findIndex((opt) => opt.value === value),
    [normalizedOptions, value]
  );

  const selectedOption = selectedIndex >= 0 ? normalizedOptions[selectedIndex] : null;

  const setMergedRef = (node) => {
    triggerRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  const openMenu = () => {
    if (disabled) return;
    const initialIndex =
      selectedIndex >= 0 && !normalizedOptions[selectedIndex]?.disabled
        ? selectedIndex
        : findNextEnabledIndex(normalizedOptions, -1, 1);
    setHighlightedIndex(initialIndex);
    setIsOpen(true);
  };

  const closeMenu = (restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  };

  const selectOption = (option) => {
    if (!option || option.disabled) return;
    if (onChange) {
      onChange({
        target: { value: option.value, name },
        currentTarget: { value: option.value, name }
      });
    }
    closeMenu(true);
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          const base = highlightedIndex >= 0 ? highlightedIndex : -1;
          setHighlightedIndex(findNextEnabledIndex(normalizedOptions, base, 1));
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        if (!isOpen) {
          openMenu();
        } else {
          const base = highlightedIndex >= 0 ? highlightedIndex : 0;
          setHighlightedIndex(findNextEnabledIndex(normalizedOptions, base, -1));
        }
        break;
      }
      case 'Home': {
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(findNextEnabledIndex(normalizedOptions, -1, 1));
        }
        break;
      }
      case 'End': {
        if (isOpen) {
          event.preventDefault();
          setHighlightedIndex(findNextEnabledIndex(normalizedOptions, 0, -1));
        }
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (!isOpen) {
          openMenu();
        } else if (highlightedIndex >= 0 && normalizedOptions[highlightedIndex]) {
          selectOption(normalizedOptions[highlightedIndex]);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          event.preventDefault();
          closeMenu(true);
        }
        break;
      }
      case 'Tab': {
        if (isOpen) {
          setIsOpen(false);
        }
        break;
      }
      default:
        break;
    }
  };

  const sizeClasses = size === 'sm' ? 'h-8 px-2.5 text-xs' : 'min-h-[38px] px-3 py-2 text-sm';

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label
          id={labelId}
          htmlFor={selectId}
          onClick={() => {
            if (!disabled) {
              triggerRef.current?.focus();
            }
          }}
          className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          ref={setMergedRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={Boolean(error)}
          aria-required={required}
          disabled={disabled}
          onClick={() => (isOpen ? closeMenu(false) : openMenu())}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white text-left shadow-sm transition-colors',
            'focus:outline-none focus:border-[#0E4B2E] focus:ring-1 focus:ring-[#0E4B2E]',
            isOpen && !error && 'border-[#0E4B2E] ring-1 ring-[#0E4B2E]',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200',
            sizeClasses,
            className
          )}
          {...props}
        >
          <span className="flex items-center gap-2 min-w-0 flex-1">
            {LeftIcon && (
              <LeftIcon className="w-4 h-4 text-gray-400 shrink-0" />
            )}
            <span
              className={cn(
                'truncate block',
                selectedOption ? 'text-gray-900' : 'text-gray-400',
                disabled && 'text-gray-500',
                error && selectedOption && 'text-red-900'
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </span>

          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180 text-[#0E4B2E]'
            )}
          />
        </button>

        {isOpen && (
          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? labelId : undefined}
            className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1 z-50 focus:outline-none"
          >
            {normalizedOptions.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-500 text-center">
                No options available
              </li>
            ) : (
              normalizedOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={option.value ?? index}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onMouseEnter={() => {
                      if (!option.disabled) {
                        setHighlightedIndex(index);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(option);
                    }}
                    className={cn(
                      'flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors select-none',
                      option.disabled
                        ? 'text-gray-400 cursor-not-allowed opacity-60'
                        : 'cursor-pointer hover:bg-ktc-green/5',
                      isHighlighted && !option.disabled && 'bg-ktc-green/5',
                      isSelected && 'bg-[#ECFDF5] text-[#0E4B2E] font-medium'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.subtitle && (
                        <span className="block text-xs text-gray-500 truncate mt-0.5 font-normal">
                          {option.subtitle}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0E4B2E] shrink-0" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
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

export default Select;
