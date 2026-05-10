#!/usr/bin/env node
/**
 * PlayHQ Scraper
 * Fetches ladder and fixture data from PlayHQ and writes scripts/scores-data.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CLUB_NAME,
  fetchGrades,
  fetchGames,
  fetchLadder,
  normaliseGame,
  normaliseLadderRow,
  structuredLog,
  playHQConfig,
} from './lib/playhq-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, 'scores-data.json');
const SEASON_IDS = playHQConfig.seasonIds;

function isClubGame(game) {
  const needle = CLUB_NAME.toLowerCase();
  return (game.competitors ?? []).some((c) => String(c.name ?? '').toLowerCase().includes(needle));
}

async function main() {
  if (SEASON_IDS.length === 0) {
    throw new Error('Missing required PlayHQ configuration: PLAYHQ_SEASON_IDS');
  }

  const allScores = [];
  const allLadders = {};

  for (const seasonId of SEASON_IDS) {
    structuredLog('info', { event: 'season_start', seasonId });
    let grades = [];
    try {
      grades = await fetchGrades(seasonId);
    } catch (err) {
      structuredLog('error', { event: 'grades_fetch_failed', seasonId, message: err.message });
      continue;
    }

    for (const grade of grades) {
      const gradeName = grade.name ?? grade.id;
      try {
        const rows = await fetchLadder(grade.id);
        allLadders[gradeName] = rows.map((row, i) => normaliseLadderRow(row, i + 1));
      } catch (err) {
        structuredLog('warn', { event: 'ladder_fetch_failed', gradeId: grade.id, message: err.message });
      }

      try {
        const games = await fetchGames(grade.id);
        const clubGames = games.filter(isClubGame);
        for (const rawGame of clubGames) {
          const game = normaliseGame(rawGame, gradeName);
          if (game.roundNumber === null) {
            structuredLog('warn', { event: 'game_excluded', gameId: rawGame.id, reason: 'missing_round_number' });
            continue;
          }
          allScores.push(game);
        }
      } catch (err) {
        structuredLog('warn', { event: 'games_fetch_failed', gradeId: grade.id, message: err.message });
      }
    }
  }

  allScores.sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const output = {
    lastUpdated: new Date().toISOString(),
    scores: allScores,
    ladders: allLadders,
    ladder: Object.values(allLadders).flat(),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  structuredLog('info', { event: 'scores_written', count: allScores.length, file: OUTPUT_FILE });
}

main().catch((err) => {
  structuredLog('error', { event: 'scrape_failed', message: err.message });
  process.exit(1);
});
