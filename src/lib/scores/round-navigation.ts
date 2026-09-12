import { fetchFreshestLiveJson } from '../playhq/live-data';
import type { RoundFile, RoundsIndex } from './round-file';

export async function loadRoundsIndex(): Promise<RoundsIndex | null> {
  return fetchFreshestLiveJson<RoundsIndex>('rounds/rounds-index.json', (payload) => {
    const index = payload as Partial<RoundsIndex> | null;
    return !!index && Array.isArray(index.availableRounds) && typeof index.currentRound === 'number';
  });
}

export async function loadRoundFile(roundNumber: number): Promise<RoundFile | null> {
  return fetchFreshestLiveJson<RoundFile>(`rounds/round-${roundNumber}.json`, (payload) => {
    const round = payload as Partial<RoundFile> | null;
    return !!round && Array.isArray(round.games);
  });
}
