import type { LiveScores, NormalisedGame } from '../scores/round-file';

export const DEFAULT_LIVE_DATA_STALE_AFTER_MINUTES = 15;

export function getLiveDataUrl(fileName: string): string {
  const normalised = fileName.replace(/^\/+/, '');
  return `/live-data/${normalised}`;
}

export function mergeLiveScores(games: NormalisedGame[], liveScores: LiveScores): NormalisedGame[] {
  return games.map((game) => {
    const live = liveScores[game.id];
    if (!live) return game;
    return {
      ...game,
      homeScore: live.homeScore,
      awayScore: live.awayScore,
      status: live.status,
    };
  });
}

export function isLiveDataStale(
  generatedAt: string,
  thresholdMinutes = DEFAULT_LIVE_DATA_STALE_AFTER_MINUTES,
  now = new Date(),
): boolean {
  const publishedAt = Date.parse(generatedAt);
  if (Number.isNaN(publishedAt)) return true;

  const ageMs = now.getTime() - publishedAt;
  return ageMs > thresholdMinutes * 60 * 1000;
}
