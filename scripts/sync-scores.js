#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { structuredLog } from './lib/playhq-api.js';

const LIVE_DATA_DIR = path.join(process.cwd(), 'public', 'live-data');
const ROUNDS_DIR = path.join(LIVE_DATA_DIR, 'rounds');
const LIVE_SCORES_FILE = path.join(LIVE_DATA_DIR, 'live-scores.json');
const HOME_GAMES_FILE = path.join(LIVE_DATA_DIR, 'home-games.json');
const ROUND_FILE_GLOB = 'public/live-data/rounds/*.json';
const LIVE_SCORES_PATH = 'public/live-data/live-scores.json';
const HOME_GAMES_PATH = 'public/live-data/home-games.json';
const CHILD_ENV = { ...process.env, SCORE_SYNC_SKIP_FTP: '1', SCORE_SYNC_FAST: '1' };

function runNode(script) {
  const result = spawnSync(process.execPath, [script], {
    env: CHILD_ENV,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`${script} failed with status ${result.status ?? 1}`);
  }
}

function listJsonFiles() {
  const files = [];
  if (fs.existsSync(ROUNDS_DIR)) {
    for (const entry of fs.readdirSync(ROUNDS_DIR)) {
      if (entry.endsWith('.json')) files.push(path.join(ROUNDS_DIR, entry));
    }
  }
  if (fs.existsSync(LIVE_SCORES_FILE)) files.push(LIVE_SCORES_FILE);
  if (fs.existsSync(HOME_GAMES_FILE)) files.push(HOME_GAMES_FILE);
  return files.sort();
}

function ftpQuote(value) {
  return String(value).replace(/"/g, '\\"');
}

function deployLiveDataJson(files) {
  const ftpHost = process.env.FTP_HOST;
  const ftpPort = process.env.FTP_PORT || '21';
  const ftpUser = process.env.FTP_USER;
  const ftpPass = process.env.FTP_PASS;
  const remoteDir = process.env.FTP_REMOTE_DIR || '.';

  if (!ftpHost || !ftpUser || !ftpPass) {
    structuredLog('warn', { event: 'ftp_skipped', reason: 'missing_credentials', fileCount: files.length });
    return;
  }

  const commands = [
    'set ssl:verify-certificate yes',
    'set ftp:ssl-force true',
    'set ftp:ssl-protect-data true',
    'set ftp:ssl-auth TLS',
    `open -u "${ftpQuote(ftpUser)}","${ftpQuote(ftpPass)}" -p "${ftpQuote(ftpPort)}" ftp://${ftpQuote(ftpHost)}`,
    `mkdir -p "${ftpQuote(remoteDir)}/live-data"`,
    `mkdir -p "${ftpQuote(remoteDir)}/live-data/rounds"`,
  ];

  for (const file of files) {
    const local = path.relative(process.cwd(), file).replace(/\\/g, '/');
    const remote = local.startsWith('public/live-data/rounds/')
      ? `${remoteDir}/live-data/rounds/${path.basename(file)}`
      : `${remoteDir}/live-data/${path.basename(file)}`;
    commands.push(`put "${ftpQuote(local)}" -o "${ftpQuote(remote)}"`);
  }

  commands.push('bye');
  execFileSync('lftp', ['-c', commands.join('; ')], { stdio: 'inherit' });
  structuredLog('info', { event: 'score_sync_ftp_completed', fileCount: files.length });
}

async function main() {
  const start = Date.now();
  structuredLog('info', { event: 'score_sync_started' });

  runNode('scripts/write-round-files.js');
  runNode('scripts/write-home-games-from-rounds.js');
  runNode('scripts/poll-live-scores.js');

  const files = listJsonFiles();
  deployLiveDataJson(files);

  structuredLog('info', {
    event: 'score_sync_completed',
    fileCount: files.length,
    durationMs: Date.now() - start,
    roundFilePattern: ROUND_FILE_GLOB,
    liveScoresPath: LIVE_SCORES_PATH,
    homeGamesPath: HOME_GAMES_PATH,
  });
}

main().catch((err) => {
  structuredLog('error', { event: 'score_sync_failed', message: err.message });
  process.exit(1);
});
