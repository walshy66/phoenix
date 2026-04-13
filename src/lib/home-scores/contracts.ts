export type ArtifactStatus = 'success' | 'stale' | 'error';

export interface ValidationResult {
  ok: boolean;
  code?: 'INVALID_JSON' | 'INVALID_SHAPE' | 'INVALID_STATUS';
  message?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function validateHomeGamesArtifact(input: unknown): ValidationResult {
  if (!isObject(input)) {
    return { ok: false, code: 'INVALID_SHAPE', message: 'Artifact must be an object.' };
  }

  const { generatedAt, status, window, games } = input;

  if (!['success', 'stale', 'error'].includes(String(status))) {
    return { ok: false, code: 'INVALID_STATUS', message: 'status must be success|stale|error.' };
  }

  if (typeof generatedAt !== 'string' || Number.isNaN(Date.parse(generatedAt))) {
    return { ok: false, code: 'INVALID_SHAPE', message: 'generatedAt must be ISO date.' };
  }

  if (!isObject(window)) {
    return { ok: false, code: 'INVALID_SHAPE', message: 'window is required.' };
  }

  if (
    !['rolling-7-days', 'rolling-7-plus-7-days'].includes(String(window.kind)) ||
    typeof window.startDate !== 'string' ||
    typeof window.endDate !== 'string' ||
    window.timezone !== 'Australia/Melbourne'
  ) {
    return { ok: false, code: 'INVALID_SHAPE', message: 'window shape invalid.' };
  }

  if (!Array.isArray(games)) {
    return { ok: false, code: 'INVALID_SHAPE', message: 'games must be an array.' };
  }

  return { ok: true };
}

export function parseAndValidateHomeGamesArtifact(raw: string): ValidationResult {
  try {
    const parsed = JSON.parse(raw);
    return validateHomeGamesArtifact(parsed);
  } catch {
    return { ok: false, code: 'INVALID_JSON', message: 'Unable to parse JSON.' };
  }
}
