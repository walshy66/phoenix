#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'scripts', 'scores-data.json');

function fail(code, message) {
  console.error(`${code}: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(FILE)) {
  fail('INVALID_SHAPE', 'scripts/scores-data.json does not exist. Run scores:refresh first.');
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
} catch {
  fail('INVALID_JSON', 'scores-data.json contains invalid JSON');
}

if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
  fail('INVALID_SHAPE', 'scores artifact root must be an object');
}

if (typeof payload.lastUpdated !== 'string' || Number.isNaN(Date.parse(payload.lastUpdated))) {
  fail('INVALID_SHAPE', 'lastUpdated must be an ISO datetime string');
}

if (!Array.isArray(payload.scores)) {
  fail('INVALID_SHAPE', 'scores must be an array');
}

if (!Array.isArray(payload.ladder)) {
  fail('INVALID_SHAPE', 'ladder must be an array');
}

for (const [index, game] of payload.scores.entries()) {
  if (!game || typeof game !== 'object') {
    fail('INVALID_SHAPE', `scores[${index}] must be an object`);
  }
  if (typeof game.id !== 'string' && typeof game.id !== 'number') {
    fail('INVALID_SHAPE', `scores[${index}].id is required`);
  }
  if (typeof game.homeTeam !== 'string' || typeof game.awayTeam !== 'string') {
    fail('INVALID_SHAPE', `scores[${index}] homeTeam/awayTeam must be strings`);
  }
}

console.log('✅ scores-data.json is valid');
