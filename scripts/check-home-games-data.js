#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'scripts', 'home-games-data.json');

function fail(code, message) {
  console.error(`${code}: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(FILE)) {
  fail('INVALID_SHAPE', 'scripts/home-games-data.json does not exist. Run home-scores:refresh first.');
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
} catch {
  fail('INVALID_JSON', 'home-games-data.json contains invalid JSON');
}

if (!payload || typeof payload !== 'object') {
  fail('INVALID_SHAPE', 'artifact root must be an object');
}

if (!['success', 'stale', 'error'].includes(payload.status)) {
  fail('INVALID_STATUS', 'status must be success|stale|error');
}

if (!payload.window || !['rolling-7-days', 'rolling-7-plus-7-days'].includes(payload.window.kind)) {
  fail('INVALID_SHAPE', 'window.kind must be rolling-7-days or rolling-7-plus-7-days');
}

if (payload.window.timezone !== 'Australia/Melbourne') {
  fail('INVALID_SHAPE', 'window.timezone must be Australia/Melbourne');
}

if (!Array.isArray(payload.games)) {
  fail('INVALID_SHAPE', 'games must be an array');
}

console.log('✅ home-games-data.json is valid');
