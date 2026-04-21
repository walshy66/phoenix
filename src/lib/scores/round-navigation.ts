import type { RoundFile, RoundsIndex } from './round-file';

export async function loadRoundsIndex(): Promise<RoundsIndex | null> {
  try {
    const response = await fetch(`/live-data/rounds/rounds-index.json?t=${Date.now()}`);
    if (!response.ok) return null;
    return (await response.json()) as RoundsIndex;
  } catch {
    return null;
  }
}

export async function loadRoundFile(roundNumber: number): Promise<RoundFile | null> {
  try {
    const response = await fetch(`/live-data/rounds/round-${roundNumber}.json?t=${Date.now()}`);
    if (!response.ok) return null;
    return (await response.json()) as RoundFile;
  } catch {
    return null;
  }
}
