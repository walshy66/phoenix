/**
 * COA-24: Seasons Page — Type Definitions
 *
 * Defines core data structures for season, key dates, and registration costs.
 * Traceability: FR-001, FR-003, Key Entities section (spec.md)
 */

/**
 * Season role — determined by backend, not client
 * Principle III (Backend Authority): Client MUST NOT infer role from dates
 */
export type SeasonRole = 'current' | 'next' | 'previous' | 'archive';

/**
 * Season status — indicates availability state for display purposes
 */
export type SeasonStatus = 'active' | 'coming_soon' | 'completed';

/**
 * Season — represents a competitive period (e.g., Winter 2026, Summer 2025/26)
 *
 * **Server Responsibility**: Backend MUST calculate `role` based on date logic
 * **Client Responsibility**: Display season with provided role; never infer from dates
 */
export interface Season {
  /**
   * Unique identifier (from PlayHQ or internal DB)
   * Example: 'winter-2026', 'spring-2026'
   */
  id: string;

  /**
   * Human-readable name
   * Example: 'Winter 2026', 'Summer 2025/26'
   */
  name: string;

  /**
   * ISO 8601 datetime when season begins
   * Example: '2026-06-01'
   */
  startDate: string;

  /**
   * ISO 8601 datetime when season concludes
   * Example: '2026-09-30'
   */
  endDate: string;

  /**
   * Server-determined role — one of: current | next | previous | archive
   * Determined by backend logic comparing startDate/endDate to system date
   * Client MUST NOT infer this from dates (Principle III)
   */
  role: SeasonRole;

  /**
   * Status enum — controls display state (visual styling, interactivity)
   * - 'active': Registration open, season is running
   * - 'coming_soon': Placeholder state, future season not yet ready
   * - 'completed': Past season, read-only historical data
   */
  status: SeasonStatus;
}

/**
 * KeyDate — represents a significant date for a season
 * Examples: Registration Opens, Season Starts, Grading, Finals
 */
export interface KeyDate {
  /**
   * Short label for the date
   * Example: 'Registration Opens', 'Season Starts', 'Finals'
   */
  label: string;

  /**
   * ISO 8601 datetime or date value
   * Example: '2026-05-01', '2026-06-01T09:00:00Z'
   */
  date: string;

  /**
   * Optional description or additional context
   * Example: 'Registration closes at 5 PM AEST'
   */
  description?: string;
}

/**
 * RegistrationCost — represents a cost category for season registration
 * Example: 'Full Season', 'Monthly Pass', 'Single Game'
 */
export interface RegistrationCost {
  /**
   * Unique identifier for this cost record
   * Example: 'winter-2026-full'
   */
  id: string;

  /**
   * Category name (membership tier, duration, etc.)
   * Example: 'Full Season', 'Monthly Pass'
   */
  category: string;

  /**
   * Cost amount in AUD (Australian Dollars)
   * Stored as decimal (e.g., 150.00 for $150.00)
   */
  cost: number;

  /**
   * Optional description or terms
   * Example: 'Includes 10 games and end-of-season trophy'
   */
  description?: string;
}
