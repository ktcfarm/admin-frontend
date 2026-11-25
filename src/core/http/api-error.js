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

    const message =
      typeof rawMessage === 'string'
        ? rawMessage
        : typeof rawMessage === 'object' && rawMessage !== null && typeof rawMessage.message === 'string'
          ? rawMessage.message
          : 'An unexpected error occurred';

    const code = data?.error?.code || data?.code || 'UNKNOWN_ERROR';
    const details = data?.error?.details ?? data?.details ?? null;
    const responsePayload = data?.data ?? null;
    const errors = data?.errors ?? details;

    return new ApiError(statusCode, message, code, details, responsePayload, errors);
  }
}

export default ApiError;
