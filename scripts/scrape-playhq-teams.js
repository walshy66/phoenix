#!/usr/bin/env node
/**
 * PlayHQ Teams Scraper
 * ====================
 * Fetches team roster data from PlayHQ REST API and writes to
 * scripts/teams-data.json, which the Teams page reads at build time.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLUB_NAME, fetchTeams, playHQConfig } from './lib/playhq-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, 'teams-data.json');
const SEASON_IDS = playHQConfig.seasonIds;

if (SEASON_IDS.length === 0) {
  throw new Error('Missing required PlayHQ configuration: PLAYHQ_SEASON_IDS');
}

function parseGradeName(name) {
  if (!name) return { ageGroup: 'unknown', gender: 'TBC', gameNight: 'TBC', division: 'TBC' };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const gameNight = days.find((d) => name.includes(d)) ?? 'TBC';
  const ageMatch = name.match(/U(\d+)/i);
  const ageGroup = ageMatch ? `u${ageMatch[1]}` : 'unknown';
  const gender = name.includes('Boys') ? 'Boys' : name.includes('Girls') ? 'Girls' : 'TBC';
  const divMatch = name.match(/\b(\d+)\s*$/);
  const division = divMatch ? `DIV ${divMatch[1]}` : 'TBC';
  return { ageGroup, gender, gameNight, division };
}

function normaliseTeam(team) {
  const gradeName = team.grade?.name ?? '';
  return {
    id: team.id,
    name: team.name,
    gradeName,
    slug: team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    coaches: (team.coaches ?? []).map((c) => ({ name: c.name, role: c.role })),
  };
}

async function main() {
  console.log(`🏀 ${CLUB_NAME} — Teams scraper`);
  console.log('──────────────────────────────────');

  const allTeams = [];
  const clubNeedle = CLUB_NAME.toLowerCase();

  for (const seasonId of SEASON_IDS) {
    console.log(`\nSeason: ${seasonId}`);
    let teams;

    try {
      teams = await fetchTeams(seasonId);
    } catch (err) {
      console.error(`  ✗ Could not fetch teams: ${err.message}`);
      continue;
    }

    console.log(`  ${teams.length} team(s) total`);
    const clubTeams = teams.filter((team) => String(team.name ?? '').toLowerCase().includes(clubNeedle));
    console.log(`  ${clubTeams.length} configured club team(s)`);

    clubTeams.forEach((team) => {
      const normalized = normaliseTeam(team);
      allTeams.push(normalized);
      const parsed = parseGradeName(team.grade?.name ?? '');
      console.log(`    • ${team.name} (${parsed.ageGroup}, ${parsed.gender}, ${parsed.gameNight})`);
    });
  }

  const ageGroupOrder = ['u10', 'u12', 'u14', 'u16', 'u18'];
  allTeams.sort((a, b) => {
    const aGrade = parseGradeName(a.gradeName).ageGroup;
    const bGrade = parseGradeName(b.gradeName).ageGroup;
    const aIndex = ageGroupOrder.indexOf(aGrade);
    const bIndex = ageGroupOrder.indexOf(bGrade);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.name.localeCompare(b.name);
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ lastUpdated: new Date().toISOString(), teams: allTeams }, null, 2));

  console.log('\n──────────────────────────────────');
  console.log(`✅ ${allTeams.length} team(s) written to scripts/teams-data.json`);
  console.log("   Run 'npm run build' to rebuild the site with updated data.");
}

main().catch((err) => {
  console.error('\n❌ Scraper failed:', err.message);
  process.exit(1);
});
