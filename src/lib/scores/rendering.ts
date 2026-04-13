import type { NormalizedFixture } from './fixtures';

export type WeeklyArtifact = {
  generatedAt?: string;
  status: 'success' | 'stale' | 'error';
  window: {
    timezone: string;
    startDate: string;
    endDate: string;
  };
  days: {
    monday: NormalizedFixture[];
    tuesday: NormalizedFixture[];
    wednesday: NormalizedFixture[];
    friday: NormalizedFixture[];
  };
  error?: {
    code?: string;
    message?: string;
  };
  staleBanner?: string;
};

export const FIXED_DAY_COLUMNS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'friday', label: 'Friday' },
] as const;

export function getDayColumns(artifact: WeeklyArtifact) {
  return FIXED_DAY_COLUMNS.map((day) => ({
    ...day,
    fixtures: artifact.days[day.key] ?? [],
  }));
}

export function hasAnyFixtures(artifact: WeeklyArtifact): boolean {
  return getDayColumns(artifact).some((day) => day.fixtures.length > 0);
}

export function getScoresPageState(artifact: WeeklyArtifact): 'ready' | 'empty' | 'error' {
  if (artifact.status === 'error') return 'error';
  return hasAnyFixtures(artifact) ? 'ready' : 'empty';
}

export function getStaleBannerText(artifact: WeeklyArtifact): string | null {
  if (artifact.status !== 'stale') return null;
  return artifact.staleBanner ?? 'Showing last successful update. Live refresh is temporarily unavailable.';
}
