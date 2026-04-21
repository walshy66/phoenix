import { describe, expect, it } from 'vitest';
import { renderGameCard, renderGameDetail } from './round-renderer';
import type { NormalisedGame } from '../scores/round-file';

const baseGame: NormalisedGame = {
  id: 'g1',
  roundNumber: 1,
  date: '2026-04-21',
  time: '18:00:00',
  competition: 'A Grade',
  venue: 'Arena',
  court: 'Court 1',
  homeTeam: 'Home',
  awayTeam: 'Away',
  homeScore: null,
  awayScore: null,
  status: 'UPCOMING',
  playerStats: null,
};

describe('renderGameCard', () => {
  it('renders upcoming game without scores', () => {
    const html = renderGameCard(baseGame);
    expect(html).toContain('VS');
    expect(html).not.toContain('home-score');
  });

  it('renders completed game with scores', () => {
    const html = renderGameCard({ ...baseGame, status: 'COMPLETED', homeScore: 52, awayScore: 49 });
    expect(html).toContain('FINAL');
    expect(html).toContain('52');
    expect(html).toContain('49');
  });

  it('renders live badge and overlay score', () => {
    const html = renderGameCard({ ...baseGame, status: 'IN_PROGRESS' }, { g1: { homeScore: 10, awayScore: 9, status: 'IN_PROGRESS' } });
    expect(html).toContain('LIVE');
    expect(html).toContain('10');
    expect(html).toContain('9');
  });
});

describe('renderGameDetail', () => {
  it('renders player stats when available for completed games', () => {
    const html = renderGameDetail({
      ...baseGame,
      status: 'COMPLETED',
      homeScore: 61,
      awayScore: 55,
      playerStats: {
        players: [
          { name: 'Player One', team: 'Home', points: 14, assists: 2, rebounds: 5, fouls: 1 },
        ],
      },
    });
    expect(html).toContain('Player Statistics');
    expect(html).toContain('Player One');
    expect(html).toContain('14');
  });
});
