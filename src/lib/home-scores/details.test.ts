import { describe, expect, test } from 'vitest';
import { toPublicGameDetail } from './details';

describe('home-scores/details', () => {
  test('suppresses hidden squad/player fields in public detail shape', () => {
    const detail = toPublicGameDetail({
      id: 'game-1',
      homeTeam: 'Bendigo Phoenix',
      awayTeam: 'Rivals',
      squad: [{ name: 'Hidden' }],
      players: [{ name: 'Also Hidden' }],
    } as any);

    expect(detail.gameId).toBe('game-1');
    expect((detail as any).squad).toBeUndefined();
    expect((detail as any).players).toBeUndefined();
  });
});
