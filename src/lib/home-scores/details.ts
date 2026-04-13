export interface RawDetailGame {
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
  [key: string]: unknown;
}

export interface PublicGameDetail {
  gameId: string;
  date: string | null;
  time: string | null;
  competition: string | null;
  venue: string | null;
  court: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

export function toPublicGameDetail(raw: RawDetailGame): PublicGameDetail {
  return {
    gameId: String(raw.id ?? raw.gameId ?? ''),
    date: raw.date ?? null,
    time: raw.time ?? null,
    competition: raw.competition ?? null,
    venue: raw.venue ?? null,
    court: raw.court ?? null,
    homeTeam: raw.homeTeam ?? 'TBD',
    awayTeam: raw.awayTeam ?? 'TBD',
    homeScore: typeof raw.homeScore === 'number' ? raw.homeScore : null,
    awayScore: typeof raw.awayScore === 'number' ? raw.awayScore : null,
    status: typeof raw.status === 'string' ? raw.status : 'unknown',
  };
}
