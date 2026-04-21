import { describe, expect, it } from 'vitest';
import type { NormalisedGame, RoundFile, RoundsIndex } from './round-file';
import { normaliseStatus } from './round-file';

describe('normaliseStatus', () => {
  it('maps UPCOMING to UPCOMING', () => expect(normaliseStatus('UPCOMING')).toBe('UPCOMING'));
  it('maps FINAL to COMPLETED', () => expect(normaliseStatus('FINAL')).toBe('COMPLETED'));
  it('maps null to UPCOMING', () => expect(normaliseStatus(null)).toBe('UPCOMING'));
  it('maps unknown string to UPCOMING', () => expect(normaliseStatus('unknown-future-status')).toBe('UPCOMING'));
});

describe('round file types', () => {
  it('accepts valid RoundFile and RoundsIndex shapes', () => {
    const game: NormalisedGame = {
      id: 'g1',
      roundNumber: 1,
      date: '2026-04-21',
      time: '18:00:00',
      competition: 'A Grade',
      venue: 'Arena',
      court: 'Court 1',
      homeTeam: 'Home',
      awayTeam: 'Away',
      homeScore: 50,
      awayScore: 42,
      status: 'COMPLETED',
      playerStats: null,
    };

    const roundFile: RoundFile = {
      roundNumber: 1,
      season: 'Winter 2026',
      lastUpdated: '2026-04-21T00:00:00.000Z',
      status: 'completed',
      games: [game],
      ladders: {},
    };

    const index: RoundsIndex = {
      currentRound: 1,
      availableRounds: [1],
      lastUpdated: '2026-04-21T00:00:00.000Z',
    };

    expect(roundFile.games[0].id).toBe('g1');
    expect(index.currentRound).toBe(1);
  });
});
