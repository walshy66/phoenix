#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const PLAYHQ_API_KEY = process.env.PLAYHQ_API_KEY || '';
const TENANT = process.env.PLAYHQ_TENANT || 'bv';
const CLUB_NAME = process.env.PLAYHQ_CLUB_NAME || 'Phoenix';
const SEASON_IDS = (process.env.PLAYHQ_SEASON_IDS || 'b3efb4fc-f645-4b5a-a777-50cc99464849')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const API_BASE = 'https://api.playhq.com';
const TIMEZONE = 'Australia/Melbourne';
const OUTPUT_FILE = resolve(process.cwd(), 'scripts/weekly-games-data.json');

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'friday'];

function structuredLog(level, details) {
  const payload = { timestamp: new Date().toISOString(), ...details };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else {
    console.log(line);
  }
}

function getTimezoneDateParts(date, timeZone = TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: (get('weekday') || 'Mon').slice(0, 3).toLowerCase(),
  };
}

function addDays(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

function getUpcomingWeekWindow(reference = new Date(), timeZone = TIMEZONE) {
  const weekdayMap = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 };
  const current = getTimezoneDateParts(reference, timeZone);
  const currentIso = `${current.year}-${String(current.month).padStart(2, '0')}-${String(current.day).padStart(2, '0')}`;
  const weekdayIndex = weekdayMap[current.weekday] || 1;

  const offsetToMonday = weekdayIndex <= 5 ? 1 - weekdayIndex : 8 - weekdayIndex;
  const startDate = addDays(currentIso, offsetToMonday);
  const endDate = addDays(startDate, 4);

  return { timezone: timeZone, startDate, endDate };
}

function shiftWindow(window, weekOffset = 0) {
  if (!weekOffset) return window;
  const dayShift = weekOffset * 7;
  return {
    ...window,
    startDate: addDays(window.startDate, dayShift),
    endDate: addDays(window.endDate, dayShift),
  };
}

function dayKeyForDate(dateString, timeZone = TIMEZONE) {
  if (!dateString) return null;
  const [y, m, d] = dateString.split('-').map(Number);
  if (!y || !m || !d) return null;

  const parsed = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const day = new Intl.DateTimeFormat('en-AU', { timeZone, weekday: 'long' }).format(parsed).toLowerCase();

  if (day === 'monday') return 'monday';
  if (day === 'tuesday') return 'tuesday';
  if (day === 'wednesday') return 'wednesday';
  if (day === 'friday') return 'friday';
  return null;
}

function formatLocalTime(timeValue) {
  if (!timeValue) return 'TBA';
  const match = /^([0-2]?\d):([0-5]\d)(?::([0-5]\d))?$/.exec(String(timeValue));
  if (!match) return 'TBA';

  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = hour24 >= 12 ? 'pm' : 'am';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function inWindow(dateOnly, window) {
  if (!dateOnly) return false;
  return dateOnly >= window.startDate && dateOnly <= window.endDate;
}

function sortFixtures(fixtures) {
  const timeToMinutes = (timeValue) => {
    if (!timeValue) return Number.POSITIVE_INFINITY;
    const [h, m] = String(timeValue).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return Number.POSITIVE_INFINITY;
    return h * 60 + m;
  };

  return [...fixtures].sort((a, b) => {
    const aTime = timeToMinutes(a.kickoffTime);
    const bTime = timeToMinutes(b.kickoffTime);
    if (aTime !== bTime) return aTime - bTime;
    return `${a.homeTeam}-${a.awayTeam}`.localeCompare(`${b.homeTeam}-${b.awayTeam}`);
  });
}

function baseArtifact(window) {
  return {
    generatedAt: new Date().toISOString(),
    window,
    status: 'success',
    staleBanner: null,
    days: {
      monday: [],
      tuesday: [],
      wednesday: [],
      friday: [],
    },
    fixturesById: {},
  };
}

function readPreviousArtifact() {
  if (!existsSync(OUTPUT_FILE)) return null;
  try {
    return JSON.parse(readFileSync(OUTPUT_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

async function apiFetch(endpoint) {
  if (!PLAYHQ_API_KEY) {
    const err = new Error('Missing PLAYHQ_API_KEY');
    err.code = 'AUTH_MISSING';
    throw err;
  }

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-api-key': PLAYHQ_API_KEY,
      'x-phq-tenant': TENANT,
    },
  });

  if (!res.ok) {
    const err = new Error(`PlayHQ ${res.status} ${res.statusText}`);
    err.code = `HTTP_${res.status}`;
    throw err;
  }

  return res.json();
}

async function fetchAllPages(basePath) {
  const results = [];
  let cursor = null;

  do {
    const separator = basePath.includes('?') ? '&' : '?';
    const path = cursor ? `${basePath}${separator}cursor=${cursor}` : basePath;
    const json = await apiFetch(path);
    results.push(...(json.data || []));
    cursor = json.metadata?.hasMore ? json.metadata.nextCursor : null;
  } while (cursor);

  return results;
}

function toFixture(game, gradeName) {
  const competitors = game.competitors || [];
  const home = competitors.find((c) => c.isHomeTeam) || competitors[0] || {};
  const away = competitors.find((c) => !c.isHomeTeam) || competitors[1] || {};
  const gameDate = game.schedule?.date || null;
  const kickoffTime = game.schedule?.time || null;

  return {
    fixtureId: game.id,
    homeTeam: home.name || 'TBD',
    awayTeam: away.name || 'TBD',
    grade: gradeName || null,
    venue: game.venue?.name || null,
    court: game.venue?.surfaceName || game.venue?.surfaceAbbreviation || null,
    kickoffDate: gameDate,
    kickoffTime,
    kickoffAt: gameDate && kickoffTime ? `${gameDate}T${kickoffTime}` : gameDate,
    kickoffDisplay: formatLocalTime(kickoffTime),
    squads: game.squads || [],
  };
}

function isClubFixture(game) {
  return (game.competitors || []).some((competitor) =>
    String(competitor.name || '')
      .toLowerCase()
      .includes(CLUB_NAME.toLowerCase()),
  );
}

async function buildSuccessArtifact(window) {
  const artifact = baseArtifact(window);
  const dedupe = new Set();

  for (const seasonId of SEASON_IDS) {
    const gradesResponse = await apiFetch(`/v1/seasons/${seasonId}/grades`);
    const grades = gradesResponse.data || [];

    for (const grade of grades) {
      const games = await fetchAllPages(`/v1/grades/${grade.id}/games`);
      const fixtures = games
        .filter(isClubFixture)
        .map((game) => toFixture(game, grade.name))
        .filter((fixture) => inWindow(fixture.kickoffDate, window));

      for (const fixture of fixtures) {
        if (dedupe.has(fixture.fixtureId)) continue;
        dedupe.add(fixture.fixtureId);

        const dayKey = dayKeyForDate(fixture.kickoffDate, TIMEZONE);
        if (!dayKey || !DAY_KEYS.includes(dayKey)) continue;

        artifact.days[dayKey].push(fixture);
        artifact.fixturesById[fixture.fixtureId] = fixture;
      }
    }
  }

  for (const day of DAY_KEYS) {
    artifact.days[day] = sortFixtures(artifact.days[day]);
  }

  return artifact;
}

function buildFailureArtifact(previous, window, code, message) {
  const stalePrevious =
    previous &&
    (previous.status === 'success' || previous.status === 'stale') &&
    previous.days &&
    typeof previous.days === 'object';

  if (stalePrevious) {
    return {
      ...previous,
      generatedAt: new Date().toISOString(),
      window,
      status: 'stale',
      staleBanner: 'Showing last successful weekly update while live refresh is unavailable.',
      error: { code, message },
    };
  }

  return {
    ...baseArtifact(window),
    status: 'error',
    staleBanner: null,
    error: { code, message },
  };
}

async function main() {
  const operation = 'weekly-fixtures-refresh';
  const referenceDate = process.env.SCORES_REFERENCE_DATE ? new Date(process.env.SCORES_REFERENCE_DATE) : new Date();
  const weekOffset = Number.parseInt(process.env.SCORES_WEEK_OFFSET || '0', 10) || 0;
  const window = shiftWindow(getUpcomingWeekWindow(referenceDate, TIMEZONE), weekOffset);
  const previous = readPreviousArtifact();

  structuredLog('info', {
    operation,
    status: 'started',
    message: 'Refresh run started',
    windowStart: window.startDate,
    windowEnd: window.endDate,
  });

  try {
    const artifact = await buildSuccessArtifact(window);
    writeFileSync(OUTPUT_FILE, JSON.stringify(artifact, null, 2));

    structuredLog('info', {
      operation,
      status: 'success',
      message: 'Refresh run completed',
      windowStart: window.startDate,
      windowEnd: window.endDate,
    });

    console.log(`✅ Wrote weekly artifact: ${OUTPUT_FILE}`);
  } catch (error) {
    const code = error?.code || 'REFRESH_FAILED';
    const message = error?.message || 'Unknown refresh error';

    const fallbackArtifact = buildFailureArtifact(previous, window, code, message);
    writeFileSync(OUTPUT_FILE, JSON.stringify(fallbackArtifact, null, 2));

    structuredLog('error', {
      operation,
      status: code,
      errorCode: code,
      message,
      windowStart: window.startDate,
      windowEnd: window.endDate,
    });

    if (fallbackArtifact.status === 'error') {
      process.exitCode = 1;
    }
  }
}

main();
