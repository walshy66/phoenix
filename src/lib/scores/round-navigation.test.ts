import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadRoundFile, loadRoundsIndex } from './round-navigation';

afterEach(() => vi.unstubAllGlobals());

describe('round navigation loaders', () => {
  it('returns null when rounds index fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fail')));
    await expect(loadRoundsIndex()).resolves.toBeNull();
  });

  it('returns parsed rounds index on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ currentRound: 3, availableRounds: [1, 2, 3], lastUpdated: '2026-04-21T00:00:00.000Z' }) }));
    await expect(loadRoundsIndex()).resolves.toMatchObject({ currentRound: 3 });
  });

  it('returns null when round fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(loadRoundFile(2)).resolves.toBeNull();
  });
});
