#!/usr/bin/env node
/**
 * PlayHQ Teams Details Scraper — Bendigo Phoenix
 * ================================================
 * Fetches schedule (games) and ladder data for each Phoenix team
 * and writes to scripts/teams-details.json
 *
 * USAGE: node scripts/scrape-playhq-teams-details.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYHQ_API_KEY = process.env.PLAYHQ_API_KEY || '4a1e6a01-32f3-477d-9c08-4d9ec6b50148';
const TENANT = 'bv';
const SEASON_IDS = [
  'b3efb4fc-f645-4b5a-a777-50cc99464849',   // Winter 2026
];

const API_BASE = 'https://api.playhq.com';
const OUTPUT_FILE = path.join(__dirname, 'teams-details.json');

const HEADERS = {
  'Accept': 'application/json',
  'x-api-key': PLAYHQ_API_KEY,
  'x-phq-tenant': TENANT,
};

async function apiFetch(endpoint) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, { headers: HEADERS });

  if (!res.ok) {
    throw new Error(`PlayHQ API ${res.status} on ${url}`);
  }

  return res.json();
}

async function fetchAllPages(basePath) {
  const results = [];
  let cursor = null;

  do {
    const sep = basePath.includes('?') ? '&' : '?';
    const url = cursor ? `${basePath}${sep}cursor=${cursor}` : basePath;
    const data = await apiFetch(url);
    results.push(...(data.data ?? []));
    cursor = data.metadata?.hasMore ? data.metadata.nextCursor : null;
  } while (cursor);

  return results;
}

function normalizeGame(game) {
  const competitors = game.competitors ?? [];
  const home = competitors.find(c => c.isHomeTeam);
  const away = competitors.find(c => !c.isHomeTeam);
  const rawStatus = String(game.status ?? 'UPCOMING').toLowerCase();
  const status = rawStatus === 'final' || rawStatus === 'completed' ? 'COMPLETED'
    : rawStatus === 'in-progress' || rawStatus === 'live' ? 'IN_PROGRESS'
    : 'UPCOMING';

  return {
    id: game.id,
    date: game.schedule?.date ?? null,
    time: game.schedule?.time ?? null,
    venue: game.venue?.name ?? 'TBC',
    court: game.venue?.surfaceName ?? game.venue?.surfaceAbbreviation ?? null,
    address: game.venue?.address?.line1 ?? null,
    homeTeam: home?.name ?? 'TBD',
    awayTeam: away?.name ?? 'TBD',
    homeScore: home?.scoreTotal ?? null,
    awayScore: away?.scoreTotal ?? null,
    status,
    round: game.round?.name ?? null,
    playerStats: null,
  };
}

function normalizePlayerStats(summary) {
  const competitors = summary.competitors ?? [];
  const teamNameById = new Map(competitors.map((team) => [team.id, team.name ?? 'Unknown']));
  const appearances = Array.isArray(summary.appearances) ? summary.appearances : [];

  const players = appearances
    .filter((appearance) => String(appearance.roleType ?? '').toLowerCase() === 'player')
    .map((appearance) => ({
      name: [appearance.firstName, appearance.lastName].filter(Boolean).join(' ').trim() || 'Unknown',
      team: teamNameById.get(appearance.teamID) ?? 'Unknown',
      points: Number(appearance.scoreTotal ?? 0),
      fouls: 0,
      assists: 0,
      rebounds: 0,
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  return players.length ? { players } : null;
}

function normalizeLadderRow(row, rank) {
  return {
    rank: row.ranking != null ? Number(row.ranking) + 1 : rank,
    team: row.team?.name ?? row.teamName ?? row.name ?? '—',
    played: row.played ?? 0,
    won: row.won ?? 0,
    lost: row.lost ?? 0,
    drawn: row.drawn ?? 0,
    points: row.points ?? row.competitionPoints ?? 0,
  };
}

function flattenLadderPayload(payload) {
  const flattened = [];
  for (const entry of payload?.data ?? []) {
    for (const ladder of entry?.ladders ?? []) {
      flattened.push(...(ladder?.standings ?? []));
    }
  }
  return flattened;
}

async function main() {
  console.log('🏀 Bendigo Phoenix — Teams Details scraper');
  console.log('─────────────────────────────────────────');

  const teamDetails = {};

  // Load teams data to get grade IDs
  const teamsDataPath = path.join(__dirname, 'teams-data.json');
  let teams = [];
  try {
    const raw = fs.readFileSync(teamsDataPath, 'utf-8');
    const data = JSON.parse(raw);
    teams = data.teams || [];
  } catch (err) {
    console.error('Failed to load teams-data.json. Run scrape-playhq-teams.js first.');
    process.exit(1);
  }

  console.log(`Loaded ${teams.length} teams\n`);

  // Group teams by grade to avoid fetching duplicate data
  const gradeMap = {};
  teams.forEach(team => {
    const gradeName = team.gradeName;
    if (!gradeMap[gradeName]) {
      gradeMap[gradeName] = [];
    }
    gradeMap[gradeName].push(team);
  });

  console.log(`Processing ${Object.keys(gradeMap).length} unique grades...\n`);

  // For each grade, fetch ladder and games
  for (const [gradeName, gradeTeams] of Object.entries(gradeMap)) {
    console.log(`Grade: ${gradeName}`);

    // Get grade ID from first team's grade info (we'll fetch from API)
    // We need to find the grade ID by querying all grades and matching by name
    let gradeId = null;
    for (const seasonId of SEASON_IDS) {
      try {
        const grades = await fetchAllPages(`/v1/seasons/${seasonId}/grades`);
        const matchedGrade = grades.find(g => g.name === gradeName);
        if (matchedGrade) {
          gradeId = matchedGrade.id;
          break;
        }
      } catch (err) {
        console.warn(`  ⚠ Could not fetch grades: ${err.message}`);
      }
    }

    if (!gradeId) {
      console.warn(`  ⚠ Could not find grade ID for "${gradeName}"`);
      continue;
    }

    // Fetch ladder
    let ladder = [];
    try {
      const rows = await apiFetch(`/v1/grades/${gradeId}/ladder`);
      ladder = flattenLadderPayload(rows).map((row, i) => normalizeLadderRow(row, i + 1));
      console.log(`  Ladder: ${ladder.length} team(s)`);
    } catch (err) {
      console.warn(`  ⚠ Ladder: ${err.message}`);
    }

    // Fetch games
    let games = [];
    try {
      const allGames = await fetchAllPages(`/v1/grades/${gradeId}/games`);
      games = allGames.map(normalizeGame);
      console.log(`  Games: ${games.length} total`);
    } catch (err) {
      console.warn(`  ⚠ Games: ${err.message}`);
    }

    // Assign to each team in this grade
    for (const team of gradeTeams) {
      const teamGames = games.filter(g => g.homeTeam === team.name || g.awayTeam === team.name);

      // Sort by date (most recent first for completed, upcoming next)
      teamGames.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
      });

      const enrichedGames = [];
      for (const game of teamGames) {
        if (game.status === 'COMPLETED') {
          try {
            const summary = await apiFetch(`/v1/games/${game.id}/summary`);
            game.playerStats = normalizePlayerStats(summary.data ?? summary);
          } catch (err) {
            console.warn(`  ⚠ Stats: ${err.message}`);
          }
        }
        enrichedGames.push(game);
      }

      teamDetails[team.slug] = {
        teamId: team.id,
        teamName: team.name,
        gradeName: gradeName,
        fixture: enrichedGames,
        ladder: ladder,
      };
    }
  }

  const output = {
    lastUpdated: new Date().toISOString(),
    teamDetails: teamDetails,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Details for ${Object.keys(teamDetails).length} team(s) written`);
  console.log(`   Run 'npm run build' to rebuild the site.`);
}

main().catch(err => {
  console.error('\n❌ Scraper failed:', err.message);
  process.exit(1);
});
