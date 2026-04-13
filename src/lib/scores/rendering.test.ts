import { describe, expect, test } from 'vitest';
import { getDayColumns, getScoresPageState, getStaleBannerText, hasAnyFixtures } from './rendering';

const baseArtifact = {
  status: 'success' as const,
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

describe('scores/rendering', () => {
  test('returns fixed day column order Monday, Tuesday, Wednesday, Friday', () => {
    const columns = getDayColumns(baseArtifact);
    expect(columns.map((c) => c.label)).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Friday']);
  });

  test('reports empty page state when all fixed day buckets are empty', () => {
    expect(getScoresPageState(baseArtifact)).toBe('empty');
    expect(hasAnyFixtures(baseArtifact)).toBe(false);
  });

  test('reports ready state when at least one day has fixtures', () => {
    const artifact = {
      ...baseArtifact,
      days: {
        ...baseArtifact.days,
        wednesday: [
          {
            fixtureId: 'g-1',
            homeTeam: 'Phoenix',
            awayTeam: 'Heat',
            grade: 'U14',
            venue: 'Court 1',
            kickoffAt: '2026-04-15T08:00:00.000Z',
            kickoffDisplay: '6:00 pm',
            dayKey: 'wednesday' as const,
          },
        ],
      },
    };

    expect(getScoresPageState(artifact)).toBe('ready');
    expect(hasAnyFixtures(artifact)).toBe(true);
  });

  test('reports error state when artifact status is error', () => {
    const errorArtifact = {
      ...baseArtifact,
      status: 'error' as const,
      error: { code: 'NETWORK_ERROR', message: 'Unable to load fixtures' },
    };

    expect(getScoresPageState(errorArtifact)).toBe('error');
  });

  test('returns stale banner text only for stale artifact status', () => {
    const staleArtifact = {
      ...baseArtifact,
      status: 'stale' as const,
      staleBanner: 'Showing last successful weekly data.',
    };

    expect(getStaleBannerText(staleArtifact)).toBe('Showing last successful weekly data.');
    expect(getStaleBannerText(baseArtifact)).toBeNull();
  });
});
