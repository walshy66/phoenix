/**
 * COA-24: Seasons Page — Test Fixtures
 *
 * Mock data for component testing (unit and integration tests).
 * All fixtures match types.ts interfaces.
 *
 * Traceability: Principle II (Test-First Discipline)
 */

import type { Season, KeyDate, RegistrationCost } from '../../lib/seasons/types';

/**
 * Mock current season with full data
 */
export const mockSeasonCurrent: Season = {
  id: 'winter-2026',
  name: 'Winter 2026',
  startDate: '2026-06-01',
  endDate: '2026-09-30',
  role: 'current',
  status: 'active',
};

/**
 * Mock next season with coming-soon status
 */
export const mockSeasonNext: Season = {
  id: 'spring-2026',
  name: 'Spring 2026',
  startDate: '2026-10-01',
  endDate: '2026-12-31',
  role: 'next',
  status: 'coming_soon',
};

/**
 * Mock previous season with completed status
 */
export const mockSeasonPrevious: Season = {
  id: 'summer-2025-26',
  name: 'Summer 2025/26',
  startDate: '2025-12-01',
  endDate: '2026-02-28',
  role: 'previous',
  status: 'completed',
};

/**
 * Mock archive season
 */
export const mockSeasonArchive: Season = {
  id: 'winter-2025',
  name: 'Winter 2025',
  startDate: '2025-06-01',
  endDate: '2025-09-30',
  role: 'archive',
  status: 'completed',
};

/**
 * Season with minimal data (all optional fields missing)
 */
export const mockSeasonMinimal: Season = {
  id: 'test-minimal',
  name: 'Test Minimal',
  startDate: '2026-01-01',
  endDate: '2026-03-31',
  role: 'current',
  status: 'active',
};

/**
 * Mock key dates for testing
 */
export const mockKeyDates: KeyDate[] = [
  {
    label: 'Registration Opens',
    date: '2026-05-01',
    description: 'Register online via PlayHQ',
  },
  {
    label: 'Season Starts',
    date: '2026-06-01',
  },
  {
    label: 'Mid-Season Break',
    date: '2026-07-20',
    description: '1 week break',
  },
  {
    label: 'Finals',
    date: '2026-09-15',
  },
];

/**
 * Mock key dates with minimal data (no descriptions)
 */
export const mockKeyDatesMinimal: KeyDate[] = [
  {
    label: 'Start',
    date: '2026-06-01',
  },
  {
    label: 'End',
    date: '2026-09-30',
  },
];

/**
 * Empty key dates array (simulates "No scheduled dates announced yet")
 */
export const mockKeyDatesEmpty: KeyDate[] = [];

/**
 * Mock registration costs
 */
export const mockRegistrationCosts: RegistrationCost[] = [
  {
    id: 'winter-2026-full',
    category: 'Full Season',
    cost: 150.0,
    description: 'Includes all 10 games and end-of-season trophy',
  },
  {
    id: 'winter-2026-monthly',
    category: 'Monthly Pass',
    cost: 49.5,
    description: 'Valid for one calendar month',
  },
  {
    id: 'winter-2026-single',
    category: 'Single Game',
    cost: 20.0,
  },
];

/**
 * Mock registration costs with minimal data (no descriptions)
 */
export const mockRegistrationCostsMinimal: RegistrationCost[] = [
  {
    id: 'test-1',
    category: 'Standard',
    cost: 100.0,
  },
];

/**
 * Empty registration costs array (simulates "Registration pricing to be confirmed")
 */
export const mockRegistrationCostsEmpty: RegistrationCost[] = [];

/**
 * Complete test data set (all fields populated)
 */
export const completeTestDataSet = {
  season: mockSeasonCurrent,
  keyDates: mockKeyDates,
  registrationCosts: mockRegistrationCosts,
};

/**
 * Minimal test data set (all fields present but sparse)
 */
export const minimalTestDataSet = {
  season: mockSeasonMinimal,
  keyDates: mockKeyDatesMinimal,
  registrationCosts: mockRegistrationCostsMinimal,
};

/**
 * Empty test data set (required fields only, no key dates or costs)
 */
export const emptyTestDataSet = {
  season: mockSeasonCurrent,
  keyDates: mockKeyDatesEmpty,
  registrationCosts: mockRegistrationCostsEmpty,
};

/**
 * All mock seasons for testing page rendering
 */
export const mockAllSeasons: Season[] = [
  mockSeasonCurrent,
  mockSeasonNext,
  mockSeasonPrevious,
];

/**
 * All mock seasons including archive for multi-year testing
 */
export const mockAllSeasonsWithArchive: Season[] = [
  mockSeasonCurrent,
  mockSeasonNext,
  mockSeasonPrevious,
  mockSeasonArchive,
];
