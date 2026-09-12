import type { LiveScores, NormalisedGame } from '../scores/round-file';

export const DEFAULT_LIVE_DATA_STALE_AFTER_MINUTES = 15;

export function getLiveDataUrl(fileName: string): string {
  const normalised = normaliseLiveDataPath(fileName);
  return `/live-data/${normalised}`;
}

function normaliseLiveDataPath(fileName: string): string {
  return fileName
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/^\/+/, '')
    .replace(/^(live-data|live-snapshot)\//, '')
    .replace(/\?.*$/, '');
}

function getPayloadTimestamp(payload: unknown): number {
  if (!payload || typeof payload !== 'object') return 0;
  const record = payload as { generatedAt?: unknown; lastUpdated?: unknown };
  const value = typeof record.generatedAt === 'string'
    ? record.generatedAt
    : typeof record.lastUpdated === 'string'
      ? record.lastUpdated
      : '';
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function fetchFreshestLiveJson<T = unknown>(
  fileName: string,
  isValid: (payload: unknown) => boolean = () => true,
): Promise<T | null> {
  const normalised = normaliseLiveDataPath(fileName);
  const t = Date.now();
  const candidates = [`/live-data/${normalised}`, `/live-snapshot/${normalised}`];
  const payloads = await Promise.all(candidates.map(async (url) => {
    try {
      const response = await fetch(`${url}?t=${t}`, { cache: 'no-store' });
      if (!response.ok) return null;
      const payload = await response.json();
      if (!isValid(payload)) return null;
      return { payload, timestamp: getPayloadTimestamp(payload) };
    } catch {
      return null;
    }
  }));

  const validPayloads = payloads.filter((payload): payload is { payload: T; timestamp: number } => payload !== null);
  validPayloads.sort((a, b) => b.timestamp - a.timestamp);
  return validPayloads[0]?.payload ?? null;
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
