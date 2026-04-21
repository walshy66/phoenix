#!/usr/bin/env node
import { API_BASE, buildHeaders, structuredLog } from './lib/playhq-api.js';

function normalisePlayerStats(summary) {
  const competitors = summary.competitors ?? [];
  const teamNameById = new Map(competitors.map((team) => [team.id, team.name ?? 'Unknown']));
  const appearances = Array.isArray(summary.appearances) ? summary.appearances : [];

  const players = appearances
    .filter((appearance) => (appearance.roleType ?? '').toLowerCase() === 'player')
    .map((appearance) => ({
      name: [appearance.firstName, appearance.lastName].filter(Boolean).join(' ').trim() || 'Unknown',
      team: teamNameById.get(appearance.teamID) ?? 'Unknown',
      points: Number(appearance.scoreTotal ?? 0),
      fouls: 0,
      assists: 0,
      rebounds: 0,
    }))
    .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  return players.length ? { players } : null;
}

export async function fetchPlayerStats(games) {
  const results = new Map();

  for (const game of games ?? []) {
    if (!game?.id || game.status !== 'COMPLETED') {
      if (game?.id) results.set(game.id, null);
      continue;
    }

    try {
      const response = await fetch(`${API_BASE}/v1/games/${game.id}/summary`, {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        structuredLog('warn', { event: 'stats_fetch_failed', gameId: game.id, errorCode: response.status });
        results.set(game.id, null);
        continue;
      }

      const payload = await response.json();
      const summary = payload.data ?? payload;
      const stats = normalisePlayerStats(summary);

      if (!stats) {
        structuredLog('info', { event: 'stats_empty', gameId: game.id });
        results.set(game.id, null);
        continue;
      }

      results.set(game.id, stats);
      structuredLog('info', { event: 'stats_fetched', gameId: game.id, playerCount: stats.players.length });
    } catch (err) {
      structuredLog('error', { event: 'stats_fetch_failed', gameId: game.id, message: err.message });
      results.set(game.id, null);
    }
  }

  return results;
}
