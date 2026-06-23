#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fetchGrades, fetchGames, fetchLadder, normaliseGame, normaliseLadderRow, structuredLog } from './lib/playhq-api.js';
import { fetchPlayerStats } from './fetch-player-stats.js';

const ROUNDS_DIR = path.join(process.cwd(), 'public', 'live-data', 'rounds');
const GAME_INDEX_FILE = path.join(ROUNDS_DIR, 'game-index.json');
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

// Returns the ISO date (YYYY-MM-DD) of the Monday that starts the week containing dateStr.
function getWeekMonday(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun, 1=Mon … 6=Sat
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

// Groups games into Monday-anchored calendar-week blocks.
// This prevents rescheduled games (e.g. after a public holiday) from bleeding
// into a different display round — a game played on June 15 stays in the
// June 15 block regardless of what round number PlayHQ assigned it.
// Undated future fixtures are placed using the dominant week of their PlayHQ round.
// Reads existing round file (if any) and returns a map of gameId → cached playerStats.
// Used to avoid re-fetching stats for games that are already complete.
function loadCachedStats(roundNumber) {
  const file = path.join(ROUNDS_DIR, `round-${roundNumber}.json`);
  if (!fs.existsSync(file)) return new Map();
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const map = new Map();
    for (const game of data.games ?? []) {
      if (game.playerStats?.players?.length > 0) map.set(game.id, game.playerStats);
    }
    return map;
  } catch {
    return new Map();
  }
}

function groupByCalendarWeek(games) {
  const byWeek = new Map(); // 'YYYY-MM-DD' (Monday) → game[]
  const undated = [];

  for (const game of games) {
    if (!game.date) { undated.push(game); continue; }
    const monday = getWeekMonday(game.date);
    if (!byWeek.has(monday)) byWeek.set(monday, []);
    byWeek.get(monday).push(game);
  }

  if (undated.length > 0) {
    // Build playhqRound → monday vote map from dated games
    const roundVotes = new Map(); // playhqRound → Map<monday, count>
    for (const [monday, weekGames] of byWeek) {
      for (const g of weekGames) {
        if (g.roundNumber == null) continue;
        if (!roundVotes.has(g.roundNumber)) roundVotes.set(g.roundNumber, new Map());
        const votes = roundVotes.get(g.roundNumber);
        votes.set(monday, (votes.get(monday) ?? 0) + 1);
      }
    }

    for (const game of undated) {
      const votes = game.roundNumber != null ? roundVotes.get(game.roundNumber) : null;
      if (!votes) {
        structuredLog('warn', { event: 'game_excluded', gameId: game.id, reason: 'no_date_no_round_mapping' });
        continue;
      }
      let bestMonday = null, best = 0;
      for (const [monday, count] of votes) {
        if (count > best) { bestMonday = monday; best = count; }
      }
      if (bestMonday) byWeek.get(bestMonday).push(game);
    }
  }

  return byWeek;
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

async function writeRoundFile(roundNumber, weekStartDate, games, statsMap) {
  fs.mkdirSync(ROUNDS_DIR, { recursive: true });
  const file = path.join(ROUNDS_DIR, `round-${roundNumber}.json`);

  const payload = {
    roundNumber,
    weekStartDate,
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
  structuredLog('info', { event: 'round_written', roundNumber, weekStartDate, gameCount: games.length, status: payload.status });
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

function writeGameIndex(games) {
  const map = {};
  for (const game of games) {
    if (game.id && game.roundNumber != null) {
      map[game.id] = game.roundNumber;
    }
  }
  fs.writeFileSync(GAME_INDEX_FILE, JSON.stringify({ lastUpdated: new Date().toISOString(), games: map }, null, 2));
  structuredLog('info', { event: 'game_index_written', count: Object.keys(map).length });
}

function maybeDeploy(files) {
  if (process.env.SCORE_SYNC_SKIP_FTP === '1') {
    structuredLog('info', { event: 'ftp_skipped', reason: 'delegated_to_score_sync', fileCount: files.length });
    return;
  }

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

  const byWeek = groupByCalendarWeek(games);
  const sortedMondays = [...byWeek.keys()].sort();
  const mondayToRound = new Map(sortedMondays.map((monday, i) => [monday, i + 1]));

  const allGames = [];
  const roundNumbers = [];
  const completed = [];

  for (const monday of sortedMondays) {
    const roundNumber = mondayToRound.get(monday);
    const roundGames = byWeek.get(monday).map((g) => ({ ...g, roundNumber }));
    allGames.push(...roundGames);
    roundNumbers.push(roundNumber);

    let statsMap;
    if (process.env.SCORE_SYNC_FAST === '1') {
      statsMap = new Map();
    } else {
      const cachedStats = loadCachedStats(roundNumber);
      const needsStats = roundGames.filter((g) => g.status === 'COMPLETED' && !cachedStats.has(g.id));
      const freshStats = needsStats.length > 0 ? await fetchPlayerStats(needsStats) : new Map();
      statsMap = new Map([...cachedStats, ...freshStats]);
    }
    await writeRoundFile(roundNumber, monday, roundGames, statsMap);
    completed.push(path.join(ROUNDS_DIR, `round-${roundNumber}.json`));
  }

  writeIndex(roundNumbers);
  writeGameIndex(allGames);
  maybeDeploy([...completed, path.join(ROUNDS_DIR, 'rounds-index.json'), GAME_INDEX_FILE]);
}

main().catch((err) => {
  structuredLog('error', { event: 'write_rounds_failed', message: err.message });
  process.exit(1);
});
