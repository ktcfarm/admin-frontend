import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { Select } from './Select.jsx';
import { cn } from '../utils/cn.js';
import { formatTime24To12, parseOperatingHours } from '../utils/formatters.js';

const DEFAULT_HOURS = Object.freeze({
  openTime: '07:00',
  closeTime: '19:00',
  days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
});

const DAY_KEYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

const DEFAULT_PRESETS = [
  { id: 'mon-sat', label: 'Mon–Sat', days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] },
  { id: 'all-days', label: 'All Days', days: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] },
];

function buildTimeOptions() {
  const options = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of [0, 30]) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push({
        value,
        label: formatTime24To12(value),
      });
    }
  }
  return options;
}

export function OperatingHoursInput({
  label,
  helperText,
  error,
  value,
  onChange,
  disabled = false,
  required = false,
  openLabel = 'Open Time',
  closeLabel = 'Close Time',
  daysLabel = 'Operating Days',
  presets = DEFAULT_PRESETS,
  dayLabels,
  className = '',
}) {
  const timeOptions = useMemo(() => buildTimeOptions(), []);

  const current = useMemo(() => {
    const parsed = parseOperatingHours(value);
    if (parsed) {
      return parsed;
    }
    return {
      openTime: DEFAULT_HOURS.openTime,
      closeTime: DEFAULT_HOURS.closeTime,
      days: [...DEFAULT_HOURS.days],
    };
  }, [value]);

  const emitChange = (nextPatch) => {
    if (disabled || !onChange) return;
    onChange({
      ...current,
      ...nextPatch,
    });
  };

  const toggleDay = (dayKey) => {
    if (disabled) return;
    const exists = current.days.includes(dayKey);
    if (exists && current.days.length === 1) {
      return;
    }
    const nextDays = exists
      ? current.days.filter((d) => d !== dayKey)
      : DAY_KEYS.map((d) => d.key).filter((d) => d === dayKey || current.days.includes(d));
    emitChange({ days: nextDays });
  };

  const isPresetActive = (presetDays) =>
    presetDays.length === current.days.length &&
    presetDays.every((day) => current.days.includes(day));

  return (
    <div className={cn('w-full space-y-3', className)}>
      {label && (
        <span className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label={openLabel}
            leftIcon={Clock}
            options={timeOptions}
            value={current.openTime}
            disabled={disabled}
            onChange={(event) => emitChange({ openTime: event.target.value })}
          />

          <Select
            label={closeLabel}
            leftIcon={Clock}
            options={timeOptions}
            value={current.closeTime}
            disabled={disabled}
            onChange={(event) => emitChange({ closeTime: event.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-600">{daysLabel}</span>

            <div className="flex items-center gap-1.5">
              {presets.map((preset) => {
                const active = isPresetActive(preset.days);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => emitChange({ days: [...preset.days] })}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors',
                      active
                        ? 'bg-[#ECFDF5] text-[#0E4B2E] border-[#0E4B2E]/30'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100',
                      disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DAY_KEYS.map((day) => {
              const selected = current.days.includes(day.key);
              const displayLabel = dayLabels?.[day.key] || day.label;

              return (
                <button
                  key={day.key}
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => toggleDay(day.key)}
                  className={cn(
                    'min-w-[46px] px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors select-none',
                    selected
                      ? 'bg-[#0E4B2E] text-white border-[#0E4B2E] shadow-xs'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default OperatingHoursInput;
