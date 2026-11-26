const FIELD_LABELS = Object.freeze({
  categoryId: 'Parent Category',
  cropId: 'Parent Master Crop',
  name: 'Name',
  'translations.en': 'English Name',
  'translations.hi': 'Hindi Name',
  perishabilityType: 'Perishability Classification',
  baseUnit: 'Base Unit',
  shelfLifeDays: 'Shelf Life (Days)',
  standardMoistureThreshold: 'Moisture Threshold',
  unitConversions: 'Unit Conversions',
  gradeSpecs: 'Quality Grades',
  slug: 'URL Slug'
});

function formatFieldLabel(field = '') {
  const cleaned = String(field).replace(/^(body|query|params)\./, '');
  if (FIELD_LABELS[cleaned]) {
    return FIELD_LABELS[cleaned];
  }
  const lastSegment = cleaned.split('.').pop() || cleaned;
  return lastSegment
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatIssueMessage(issue) {
  if (!issue) return '';
  if (typeof issue === 'string') return issue;

  const rawField = issue.field || (Array.isArray(issue.path) ? issue.path.join('.') : '');
  const rawMsg = issue.message || '';
  const fieldLabel = rawField ? formatFieldLabel(rawField) : '';

  let friendlyMsg = rawMsg;
  if (rawMsg === 'Required') {
    friendlyMsg = 'is required';
  } else if (/invalid uuid/i.test(rawMsg)) {
    friendlyMsg = 'must be a valid selection';
  } else if (/expected string, received object/i.test(rawMsg)) {
    friendlyMsg = 'must be a valid selection';
  }

  if (fieldLabel && friendlyMsg) {
    return `${fieldLabel} ${friendlyMsg.charAt(0).toLowerCase()}${friendlyMsg.slice(1)}`;
  }
  return friendlyMsg || fieldLabel;
}

function formatValidationMessage(details, fallbackMessage) {
  if (!Array.isArray(details) || details.length === 0) {
    return fallbackMessage === 'Invalid request payload'
      ? 'Please check the highlighted fields and try again.'
      : fallbackMessage;
  }

  const formatted = details
    .map(formatIssueMessage)
    .filter(Boolean);

  if (formatted.length === 0) {
    return 'Please check the highlighted fields and try again.';
  }

  const preview = formatted.slice(0, 2).join('; ');
  if (formatted.length > 2) {
    return `${preview} (+${formatted.length - 2} more)`;
  }
  return preview;
}

export class ApiError extends Error {
  constructor(
    statusCode = 500,
    message = 'An unexpected error occurred',
    code = 'UNKNOWN_ERROR',
    details = null,
    data = null,
    errors = null
  ) {
    let resolvedCode = typeof code === 'string' ? code : 'UNKNOWN_ERROR';
    let resolvedDetails = details;
    let resolvedData = data;
    let resolvedErrors = errors ?? details;

    if (typeof code !== 'string') {
      resolvedData = code;
      resolvedErrors = details;
      resolvedDetails = details;
      resolvedCode = 'UNKNOWN_ERROR';
    }

    let resolvedMessage = 'An unexpected error occurred';
    if (typeof message === 'string' && message.trim()) {
      resolvedMessage = message;
    } else if (typeof message === 'object' && message !== null) {
      if (typeof message.message === 'string' && message.message.trim()) {
        resolvedMessage = message.message;
      } else if (typeof message.error === 'string' && message.error.trim()) {
        resolvedMessage = message.error;
      }
    }

    super(resolvedMessage);
    this.name = 'ApiError';
    this.statusCode = Number(statusCode) || 500;
    this.code = resolvedCode;
    this.details = resolvedDetails;
    this.data = resolvedData;
    this.errors = resolvedErrors;
  }

  static fromAxiosError(error) {
    if (error instanceof ApiError) {
      return error;
    }

    const statusCode = error?.response?.status || 500;
    const data = error?.response?.data;

    const rawMessage =
      (typeof data?.error === 'object' && data?.error !== null ? data.error.message : null) ||
      (typeof data?.error === 'string' ? data.error : null) ||
      data?.message ||
      error?.message ||
      'An unexpected error occurred';

    let message =
      typeof rawMessage === 'string'
        ? rawMessage
        : typeof rawMessage === 'object' && rawMessage !== null && typeof rawMessage.message === 'string'
          ? rawMessage.message
          : 'An unexpected error occurred';

    const code = data?.error?.code || data?.code || 'UNKNOWN_ERROR';
    const details = data?.error?.details ?? data?.details ?? null;
    const responsePayload = data?.data ?? null;
    const errors = data?.errors ?? details;

    if (
      statusCode === 400 &&
      (code === 'ValidationError' || message === 'Invalid request payload' || Array.isArray(details))
    ) {
      message = formatValidationMessage(details, message);
    }

    return new ApiError(statusCode, message, code, details, responsePayload, errors);
  }
}

export default ApiError;
