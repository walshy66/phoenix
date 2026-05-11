#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const ROUNDS_DIR = path.join(process.cwd(), 'public', 'live-data', 'rounds');
const HOME_FILE = path.join(process.cwd(), 'public', 'live-data', 'home-games.json');
const TZ = 'Australia/Melbourne';

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function structuredLog(level, details) {
  const payload = { timestamp: new Date().toISOString(), ...details };
  const line = JSON.stringify(payload);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

function melDate(date) {
  return dateFmt.format(date);
}

function plusDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days, 0, 0, 0));
  return dt.toISOString().slice(0, 10);
}

function rollingWindow(now = new Date()) {
  const today = melDate(now);
  return {
    kind: 'rolling-7-plus-7-days',
    startDate: plusDays(today, -7),
    endDate: plusDays(today, 7),
    timezone: TZ,
  };
}

function normalizeStatus(status) {
  const s = String(status || '').toLowerCase();
  if (['complete', 'completed', 'final'].includes(s)) return 'completed';
  if (['live', 'in_progress', 'in-progress'].includes(s)) return 'live';
  if (['scheduled', 'upcoming', 'pending'].includes(s)) return 'upcoming';
  if (['cancelled', 'canceled', 'abandoned'].includes(s)) return 'cancelled';
  return 'unknown';
}

function normalizeTime(time) {
  if (!time || !/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
    return { kickoffTime: null, kickoffDisplay: 'TBA' };
  }
  const hhmm = time.slice(0, 5);
  return { kickoffTime: time.length === 5 ? `${time}:00` : time, kickoffDisplay: hhmm };
}

function getStatusRank(status) {
  if (status === 'live') return 0;
  if (status === 'upcoming') return 1;
  if (status === 'unknown') return 2;
  if (status === 'completed') return 3;
  if (status === 'cancelled') return 4;
  return 5;
}

function compareGameOrder(a, b) {
  const statusDiff = getStatusRank(a.status) - getStatusRank(b.status);
  if (statusDiff !== 0) return statusDiff;

  if (a.status === 'completed') {
    if (a.kickoffDate !== b.kickoffDate) return b.kickoffDate.localeCompare(a.kickoffDate);
  } else if (a.kickoffDate !== b.kickoffDate) {
    return a.kickoffDate.localeCompare(b.kickoffDate);
  }

  if (a.kickoffTime && b.kickoffTime) return a.kickoffTime.localeCompare(b.kickoffTime);
  if (a.kickoffTime && !b.kickoffTime) return -1;
  if (!a.kickoffTime && b.kickoffTime) return 1;
  return a.gameId.localeCompare(b.gameId);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listRoundFiles() {
  if (!fs.existsSync(ROUNDS_DIR)) return [];
  return fs.readdirSync(ROUNDS_DIR)
    .filter((entry) => /^round-\d+\.json$/.test(entry))
    .map((entry) => path.join(ROUNDS_DIR, entry))
    .sort();
}

function loadRoundGames() {
  return listRoundFiles().flatMap((file) => {
    const parsed = readJson(file);
    return Array.isArray(parsed?.games) ? parsed.games : [];
  });
}

function normalizeHomeGames(rawGames, window) {
  const mapped = rawGames
    .map((raw) => {
      const kickoffDate = raw?.date && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : null;
      const { kickoffTime, kickoffDisplay } = normalizeTime(raw?.time);
      const gameId = String(raw?.id ?? raw?.gameId ?? '').trim();
      return {
        gameId,
        homeTeam: raw?.homeTeam ?? 'TBD',
        awayTeam: raw?.awayTeam ?? 'TBD',
        homeScore: typeof raw?.homeScore === 'number' ? raw.homeScore : null,
        awayScore: typeof raw?.awayScore === 'number' ? raw.awayScore : null,
        status: normalizeStatus(raw?.status),
        kickoffDate,
        kickoffTime,
        kickoffDisplay,
        competition: raw?.competition ?? null,
        venue: raw?.venue ?? null,
        court: raw?.court ?? null,
      };
    })
    .filter((game) => game.gameId)
    .filter((game) => game.kickoffDate)
    .filter((game) => game.kickoffDate >= window.startDate && game.kickoffDate <= window.endDate)
    .sort(compareGameOrder);

  const seen = new Set();
  return mapped.filter((game) => {
    if (seen.has(game.gameId)) return false;
    seen.add(game.gameId);
    return true;
  });
}

function writeArtifact(artifact) {
  fs.mkdirSync(path.dirname(HOME_FILE), { recursive: true });
  fs.writeFileSync(HOME_FILE, JSON.stringify(artifact, null, 2));
}

function main() {
  const window = rollingWindow();

  try {
    const games = normalizeHomeGames(loadRoundGames(), window);
    writeArtifact({
      generatedAt: new Date().toISOString(),
      status: 'success',
      window,
      staleBanner: null,
      error: null,
      games,
    });
    structuredLog('info', { event: 'home_games_written_from_rounds', count: games.length, outputPath: 'public/live-data/home-games.json' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown home-games refresh failure';
    writeArtifact({
      generatedAt: new Date().toISOString(),
      status: 'error',
      window,
      staleBanner: null,
      error: {
        code: 'REFRESH_FAILED',
        message: 'Unable to load games right now. Please try again later.',
      },
      games: [],
    });
    structuredLog('error', { event: 'home_games_from_rounds_failed', message });
    process.exit(1);
  }
}

main();
