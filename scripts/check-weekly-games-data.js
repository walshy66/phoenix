#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(process.cwd(), 'scripts/weekly-games-data.json');

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

if (!existsSync(file)) {
  fail('Missing scripts/weekly-games-data.json. Run `node scripts/scrape-weekly-games.js` first.');
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(file, 'utf-8'));
} catch {
  fail('weekly-games-data.json is not valid JSON.');
}

const requiredRoot = ['generatedAt', 'window', 'status', 'days'];
for (const key of requiredRoot) {
  if (!(key in parsed)) fail(`Artifact missing root key: ${key}`);
}

if (!['success', 'stale', 'error'].includes(parsed.status)) {
  fail(`Invalid status: ${parsed.status}`);
}

if (!parsed.window?.startDate || !parsed.window?.endDate) {
  fail('window.startDate/window.endDate are required');
}

for (const day of ['monday', 'tuesday', 'wednesday', 'friday']) {
  if (!Array.isArray(parsed.days?.[day])) {
    fail(`days.${day} must be an array`);
  }
}

console.log('✅ weekly-games-data.json passed shape checks');
