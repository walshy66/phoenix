/**
 * Court Time Calculator — Rotation Algorithm
 *
 * Pure TypeScript module. No DOM, no Astro, no third-party dependencies.
 *
 * Entry point: generateRotationPlan(players, startingFive, finishers?) → RotationPlan
 */

import type {
  Player,
  RotationPlan,
  HalfPlan,
  SubstitutionEvent,
  PlayerSchedule,
  Stint,
} from './types.js';

// ---------------------------------------------------------------------------
// Deterministic seeded PRNG (xmur3 + mulberry32)
// ---------------------------------------------------------------------------

function xmur3Seed(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), seed | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRng(seed: string): () => number {
  const seedFn = xmur3Seed(seed);
  return mulberry32(seedFn());
}

function seededShuffle<T>(arr: T[], rng: () => number): T[] {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---------------------------------------------------------------------------
// computeCourtTargets
// ---------------------------------------------------------------------------

/**
 * Returns per-player minute targets (length n) summing to 200.
 * Base = floor(200 / n). The (200 % n) players who receive an extra minute
 * are selected via a seeded shuffle so the assignment is deterministic for
 * a given seed but not biased toward roster entry order.
 */
export function computeCourtTargets(n: number, seed: string): number[] {
  const base = Math.floor(200 / n);
  const remainder = 200 % n;

  const rng = makeRng(seed + ':targets');
  const indices = seededShuffle(
    Array.from({ length: n }, (_, i) => i),
    rng,
  );

  const bonusSet = new Set(indices.slice(0, remainder));
  return Array.from({ length: n }, (_, i) => (bonusSet.has(i) ? base + 1 : base));
}

// ---------------------------------------------------------------------------
// scheduleHalf — slot-based approach
// ---------------------------------------------------------------------------

/**
 * Schedule one half (20 minutes) for the given players.
 *
 * Slot model: slot[m] = array of 5 player IDs on court during minute m (0..19).
 *
 * Algorithm:
 * 1. Initialise all slots with the starting five.
 * 2. For each bench player (sorted by descending half-target), find a contiguous
 *    window of `target` minutes placed as late as possible.
 *    For each slot in the window, displace the player with the highest surplus.
 * 3. After all bench players are placed, fix any players still over their target
 *    via a correction pass.
 * 4. Enforce max 10-minute consecutive on-court stint per player.
 * 5. If finishers provided, lock them on court for the final 4 minutes.
 * 6. Extract substitution events from slot diffs.
 */
export function scheduleHalf(
  players: Player[],
  startingFive: Player[],
  halfTargets: number[],
  halfNumber: 1 | 2,
  finishers?: Player[],
): HalfPlan {
  const HALF_MINUTES = 20;
  const MAX_STINT = 10;
  const MIN_SUB_MINUTE = 5; // earliest minute a substitution may occur (5 min elapsed)
  const n = players.length;

  // slot[m] = array of 5 player IDs on court during minute m (0..19)
  const slots: string[][] = Array.from({ length: HALF_MINUTES }, () =>
    startingFive.map((p) => p.id),
  );

  const playerIdx = new Map<string, number>(players.map((p, i) => [p.id, i]));
  const starterIds = new Set(startingFive.map((p) => p.id));
  const benchPlayers = players.filter((p) => !starterIds.has(p.id));

  /**
   * Count how many minutes player `id` appears in slots [start..end).
   */
  function countMinutes(id: string, start = 0, end = HALF_MINUTES): number {
    let count = 0;
    for (let m = start; m < end; m++) {
      if (slots[m].includes(id)) count++;
    }
    return count;
  }

  /**
   * Get the surplus of a player at the current state: currentMinutes - target.
   * Positive means over target, negative means under target.
   */
  function getSurplus(id: string): number {
    const idx = playerIdx.get(id)!;
    return countMinutes(id) - halfTargets[idx];
  }

  /**
   * In slot[m], find the on-court player with the highest surplus.
   * Among ties, prefer the one with the highest index (last in roster) to be
   * deterministic and keep earlier players on court longer.
   */
  function findHighestSurplusInSlot(m: number): string {
    let bestId = '';
    let bestSurplus = -Infinity;
    let bestIdx = -1;
    for (const id of slots[m]) {
      const surplus = getSurplus(id);
      const idx = playerIdx.get(id)!;
      if (surplus > bestSurplus || (surplus === bestSurplus && idx > bestIdx)) {
        bestSurplus = surplus;
        bestId = id;
        bestIdx = idx;
      }
    }
    return bestId;
  }

  // Process bench players in order of descending half-target so the player
  // with the most time to serve is placed first.
  const sortedBench = benchPlayers.slice().sort((a, b) => {
    const ia = playerIdx.get(a.id)!;
    const ib = playerIdx.get(b.id)!;
    const td = halfTargets[ib] - halfTargets[ia];
    if (td !== 0) return td;
    return ia - ib;
  });

  for (const benchPlayer of sortedBench) {
    const bi = playerIdx.get(benchPlayer.id)!;
    const target = halfTargets[bi];

    if (target === 0) continue;

    // Place the bench player's window as late as possible: [windowStart, HALF_MINUTES)
    // windowStart is clamped to MIN_SUB_MINUTE so no sub occurs before 5 min elapsed.
    const windowStart = Math.max(HALF_MINUTES - target, MIN_SUB_MINUTE);
    const windowEnd = HALF_MINUTES;

    for (let m = windowStart; m < windowEnd; m++) {
      const outId = findHighestSurplusInSlot(m);
      slots[m] = slots[m].map((id) => (id === outId ? benchPlayer.id : id));
    }
  }

  // Correction pass: swap over-target on-court players with under-target off-court players.
  let changed = true;
  let safetyCounter = 0;
  while (changed && safetyCounter < 100) {
    changed = false;
    safetyCounter++;

    for (let m = HALF_MINUTES - 1; m >= MIN_SUB_MINUTE; m--) {
      const currentOnCourt = new Set(slots[m]);

      let overTargetId = '';
      for (const id of currentOnCourt) {
        const idx = playerIdx.get(id)!;
        const currentMins = countMinutes(id);
        if (currentMins >= halfTargets[idx] && currentMins > 0) {
          overTargetId = id;
          break;
        }
      }
      if (!overTargetId) continue;

      let needsTimeId = '';
      for (const p of players) {
        if (currentOnCourt.has(p.id)) continue;
        const idx = playerIdx.get(p.id)!;
        if (countMinutes(p.id) < halfTargets[idx]) {
          needsTimeId = p.id;
          break;
        }
      }
      if (!needsTimeId) continue;

      slots[m] = slots[m].map((id) => (id === overTargetId ? needsTimeId : id));
      changed = true;
    }
  }

  // ---------------------------------------------------------------------------
  // Max consecutive stint enforcement (10 minutes maximum)
  // ---------------------------------------------------------------------------
  // Uses a neutral two-minute swap to preserve minute totals:
  //   At breakAt: player A → player B (A off, B on)
  //   At minute Y: player B → player A (B off, A on)
  // Net effect: A and B each gain and lose exactly one minute → totals unchanged.
  {
    const finisherIds = finishers ? new Set(finishers.map((f) => f.id)) : new Set<string>();
    const LOCK_START = HALF_MINUTES - 4; // minute 16 — finisher-locked zone

    /**
     * Would adding `id` to slot[m] create a consecutive run > MAX_STINT?
     * Used by the post-correction pass to prevent it from re-creating long runs.
     */
    function wouldExceedMaxStint(id: string, m: number): boolean {
      let runLen = 1; // minute m itself
      for (let mm = m - 1; mm >= 0 && slots[mm].includes(id); mm--) runLen++;
      for (let mm = m + 1; mm < HALF_MINUTES && slots[mm].includes(id); mm++) runLen++;
      return runLen > MAX_STINT;
    }

    let stintChanged = true;
    let stintSafety = 0;
    while (stintChanged && stintSafety < 200) {
      stintChanged = false;
      stintSafety++;

      for (const player of players) {
        const id = player.id;
        let runStart = -1;

        for (let m = 0; m <= HALF_MINUTES; m++) {
          const onCourt = m < HALF_MINUTES && slots[m].includes(id);
          if (onCourt) {
            if (runStart === -1) runStart = m;
          } else {
            if (runStart !== -1) {
              const runEnd = m;
              const runLen = runEnd - runStart;
              if (runLen > MAX_STINT) {
                const breakAt = runStart + MAX_STINT;

                // Skip enforcement if breakAt is in the finisher locked zone for a finisher
                if (finisherIds.has(id) && breakAt >= LOCK_START) {
                  runStart = -1;
                  continue;
                }

                const onCourtAtBreak = new Set(slots[breakAt]);
                let neutralFound = false;

                // Forward neutral swap: find off-court player p who is on court at some Y >= runEnd
                // where id is NOT already on court (avoids inserting id twice into a slot).
                outer: for (const p of players) {
                  if (onCourtAtBreak.has(p.id)) continue;
                  for (let y = runEnd; y < HALF_MINUTES; y++) {
                    if (slots[y].includes(p.id) && !slots[y].includes(id)) {
                      // Neutral swap: id out at breakAt, in at y; p in at breakAt, out at y
                      slots[breakAt] = slots[breakAt].map((sid) => (sid === id ? p.id : sid));
                      slots[y] = slots[y].map((sid) => (sid === p.id ? id : sid));
                      neutralFound = true;
                      stintChanged = true;
                      break outer;
                    }
                  }
                }

                // Backward neutral swap: find off-court player p on court at some Y in [MIN_SUB_MINUTE..runStart).
                // Y<MIN_SUB_MINUTE is excluded: Y=0 corrupts startingFive invariant, and
                // minutes 1–4 are the no-sub zone (no sub before 5 min elapsed).
                if (!neutralFound) {
                  outer2: for (const p of players) {
                    if (onCourtAtBreak.has(p.id)) continue;
                    for (let y = MIN_SUB_MINUTE; y < runStart; y++) {
                      if (!slots[y].includes(id) && slots[y].includes(p.id)) {
                        slots[breakAt] = slots[breakAt].map((sid) => (sid === id ? p.id : sid));
                        slots[y] = slots[y].map((sid) => (sid === p.id ? id : sid));
                        neutralFound = true;
                        stintChanged = true;
                        break outer2;
                      }
                    }
                  }
                }

                // Fallback: simple single-minute swap (rare; post-correction will rebalance)
                if (!neutralFound) {
                  for (const p of players) {
                    if (!onCourtAtBreak.has(p.id)) {
                      slots[breakAt] = slots[breakAt].map((sid) => (sid === id ? p.id : sid));
                      stintChanged = true;
                      break;
                    }
                  }
                }
              }
              runStart = -1;
            }
          }
        }
      }

      // Post-correction pass (runs inside the outer while loop so any new violations
      // created here are caught by the next stint-enforcement iteration).
      // Skips swaps that would re-create a run > MAX_STINT to break the oscillation
      // where the fallback removes a player and this pass immediately puts them back.
      {
        let postCorrChanged = true;
        while (postCorrChanged) {
          postCorrChanged = false;
          for (let m = HALF_MINUTES - 1; m >= MIN_SUB_MINUTE; m--) {
            const currentOnCourt = new Set(slots[m]);
            let overTargetId = '';
            for (const cid of currentOnCourt) {
              const idx = playerIdx.get(cid)!;
              if (countMinutes(cid) > halfTargets[idx]) {
                overTargetId = cid;
                break;
              }
            }
            if (!overTargetId) continue;
            let needsTimeId = '';
            for (const p of players) {
              if (currentOnCourt.has(p.id)) continue;
              const idx = playerIdx.get(p.id)!;
              if (
                countMinutes(p.id) < halfTargets[idx] &&
                !wouldExceedMaxStint(p.id, m)
              ) {
                needsTimeId = p.id;
                break;
              }
            }
            if (!needsTimeId) continue;
            slots[m] = slots[m].map((sid) => (sid === overTargetId ? needsTimeId : sid));
            postCorrChanged = true;
            stintChanged = true; // trigger outer loop to recheck stints
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Finisher lock — pin 3 players to the final 4 minutes
  // ---------------------------------------------------------------------------
  // Ensures finisher players are on court for all of minutes 16–19.
  // Removes the highest-surplus non-finisher to make room when needed.
  if (finishers && finishers.length > 0) {
    const LOCK_START = HALF_MINUTES - 4; // minute 16
    const finisherIds = new Set(finishers.map((f) => f.id));

    for (let m = LOCK_START; m < HALF_MINUTES; m++) {
      for (const finisher of finishers) {
        if (!slots[m].includes(finisher.id)) {
          // Remove highest-surplus non-finisher to make room
          let outId = '';
          let highestSurplus = -Infinity;
          for (const id of slots[m]) {
            if (finisherIds.has(id)) continue;
            const surplus = getSurplus(id);
            if (surplus > highestSurplus) {
              highestSurplus = surplus;
              outId = id;
            }
          }
          if (outId) {
            slots[m] = slots[m].map((id) => (id === outId ? finisher.id : id));
          }
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Build substitution events from slot diffs
  // ---------------------------------------------------------------------------
  const subEvents = new Map<number, { comingOn: Player[]; sittingDown: Player[] }>();

  for (let m = 1; m < HALF_MINUTES; m++) {
    const prev = new Set(slots[m - 1]);
    const curr = new Set(slots[m]);

    const comingOn: Player[] = [];
    const sittingDown: Player[] = [];

    for (const id of curr) {
      if (!prev.has(id)) {
        const p = players.find((pl) => pl.id === id);
        if (p) comingOn.push(p);
      }
    }
    for (const id of prev) {
      if (!curr.has(id)) {
        const p = players.find((pl) => pl.id === id);
        if (p) sittingDown.push(p);
      }
    }

    if (comingOn.length > 0) {
      subEvents.set(m, { comingOn, sittingDown });
    }
  }

  const substitutions: SubstitutionEvent[] = Array.from(subEvents.entries())
    .sort(([a], [b]) => a - b)
    .map(([minute, { comingOn, sittingDown }]) => ({
      gameClockMinute: minute,
      playersComingOn: comingOn,
      playersSittingDown: sittingDown,
    }));

  return { halfNumber, startingFive, substitutions };
}

// ---------------------------------------------------------------------------
// selectSecondHalfStarters
// ---------------------------------------------------------------------------

/**
 * Returns the 5 players with the highest remaining court time target after half 1.
 * Ties broken by original roster entry order (lower index wins).
 *
 * Remaining = totalTarget - actualHalf1CourtMinutes
 */
export function selectSecondHalfStarters(
  players: Player[],
  half1Plan: HalfPlan,
  targets: number[],
): Player[] {
  const half1Court = computeHalfCourtMinutes(players, half1Plan);

  const remaining = players.map((p, i) => ({
    player: p,
    remaining: targets[i] - half1Court[i],
    rosterIndex: i,
  }));

  remaining.sort((a, b) => {
    if (b.remaining !== a.remaining) return b.remaining - a.remaining;
    return a.rosterIndex - b.rosterIndex;
  });

  return remaining.slice(0, 5).map((r) => r.player);
}

/**
 * Compute on-court minutes per player for a given HalfPlan by replaying
 * substitution events. Returns an array indexed by position in `players`.
 */
function computeHalfCourtMinutes(players: Player[], half: HalfPlan): number[] {
  const HALF_MINUTES = 20;

  const subsByMinute = new Map<number, SubstitutionEvent>();
  for (const sub of half.substitutions) {
    subsByMinute.set(sub.gameClockMinute, sub);
  }

  const onCourt = new Set<string>(half.startingFive.map((p) => p.id));
  const counts = new Map<string, number>(players.map((p) => [p.id, 0]));

  for (let m = 0; m < HALF_MINUTES; m++) {
    const sub = subsByMinute.get(m);
    if (sub) {
      for (const p of sub.playersComingOn) onCourt.add(p.id);
      for (const p of sub.playersSittingDown) onCourt.delete(p.id);
    }
    for (const id of onCourt) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }

  return players.map((p) => counts.get(p.id) ?? 0);
}

// ---------------------------------------------------------------------------
// derivePlayerSchedules
// ---------------------------------------------------------------------------

/**
 * Walk each player's timeline minute by minute across both halves (absolute 0–40)
 * and emit contiguous Stint blocks.
 */
export function derivePlayerSchedules(plan: RotationPlan): PlayerSchedule[] {
  const { roster, halves } = plan;
  const GAME_MINUTES = 40;
  const HALF_MINUTES = 20;

  const playerIdx = new Map<string, number>(roster.map((p, i) => [p.id, i]));

  // onCourtByMinute[playerIdx][minute 0..39] = boolean
  const onCourtByMinute: boolean[][] = roster.map(() => new Array(GAME_MINUTES).fill(false));

  for (const half of halves) {
    const halfOffset = (half.halfNumber - 1) * HALF_MINUTES;

    const subsByMinute = new Map<number, SubstitutionEvent>();
    for (const sub of half.substitutions) {
      subsByMinute.set(sub.gameClockMinute, sub);
    }

    const onCourt = new Set<string>(half.startingFive.map((p) => p.id));

    for (let m = 0; m < HALF_MINUTES; m++) {
      const sub = subsByMinute.get(m);
      if (sub) {
        for (const p of sub.playersComingOn) onCourt.add(p.id);
        for (const p of sub.playersSittingDown) onCourt.delete(p.id);
      }
      for (const [id, idx] of playerIdx) {
        onCourtByMinute[idx][halfOffset + m] = onCourt.has(id);
      }
    }
  }

  return roster.map((player, pi) => {
    const stints: Stint[] = [];
    const timeline = onCourtByMinute[pi];

    let stintStart = 0;
    let stintType: 'on-court' | 'bench' = timeline[0] ? 'on-court' : 'bench';

    for (let m = 1; m <= GAME_MINUTES; m++) {
      const currentOnCourt = m < GAME_MINUTES ? timeline[m] : null;
      const currentType = currentOnCourt === null ? null : currentOnCourt ? 'on-court' : 'bench';

      if (currentType !== stintType) {
        stints.push({
          type: stintType,
          startMinute: stintStart,
          endMinute: m,
          durationMinutes: m - stintStart,
        });
        stintStart = m;
        if (currentType !== null) stintType = currentType;
      }
    }

    return { player, stints };
  });
}

// ---------------------------------------------------------------------------
// generateRotationPlan
// ---------------------------------------------------------------------------

export function generateRotationPlan(
  players: Player[],
  startingFive: Player[],
  finishers?: Player[],
): RotationPlan {
  if (players.length < 7 || players.length > 9) {
    throw new Error(`generateRotationPlan: roster must have 7–9 players, got ${players.length}`);
  }
  if (startingFive.length !== 5) {
    throw new Error(`generateRotationPlan: startingFive must have exactly 5 players`);
  }
  if (finishers !== undefined && finishers.length !== 0 && finishers.length !== 3) {
    throw new Error(
      `generateRotationPlan: finishers must be empty or exactly 3 players, got ${finishers.length}`,
    );
  }

  if (finishers && finishers.length > 0) {
    const rosterIds = new Set(players.map((p) => p.id));
    for (const f of finishers) {
      if (!rosterIds.has(f.id)) {
        throw new Error(`generateRotationPlan: finisher "${f.name}" is not in the roster`);
      }
    }
  }

  const seed = players.map((p) => p.name).join(',');
  const targets = computeCourtTargets(players.length, seed);

  const half1Targets = computeHalf1Targets(targets);
  const half1 = scheduleHalf(players, startingFive, half1Targets, 1);

  const half2Starters = selectSecondHalfStarters(players, half1, targets);

  const half1CourtMinutes = computeHalfCourtMinutes(players, half1);
  const half2Targets = targets.map((t, i) => t - half1CourtMinutes[i]);

  // Pass finishers only to half 2 (they lock the end of the game)
  const half2 = scheduleHalf(players, half2Starters, half2Targets, 2, finishers);

  const plan: RotationPlan = {
    roster: players,
    halves: [half1, half2],
    totalPlayerMinutes: 200,
    finishers: finishers && finishers.length > 0 ? finishers : undefined,
  };

  validatePlan(plan);
  return plan;
}

// ---------------------------------------------------------------------------
// Half-1 target computation
// ---------------------------------------------------------------------------

/**
 * Compute half-1 targets: each player gets round(total/2), corrected so sum == 100.
 */
function computeHalf1Targets(targets: number[]): number[] {
  const half1 = targets.map((t) => Math.round(t / 2));

  const sum1 = half1.reduce((a, b) => a + b, 0);
  const delta = 100 - sum1;

  if (delta !== 0) {
    const order = targets.map((t, i) => ({ i, deviation: half1[i] - t / 2 }));
    if (delta > 0) {
      order.sort((a, b) => a.deviation - b.deviation);
    } else {
      order.sort((a, b) => b.deviation - a.deviation);
    }
    let remaining = Math.abs(delta);
    for (const { i } of order) {
      if (remaining === 0) break;
      half1[i] += delta > 0 ? 1 : -1;
      remaining--;
    }
  }

  return half1;
}

// ---------------------------------------------------------------------------
// Internal validation
// ---------------------------------------------------------------------------

function validatePlan(plan: RotationPlan): void {
  const schedules = derivePlayerSchedules(plan);

  const total = schedules.reduce(
    (acc, ps) =>
      acc +
      ps.stints
        .filter((s) => s.type === 'on-court')
        .reduce((a, s) => a + s.durationMinutes, 0),
    0,
  );
  if (total !== 200) {
    throw new Error(`validatePlan: total player-minutes is ${total}, expected 200`);
  }

  for (let m = 0; m < 40; m++) {
    let count = 0;
    for (const ps of schedules) {
      for (const stint of ps.stints) {
        if (stint.type === 'on-court' && stint.startMinute <= m && m < stint.endMinute) {
          count++;
          break;
        }
      }
    }
    if (count !== 5) {
      throw new Error(`validatePlan: ${count} players on court at minute ${m}, expected 5`);
    }
  }

  for (const half of plan.halves) {
    const minutes = half.substitutions.map((s) => s.gameClockMinute);
    const unique = new Set(minutes);
    if (unique.size !== minutes.length) {
      throw new Error(`validatePlan: duplicate substitution minutes in half ${half.halfNumber}`);
    }
    for (const sub of half.substitutions) {
      if (sub.gameClockMinute < 5 || sub.gameClockMinute > 19) {
        throw new Error(
          `validatePlan: substitution at invalid minute ${sub.gameClockMinute} in half ${half.halfNumber}`,
        );
      }
    }
  }

  // Validate finisher constraint: all finishers must be on court at game minute 39
  if (plan.finishers && plan.finishers.length > 0) {
    const finisherIds = new Set(plan.finishers.map((f) => f.id));
    for (const ps of schedules) {
      if (!finisherIds.has(ps.player.id)) continue;
      const onAtEnd = ps.stints.some(
        (s) => s.type === 'on-court' && s.startMinute <= 39 && s.endMinute > 39,
      );
      if (!onAtEnd) {
        throw new Error(
          `validatePlan: finisher "${ps.player.name}" is not on court at game minute 39`,
        );
      }
    }
  }
}
