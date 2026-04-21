#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROUNDS_DIR = path.join(process.cwd(), 'public', 'live-data', 'rounds');
const indexPath = path.join(ROUNDS_DIR, 'rounds-index.json');

function bail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(indexPath)) bail('rounds-index.json not found');

let index;
try {
  index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
} catch {
  bail('rounds-index.json is not valid JSON');
}

if (typeof index.currentRound !== 'number') bail('currentRound missing or not a number');
if (!Array.isArray(index.availableRounds)) bail('availableRounds missing or not an array');
if (typeof index.lastUpdated !== 'string') bail('lastUpdated missing');

for (const roundNumber of index.availableRounds) {
  const roundPath = path.join(ROUNDS_DIR, `round-${roundNumber}.json`);
  if (!fs.existsSync(roundPath)) bail(`round-${roundNumber}.json listed in availableRounds but file not found`);
  const round = JSON.parse(fs.readFileSync(roundPath, 'utf8'));
  if (typeof round.roundNumber !== 'number') bail(`round-${roundNumber}.json missing roundNumber`);
  if (!['upcoming', 'in-progress', 'completed'].includes(round.status)) bail(`round-${roundNumber}.json has invalid status`);
  if (!Array.isArray(round.games)) bail(`round-${roundNumber}.json missing games array`);
}

console.log('OK: round files validated');
