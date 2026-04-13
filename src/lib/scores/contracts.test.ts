import { describe, expect, test } from 'vitest';
import { parseWeeklyGamesArtifact, validateWeeklyGamesArtifact } from './contracts';

describe('scores/contracts', () => {
  test('accepts valid weekly artifact shape', () => {
    const valid = {
      generatedAt: '2026-04-13T00:00:00.000Z',
      status: 'success',
      window: {
        timezone: 'Australia/Melbourne',
        startDate: '2026-04-13',
        endDate: '2026-04-17',
      },
      days: {
        monday: [],
        tuesday: [],
        wednesday: [],
        friday: [],
      },
    };

    expect(validateWeeklyGamesArtifact(valid)).toEqual({ ok: true });
  });

  test('returns structured shape error for missing required keys', () => {
    const result = validateWeeklyGamesArtifact({ status: 'success' });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_SHAPE');
      expect(result.error.message).toContain('window');
      expect(result.error.message).toContain('days');
    }
  });

  test('returns parse error code when JSON is invalid', () => {
    const result = parseWeeklyGamesArtifact('{bad json');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_JSON');
    }
  });
});
