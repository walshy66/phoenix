#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fetchGrades, fetchGames, normaliseStatus, structuredLog } from './lib/playhq-api.js';

const OUTPUT_PATH = path.join(process.cwd(), 'public', 'live-data', 'live-scores.json');
const SEASON_IDS = (process.env.PLAYHQ_SEASON_IDS || '').split(',').map((v) => v.trim()).filter(Boolean);
const FETCH_TIMEOUT_MS = 60_000;

async function withTimeout(promise, ms) {
  let timeoutId;
  const timeout = new Promise((resolve) => {
    timeoutId = setTimeout(() => resolve([]), ms);
  });
  const result = await Promise.race([promise, timeout]);
  clearTimeout(timeoutId);
  return result;
}

function writeOverlay(liveScores) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(liveScores, null, 2));
}

function maybeDeploy() {
  const ftpHost = process.env.FTP_HOST;
  const ftpPort = process.env.FTP_PORT || '21';
  const ftpUser = process.env.FTP_USER;
  const ftpPass = process.env.FTP_PASS;
  const remoteDir = process.env.FTP_REMOTE_DIR || '.';
  if (!ftpHost || !ftpUser || !ftpPass) return;
  const local = path.relative(process.cwd(), OUTPUT_PATH).replace(/\\/g, '/');
  const commands = [
    'set ssl:verify-certificate yes',
    'set ftp:ssl-force true',
    'set ftp:ssl-protect-data true',
    'set ftp:ssl-auth TLS',
    `open -u "${ftpUser}","${ftpPass}" -p "${ftpPort}" ftp://${ftpHost}`,
    `put "${local}" -o "${remoteDir}/live-data/live-scores.json"`,
    'bye',
  ];
  execFileSync('lftp', ['-c', commands.join('; ')], { stdio: 'inherit' });
}

async function main() {
  const liveScores = {};
  for (const seasonId of SEASON_IDS) {
    const grades = await withTimeout(fetchGrades(seasonId), FETCH_TIMEOUT_MS);
    for (const grade of grades) {
      const games = await withTimeout(fetchGames(grade.id), FETCH_TIMEOUT_MS);
      for (const game of games) {
        if (normaliseStatus(game.status) !== 'IN_PROGRESS') continue;
        liveScores[game.id] = {
          homeScore: game.competitors?.find((c) => c.isHomeTeam)?.scoreTotal ?? 0,
          awayScore: game.competitors?.find((c) => !c.isHomeTeam)?.scoreTotal ?? 0,
          status: 'IN_PROGRESS',
        };
      }
    }
  }

  writeOverlay(liveScores);
  structuredLog('info', { event: 'live_scores_written', count: Object.keys(liveScores).length });
  maybeDeploy();
}

main().catch((err) => {
  structuredLog('error', { event: 'live_scores_failed', message: err.message });
  process.exit(1);
});
