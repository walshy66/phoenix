import { describe, expect, test } from 'vitest';
import { renderHomeGamesStateHtml } from './renderers';

const makeGame = () => ({
  gameId: 'game-1',
  homeTeam: 'Phoenix Flyers',
  awayTeam: 'Aztecs',
  homeScore: null,
  awayScore: null,
  status: 'upcoming',
  kickoffDate: '2026-04-22',
  kickoffTime: '16:30',
  kickoffDisplay: 'Wed, 22 Apr 2026 • 16:30',
  competition: 'Wednesday U14 Boys 8',
  venue: 'Red Energy Arena',
  court: 'Crt 4',
});

describe('renderHomeGamesStateHtml', () => {
  test('does not render the stale data banner on the home page', () => {
    const html = renderHomeGamesStateHtml({
      status: 'stale',
      staleBanner: 'Showing last known results. Live refresh is temporarily unavailable.',
      games: [makeGame()],
    });

    expect(html).toContain('home-scores-carousel');
    expect(html).not.toContain('Showing last known results. Live refresh is temporarily unavailable.');
    expect(html).not.toContain('last known results');
  });

  test('still renders the home carousel content for stale data', () => {
    const html = renderHomeGamesStateHtml({
      status: 'stale',
      games: [makeGame()],
    });

    expect(html).toContain('home-scores-track');
    expect(html).toContain('Phoenix Flyers');
    expect(html).toContain('Aztecs');
  });
});
