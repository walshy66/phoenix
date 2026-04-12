#!/usr/bin/env node
/**
 * PlayHQ Teams Scraper — Bendigo Phoenix
 * =======================================
 * Fetches team roster data from PlayHQ REST API and writes to
 * scripts/teams-data.json, which the Teams page reads at build time.
 *
 * USAGE
 * -----
 *   node scripts/scrape-playhq-teams.js
 *
 * HOW IT WORKS
 * -----------
 * Calls: GET /v1/seasons/{seasonId}/teams
 *   → lists all teams in the season
 *   → filters for Bendigo Phoenix teams
 *   → extracts grade (age group, gender, game night, division)
 *   → writes to teams-data.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Configuration ────────────────────────────────────────────────────────────

const PLAYHQ_API_KEY = process.env.PLAYHQ_API_KEY || '4a1e6a01-32f3-477d-9c08-4d9ec6b50148';
const TENANT         = 'bv';
const ORG_ID         = '90c7fb8e-b434-42ea-9af5-625235ca11e7';
const CLUB_NAME      = 'Bendigo Phoenix';

// Season UUIDs to fetch teams from
const SEASON_IDS = [
  'b3efb4fc-f645-4b5a-a777-50cc99464849',   // Winter 2026
  // '0bf74768-492e-4f43-adcf-c863f59c9422', // Summer 2025/26 (if needed)
];

const API_BASE      = 'https://api.playhq.com';
const OUTPUT_FILE   = path.join(__dirname, 'teams-data.json');

// ─── API helper ───────────────────────────────────────────────────────────────

async function apiFetch(endpoint) {
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

// ─── Transform helpers ────────────────────────────────────────────────────────

function parseGradeName(name) {
  if (!name) return { ageGroup: 'unknown', gender: 'TBC', gameNight: 'TBC', division: 'TBC' };
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const gameNight = days.find(d => name.includes(d)) ?? 'TBC';
  
  const ageMatch = name.match(/U(\d+)/i);
  const ageGroup = ageMatch ? `u${ageMatch[1]}s` : 'unknown';
  
  const gender = name.includes('Boys') ? 'Boys' : name.includes('Girls') ? 'Girls' : 'TBC';
  
  const divMatch = name.match(/\b(\d+)\s*$/);
  const division = divMatch ? `DIV ${divMatch[1]}` : 'TBC';
  
  return { ageGroup, gender, gameNight, division };
}

function normaliseTeam(team, index) {
  const gradeName = team.grade?.name ?? '';
  const parsed = parseGradeName(gradeName);
  
  return {
    id:        team.id,
    name:      team.name,
    gradeName: gradeName,
    slug:      team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
    coaches:   (team.coaches ?? []).map(c => ({ name: c.name, role: c.role })),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🏀 Bendigo Phoenix — Teams scraper');
  console.log('──────────────────────────────────');

  const allTeams = [];

  for (const seasonId of SEASON_IDS) {
    console.log(`\nSeason: ${seasonId}`);
    let teams;

    try {
      teams = await fetchAllPages(`/v1/seasons/${seasonId}/teams`);
    } catch (err) {
      console.error(`  ✗ Could not fetch teams: ${err.message}`);
      continue;
    }

    console.log(`  ${teams.length} team(s) total`);

    const phoenixTeams = teams.filter(t => 
      t.name.toLowerCase().includes('phoenix') || 
      t.name.toLowerCase().includes('bendigo')
    );
    console.log(`  ${phoenixTeams.length} Phoenix team(s)`);

    phoenixTeams.forEach(team => {
      const normalized = normaliseTeam(team);
      allTeams.push(normalized);
      const parsed = parseGradeName(team.grade?.name ?? '');
      console.log(`    • ${team.name} (${parsed.ageGroup}, ${parsed.gender}, ${parsed.gameNight})`);
    });
  }

  // Sort by age group order, then alphabetically
  const ageGroupOrder = ['u10s', 'u12s', 'u14s', 'u16s', 'u18s'];
  allTeams.sort((a, b) => {
    const aGrade = parseGradeName(a.gradeName).ageGroup;
    const bGrade = parseGradeName(b.gradeName).ageGroup;
    const aIndex = ageGroupOrder.indexOf(aGrade);
    const bIndex = ageGroupOrder.indexOf(bGrade);
    
    if (aIndex !== bIndex) return aIndex - bIndex;
    return a.name.localeCompare(b.name);
  });

  const output = {
    lastUpdated: new Date().toISOString(),
    teams: allTeams,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log('\n──────────────────────────────────');
  console.log(`✅ ${allTeams.length} team(s) written to scripts/teams-data.json`);
  console.log(`   Run 'npm run build' to rebuild the site with updated data.`);
}

main().catch(err => {
  console.error('\n❌ Scraper failed:', err.message);
  process.exit(1);
});
