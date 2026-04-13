import { describe, expect, test } from 'vitest';
import { parseAndValidateHomeGamesArtifact, validateHomeGamesArtifact } from './contracts';

describe('home-scores/contracts', () => {
  const validArtifact = {
    generatedAt: '2026-04-13T00:00:00.000Z',
    status: 'success',
    window: {
      kind: 'rolling-7-plus-7-days',
      startDate: '2026-04-06',
      endDate: '2026-04-20',
      timezone: 'Australia/Melbourne',
    },
    games: [],
  };

  test('accepts valid artifact shape', () => {
    const result = validateHomeGamesArtifact(validArtifact);
    expect(result.ok).toBe(true);
  });

  test('rejects invalid status with deterministic code', () => {
    const result = validateHomeGamesArtifact({ ...validArtifact, status: 'bad' });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('INVALID_STATUS');
  });

  test('rejects missing required fields with INVALID_SHAPE', () => {
    const result = validateHomeGamesArtifact({ status: 'success' });
    expect(result.ok).toBe(false);
    expect(result.code).toBe('INVALID_SHAPE');
  });

  test('parseAndValidate returns INVALID_JSON for malformed json', () => {
    const result = parseAndValidateHomeGamesArtifact('{oops');
    expect(result.ok).toBe(false);
    expect(result.code).toBe('INVALID_JSON');
  });
});
