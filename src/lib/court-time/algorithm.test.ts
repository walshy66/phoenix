/**
 * Court Time Calculator — Algorithm Unit Tests
 * Tests are written first (TDD). Run with: npx vitest run
 */
import { describe, test, expect } from 'vitest';
import {
  generateRotationPlan,
  derivePlayerSchedules,
  computeCourtTargets,
  selectSecondHalfStarters,
} from './algorithm.js';
import type { Player, RotationPlan, HalfPlan } from './types.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makePlayers(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `Player ${i + 1}` }));
}

/** Return the 5 players chosen as starters (first 5 in roster). */
function makeStarters(players: Player[]): Player[] {
  return players.slice(0, 5);
}

/**
 * For a given RotationPlan, compute each player's total on-court minutes
 * by summing stint durations for 'on-court' stints.
 */
function totalCourtMinutes(plan: RotationPlan): Map<string, number> {
  const schedules = derivePlayerSchedules(plan);
  const totals = new Map<string, number>();
  for (const ps of schedules) {
    const mins = ps.stints
      .filter((s) => s.type === 'on-court')
      .reduce((acc, s) => acc + s.durationMinutes, 0);
    totals.set(ps.player.id, mins);
  }
  return totals;
}

/**
 * Count how many players are on court at a given absolute minute (0–39).
 * A player is on court at minute m if they have an on-court stint where
 * startMinute <= m < endMinute.
 */
function playersOnCourtAtMinute(plan: RotationPlan, minute: number): number {
  const schedules = derivePlayerSchedules(plan);
  let count = 0;
  for (const ps of schedules) {
    for (const stint of ps.stints) {
      if (stint.type === 'on-court' && stint.startMinute <= minute && minute < stint.endMinute) {
        count++;
        break;
      }
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('computeCourtTargets', () => {
  test('7 players: four get 29, three get 28, sum = 200', () => {
    const targets = computeCourtTargets(7, 'Player 1,Player 2,Player 3,Player 4,Player 5,Player 6,Player 7');
    expect(targets).toHaveLength(7);
    expect(targets.reduce((a, b) => a + b, 0)).toBe(200);
    expect(targets.filter((t) => t === 29)).toHaveLength(4);
    expect(targets.filter((t) => t === 28)).toHaveLength(3);
  });

  test('8 players: all get exactly 25, sum = 200', () => {
    const targets = computeCourtTargets(8, 'Player 1,Player 2,Player 3,Player 4,Player 5,Player 6,Player 7,Player 8');
    expect(targets).toHaveLength(8);
    expect(targets.reduce((a, b) => a + b, 0)).toBe(200);
    targets.forEach((t) => expect(t).toBe(25));
  });

  test('9 players: two get 23, seven get 22, sum = 200', () => {
    const targets = computeCourtTargets(9, 'Player 1,Player 2,Player 3,Player 4,Player 5,Player 6,Player 7,Player 8,Player 9');
    expect(targets).toHaveLength(9);
    expect(targets.reduce((a, b) => a + b, 0)).toBe(200);
    expect(targets.filter((t) => t === 23)).toHaveLength(2);
    expect(targets.filter((t) => t === 22)).toHaveLength(7);
  });
});

describe('generateRotationPlan — court time distribution', () => {
  test('7-player roster: all players get 28 or 29 minutes, sum = 200', () => {
    const players = makePlayers(7);
    const starters = makeStarters(players);
    const plan = generateRotationPlan(players, starters);
    const totals = totalCourtMinutes(plan);
    let sum = 0;
    for (const [, mins] of totals) {
      expect(mins).toBeGreaterThanOrEqual(28);
      expect(mins).toBeLessThanOrEqual(29);
      sum += mins;
    }
    expect(sum).toBe(200);
  });

  test('8-player roster: all players get exactly 25 minutes', () => {
    const players = makePlayers(8);
    const starters = makeStarters(players);
    const plan = generateRotationPlan(players, starters);
    const totals = totalCourtMinutes(plan);
    for (const [, mins] of totals) {
      expect(mins).toBe(25);
    }
  });

  test('9-player roster: all players get 22 or 23 minutes, sum = 200', () => {
    const players = makePlayers(9);
    const starters = makeStarters(players);
    const plan = generateRotationPlan(players, starters);
    const totals = totalCourtMinutes(plan);
    let sum = 0;
    for (const [, mins] of totals) {
      expect(mins).toBeGreaterThanOrEqual(22);
      expect(mins).toBeLessThanOrEqual(23);
      sum += mins;
    }
    expect(sum).toBe(200);
  });
});

describe('generateRotationPlan — starting five honoured', () => {
  test('first half begins with coach-selected starting five at minute 0', () => {
    const players = makePlayers(8);
    // Pick starters as players 2,3,4,5,6 (not the first 5) to test
    const starters = [players[1], players[2], players[3], players[4], players[5]];
    const plan = generateRotationPlan(players, starters);

    const starterIds = new Set(starters.map((p) => p.id));
    const half1 = plan.halves[0];
    expect(half1.startingFive).toHaveLength(5);
    for (const p of half1.startingFive) {
      expect(starterIds.has(p.id)).toBe(true);
    }
  });

  test('Gantt shows selected starters with on-court stint starting at minute 0', () => {
    const players = makePlayers(8);
    const starters = makeStarters(players);
    const plan = generateRotationPlan(players, starters);
    const schedules = derivePlayerSchedules(plan);
    const starterIds = new Set(starters.map((p) => p.id));

    for (const ps of schedules) {
      const firstStint = ps.stints[0];
      expect(firstStint).toBeDefined();
      expect(firstStint.startMinute).toBe(0);
      if (starterIds.has(ps.player.id)) {
        // Starters start on court
        expect(firstStint.type).toBe('on-court');
      } else {
        // Bench players start on bench
        expect(firstStint.type).toBe('bench');
      }
    }
  });
});

describe('generateRotationPlan — second-half starters', () => {
  test('second-half starting five are the 5 players with most remaining target after half 1', () => {
    const players = makePlayers(8);
    const starters = makeStarters(players);
    const plan = generateRotationPlan(players, starters);
    const schedules = derivePlayerSchedules(plan);

    // Compute court time after half 1 for each player (absolute minutes 0–19)
    const half1Court = new Map<string, number>();
    for (const ps of schedules) {
      const mins = ps.stints
        .filter((s) => s.type === 'on-court' && s.startMinute < 20)
        .reduce((acc, s) => {
          const start = s.startMinute;
          const end = Math.min(s.endMinute, 20);
          return acc + (end - start);
        }, 0);
      half1Court.set(ps.player.id, mins);
    }

    // Remaining target = 25 - half1Court[p] (for 8 players all have target 25)
    const remaining = players.map((p) => ({
      id: p.id,
      rem: 25 - (half1Court.get(p.id) ?? 0),
    }));
    remaining.sort((a, b) => b.rem - a.rem || players.findIndex((p) => p.id === a.id) - players.findIndex((p) => p.id === b.id));
    const expectedStarters = new Set(remaining.slice(0, 5).map((r) => r.id));

    const half2StarterIds = new Set(plan.halves[1].startingFive.map((p) => p.id));
    expect(half2StarterIds).toEqual(expectedStarters);
  });
});

describe('generateRotationPlan — determinism', () => {
  test('same inputs produce identical JSON output when called twice', () => {
    const players = makePlayers(7);
    const starters = makeStarters(players);
    const plan1 = generateRotationPlan(players, starters);
    const plan2 = generateRotationPlan(players, starters);
    expect(JSON.stringify(plan1)).toBe(JSON.stringify(plan2));
  });

  test('determinism holds for 9-player roster (which players get extra minute is consistent)', () => {
    const players = makePlayers(9);
    const starters = makeStarters(players);
    const plan1 = generateRotationPlan(players, starters);
    const plan2 = generateRotationPlan(players, starters);
    expect(JSON.stringify(plan1)).toBe(JSON.stringify(plan2));
  });
});

describe('generateRotationPlan — substitution constraints', () => {
  test('no two substitutions share the same game clock minute within a half', () => {
    for (const n of [7, 8, 9]) {
      const players = makePlayers(n);
      const starters = makeStarters(players);
      const plan = generateRotationPlan(players, starters);
      for (const half of plan.halves) {
        const minutes = half.substitutions.map((s) => s.gameClockMinute);
        const unique = new Set(minutes);
        expect(unique.size).toBe(minutes.length);
      }
    }
  });

  test('no substitution at absolute game clock minute 0 or 20 (half boundaries)', () => {
    for (const n of [7, 8, 9]) {
      const players = makePlayers(n);
      const starters = makeStarters(players);
      const plan = generateRotationPlan(players, starters);

      // Half 1: gameClockMinute must be 1–19
      for (const sub of plan.halves[0].substitutions) {
        expect(sub.gameClockMinute).toBeGreaterThanOrEqual(1);
        expect(sub.gameClockMinute).toBeLessThanOrEqual(19);
      }

      // Half 2: gameClockMinute must be 1–19 (half-relative)
      for (const sub of plan.halves[1].substitutions) {
        expect(sub.gameClockMinute).toBeGreaterThanOrEqual(1);
        expect(sub.gameClockMinute).toBeLessThanOrEqual(19);
      }
    }
  });
});

describe('generateRotationPlan — player-minute totals', () => {
  test('sum of all stint durationMinutes across all players = 200', () => {
    for (const n of [7, 8, 9]) {
      const players = makePlayers(n);
      const starters = makeStarters(players);
      const plan = generateRotationPlan(players, starters);
      const schedules = derivePlayerSchedules(plan);
      const total = schedules.reduce(
        (acc, ps) =>
          acc +
          ps.stints
            .filter((s) => s.type === 'on-court')
            .reduce((a, s) => a + s.durationMinutes, 0),
        0,
      );
      expect(total).toBe(200);
    }
  });

  test('sum of on-court player-minutes per half = 100', () => {
    for (const n of [7, 8, 9]) {
      const players = makePlayers(n);
      const starters = makeStarters(players);
      const plan = generateRotationPlan(players, starters);
      const schedules = derivePlayerSchedules(plan);

      for (const halfIdx of [0, 1]) {
        const halfStart = halfIdx * 20;
        const halfEnd = halfStart + 20;
        let sum = 0;
        for (const ps of schedules) {
          for (const stint of ps.stints) {
            if (stint.type === 'on-court') {
              const start = Math.max(stint.startMinute, halfStart);
              const end = Math.min(stint.endMinute, halfEnd);
              if (end > start) sum += end - start;
            }
          }
        }
        expect(sum).toBe(100);
      }
    }
  });
});

describe('derivePlayerSchedules — stint continuity', () => {
  test('no player has a gap or overlap in their 0–40 timeline', () => {
    for (const n of [7, 8, 9]) {
      const players = makePlayers(n);
      const starters = makeStarters(players);
      const plan = generateRotationPlan(players, starters);
      const schedules = derivePlayerSchedules(plan);

      for (const ps of schedules) {
        const { stints } = ps;
        expect(stints.length).toBeGreaterThan(0);

        // First stint must start at minute 0
        expect(stints[0].startMinute).toBe(0);

        // Last stint must end at minute 40
        expect(stints[stints.length - 1].endMinute).toBe(40);

        // Consecutive stints must be contiguous (no gap, no overlap)
        for (let i = 1; i < stints.length; i++) {
          expect(stints[i].startMinute).toBe(stints[i - 1].endMinute);
        }

        // Each stint must have a positive duration
        for (const stint of stints) {
          expect(stint.durationMinutes).toBeGreaterThan(0);
          expect(stint.durationMinutes).toBe(stint.endMinute - stint.startMinute);
        }
      }
    }
  });
});

describe('generateRotationPlan — 5-on-court invariant', () => {
  test('at every minute 0–39, exactly 5 players are on court', () => {
    for (const n of [7, 8, 9]) {
      const players = makePlayers(n);
      const starters = makeStarters(players);
      const plan = generateRotationPlan(players, starters);
      for (let m = 0; m < 40; m++) {
        const count = playersOnCourtAtMinute(plan, m);
        expect(count).toBe(5);
      }
    }
  });
});
