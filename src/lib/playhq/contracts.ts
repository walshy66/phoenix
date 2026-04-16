export type LiveDataStatus = 'success' | 'stale' | 'error';

export type ValidationErrorCode = 'INVALID_JSON' | 'INVALID_SHAPE' | 'INVALID_STATUS';

export type ValidationError = {
  code: ValidationErrorCode;
  message: string;
};

export type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      error: ValidationError;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function validateStatus(value: unknown): ValidationResult {
  if (!['success', 'stale', 'error'].includes(String(value))) {
    return {
      ok: false,
      error: { code: 'INVALID_STATUS', message: 'status must be success|stale|error' },
    };
  }

  return { ok: true };
}

function validateGeneratedAt(value: unknown): ValidationResult {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    return {
      ok: false,
      error: { code: 'INVALID_SHAPE', message: 'generatedAt must be an ISO datetime string' },
    };
  }

  return { ok: true };
}

function validateHomeWindow(windowValue: unknown): ValidationResult {
  if (!isRecord(windowValue)) {
    return {
      ok: false,
      error: { code: 'INVALID_SHAPE', message: 'window must be an object' },
    };
  }

  if (
    windowValue.kind !== 'rolling-7-plus-7-days' ||
    typeof windowValue.startDate !== 'string' ||
    typeof windowValue.endDate !== 'string' ||
    windowValue.timezone !== 'Australia/Melbourne'
  ) {
    return {
      ok: false,
      error: {
        code: 'INVALID_SHAPE',
        message: 'window must include kind, startDate, endDate, and timezone',
      },
    };
  }

  return { ok: true };
}

function validateScoresWindow(windowValue: unknown): ValidationResult {
  if (!isRecord(windowValue)) {
    return {
      ok: false,
      error: { code: 'INVALID_SHAPE', message: 'window must be an object' },
    };
  }

  if (
    typeof windowValue.startDate !== 'string' ||
    typeof windowValue.endDate !== 'string' ||
    windowValue.timezone !== 'Australia/Melbourne'
  ) {
    return {
      ok: false,
      error: {
        code: 'INVALID_SHAPE',
        message: 'window must include startDate, endDate, and timezone',
      },
    };
  }

  return { ok: true };
}

export function validateLiveHomeGamesPayload(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: { code: 'INVALID_SHAPE', message: 'payload must be an object' } };
  }

  const generatedAt = validateGeneratedAt(input.generatedAt);
  if (!generatedAt.ok) return generatedAt;

  const status = validateStatus(input.status);
  if (!status.ok) return status;

  const windowResult = validateHomeWindow(input.window);
  if (!windowResult.ok) return windowResult;

  if (!Array.isArray(input.games)) {
    return {
      ok: false,
      error: { code: 'INVALID_SHAPE', message: 'games must be an array' },
    };
  }

  return { ok: true };
}

export function validateLiveScoresPayload(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, error: { code: 'INVALID_SHAPE', message: 'payload must be an object' } };
  }

  const generatedAt = validateGeneratedAt(input.generatedAt);
  if (!generatedAt.ok) return generatedAt;

  const status = validateStatus(input.status);
  if (!status.ok) return status;

  const windowResult = validateScoresWindow(input.window);
  if (!windowResult.ok) return windowResult;

  if (!isRecord(input.days)) {
    return {
      ok: false,
      error: { code: 'INVALID_SHAPE', message: 'days must be an object' },
    };
  }

  for (const key of ['monday', 'tuesday', 'wednesday', 'friday'] as const) {
    if (!Array.isArray(input.days[key])) {
      return {
        ok: false,
        error: { code: 'INVALID_SHAPE', message: `days.${key} must be an array` },
      };
    }
  }

  return { ok: true };
}
