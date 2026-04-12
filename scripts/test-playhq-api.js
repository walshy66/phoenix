#!/usr/bin/env node
/**
 * PlayHQ API Explorer — temporary test script
 * Run: node scripts/test-playhq-api.js
 * Delete after use.
 */

const API_KEY = '4a1e6a01-32f3-477d-9c08-4d9ec6b50148';
const TENANT  = 'bv';
const ORG_ID  = '90c7fb8e-b434-42ea-9af5-625235ca11e7';
const SEASON_ID_UPCOMING = 'b3efb4fc-f645-4b5a-a777-50cc99464849'; // Winter 2026 (UPCOMING)
const SEASON_ID_COMPLETED = '0bf74768-492e-4f43-adcf-c863f59c9422'; // Summer 2025/26 (COMPLETED)
const SEASON_ID = SEASON_ID_UPCOMING;

const HEADERS = {
  'Accept':       'application/json',
  'x-api-key':    API_KEY,
  'x-phq-tenant': TENANT,
};

async function get(path) {
  const url = `https://api.playhq.com${path}`;
  console.log(`\nGET ${url}`);
  const res = await fetch(url, { headers: HEADERS });
  console.log(`Status: ${res.status}`);
  if (!res.ok) {
    const text = await res.text();
    console.log('Error body:', text.slice(0, 500));
    return null;
  }
  const json = await res.json();
  return json;
}

// Parse age group, gender, game night, division from a PlayHQ grade name
// e.g. "Friday U18 Boys 2" → { day: "Friday", ageGroup: "U18", gender: "Boys", division: "2" }
function parseGradeName(name) {
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const day = days.find(d => name.includes(d)) ?? null;
  const ageMatch = name.match(/U(\d+)/i);
  const ageGroup = ageMatch ? `u${ageMatch[1]}s` : null;
  const gender = name.includes('Boys') ? 'Boys' : name.includes('Girls') ? 'Girls' : null;
  const divMatch = name.match(/\b(\d+)\s*$/);
  const division = divMatch ? `DIV ${divMatch[1]}` : name.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*(U\d+)?\s*(Boys|Girls)?\s*/i, '').trim() || null;
  return { day, ageGroup, gender, division };
}

async function getAllTeams(seasonId) {
  const all = [];
  let cursor = null;
  do {
    const url = cursor
      ? `/v1/seasons/${seasonId}/teams?cursor=${cursor}`
      : `/v1/seasons/${seasonId}/teams`;
    const res = await get(url);
    if (!res) break;
    const items = res.data ?? res;
    all.push(...(Array.isArray(items) ? items : []));
    cursor = res.metadata?.hasMore ? res.metadata.nextCursor : null;
  } while (cursor);
  return all;
}

async function main() {
  console.log('=== PlayHQ API Explorer ===\n');

  // 1. Paginate ALL teams to find Phoenix ones
  console.log('\n--- ALL TEAMS (paginated, upcoming season) ---');
  const allTeams = await getAllTeams(SEASON_ID_UPCOMING);
  console.log(`Total teams across all pages: ${allTeams.length}`);
  const phoenix = allTeams.filter(t => t.name.toLowerCase().includes('phoenix'));
  console.log(`Phoenix teams found: ${phoenix.length}`);
  phoenix.forEach(t => {
    const parsed = parseGradeName(t.grade?.name ?? '');
    console.log(`  "${t.name}" → grade: "${t.grade?.name}" → ageGroup=${parsed.ageGroup} gender=${parsed.gender} day=${parsed.day} division=${parsed.division}`);
  });

  // 2. The correct fixture endpoint is /games — fetch it and print a full game shape
  console.log('\n--- GAMES ENDPOINT (correct fixture path) ---');
  const gradesCompleted = await get(`/v1/seasons/${SEASON_ID_COMPLETED}/grades`);
  if (gradesCompleted) {
    const items = gradesCompleted.data ?? gradesCompleted;
    // Find a Phoenix-relevant grade from completed season
    const allTeamsCompleted = await getAllTeams(SEASON_ID_COMPLETED);
    const phoenixCompleted = allTeamsCompleted.filter(t => t.name.toLowerCase().includes('phoenix'));
    console.log(`Phoenix teams in completed season: ${phoenixCompleted.length}`);
    phoenixCompleted.forEach(t => console.log(`  "${t.name}" → grade: "${t.grade?.name}"`));

    // Test /games on a grade that has Phoenix
    const phoenixGradeId = phoenixCompleted[0]?.grade?.id;
    const testGradeId = phoenixGradeId ?? (Array.isArray(items) ? items[0]?.id : null);
    if (testGradeId) {
      const games = await get(`/v1/grades/${testGradeId}/games`);
      if (games) {
        const gameList = games.data ?? games;
        console.log(`Games count: ${Array.isArray(gameList) ? gameList.length : 'N/A'}`);
        if (Array.isArray(gameList) && gameList.length > 0) {
          console.log('First game full shape:', JSON.stringify(gameList[0], null, 2));

          // Game summary on first game
          const gameId = gameList[0].id;
          if (gameId) {
            console.log('\n--- GAME SUMMARY ---');
            const summary = await get(`/v1/games/${gameId}/summary`);
            if (summary) console.log('Summary shape:', JSON.stringify(summary, null, 2));
          }
        }
      }
    }
  }
}

main().catch(err => {
  console.error('Failed:', err.message);
  process.exit(1);
});
