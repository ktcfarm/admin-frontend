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
