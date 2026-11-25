import React, { useId, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn.js';

export function OtpPinInput({
  length = 6,
  value = '',
  onChange,
  onComplete,
  masked = false,
  allowReveal = false,
  label,
  helperText,
  error,
  disabled = false,
  autoFocus = false,
  className = '',
  id
}) {
  const generatedId = useId();
  const groupId = id || generatedId;
  const inputRefs = useRef([]);
  const [isRevealed, setIsRevealed] = useState(false);

  const sanitizedValue = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, length);

  const digits = Array.from({ length }, (_, index) => sanitizedValue[index] || '');

  const emitChange = (nextDigits) => {
    const nextCode = nextDigits.join('').slice(0, length);
    onChange?.(nextCode);
    if (nextCode.length === length && nextDigits.every((d) => d !== '')) {
      onComplete?.(nextCode);
    }
  };

  const focusBox = (index) => {
    const bounded = Math.max(0, Math.min(index, length - 1));
    inputRefs.current[bounded]?.focus();
    inputRefs.current[bounded]?.select();
  };

  const handleChange = (index, event) => {
    if (disabled) return;
    const raw = event.target.value.replace(/\D/g, '');

    if (!raw) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      emitChange(nextDigits);
      return;
    }

    if (raw.length > 1) {
      const nextDigits = [...digits];
      const chars = raw.slice(0, length - index).split('');
      chars.forEach((char, offset) => {
        nextDigits[index + offset] = char;
      });
      emitChange(nextDigits);
      focusBox(Math.min(index + chars.length, length - 1));
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = raw;
    emitChange(nextDigits);
    if (index < length - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (disabled) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      const nextDigits = [...digits];
      if (nextDigits[index]) {
        nextDigits[index] = '';
        emitChange(nextDigits);
        return;
      }
      if (index > 0) {
        nextDigits[index - 1] = '';
        emitChange(nextDigits);
        focusBox(index - 1);
      }
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index] = '';
      emitChange(nextDigits);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (index > 0) {
        focusBox(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      if (index < length - 1) {
        focusBox(index + 1);
      }
    }
  };

  const handlePaste = (index, event) => {
    if (disabled) return;
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const pastedDigits = pastedText.replace(/\D/g, '');
    if (!pastedDigits) return;

    const nextDigits = [...digits];
    const startAt = pastedDigits.length >= length ? 0 : index;
    const chars = pastedDigits.slice(0, length - startAt).split('');

    chars.forEach((char, offset) => {
      nextDigits[startAt + offset] = char;
    });

    emitChange(nextDigits);
    const nextFocusIndex = Math.min(startAt + chars.length - 1, length - 1);
    focusBox(nextFocusIndex);
  };

  const inputType = masked && !isRevealed ? 'password' : 'text';

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={`${groupId}-0`}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div
          role="group"
          aria-labelledby={label ? `${groupId}-0` : undefined}
          className="flex items-center gap-2"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              id={`${groupId}-${index}`}
              type={inputType}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={masked ? 'off' : index === 0 ? 'one-time-code' : 'off'}
              maxLength={length}
              value={digit}
              disabled={disabled}
              autoFocus={autoFocus && index === 0}
              aria-label={`${label || 'Code'} digit ${index + 1}`}
              aria-invalid={Boolean(error)}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={(e) => e.target.select()}
              className={cn(
                'w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-bold rounded-xl border border-gray-300 bg-white text-gray-900 shadow-xs transition-all',
                'focus:outline-none focus:border-[#0E4B2E] focus:ring-2 focus:ring-[#0E4B2E]/20',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20 text-red-900',
                disabled && 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
              )}
            />
          ))}
        </div>

        {masked && allowReveal && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsRevealed((prev) => !prev)}
            aria-label={isRevealed ? 'Hide PIN' : 'Reveal PIN'}
            className={cn(
              'p-2.5 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors focus:outline-none focus:border-[#0E4B2E]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default OtpPinInput;
