/**
 * Court Time Calculator — Shared TypeScript Types
 * Pure data structures; no DOM or framework dependencies.
 */

/** A single player in the roster. */
export interface Player {
  /** Stable identifier for the session (e.g. index-based "p0", "p1", …). */
  id: string;
  /** Free-text name entered by the coach, trimmed. */
  name: string;
}

/** The input provided by the coach at the start of a session. */
export interface Roster {
  players: Player[]; // ordered list, 7–9 entries
}

/** The full computed schedule for both halves, produced by the algorithm from the Roster. */
export interface RotationPlan {
  roster: Player[];
  halves: [HalfPlan, HalfPlan]; // always exactly 2 entries
  totalPlayerMinutes: number;    // must equal 200
  finishers?: Player[];          // 0 or 3 players pinned to the end of the game
}

/** The schedule for one half (20 minutes). */
export interface HalfPlan {
  halfNumber: 1 | 2;
  startingFive: Player[];           // exactly 5 players
  substitutions: SubstitutionEvent[];
}

/**
 * A single planned substitution at a specific game clock time within a half.
 * gameClockMinute is half-relative elapsed minutes (1–19).
 */
export interface SubstitutionEvent {
  /** Whole number, 1–19 within the half (half-relative elapsed). */
  gameClockMinute: number;
  /** 1 or more players entering the court. */
  playersComingOn: Player[];
  /** Same count as playersComingOn — players moving to the bench. */
  playersSittingDown: Player[];
}

/** A derived view of a single player's activity, used for Gantt chart rendering. */
export interface PlayerSchedule {
  player: Player;
  stints: Stint[];
}

/** A continuous block of time a player is either on court or on the bench. */
export interface Stint {
  type: 'on-court' | 'bench';
  /** 0–39, absolute game clock (0 = start of game). */
  startMinute: number;
  /** 1–40, absolute game clock. */
  endMinute: number;
  /** endMinute - startMinute */
  durationMinutes: number;
}
