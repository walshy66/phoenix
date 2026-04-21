import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { isLiveDataStale, mergeLiveScores } from './live-data';
import { loadLiveJsonSnapshot } from './server-live-data';
import { validateLiveScoresPayload } from './contracts';

describe('playhq/live-data', () => {
  test('flags old data as stale after the configured threshold', () => {
    const now = new Date('2026-04-16T12:00:00.000Z');
    expect(isLiveDataStale('2026-04-16T11:40:00.000Z', 15, now)).toBe(true);
    expect(isLiveDataStale('2026-04-16T11:50:30.000Z', 15, now)).toBe(false);
  });

  test('merges live scores into games by gameId', () => {
    const games = [
      {
        id: 'abc',
        roundNumber: 1,
        date: '2026-04-21',
        time: '18:00:00',
        competition: 'A Grade',
        venue: 'Arena',
        court: 'Court 1',
        homeTeam: 'Home',
        awayTeam: 'Away',
        homeScore: null,
        awayScore: null,
        status: 'UPCOMING' as const,
        playerStats: null,
      },
    ];
    const merged = mergeLiveScores(games as any, { abc: { homeScore: 42, awayScore: 38, status: 'IN_PROGRESS' } });
    expect(merged[0].homeScore).toBe(42);
    expect(merged[0].status).toBe('IN_PROGRESS');
  });

  test('loads valid json snapshots and falls back on invalid payloads', () => {
    const dir = mkdtempSync(join(tmpdir(), 'phoenix-live-data-'));
    const goodFile = join(dir, 'fixtures.json');
    const badFile = join(dir, 'broken.json');

    writeFileSync(
      goodFile,
      JSON.stringify(
        {
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
        },
        null,
        2,
      ),
    );
    writeFileSync(badFile, '{bad json');

    const fallback = { generatedAt: 'fallback', status: 'error' as const, days: {} } as any;

    const loaded = loadLiveJsonSnapshot(goodFile, fallback, validateLiveScoresPayload);
    const invalid = loadLiveJsonSnapshot(badFile, fallback, validateLiveScoresPayload);
    const missing = loadLiveJsonSnapshot(join(dir, 'missing.json'), fallback, validateLiveScoresPayload);

    expect(loaded.status).toBe('success');
    expect(invalid).toBe(fallback);
    expect(missing).toBe(fallback);
  });
});
