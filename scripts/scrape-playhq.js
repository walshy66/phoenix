#!/usr/bin/env node
/**
 * PlayHQ Scraper — Bendigo Phoenix
 * =================================
 * Fetches ladder and fixture data from the PlayHQ REST API and writes
 * the result to scripts/scores-data.json, which the Scores & Ladder
 * page reads at build time (or on refresh).
 *
 * USAGE
 * -----
 *   node scripts/scrape-playhq.js
 *
 * BEFORE YOU RUN
 * --------------
 * You need an API key from PlayHQ. It is a UUID tied to the Bendigo
 * Basketball Association organisation.
 *
 * How to get it:
 *   1. Contact Basketball Victoria (your BV club admin) and ask them
 *      to request a PlayHQ API key for Bendigo Phoenix's public website.
 *   2. OR email PlayHQ support — mention you need read-only access to
 *      ladder and fixture data for a club website.
 *   3. Once you have the key, either:
 *      a) Set it as an environment variable:  export PLAYHQ_API_KEY=your-key-here
 *      b) Paste it directly into the PLAYHQ_API_KEY line below (less secure)
 *
 * HOW IT WORKS
 * ------------
 * The script calls these PlayHQ REST API endpoints:
 *
 *   GET /v1/seasons/{seasonId}/grades
 *     → lists all grades/divisions in the season
 *
 *   GET /v1/grades/{gradeId}/ladder
 *     → ladder table for that grade
 *
 *   GET /v1/grades/{gradeId}/games
 *     → all scheduled & completed games for that grade
 *     NOTE: the endpoint is /games, NOT /fixture (fixture returns 404)
 *
 * It filters for games where Bendigo Phoenix is a participant,
 * and writes the result to scores-data.json.
 *
 * KNOWN IDs (extracted from your PlayHQ URLs)
 * -------------------------------------------
 *   Tenant (Basketball Victoria):  bv
 *   Org UUID:                       90c7fb8e-b434-42ea-9af5-625235ca11e7
 *   Summer 2025/26 season (short):  0bf74768
 *   Winter 2026 season UUID:        b3efb4fc-f645-4b5a-a777-50cc99464849
 *
 * TO ADD THE SUMMER SEASON FULL UUID:
 *   1. Log into https://bv.playhq.com
 *   2. Navigate to the summer 2025/26 season
 *   3. The UUID is in the URL — copy it into SEASON_IDS below
 *
 * LIVE SCOREBOARD NOTE
 * --------------------
 * PlayHQ's "Live Scoreboard Integration" is a webhook system for physical
 * stadium LED displays — it is not an embeddable iframe for websites.
 * The best way to show live scores on your site is to run this scraper
 * on a schedule (e.g. every 5 minutes on game days) and rebuild the site.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Configuration ────────────────────────────────────────────────────────────

function readLocalEnvVar(key) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return undefined;

  const raw = fs.readFileSync(envPath, 'utf-8');
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
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

const PLAYHQ_API_KEY = process.env.PLAYHQ_API_KEY || readLocalEnvVar('PLAYHQ_API_KEY') || 'PASTE_YOUR_API_KEY_HERE';
const TENANT         = process.env.PLAYHQ_TENANT || readLocalEnvVar('PLAYHQ_TENANT') || 'bv';
const ORG_ID         = process.env.PLAYHQ_ORG_ID || readLocalEnvVar('PLAYHQ_ORG_ID') || '90c7fb8e-b434-42ea-9af5-625235ca11e7';
const CLUB_NAME      = process.env.PLAYHQ_CLUB_MATCH || readLocalEnvVar('PLAYHQ_CLUB_MATCH') || 'Phoenix';

// Season UUIDs to fetch. Add/remove as seasons change.
// Get the full UUID from the admin URL: https://bv.playhq.com/org/.../seasons/{UUID}/grades
const SEASON_IDS = [
  'b3efb4fc-f645-4b5a-a777-50cc99464849',   // Winter 2025
  // 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Summer 2025/26 — add full UUID here
];

const API_BASE    = process.env.PLAYHQ_API_BASE || readLocalEnvVar('PLAYHQ_API_BASE') || 'https://api.playhq.com';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, 'scores-data.json');

// ─── API helper ───────────────────────────────────────────────────────────────

async function apiFetch(endpoint) {
  if (PLAYHQ_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
    throw new Error(
      'No API key configured.\n' +
      'Set PLAYHQ_API_KEY in your shell or in .env.local at repo root.\n' +
      'See the BEFORE YOU RUN section above for how to get a key.'
    );
  }

  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Accept':       'application/json',
      'x-api-key':    PLAYHQ_API_KEY,
      'x-phq-tenant': TENANT,
    },
  });

  if (!res.ok) {
    throw new Error(`PlayHQ API ${res.status} on ${url}`);
  }

  return res.json();
}

/** Fetch all pages of a paginated endpoint. */
async function fetchAllPages(basePath) {
  const results = [];
  let cursor = null;

  do {
    const sep  = basePath.includes('?') ? '&' : '?';
    const url  = cursor ? `${basePath}${sep}cursor=${cursor}` : basePath;
    const data = await apiFetch(url);
    results.push(...(data.data ?? []));
    cursor = data.metadata?.hasMore ? data.metadata.nextCursor : null;
  } while (cursor);

  return results;
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────

async function getGradesForSeason(seasonId) {
  const data = await apiFetch(`/v1/seasons/${seasonId}/grades`);
  return data.data ?? [];
}

async function getLadder(gradeId) {
  const data = await apiFetch(`/v1/grades/${gradeId}/ladder`);
  return data.data ?? [];
}

async function getFixture(gradeId) {
  return fetchAllPages(`/v1/grades/${gradeId}/games`);
}

// ─── Transform helpers ────────────────────────────────────────────────────────

function isPhoenixGame(game) {
  const needle = CLUB_NAME.toLowerCase();
  return (game.competitors ?? []).some(c => c.name.toLowerCase().includes(needle));
}

function normaliseGame(game, gradeName) {
  const home = (game.competitors ?? []).find(c => c.isHomeTeam);
  const away = (game.competitors ?? []).find(c => !c.isHomeTeam);
  return {
    id:          game.id,
    date:        game.schedule?.date ?? null,
    time:        game.schedule?.time ?? null,
    competition: gradeName,
    venue:       game.venue?.name ?? null,
    court:       game.venue?.surfaceName ?? game.venue?.surfaceAbbreviation ?? null,
    homeTeam:    home?.name ?? 'TBD',
    awayTeam:    away?.name ?? 'TBD',
    homeScore:   home?.scoreTotal ?? null,
    awayScore:   away?.scoreTotal ?? null,
    status:      game.status ?? 'scheduled',
  };
}

function normaliseLadderRow(row, rank) {
  return {
    rank,
    team:      row.team?.name ?? row.teamName ?? '—',
    played:    row.played  ?? 0,
    won:       row.won     ?? 0,
    lost:      row.lost    ?? 0,
    drawn:     row.drawn   ?? 0,
    points:    row.points  ?? 0,
    isPhoenix: (row.team?.name ?? row.teamName ?? '').toLowerCase().includes(CLUB_NAME.toLowerCase()),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏀 Bendigo Phoenix — PlayHQ scraper');
  console.log('─────────────────────────────────────');

  if (PLAYHQ_API_KEY === 'PASTE_YOUR_API_KEY_HERE') {
    throw new Error('No API key configured. Set PLAYHQ_API_KEY before running scores:refresh.');
  }

  const allScores  = [];
  const allLadders = {};

  for (const seasonId of SEASON_IDS) {
    console.log(`\nSeason: ${seasonId}`);
    let grades;

    try {
      grades = await getGradesForSeason(seasonId);
    } catch (err) {
      console.error(`  ✗ Could not fetch grades: ${err.message}`);
      continue;
    }

    console.log(`  ${grades.length} grade(s) found`);

    for (const grade of grades) {
      const gradeName = grade.name ?? grade.id;
      console.log(`  → ${gradeName}`);

      try {
        const rows = await getLadder(grade.id);
        allLadders[gradeName] = rows.map((row, i) => normaliseLadderRow(row, i + 1));
        console.log(`    Ladder: ${rows.length} team(s)`);
      } catch (err) {
        console.warn(`    ⚠ Ladder: ${err.message}`);
      }

      try {
        const allGames     = await getFixture(grade.id);
        const phoenixGames = allGames.filter(isPhoenixGame);
        allScores.push(...phoenixGames.map(g => normaliseGame(g, gradeName)));
        console.log(`    Fixture: ${phoenixGames.length} Phoenix game(s) of ${allGames.length}`);
      } catch (err) {
        console.warn(`    ⚠ Fixture: ${err.message}`);
      }
    }
  }

  // Most recent completed games first, then upcoming by date
  allScores.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date) - new Date(a.date);
  });

  const output = {
    lastUpdated: new Date().toISOString(),
    scores:  allScores,
    ladders: allLadders,
    // Flat ladder for the scores page (all grades combined, Phoenix row highlighted)
    ladder:  Object.values(allLadders).flat(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log('\n─────────────────────────────────────');
  console.log(`✅ ${allScores.length} game(s) written to scripts/scores-data.json`);
  console.log(`   Run 'npm run build' to rebuild the site with updated data.`);
}

main().catch(err => {
  console.error('\n❌ Scraper failed:', err.message);
  process.exit(1);
});
