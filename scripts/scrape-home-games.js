#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const SCORES_FILE = path.join(process.cwd(), 'scripts', 'scores-data.json');
const HOME_FILE = path.join(process.cwd(), 'scripts', 'home-games-data.json');
const TZ = 'Australia/Melbourne';

const dateFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

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
  const startDate = plusDays(today, -7);
  const endDate = plusDays(today, 7);
  return { kind: 'rolling-7-plus-7-days', startDate, endDate, timezone: TZ };
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

function normalizeHomeGames(rawGames, window) {
  const mapped = (rawGames || [])
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
    .filter((g) => g.gameId)
    .filter((g) => g.kickoffDate)
    .filter((g) => g.kickoffDate >= window.startDate && g.kickoffDate <= window.endDate)
    .sort(compareGameOrder);

  const seen = new Set();
  const deduped = [];
  for (const game of mapped) {
    if (seen.has(game.gameId)) continue;
    seen.add(game.gameId);
    deduped.push(game);
  }

  return deduped;
}

function isValidArtifact(input) {
  return !!input && typeof input === 'object' &&
    ['success', 'stale', 'error'].includes(input.status) &&
    !!input.window && Array.isArray(input.games) &&
    typeof input.generatedAt === 'string';
}

function logFailure({ operation, status, errorCode, message, windowStart, windowEnd }) {
  const payload = {
    timestamp: new Date().toISOString(),
    operation,
    status,
    errorCode,
    message,
    windowStart,
    windowEnd,
  };
  console.error(JSON.stringify(payload));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function writeArtifact(artifact) {
  fs.writeFileSync(HOME_FILE, JSON.stringify(artifact, null, 2));
}

function main() {
  const window = rollingWindow();

  try {
    const scoresData = readJson(SCORES_FILE);
    const games = normalizeHomeGames(scoresData.scores ?? [], window);

    const artifact = {
      generatedAt: new Date().toISOString(),
      status: 'success',
      window,
      staleBanner: null,
      error: null,
      games,
    };

    writeArtifact(artifact);
    console.log(`✅ Wrote ${games.length} home games to scripts/home-games-data.json`);
    return;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown refresh failure';
    logFailure({
      operation: 'refresh-home-games',
      status: 'failed',
      errorCode: 'REFRESH_FAILED',
      message,
      windowStart: window.startDate,
      windowEnd: window.endDate,
    });
  }

  let previous = null;
  if (fs.existsSync(HOME_FILE)) {
    try {
      const parsed = readJson(HOME_FILE);
      if (isValidArtifact(parsed) && parsed.status !== 'error') previous = parsed;
    } catch {
      previous = null;
    }
  }

  if (previous) {
    const stale = {
      ...previous,
      generatedAt: new Date().toISOString(),
      status: 'stale',
      window,
      staleBanner: 'Showing last known results. Live refresh is temporarily unavailable.',
      error: {
        code: 'REFRESH_FAILED',
        message: 'Latest refresh failed. Showing prior valid dataset.',
      },
    };
    writeArtifact(stale);
    console.log('⚠️ Wrote stale fallback to scripts/home-games-data.json');
    return;
  }

  const errorArtifact = {
    generatedAt: new Date().toISOString(),
    status: 'error',
    window,
    staleBanner: null,
    error: {
      code: 'REFRESH_FAILED',
      message: 'Unable to load games right now. Please try again later.',
    },
    games: [],
  };

  writeArtifact(errorArtifact);
  console.log('❌ Wrote error artifact to scripts/home-games-data.json');
}

main();
