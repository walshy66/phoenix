/**
 * T002: Placeholder Data Tests
 *
 * Verifies that PLACEHOLDER_SEASONS, PLACEHOLDER_KEY_DATES, and
 * PLACEHOLDER_REGISTRATION_COSTS load correctly and match types.
 *
 * Traceability: T002 (Window 1), FR-003 (placeholders allowed)
 */

import { describe, test, expect } from 'vitest';
import {
  PLACEHOLDER_SEASONS,
  PLACEHOLDER_KEY_DATES,
  PLACEHOLDER_REGISTRATION_COSTS,
} from './constants';
import type { Season, KeyDate, RegistrationCost } from './types';

describe('Seasons Constants: PLACEHOLDER_SEASONS', () => {
  test('PLACEHOLDER_SEASONS is an array', () => {
    expect(Array.isArray(PLACEHOLDER_SEASONS)).toBe(true);
  });

  test('contains exactly 3 seasons (Current, Next, Previous)', () => {
    expect(PLACEHOLDER_SEASONS).toHaveLength(3);
  });

  test('first season is Current (Winter 2026)', () => {
    const season = PLACEHOLDER_SEASONS[0];
    expect(season.id).toBe('winter-2026');
    expect(season.role).toBe('current');
    expect(season.status).toBe('active');
    expect(season.name).toBe('Winter 2026');
  });

  test('second season is Next (Spring 2026)', () => {
    const season = PLACEHOLDER_SEASONS[1];
    expect(season.id).toBe('spring-2026');
    expect(season.role).toBe('next');
    expect(season.status).toBe('coming_soon');
    expect(season.name).toBe('Spring 2026');
  });

  test('third season is Previous (Summer 2025/26)', () => {
    const season = PLACEHOLDER_SEASONS[2];
    expect(season.id).toBe('summer-2025-26');
    expect(season.role).toBe('previous');
    expect(season.status).toBe('completed');
    expect(season.name).toBe('Summer 2025/26');
  });

  test('all seasons have valid ISO 8601 dates', () => {
    PLACEHOLDER_SEASONS.forEach((season) => {
      expect(() => new Date(season.startDate)).not.toThrow();
      expect(() => new Date(season.endDate)).not.toThrow();
      expect(new Date(season.startDate).getTime()).toBeLessThan(
        new Date(season.endDate).getTime()
      );
    });
  });

  test('no archive season in placeholders (< 2 years)', () => {
    const archiveSeasons = PLACEHOLDER_SEASONS.filter((s) => s.role === 'archive');
    expect(archiveSeasons).toHaveLength(0);
  });

  test('all seasons type-check against Season interface', () => {
    PLACEHOLDER_SEASONS.forEach((season) => {
      const typed: Season = season;
      expect(typed).toBeDefined();
      expect(typed.id).toBeTruthy();
      expect(typed.name).toBeTruthy();
      expect(['current', 'next', 'previous', 'archive']).toContain(typed.role);
      expect(['active', 'coming_soon', 'completed']).toContain(typed.status);
    });
  });
});

describe('Seasons Constants: PLACEHOLDER_KEY_DATES', () => {
  test('PLACEHOLDER_KEY_DATES is a Record', () => {
    expect(typeof PLACEHOLDER_KEY_DATES).toBe('object');
    expect(PLACEHOLDER_KEY_DATES).not.toBeInstanceOf(Array);
  });

  test('contains entries for all placeholder seasons', () => {
    const expectedKeys = ['winter-2026', 'spring-2026', 'summer-2025-26'];
    expectedKeys.forEach((key) => {
      expect(PLACEHOLDER_KEY_DATES).toHaveProperty(key);
    });
  });

  test('all season entries are arrays', () => {
    Object.values(PLACEHOLDER_KEY_DATES).forEach((dates) => {
      expect(Array.isArray(dates)).toBe(true);
    });
  });

  test('all dates are currently empty (no dates announced yet)', () => {
    Object.values(PLACEHOLDER_KEY_DATES).forEach((dates) => {
      expect(dates).toHaveLength(0);
    });
  });
});

describe('Seasons Constants: PLACEHOLDER_REGISTRATION_COSTS', () => {
  test('PLACEHOLDER_REGISTRATION_COSTS is a Record', () => {
    expect(typeof PLACEHOLDER_REGISTRATION_COSTS).toBe('object');
    expect(PLACEHOLDER_REGISTRATION_COSTS).not.toBeInstanceOf(Array);
  });

  test('contains entries for all placeholder seasons', () => {
    const expectedKeys = ['winter-2026', 'spring-2026', 'summer-2025-26'];
    expectedKeys.forEach((key) => {
      expect(PLACEHOLDER_REGISTRATION_COSTS).toHaveProperty(key);
    });
  });

  test('all season entries are arrays', () => {
    Object.values(PLACEHOLDER_REGISTRATION_COSTS).forEach((costs) => {
      expect(Array.isArray(costs)).toBe(true);
    });
  });

  test('all costs are currently empty (pricing to be confirmed)', () => {
    Object.values(PLACEHOLDER_REGISTRATION_COSTS).forEach((costs) => {
      expect(costs).toHaveLength(0);
    });
  });
});

describe('Seasons Constants: Data Consistency', () => {
  test('key dates and costs have entries for all season IDs', () => {
    const seasonIds = PLACEHOLDER_SEASONS.map((s) => s.id);
    seasonIds.forEach((id) => {
      expect(PLACEHOLDER_KEY_DATES).toHaveProperty(id);
      expect(PLACEHOLDER_REGISTRATION_COSTS).toHaveProperty(id);
    });
  });

  test('no extra entries in key dates or costs beyond seasons', () => {
    const seasonIds = PLACEHOLDER_SEASONS.map((s) => s.id);
    const keyDateIds = Object.keys(PLACEHOLDER_KEY_DATES);
    const costIds = Object.keys(PLACEHOLDER_REGISTRATION_COSTS);

    keyDateIds.forEach((id) => {
      expect(seasonIds).toContain(id);
    });

    costIds.forEach((id) => {
      expect(seasonIds).toContain(id);
    });
  });
});
