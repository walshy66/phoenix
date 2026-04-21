export const HOME_TIMEZONE = 'Australia/Melbourne';

export interface RollingWindow {
  kind: 'rolling-7-plus-7-days';
  startDate: string;
  endDate: string;
  timezone: string;
}

export interface RawScoreGame {
  id?: string;
  gameId?: string;
  date?: string | null;
  time?: string | null;
  competition?: string | null;
  venue?: string | null;
  court?: string | null;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: string | null;
}

export interface HomeGameItem {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'completed' | 'upcoming' | 'live' | 'cancelled' | 'unknown';
  kickoffDate: string | null;
  kickoffTime: string | null;
  kickoffDisplay: string;
  competition: string | null;
  venue: string | null;
  court: string | null;
}

const isoDateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: HOME_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function toMelbourneDate(date: Date): string {
  return isoDateFmt.format(date);
}

function plusDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 0, 0, 0));
  return dt.toISOString().slice(0, 10);
}

export function getRolling7DayWindow(now = new Date()): RollingWindow {
  const today = toMelbourneDate(now);
  const startDate = plusDays(today, -7);
  const endDate = plusDays(today, 7);
  return {
    kind: 'rolling-7-plus-7-days',
    startDate,
    endDate,
    timezone: HOME_TIMEZONE,
  };
}

function normalizeStatus(status: string | null | undefined): HomeGameItem['status'] {
  const s = (status ?? '').toLowerCase();
  if (['complete', 'completed', 'final'].includes(s)) return 'completed';
  if (['live', 'in_progress', 'in-progress'].includes(s)) return 'live';
  if (['scheduled', 'upcoming', 'pending'].includes(s)) return 'upcoming';
  if (['cancelled', 'canceled', 'abandoned'].includes(s)) return 'cancelled';
  return 'unknown';
}

function normalizeTime(time: string | null | undefined): { kickoffTime: string | null; kickoffDisplay: string } {
  if (!time || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return { kickoffTime: null, kickoffDisplay: 'TBA' };
  }

  const hhmm = time.slice(0, 5);
  return { kickoffTime: time.length === 5 ? `${time}:00` : time, kickoffDisplay: hhmm };
}

function getStatusRank(status: HomeGameItem['status']): number {
  if (status === 'live') return 0;
  if (status === 'upcoming') return 1;
  if (status === 'unknown') return 2;
  if (status === 'completed') return 3;
  if (status === 'cancelled') return 4;
  return 5;
}

function compareGameOrder(a: HomeGameItem, b: HomeGameItem): number {
  const statusDiff = getStatusRank(a.status) - getStatusRank(b.status);
  if (statusDiff !== 0) return statusDiff;

  if (a.status === 'completed') {
    if (a.kickoffDate !== b.kickoffDate) {
      return (b.kickoffDate ?? '').localeCompare(a.kickoffDate ?? '');
    }
  } else if (a.kickoffDate !== b.kickoffDate) {
    return (a.kickoffDate ?? '').localeCompare(b.kickoffDate ?? '');
  }

  if (a.kickoffTime && b.kickoffTime) return a.kickoffTime.localeCompare(b.kickoffTime);
  if (a.kickoffTime && !b.kickoffTime) return -1;
  if (!a.kickoffTime && b.kickoffTime) return 1;
  return a.gameId.localeCompare(b.gameId);
}

function toDateOnly(rawDate: string | null | undefined): string | null {
  if (!rawDate) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;
  const dt = new Date(rawDate);
  if (Number.isNaN(dt.valueOf())) return null;
  return dt.toISOString().slice(0, 10);
}

export function normalizeHomeGames(rawGames: RawScoreGame[], opts?: { now?: Date }): HomeGameItem[] {
  const window = getRolling7DayWindow(opts?.now ?? new Date());

  const mapped = rawGames
    .map((raw) => {
      const kickoffDate = toDateOnly(raw.date);
      const { kickoffTime, kickoffDisplay } = normalizeTime(raw.time);
      return {
        gameId: String(raw.gameId ?? raw.id ?? '').trim(),
        homeTeam: raw.homeTeam ?? 'TBD',
        awayTeam: raw.awayTeam ?? 'TBD',
        homeScore: typeof raw.homeScore === 'number' ? raw.homeScore : null,
        awayScore: typeof raw.awayScore === 'number' ? raw.awayScore : null,
        status: normalizeStatus(raw.status),
        kickoffDate,
        kickoffTime,
        kickoffDisplay,
        competition: raw.competition ?? null,
        venue: raw.venue ?? null,
        court: raw.court ?? null,
      } as HomeGameItem;
    })
    .filter((game) => game.gameId.length > 0)
    .filter((game) => !!game.kickoffDate)
    .filter((game) => {
      const d = game.kickoffDate as string;
      return d >= window.startDate && d <= window.endDate;
    })
    .sort(compareGameOrder);

  const deduped: HomeGameItem[] = [];
  const seen = new Set<string>();
  for (const game of mapped) {
    if (seen.has(game.gameId)) continue;
    seen.add(game.gameId);
    deduped.push(game);
  }

  return deduped;
}
