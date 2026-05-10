import { buildPlayHQHeaders, getPlayHQConfig } from './playhq-config.js';

export const playHQConfig = getPlayHQConfig({ required: ['apiKey', 'tenant'] });
export const API_BASE = playHQConfig.apiBase;
export const PLAYHQ_API_KEY = playHQConfig.apiKey;
export const TENANT = playHQConfig.tenant;
export const CLUB_NAME = playHQConfig.clubMatch || playHQConfig.clubName;

export function buildHeaders() {
  return buildPlayHQHeaders(playHQConfig);
}

export function structuredLog(level, details) {
  const payload = { timestamp: new Date().toISOString(), ...details };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export async function apiFetch(endpoint) {
  const res = await fetch(`${API_BASE}${endpoint}`, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`PlayHQ API ${res.status} on ${endpoint}`);
  return res.json();
}

export async function fetchAllPages(basePath) {
  const results = [];
  let cursor = null;

  do {
    const sep = basePath.includes('?') ? '&' : '?';
    const endpoint = cursor ? `${basePath}${sep}cursor=${cursor}` : basePath;
    const data = await apiFetch(endpoint);
    results.push(...(data.data ?? []));
    cursor = data.metadata?.hasMore ? data.metadata.nextCursor : null;
  } while (cursor);

  return results;
}

export async function fetchGrades(seasonId) {
  const data = await apiFetch(`/v1/seasons/${seasonId}/grades`);
  return data.data ?? [];
}

export async function fetchTeams(seasonId) {
  return fetchAllPages(`/v1/seasons/${seasonId}/teams`);
}

export async function fetchGames(gradeId) {
  return fetchAllPages(`/v1/grades/${gradeId}/games`);
}

export async function fetchLadder(gradeId) {
  const data = await apiFetch(`/v1/grades/${gradeId}/ladder`);
  return flattenLadderPayload(data);
}

export function flattenLadderPayload(payload) {
  const rows = [];
  for (const ladderSet of payload.data ?? []) {
    for (const ladder of ladderSet.ladders ?? []) {
      rows.push(...(ladder.standings ?? []));
    }
  }
  return rows;
}

export function normaliseStatus(raw) {
  if (!raw) return 'UPCOMING';
  const s = String(raw).trim().toLowerCase();
  if (['completed', 'final', 'graded'].includes(s)) return 'COMPLETED';
  if (['in-progress', 'live', 'in progress'].includes(s)) return 'IN_PROGRESS';
  return 'UPCOMING';
}

function parseRoundNumber(game) {
  const candidates = [game.round?.number, game.round?.name, game.round?.abbreviatedName, game.roundNumber];
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const match = /(?:round\s*)?(\d+)/i.exec(value);
      if (match) return Number.parseInt(match[1], 10);
    }
  }
  return null;
}

export function normaliseGame(game, gradeName) {
  const home = (game.competitors ?? []).find((c) => c.isHomeTeam);
  const away = (game.competitors ?? []).find((c) => !c.isHomeTeam);
  return {
    id: game.id,
    roundNumber: parseRoundNumber(game),
    date: game.schedule?.date ?? null,
    time: game.schedule?.time ?? null,
    competition: gradeName,
    venue: game.venue?.name ?? null,
    court: game.venue?.surfaceName ?? game.venue?.surfaceAbbreviation ?? null,
    homeTeam: home?.name ?? 'TBD',
    awayTeam: away?.name ?? 'TBD',
    homeScore: home?.scoreTotal ?? null,
    awayScore: away?.scoreTotal ?? null,
    status: normaliseStatus(game.status),
    playerStats: null,
  };
}

export function normaliseLadderRow(row, position) {
  return {
    position: row.ranking != null ? Number(row.ranking) + 1 : position,
    teamName: row.team?.name ?? row.teamName ?? row.name ?? '—',
    played: row.played ?? 0,
    wins: row.won ?? row.wins ?? 0,
    losses: row.lost ?? row.losses ?? 0,
    pointsFor: row.pointsFor ?? 0,
    pointsAgainst: row.pointsAgainst ?? 0,
    percentage: row.percentage ?? row.pointsAverage ?? 0,
    points: row.points ?? row.competitionPoints ?? 0,
  };
}
