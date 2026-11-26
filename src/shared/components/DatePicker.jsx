import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn.js';

const POPOVER_WIDTH = 288;
const DEFAULT_POPOVER_HEIGHT = 340;
const VIEWPORT_PADDING = 12;
const POPOVER_GAP = 8;

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseLocalDate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return null;
  }
  const [y, m, d] = str.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function formatLocalDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(str) {
  const parsed = parseLocalDate(str);
  if (!parsed) return '';
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = SHORT_MONTHS[parsed.getMonth()];
  const year = parsed.getFullYear();
  return `${day} ${month} ${year}`;
}

function computePopoverPosition(rect, popoverHeight = DEFAULT_POPOVER_HEIGHT) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = rect.left;
  if (left + POPOVER_WIDTH > viewportWidth - VIEWPORT_PADDING) {
    left = Math.max(VIEWPORT_PADDING, rect.right - POPOVER_WIDTH);
  }
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, viewportWidth - POPOVER_WIDTH - VIEWPORT_PADDING)
  );

  let top = rect.bottom + POPOVER_GAP;
  const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING;
  const spaceAbove = rect.top - VIEWPORT_PADDING;
  if (
    rect.bottom + popoverHeight > viewportHeight - VIEWPORT_PADDING &&
    spaceAbove > spaceBelow
  ) {
    top = Math.max(VIEWPORT_PADDING, rect.top - popoverHeight - POPOVER_GAP);
  }

  return { top, left };
}

export function DatePicker({
  label,
  value = '',
  onChange,
  placeholder = 'Select date',
  required = false,
  error,
  helperText,
  disabled = false,
  minDate,
  maxDate,
  size = 'md',
  todayLabel = 'Today',
  clearLabel = 'Clear',
  className = '',
  id
}) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [todayStr] = useState(() => formatLocalDate(new Date()));

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [viewYear, setViewYear] = useState(
    () => (parseLocalDate(value) || new Date()).getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    () => (parseLocalDate(value) || new Date()).getMonth()
  );

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const measuredHeight = popoverRef.current?.offsetHeight || DEFAULT_POPOVER_HEIGHT;
    setCoords(computePopoverPosition(rect, measuredHeight));
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const rafId = requestAnimationFrame(updatePosition);
    const handlePointerDown = (event) => {
      const clickedTrigger = triggerRef.current?.contains(event.target);
      const clickedPopover = popoverRef.current?.contains(event.target);
      if (!clickedTrigger && !clickedPopover) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, viewYear, viewMonth, updatePosition]);

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i -= 1) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(viewYear, viewMonth - 1, dayNum);
      cells.push({
        dateStr: formatLocalDate(date),
        day: dayNum,
        inCurrentMonth: false
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(viewYear, viewMonth, day);
      cells.push({
        dateStr: formatLocalDate(date),
        day,
        inCurrentMonth: true
      });
    }

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= trailing; day += 1) {
      const date = new Date(viewYear, viewMonth + 1, day);
      cells.push({
        dateStr: formatLocalDate(date),
        day,
        inCurrentMonth: false
      });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const handleToggleOpen = () => {
    if (disabled) return;
    if (!open) {
      const anchor = parseLocalDate(value) || new Date();
      setViewYear(anchor.getFullYear());
      setViewMonth(anchor.getMonth());
      if (triggerRef.current) {
        setCoords(computePopoverPosition(triggerRef.current.getBoundingClientRect()));
      }
    }
    setOpen((prev) => !prev);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isDateDisabled = (dateStr) => {
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };

  const handleSelectDate = (dateStr) => {
    if (isDateDisabled(dateStr)) return;
    onChange?.(dateStr);
    setOpen(false);
  };

  const handleSelectToday = () => {
    if (isDateDisabled(todayStr)) return;
    onChange?.(todayStr);
    setOpen(false);
  };

  const handleClear = () => {
    onChange?.('');
    setOpen(false);
  };

  const formattedValue = formatDisplayDate(value);
  const sizeClasses =
    size === 'sm' ? 'h-8 px-2.5 text-xs' : 'min-h-[38px] px-3 py-2 text-sm';

  return (
    <div className={cn('relative w-full', className)}>
      {label ? (
        <label
          htmlFor={controlId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
          {required ? <span className="text-red-500 ml-0.5">*</span> : null}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        id={controlId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={handleToggleOpen}
        className={cn(
          'w-full flex items-center justify-between gap-2 rounded-lg border bg-white text-left transition-colors',
          'focus:outline-none',
          sizeClasses,
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200'
            : open
              ? 'border-[#0E4B2E] ring-2 ring-[#0E4B2E]/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-[#0E4B2E] focus:ring-2 focus:ring-[#0E4B2E]/20',
          disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <span className={cn('truncate', formattedValue ? 'text-slate-900' : 'text-slate-400')}>
          {formattedValue || placeholder}
        </span>
        <Calendar className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label={label || placeholder}
              style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
              className="fixed z-[70] w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-slate-900">
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    className="text-center text-[11px] font-medium text-slate-400 py-1"
                  >
                    {weekday}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((cell) => {
                  const isSelected = value === cell.dateStr;
                  const isToday = todayStr === cell.dateStr;
                  const dayDisabled = isDateDisabled(cell.dateStr);

                  return (
                    <button
                      key={cell.dateStr}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => handleSelectDate(cell.dateStr)}
                      className={cn(
                        'h-8 w-full rounded-lg text-xs flex items-center justify-center transition-colors',
                        isSelected
                          ? 'bg-[#0E4B2E] text-white font-semibold'
                          : dayDisabled
                            ? 'text-slate-300 cursor-not-allowed'
                            : isToday
                              ? 'ring-1 ring-[#0E4B2E] text-[#0E4B2E] font-semibold hover:bg-[#0E4B2E]/10'
                              : cell.inCurrentMonth
                                ? 'text-slate-700 hover:bg-[#0E4B2E]/10'
                                : 'text-slate-400 hover:bg-slate-100'
                      )}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isDateDisabled(todayStr)}
                  onClick={handleSelectToday}
                  className="text-xs font-medium text-[#0E4B2E] hover:underline disabled:text-slate-300 disabled:no-underline"
                >
                  {todayLabel}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  {clearLabel}
                </button>
              </div>
            </div>,
            document.body
          )
        : null}

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
