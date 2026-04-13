type ValidationErrorCode = 'INVALID_JSON' | 'INVALID_SHAPE' | 'INVALID_STATUS';

type ValidationError = {
  code: ValidationErrorCode;
  message: string;
};

export type ValidationResult =
  | { ok: true }
  | {
      ok: false;
      error: ValidationError;
    };

const REQUIRED_DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'friday'];
const ALLOWED_STATUS = new Set(['success', 'stale', 'error']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function validateWeeklyGamesArtifact(value: unknown): ValidationResult {
  if (!isRecord(value)) {
    return { ok: false, error: { code: 'INVALID_SHAPE', message: 'Artifact must be an object' } };
  }

  const missing: string[] = [];
  if (!('window' in value)) missing.push('window');
  if (!('status' in value)) missing.push('status');
  if (!('days' in value)) missing.push('days');

  if (missing.length > 0) {
    return {
      ok: false,
      error: { code: 'INVALID_SHAPE', message: `Missing required keys: ${missing.join(', ')}` },
    };
  }

  if (!ALLOWED_STATUS.has(String(value.status))) {
    return {
      ok: false,
      error: { code: 'INVALID_STATUS', message: `Invalid status: ${String(value.status)}` },
    };
  }

  const window = value.window;
  if (!isRecord(window) || typeof window.startDate !== 'string' || typeof window.endDate !== 'string') {
    return {
      ok: false,
      error: {
        code: 'INVALID_SHAPE',
        message: 'window must include string startDate and endDate',
      },
    };
  }

  const days = value.days;
  if (!isRecord(days)) {
    return { ok: false, error: { code: 'INVALID_SHAPE', message: 'days must be an object' } };
  }

  for (const key of REQUIRED_DAY_KEYS) {
    if (!Array.isArray(days[key])) {
      return {
        ok: false,
        error: { code: 'INVALID_SHAPE', message: `days.${key} must be an array` },
      };
    }
  }

  return { ok: true };
}

export function parseWeeklyGamesArtifact(rawJson: string): ValidationResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return {
      ok: false,
      error: { code: 'INVALID_JSON', message: 'Invalid JSON payload' },
    };
  }

  return validateWeeklyGamesArtifact(parsed);
}
