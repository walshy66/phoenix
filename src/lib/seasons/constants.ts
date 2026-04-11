/**
 * COA-24: Seasons Page — Placeholder Data
 *
 * Hardcoded placeholder data for MVP, before PlayHQ API integration.
 * All data is editable and will be replaced by API calls once key is available.
 *
 * Traceability: FR-003 (placeholders allowed), Plan Implementation Notes
 */

import type { Season, KeyDate, RegistrationCost } from './types';

/**
 * Placeholder seasons for development
 *
 * Structure:
 * - Winter 2026 (current): active season
 * - Spring 2026 (next): placeholder, coming soon
 * - Summer 2025/26 (previous): completed, for historical reference
 * - No archive (< 2 years of data)
 *
 * Per spec FR-001: Current, Next, Previous, Archive (conditional)
 */
export const PLACEHOLDER_SEASONS: Season[] = [
  {
    id: 'winter-2026',
    name: 'Winter 2026',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    role: 'current',
    status: 'active',
  },
  {
    id: 'spring-2026',
    name: 'Spring 2026',
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    role: 'next',
    status: 'coming_soon',
  },
  {
    id: 'summer-2025-26',
    name: 'Summer 2025/26',
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    role: 'previous',
    status: 'completed',
  },
];

/**
 * Placeholder key dates indexed by season ID
 *
 * Currently empty for all seasons (no dates announced yet).
 * When data is populated, each season will have KeyDate[] for display.
 *
 * Format: Record<seasonId, KeyDate[]>
 */
export const PLACEHOLDER_KEY_DATES: Record<string, KeyDate[]> = {
  'winter-2026': [],
  'spring-2026': [],
  'summer-2025-26': [],
};

/**
 * Placeholder registration costs indexed by season ID
 *
 * Currently empty for all seasons (pricing to be confirmed).
 * When data is populated, each season will have RegistrationCost[] for display.
 *
 * Format: Record<seasonId, RegistrationCost[]>
 */
export const PLACEHOLDER_REGISTRATION_COSTS: Record<string, RegistrationCost[]> = {
  'winter-2026': [],
  'spring-2026': [],
  'summer-2025-26': [],
};
