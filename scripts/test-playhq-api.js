#!/usr/bin/env node
/**
 * PlayHQ API Explorer — temporary test script.
 * Run: node scripts/test-playhq-api.js
 */

import { CLUB_NAME, apiFetch, fetchAllPages, playHQConfig } from './lib/playhq-api.js';

const SEASON_IDS = playHQConfig.seasonIds;
const SEASON_ID = SEASON_IDS[0];

if (!SEASON_ID) {
  throw new Error('Missing required PlayHQ configuration: PLAYHQ_SEASON_IDS');
}

async function get(path) {
  console.log(`\nGET ${playHQConfig.apiBase}${path}`);
  try {
    const json = await apiFetch(path);
    console.log('Status: 200');
    return json;
  } catch (err) {
    console.log('Error:', err.message);
    return null;
  }
}

function parseGradeName(name) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const day = days.find((d) => name.includes(d)) ?? null;
  const ageMatch = name.match(/U(\d+)/i);
  const ageGroup = ageMatch ? `u${ageMatch[1]}s` : null;
  const gender = name.includes('Boys') ? 'Boys' : name.includes('Girls') ? 'Girls' : null;
  const divMatch = name.match(/\b(\d+)\s*$/);
  const division = divMatch
    ? `DIV ${divMatch[1]}`
    : name.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(U\d+)?\s*(Boys|Girls)?\s*/i, '').trim() || null;
  return { day, ageGroup, gender, division };
}

async function getAllTeams(seasonId) {
  return fetchAllPages(`/v1/seasons/${seasonId}/teams`);
}

async function main() {
  console.log('=== PlayHQ API Explorer ===\n');

  console.log('\n--- ALL TEAMS (paginated, configured season) ---');
  const allTeams = await getAllTeams(SEASON_ID);
  console.log(`Total teams across all pages: ${allTeams.length}`);
  const clubTeams = allTeams.filter((team) => String(team.name ?? '').toLowerCase().includes(CLUB_NAME.toLowerCase()));
  console.log(`Configured club teams found: ${clubTeams.length}`);
  clubTeams.forEach((team) => {
    const parsed = parseGradeName(team.grade?.name ?? '');
    console.log(`  "${team.name}" → grade: "${team.grade?.name}" → ageGroup=${parsed.ageGroup} gender=${parsed.gender} day=${parsed.day} division=${parsed.division}`);
  });

  console.log('\n--- GAMES ENDPOINT ---');
  const grades = await get(`/v1/seasons/${SEASON_ID}/grades`);
  if (!grades) return;

  const items = grades.data ?? grades;
  const clubGradeId = clubTeams[0]?.grade?.id;
  const testGradeId = clubGradeId ?? (Array.isArray(items) ? items[0]?.id : null);
  if (!testGradeId) return;

  const games = await get(`/v1/grades/${testGradeId}/games`);
  if (!games) return;

  const gameList = games.data ?? games;
  console.log(`Games count: ${Array.isArray(gameList) ? gameList.length : 'N/A'}`);
  if (Array.isArray(gameList) && gameList.length > 0) {
    console.log('First game full shape:', JSON.stringify(gameList[0], null, 2));
    const gameId = gameList[0].id;
    if (gameId) {
      console.log('\n--- GAME SUMMARY ---');
      const summary = await get(`/v1/games/${gameId}/summary`);
      if (summary) console.log('Summary shape:', JSON.stringify(summary, null, 2));
    }
  }
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
