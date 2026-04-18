#!/usr/bin/env node
import { cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log('🏀 Refreshing local PlayHQ artifacts...');
run('npm', ['run', 'scores:refresh']);
run('node', ['scripts/scrape-weekly-games.js']);
run('node', ['scripts/check-weekly-games-data.js']);
run('npm', ['run', 'home-scores:refresh']);
run('npm', ['run', 'home-scores:check']);

cpSync(resolve(process.cwd(), 'scripts', 'weekly-games-data.json'), resolve(process.cwd(), 'public', 'live-data', 'scores.json'));
cpSync(resolve(process.cwd(), 'scripts', 'home-games-data.json'), resolve(process.cwd(), 'public', 'live-data', 'home-games.json'));

console.log('✅ Copied weekly and home PlayHQ artifacts into public/live-data');
console.log('   You can now run npm run dev or npm run build with fresh local data.');
