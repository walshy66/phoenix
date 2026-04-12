import { describe, test, expect } from 'vitest';
import { scheduleHalf, computeCourtTargets } from './algorithm.js';
import type { Player } from './types.js';

function makePlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Player ${i + 1}` }));
}

test('debug: 9-player half schedule slot totals', () => {
  const players = makePlayers(9);
  const starters = players.slice(0, 5);
  const seed = players.map(p => p.name).join(',');
  const targets = computeCourtTargets(9, seed);
  
  const half1Raw = targets.map(t => Math.round(t / 2));
  const sum1 = half1Raw.reduce((a,b)=>a+b,0);
  const delta = 100 - sum1;
  const half1Targets = [...half1Raw];
  if (delta !== 0) {
    const order = targets.map((t, i) => ({ i, deviation: half1Raw[i] - t / 2 }));
    if (delta > 0) order.sort((a,b)=>a.deviation-b.deviation);
    else order.sort((a,b)=>b.deviation-a.deviation);
    let rem = Math.abs(delta);
    for (const {i} of order) {
      if (rem === 0) break;
      half1Targets[i] += delta > 0 ? 1 : -1;
      rem--;
    }
  }
  console.log('targets:', targets.join(','));
  console.log('half1Targets:', half1Targets.join(','), 'sum:', half1Targets.reduce((a,b)=>a+b,0));
  
  const half = scheduleHalf(players, starters, half1Targets, 1);
  
  // Count total player-minutes from substitution replay
  const HALF_MINUTES = 20;
  const subsByMin = new Map(half.substitutions.map(s => [s.gameClockMinute, s]));
  const onCourt = new Set(half.startingFive.map(p => p.id));
  const counts = new Map(players.map(p => [p.id, 0]));
  for (let m = 0; m < HALF_MINUTES; m++) {
    const sub = subsByMin.get(m);
    if (sub) {
      for (const p of sub.playersComingOn) onCourt.add(p.id);
      for (const p of sub.playersSittingDown) onCourt.delete(p.id);
    }
    for (const id of onCourt) counts.set(id, (counts.get(id)??0)+1);
    if (onCourt.size !== 5) console.log(`MINUTE ${m}: ${onCourt.size} players!`, [...onCourt]);
  }
  
  const total = [...counts.values()].reduce((a,b)=>a+b,0);
  console.log('half1 totals:', [...counts.entries()].map(([k,v])=>`${k}:${v}`).join(', '));
  console.log('Total:', total);
  
  expect(total).toBe(100);
});
