import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateWeeklyGamesArtifact } from './contracts';
import type { WeeklyArtifact } from './rendering';

export const EMPTY_WEEKLY_ARTIFACT: WeeklyArtifact = {
  status: 'error',
  window: {
    timezone: 'Australia/Melbourne',
    startDate: '',
    endDate: '',
  },
  days: {
    monday: [],
    tuesday: [],
    wednesday: [],
    friday: [],
  },
  error: {
    code: 'DATA_UNAVAILABLE',
    message: 'Unable to load weekly games right now. Please try again later.',
  },
};

export function loadWeeklyArtifact(filePath = resolve(process.cwd(), 'scripts/weekly-games-data.json')): WeeklyArtifact {
  try {
    if (!existsSync(filePath)) return EMPTY_WEEKLY_ARTIFACT;

    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
    const validation = validateWeeklyGamesArtifact(parsed);

    if (!validation.ok) {
      return {
        ...EMPTY_WEEKLY_ARTIFACT,
        error: {
          code: validation.error.code,
          message: validation.error.message,
        },
      };
    }

    return parsed as WeeklyArtifact;
  } catch {
    return EMPTY_WEEKLY_ARTIFACT;
  }
}

export function listAllFixtures(artifact: WeeklyArtifact) {
  return [artifact.days.monday, artifact.days.tuesday, artifact.days.wednesday, artifact.days.friday].flat();
}

export function findFixtureById(artifact: WeeklyArtifact, fixtureId: string) {
  const fromMap = (artifact as any).fixturesById?.[fixtureId];
  if (fromMap) return fromMap;

  return listAllFixtures(artifact).find((fixture) => fixture.fixtureId === fixtureId) ?? null;
}
