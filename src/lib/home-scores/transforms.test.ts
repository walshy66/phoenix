import { describe, expect, test } from 'vitest';
import { getRolling7DayWindow, normalizeHomeGames } from './transforms';

describe('home-scores/transforms', () => {
  test('rolling ±7-day window uses inclusive Melbourne-local boundaries', () => {
    const window = getRolling7DayWindow(new Date('2026-04-13T10:00:00Z'));
    expect(window.timezone).toBe('Australia/Melbourne');
    expect(window.kind).toBe('rolling-7-plus-7-days');
    expect(window.startDate).toBe('2026-04-06');
    expect(window.endDate).toBe('2026-04-20');
  });

  test('filters to ±7-day window and de-duplicates by gameId', () => {
    const games = normalizeHomeGames(
      [
        { id: 'a', date: '2026-04-09', time: '19:00:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'A', status: 'completed' },
        { id: 'a', date: '2026-04-09', time: '19:00:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'A', status: 'completed' },
        { id: 'b', date: '2026-04-01', time: '19:00:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'B', status: 'completed' },
        { id: 'c', date: '2026-04-20', time: '17:00:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'C', status: 'scheduled' },
      ],
      { now: new Date('2026-04-13T10:00:00Z') }
    );

    expect(games).toHaveLength(2);
    expect(games.map((g) => g.gameId)).toEqual(['c', 'a']);
  });

  test('missing time renders kickoffDisplay as TBA and sorts after timed entries same day', () => {
    const games = normalizeHomeGames(
      [
        { id: 'a', date: '2026-04-10', time: null, homeTeam: 'Bendigo Phoenix', awayTeam: 'A', status: 'scheduled' },
        { id: 'b', date: '2026-04-10', time: '18:30:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'B', status: 'scheduled' },
      ],
      { now: new Date('2026-04-13T10:00:00Z') }
    );

    expect(games[0].gameId).toBe('b');
    expect(games[1].gameId).toBe('a');
    expect(games[1].kickoffDisplay).toBe('TBA');
  });

  test('orders upcoming games from nearest to furthest so the carousel starts with the next fixture', () => {
    const games = normalizeHomeGames(
      [
        { id: 'fri', date: '2026-04-24', time: '17:15:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'Friday Team', status: 'scheduled' },
        { id: 'mon', date: '2026-04-20', time: '16:30:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'Monday Team', status: 'scheduled' },
        { id: 'wed', date: '2026-04-22', time: '18:45:00', homeTeam: 'Bendigo Phoenix', awayTeam: 'Wednesday Team', status: 'scheduled' },
      ],
      { now: new Date('2026-04-17T10:00:00+10:00') }
    );

    expect(games.map((g) => g.gameId)).toEqual(['mon', 'wed', 'fri']);
  });

  test('preserves score nulls and never fabricates unavailable values', () => {
    const games = normalizeHomeGames(
      [
        {
          id: 'a',
          date: '2026-04-10',
          time: '18:30:00',
          homeTeam: 'Bendigo Phoenix',
          awayTeam: 'A',
          homeScore: null,
          awayScore: undefined,
          status: 'scheduled',
        },
      ],
      { now: new Date('2026-04-13T10:00:00Z') }
    );

    expect(games[0].homeScore).toBeNull();
    expect(games[0].awayScore).toBeNull();
  });
});
