import { describe, expect, test } from 'vitest';
import { validateLiveHomeGamesPayload, validateLiveScoresPayload } from './contracts';

describe('playhq/contracts', () => {
  test('accepts a valid home games payload', () => {
    const result = validateLiveHomeGamesPayload({
      generatedAt: '2026-04-16T00:00:00.000Z',
      status: 'success',
      window: {
        kind: 'rolling-7-plus-7-days',
        startDate: '2026-04-10',
        endDate: '2026-04-20',
        timezone: 'Australia/Melbourne',
      },
      games: [],
    });

    expect(result.ok).toBe(true);
  });

  test('accepts a valid scores payload', () => {
    const result = validateLiveScoresPayload({
      generatedAt: '2026-04-16T00:00:00.000Z',
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
    });

    expect(result.ok).toBe(true);
  });

  test('rejects malformed payloads with deterministic errors', () => {
    const homeResult = validateLiveHomeGamesPayload({ status: 'success' });
    const scoresResult = validateLiveScoresPayload({ status: 'success' });

    expect(homeResult.ok).toBe(false);
    expect(scoresResult.ok).toBe(false);
    if (!homeResult.ok) {
      expect(homeResult.error.code).toBe('INVALID_SHAPE');
    }
    if (!scoresResult.ok) {
      expect(scoresResult.error.code).toBe('INVALID_SHAPE');
    }
  });
});
