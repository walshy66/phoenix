import fs from 'node:fs';
import path from 'node:path';

function readLocalEnvVar(key) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return undefined;

  const raw = fs.readFileSync(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (k === key) return v;
  }
  return undefined;
}

export const API_BASE = process.env.PLAYHQ_API_BASE || readLocalEnvVar('PLAYHQ_API_BASE') || 'https://api.playhq.com';
export const PLAYHQ_API_KEY = process.env.PLAYHQ_API_KEY || readLocalEnvVar('PLAYHQ_API_KEY') || 'PASTE_YOUR_API_KEY_HERE';
export const TENANT = process.env.PLAYHQ_TENANT || readLocalEnvVar('PLAYHQ_TENANT') || 'bv';
export const CLUB_NAME = process.env.PLAYHQ_CLUB_NAME || readLocalEnvVar('PLAYHQ_CLUB_NAME') || 'Phoenix';

export function buildHeaders() {
  return {
    Accept: 'application/json',
    'x-api-key': PLAYHQ_API_KEY,
    'x-phq-tenant': TENANT,
  };
}

export function structuredLog(level, details) {
  const payload = { timestamp: new Date().toISOString(), ...details };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export async function apiFetch(endpoint) {
  if (PLAYHQ_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
    throw new Error('No API key configured');
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`PlayHQ API ${res.status} on ${endpoint}`);
  return res.json();
}

export async function fetchGrades(seasonId) {
  const data = await apiFetch(`/v1/seasons/${seasonId}/grades`);
  return data.data ?? [];
}

export async function fetchGames(gradeId) {
  const results = [];
  let cursor = null;
  do {
    const sep = `/v1/grades/${gradeId}/games`.includes('?') ? '&' : '?';
    const endpoint = cursor ? `/v1/grades/${gradeId}/games${sep}cursor=${cursor}` : `/v1/grades/${gradeId}/games`;
    const data = await apiFetch(endpoint);
    results.push(...(data.data ?? []));
    cursor = data.metadata?.hasMore ? data.metadata.nextCursor : null;
  } while (cursor);
  return results;
}

export async function fetchLadder(gradeId) {
  const data = await apiFetch(`/v1/grades/${gradeId}/ladder`);
  const rows = [];
  for (const ladderSet of data.data ?? []) {
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
