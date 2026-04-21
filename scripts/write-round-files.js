#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fetchGrades, fetchGames, fetchLadder, normaliseGame, normaliseLadderRow, structuredLog } from './lib/playhq-api.js';
import { fetchPlayerStats } from './fetch-player-stats.js';

const ROUNDS_DIR = path.join(process.cwd(), 'public', 'live-data', 'rounds');
const SOURCE_FILE = path.join(process.cwd(), 'scripts', 'scores-data.json');
const TEAMS_DETAILS_FILE = path.join(process.cwd(), 'scripts', 'teams-details.json');
const SEASON_IDS = (process.env.PLAYHQ_SEASON_IDS || '').split(',').map((v) => v.trim()).filter(Boolean);
const SEASON_NAME = process.env.PLAYHQ_SEASON_NAME || 'Winter 2026';

function readJson(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function readLocalScores() {
  const parsed = readJson(SOURCE_FILE);
  return Array.isArray(parsed?.scores) ? parsed.scores : [];
}

function readLocalLadders() {
  const parsed = readJson(TEAMS_DETAILS_FILE);
  const map = new Map();
  const entries = parsed?.teamDetails ? Object.values(parsed.teamDetails) : [];
  for (const team of entries) {
    if (!team?.gradeName || !Array.isArray(team.ladder) || map.has(team.gradeName)) continue;
    map.set(team.gradeName, team.ladder);
  }
  return map;
}

function normaliseLocalScores(scores, laddersByGrade) {
  return scores
    .filter((game) => game && game.id)
    .map((game) => ({
      ...game,
      competition: game.competition ?? 'Unknown Grade',
      ladders: laddersByGrade.get(game.competition) ?? [],
    }));
}

async function fetchAllPhoenixGames() {
  if (!SEASON_IDS.length) {
    return normaliseLocalScores(readLocalScores(), readLocalLadders());
  }

  const games = [];
  const laddersByGrade = new Map();

  for (const seasonId of SEASON_IDS) {
    const grades = await fetchGrades(seasonId);
    for (const grade of grades) {
      const gradeName = grade.name ?? grade.id;
      const ladderRows = await fetchLadder(grade.id).catch(() => []);
      laddersByGrade.set(gradeName, ladderRows.map((row, i) => normaliseLadderRow(row, i + 1)));

      const gradeGames = await fetchGames(grade.id).catch(() => []);
      for (const raw of gradeGames) {
        const game = normaliseGame(raw, gradeName);
        const teams = (raw.competitors ?? []).map((c) => String(c.name ?? '')).join(' ').toLowerCase();
        if (!teams.includes('phoenix')) continue;
        games.push({ ...game, ladders: laddersByGrade.get(gradeName) ?? [] });
      }
    }
  }

  return games;
}

function groupByRound(games) {
  const byRound = new Map();
  for (const game of games) {
    if (game.roundNumber == null) {
      structuredLog('warn', { event: 'game_excluded', gameId: game.id, reason: 'missing_round_number' });
      continue;
    }
    if (!byRound.has(game.roundNumber)) byRound.set(game.roundNumber, []);
    byRound.get(game.roundNumber).push(game);
  }
  return byRound;
}

function roundStatus(games) {
  if (!games.length) return 'upcoming';
  if (games.some((g) => g.status === 'IN_PROGRESS')) return 'in-progress';
  if (games.every((g) => g.status === 'COMPLETED')) return 'completed';
  return 'upcoming';
}

function roundLadders(games) {
  const ladders = {};
  for (const game of games) {
    if (!game.competition || ladders[game.competition]) continue;
    if (Array.isArray(game.ladders) && game.ladders.length > 0) {
      ladders[game.competition] = game.ladders;
    }
  }
  return ladders;
}

async function writeRoundFile(roundNumber, games, statsMap) {
  fs.mkdirSync(ROUNDS_DIR, { recursive: true });
  const file = path.join(ROUNDS_DIR, `round-${roundNumber}.json`);
  if (fs.existsSync(file)) {
    try {
      const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (existing.status === 'completed') {
        structuredLog('warn', { event: 'round_skipped', roundNumber, reason: 'already_completed' });
        return false;
      }
    } catch {}
  }

  const payload = {
    roundNumber,
    season: SEASON_NAME,
    lastUpdated: new Date().toISOString(),
    status: roundStatus(games),
    games: games.map((game) => ({
      ...game,
      playerStats: statsMap.get(game.id) ?? null,
    })),
    ladders: roundLadders(games),
  };

  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  structuredLog('info', { event: 'round_written', roundNumber, gameCount: games.length, status: payload.status });
  return true;
}

function writeIndex(roundNumbers) {
  const sorted = [...roundNumbers].sort((a, b) => a - b);
  const file = path.join(ROUNDS_DIR, 'rounds-index.json');
  const currentRound = sorted.find((n) => {
    const round = JSON.parse(fs.readFileSync(path.join(ROUNDS_DIR, `round-${n}.json`), 'utf8'));
    return round.status === 'upcoming' || round.status === 'in-progress';
  }) ?? (sorted[sorted.length - 1] ? sorted[sorted.length - 1] + 1 : 1);
  const index = { currentRound, availableRounds: sorted, lastUpdated: new Date().toISOString() };
  fs.writeFileSync(file, JSON.stringify(index, null, 2));
  structuredLog('info', { event: 'index_written', ...index });
}

function maybeDeploy(files) {
  const ftpHost = process.env.FTP_HOST;
  const ftpPort = process.env.FTP_PORT || '21';
  const ftpUser = process.env.FTP_USER;
  const ftpPass = process.env.FTP_PASS;
  const remoteDir = process.env.FTP_REMOTE_DIR || '.';
  if (!ftpHost || !ftpUser || !ftpPass) {
    structuredLog('warn', { event: 'ftp_skipped', reason: 'missing_credentials' });
    return;
  }

  const commands = [
    'set ssl:verify-certificate yes',
    'set ftp:ssl-force true',
    'set ftp:ssl-protect-data true',
    'set ftp:ssl-auth TLS',
    `open -u "${ftpUser}","${ftpPass}" -p "${ftpPort}" ftp://${ftpHost}`,
  ];

  for (const file of files) {
    const local = path.relative(process.cwd(), file).replace(/\\/g, '/');
    const remote = `${remoteDir}/live-data/rounds/${path.basename(file)}`;
    commands.push(`put "${local}" -o "${remote}"`);
  }

  commands.push(`put "${path.relative(process.cwd(), path.join(ROUNDS_DIR, 'rounds-index.json')).replace(/\\/g, '/')}" -o "${remoteDir}/live-data/rounds/rounds-index.json"`);
  commands.push('bye');
  execFileSync('lftp', ['-c', commands.join('; ')], { stdio: 'inherit' });
}

async function main() {
  const games = await fetchAllPhoenixGames();
  const byRound = groupByRound(games);
  const roundNumbers = [...byRound.keys()];
  const completed = [];

  for (const roundNumber of roundNumbers) {
    const roundGames = byRound.get(roundNumber) ?? [];
    const statsMap = await fetchPlayerStats(roundGames);
    if (await writeRoundFile(roundNumber, roundGames, statsMap)) {
      completed.push(path.join(ROUNDS_DIR, `round-${roundNumber}.json`));
    }
  }

  writeIndex(roundNumbers);
  maybeDeploy([...completed, path.join(ROUNDS_DIR, 'rounds-index.json')]);
}

main().catch((err) => {
  structuredLog('error', { event: 'write_rounds_failed', message: err.message });
  process.exit(1);
});
