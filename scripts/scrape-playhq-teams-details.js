#!/usr/bin/env node
/**
 * PlayHQ Teams Details Scraper
 * ============================
 * Fetches schedule (games) and ladder data for each configured club team
 * and writes to scripts/teams-details.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  apiFetch,
  fetchAllPages,
  fetchGrades,
  flattenLadderPayload,
  normaliseStatus,
  playHQConfig,
} from './lib/playhq-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, 'teams-details.json');
const SEASON_IDS = playHQConfig.seasonIds;

if (SEASON_IDS.length === 0) {
  throw new Error('Missing required PlayHQ configuration: PLAYHQ_SEASON_IDS');
}

function normalizeGame(game) {
  const competitors = game.competitors ?? [];
  const home = competitors.find((c) => c.isHomeTeam);
  const away = competitors.find((c) => !c.isHomeTeam);

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
    status: normaliseStatus(game.status),
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

async function main() {
  console.log('🏀 PlayHQ — Teams Details scraper');
  console.log('─────────────────────────────────────────');

  const teamDetails = {};
  const teamsDataPath = path.join(__dirname, 'teams-data.json');
  let teams = [];
  try {
    const raw = fs.readFileSync(teamsDataPath, 'utf-8');
    const data = JSON.parse(raw);
    teams = data.teams || [];
  } catch {
    console.error('Failed to load teams-data.json. Run scrape-playhq-teams.js first.');
    process.exit(1);
  }

  console.log(`Loaded ${teams.length} teams\n`);

  const gradeMap = {};
  teams.forEach((team) => {
    const gradeName = team.gradeName;
    if (!gradeMap[gradeName]) gradeMap[gradeName] = [];
    gradeMap[gradeName].push(team);
  });

  console.log(`Processing ${Object.keys(gradeMap).length} unique grades...\n`);

  for (const [gradeName, gradeTeams] of Object.entries(gradeMap)) {
    console.log(`Grade: ${gradeName}`);

    let gradeId = null;
    for (const seasonId of SEASON_IDS) {
      try {
        const grades = await fetchGrades(seasonId);
        const matchedGrade = grades.find((grade) => grade.name === gradeName);
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

    let ladder = [];
    try {
      const rows = await apiFetch(`/v1/grades/${gradeId}/ladder`);
      ladder = flattenLadderPayload(rows).map((row, i) => normalizeLadderRow(row, i + 1));
      console.log(`  Ladder: ${ladder.length} team(s)`);
    } catch (err) {
      console.warn(`  ⚠ Ladder: ${err.message}`);
    }

    let games = [];
    try {
      const allGames = await fetchAllPages(`/v1/grades/${gradeId}/games`);
      games = allGames.map(normalizeGame);
      console.log(`  Games: ${games.length} total`);
    } catch (err) {
      console.warn(`  ⚠ Games: ${err.message}`);
    }

    for (const team of gradeTeams) {
      const teamGames = games.filter((game) => game.homeTeam === team.name || game.awayTeam === team.name);
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
        gradeName,
        fixture: enrichedGames,
        ladder,
      };
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ lastUpdated: new Date().toISOString(), teamDetails }, null, 2));

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Details for ${Object.keys(teamDetails).length} team(s) written`);
  console.log("   Run 'npm run build' to rebuild the site.");
}

main().catch((err) => {
  console.error('\n❌ Scraper failed:', err.message);
  process.exit(1);
});
