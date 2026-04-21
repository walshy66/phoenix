export type GameStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
export type RoundStatus = 'upcoming' | 'in-progress' | 'completed';

export interface PlayerStats {
  players: Array<{
    name: string;
    team: string;
    points: number;
    fouls: number;
    assists: number;
    rebounds: number;
  }>;
}

export interface NormalisedGame {
  id: string;
  roundNumber: number | null;
  date: string | null;
  time: string | null;
  competition: string;
  venue: string | null;
  court: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: GameStatus;
  playerStats: PlayerStats | null;
}

export interface LadderRow {
  position: number;
  teamName: string;
  played: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  percentage: number;
  points: number;
}

export interface RoundFile {
  roundNumber: number;
  season: string;
  lastUpdated: string;
  status: RoundStatus;
  games: NormalisedGame[];
  ladders: Record<string, LadderRow[]>;
}

export interface RoundsIndex {
  currentRound: number;
  availableRounds: number[];
  lastUpdated: string;
}

export type LiveScores = Record<string, {
  homeScore: number;
  awayScore: number;
  status: GameStatus;
}>;

export function normaliseStatus(raw: string | null | undefined): GameStatus {
  if (!raw) return 'UPCOMING';
  const s = String(raw).trim().toLowerCase();
  if (['completed', 'final', 'graded'].includes(s)) return 'COMPLETED';
  if (['in-progress', 'live', 'in progress'].includes(s)) return 'IN_PROGRESS';
  return 'UPCOMING';
}
