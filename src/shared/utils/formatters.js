export function formatINR(amount, options = {}) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '—';
  }

  const num = Number(amount);
  const {
    compact = false,
    decimals = 2,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  if (compact) {
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (abs >= 10000000) {
      const crVal = (abs / 10000000).toFixed(decimals);
      return `${sign}₹${Number(crVal).toString()} Cr`;
    }
    if (abs >= 100000) {
      const lVal = (abs / 100000).toFixed(decimals);
      return `${sign}₹${Number(lVal).toString()} L`;
    }
    if (abs >= 1000) {
      const kVal = (abs / 1000).toFixed(Math.min(decimals, 1));
      return `${sign}₹${Number(kVal).toString()} K`;
    }
  }

  const minDec = minimumFractionDigits !== undefined
    ? minimumFractionDigits
    : (Number.isInteger(num) && options.decimals === undefined ? 0 : decimals);
  const maxDec = maximumFractionDigits !== undefined ? maximumFractionDigits : decimals;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: minDec,
    maximumFractionDigits: maxDec,
  }).format(num);
}

export function formatWeight(value, unit = 'kg') {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return `0 ${unit}`;
  }

  const num = Number(value);
  const formattedNum = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(num);

  return `${formattedNum} ${unit}`;
}

export function formatDateTime(dateStr, format = 'standard') {
  if (!dateStr) return '—';

  const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (isNaN(date.getTime())) return '—';

  if (format === 'date') {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  if (format === 'time') {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  if (format === 'short') {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

const ORDERED_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DEFAULT_DAY_SHORT = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
  SUN: 'Sun',
};

export function formatTime24To12(time24) {
  if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) {
    return time24 || '';
  }
  const [hourStr, minuteStr] = time24.split(':');
  const hour24 = Number.parseInt(hourStr, 10);
  if (Number.isNaN(hour24)) return time24;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, '0')}:${minuteStr} ${period}`;
}

export function parseOperatingHours(rawValue) {
  if (!rawValue) return null;

  if (typeof rawValue === 'object' && rawValue.openTime && rawValue.closeTime) {
    return {
      openTime: rawValue.openTime,
      closeTime: rawValue.closeTime,
      days: Array.isArray(rawValue.days) && rawValue.days.length > 0
        ? rawValue.days
        : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
    };
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && parsed.openTime && parsed.closeTime) {
          return {
            openTime: parsed.openTime,
            closeTime: parsed.closeTime,
            days: Array.isArray(parsed.days) && parsed.days.length > 0
              ? parsed.days
              : ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          };
        }
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function formatOperatingHours(rawValue, fallback = '—') {
  if (!rawValue) return fallback;
  const structured = parseOperatingHours(rawValue);
  if (!structured) {
    return typeof rawValue === 'string' ? rawValue : fallback;
  }

  const orderedSelected = ORDERED_DAYS.filter((d) => structured.days.includes(d));
  let daySummary = '';

  if (orderedSelected.length === 7) {
    daySummary = 'All Days';
  } else if (
    orderedSelected.length === 6 &&
    !orderedSelected.includes('SUN')
  ) {
    daySummary = 'Mon–Sat';
  } else if (
    orderedSelected.length === 5 &&
    !orderedSelected.includes('SAT') &&
    !orderedSelected.includes('SUN')
  ) {
    daySummary = 'Mon–Fri';
  } else {
    daySummary = orderedSelected.map((d) => DEFAULT_DAY_SHORT[d] || d).join(', ');
  }

  const openLabel = formatTime24To12(structured.openTime);
  const closeLabel = formatTime24To12(structured.closeTime);
  return `${daySummary} • ${openLabel} – ${closeLabel}`;
}
