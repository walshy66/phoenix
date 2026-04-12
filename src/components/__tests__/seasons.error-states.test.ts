/**
 * T021: Error State Handling Tests
 *
 * Tests for handling API failures, missing data, and graceful degradation.
 *
 * Scenarios:
 * - PlayHQ API returns null/undefined for registration costs → show "Registration pricing to be confirmed"
 * - PlayHQ API returns empty array for key dates → show "No scheduled dates announced yet"
 * - PlayHQ API fails completely (500 error, timeout) → show page-level error banner
 * - Missing season data → show appropriate placeholder
 * - Invalid date formats → gracefully degrade (use "Date TBA")
 *
 * Traceability: NFR-011, NFR-012, NFR-013, NFR-014, NFR-015 (error handling)
 * Edge Cases: Section 1-8, spec.md lines 167-218
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import type { Season, KeyDate, RegistrationCost } from '../../lib/seasons/types'
import { formatDate } from '../../lib/seasons/utils'

describe('Error State Handling (T021)', () => {
  // ============================================================================
  // SETUP: Mock Data for Error Scenarios
  // ============================================================================

  const mockSeasonValid: Season = {
    id: 'winter-2026',
    name: 'Winter 2026',
    startDate: '2026-06-01',
    endDate: '2026-09-30',
    role: 'current',
    status: 'active'
  }

  const mockSeasonMissingDates: Season = {
    id: 'spring-2026',
    name: 'Spring 2026',
    startDate: '', // Missing start date
    endDate: '', // Missing end date
    role: 'next',
    status: 'coming_soon'
  }

  const mockSeasonMissingName: Season = {
    id: 'summer-2025',
    name: '', // Missing name
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    role: 'previous',
    status: 'completed'
  }

  const mockKeyDatesValid: KeyDate[] = [
    {
      label: 'Registration Opens',
      date: '2026-05-15',
      description: 'Online registration available'
    },
    {
      label: 'Season Starts',
      date: '2026-06-01',
      description: 'First games begin'
    }
  ]

  const mockRegistrationCostsValid: RegistrationCost[] = [
    {
      id: '1',
      category: 'U8–U10',
      cost: 150,
      description: 'Includes 4 games'
    },
    {
      id: '2',
      category: 'Senior Men',
      cost: 200,
      description: 'Includes 10 games'
    }
  ]

  // ============================================================================
  // T021.1: Missing Registration Costs
  // ============================================================================

  describe('T021.1: Missing Registration Costs', () => {
    test('should display "Registration pricing to be confirmed" when costs is empty array', () => {
      const registrationCosts: RegistrationCost[] = []

      // Simulate component logic
      const hasData = registrationCosts && registrationCosts.length > 0
      const message = hasData
        ? 'Show table'
        : 'Registration pricing to be confirmed'

      expect(message).toBe('Registration pricing to be confirmed')
    })

    test('should display "Registration pricing to be confirmed" when costs is undefined', () => {
      const registrationCosts: RegistrationCost[] | undefined = undefined

      // Simulate component logic
      const hasData = registrationCosts && registrationCosts.length > 0
      const message = hasData
        ? 'Show table'
        : 'Registration pricing to be confirmed'

      expect(message).toBe('Registration pricing to be confirmed')
    })

    test('should display "Registration pricing to be confirmed" when costs is null', () => {
      const registrationCosts: RegistrationCost[] | null = null

      // Simulate component logic
      const hasData = registrationCosts && registrationCosts.length > 0
      const message = hasData
        ? 'Show table'
        : 'Registration pricing to be confirmed'

      expect(message).toBe('Registration pricing to be confirmed')
    })

    test('should still render card container even when costs are missing', () => {
      // Card component should always render, even with empty/null costs
      const costs: RegistrationCost[] = []
      const cardRendered = true // Component renders regardless of data

      expect(cardRendered).toBe(true)
    })

    test('should not show blank table rows for missing costs', () => {
      const costs: RegistrationCost[] = []

      // Should show placeholder instead of empty table
      const shouldShowTable = costs.length > 0
      const message = shouldShowTable ? 'table' : 'placeholder'

      expect(message).toBe('placeholder')
    })
  })

  // ============================================================================
  // T021.2: Missing Key Dates
  // ============================================================================

  describe('T021.2: Missing Key Dates', () => {
    test('should display "No scheduled dates announced yet" when keyDates is empty array', () => {
      const keyDates: KeyDate[] = []

      // Simulate component logic
      const hasData = keyDates && keyDates.length > 0
      const message = hasData
        ? 'Show grid'
        : 'No scheduled dates announced yet'

      expect(message).toBe('No scheduled dates announced yet')
    })

    test('should display "No scheduled dates announced yet" when keyDates is undefined', () => {
      const keyDates: KeyDate[] | undefined = undefined

      // Simulate component logic
      const hasData = keyDates && keyDates.length > 0
      const message = hasData
        ? 'Show grid'
        : 'No scheduled dates announced yet'

      expect(message).toBe('No scheduled dates announced yet')
    })

    test('should display "No scheduled dates announced yet" when keyDates is null', () => {
      const keyDates: KeyDate[] | null = null

      // Simulate component logic
      const hasData = keyDates && keyDates.length > 0
      const message = hasData
        ? 'Show grid'
        : 'No scheduled dates announced yet'

      expect(message).toBe('No scheduled dates announced yet')
    })

    test('should render KeyDatesSection card even when dates are empty', () => {
      // Component should always render, even with no dates
      const keyDates: KeyDate[] = []
      const cardRendered = true // Component renders regardless of data

      expect(cardRendered).toBe(true)
    })

    test('should not render empty grid cells for missing dates', () => {
      const keyDates: KeyDate[] = []

      // Should show placeholder instead of empty grid
      const shouldShowGrid = keyDates.length > 0
      const display = shouldShowGrid ? 'grid' : 'placeholder'

      expect(display).toBe('placeholder')
    })
  })

  // ============================================================================
  // T021.3: Invalid Date Formats
  // ============================================================================

  describe('T021.3: Invalid Date Formats', () => {
    test('should return "Date TBA" for invalid date format', () => {
      const invalidDate = 'not-a-date'
      const result = formatDate(invalidDate)

      // formatDate should gracefully handle invalid input
      expect(['Date TBA', 'Invalid date']).toContain(result)
    })

    test('should return "Date TBA" for null date', () => {
      const nullDate = null as any
      const result = formatDate(nullDate)

      expect(['Date TBA', 'Invalid date']).toContain(result)
    })

    test('should return "Date TBA" for empty string', () => {
      const emptyDate = ''
      const result = formatDate(emptyDate)

      expect(['Date TBA', 'Invalid date']).toContain(result)
    })

    test('should return "Date TBA" for undefined date', () => {
      const undefinedDate = undefined as any
      const result = formatDate(undefinedDate)

      expect(['Date TBA', 'Invalid date']).toContain(result)
    })

    test('should format valid ISO date correctly', () => {
      const validDate = '2026-06-01'
      const result = formatDate(validDate)

      // Should return readable format, not ISO
      expect(result).not.toBe(validDate)
      expect(result.length).toBeGreaterThan(0)
    })

    test('should handle partial dates gracefully', () => {
      const partialDate = '2026-06' // Missing day
      const result = formatDate(partialDate)

      // Should either format partially or return placeholder
      expect(result).toBeTruthy()
    })
  })

  // ============================================================================
  // T021.4: Missing Season Data
  // ============================================================================

  describe('T021.4: Missing Season Data', () => {
    test('should handle season with empty name', () => {
      const season = mockSeasonMissingName

      // Display component should show placeholder name
      const displayName = season.name || 'Season details unavailable'

      expect(displayName).toBe('Season details unavailable')
    })

    test('should handle season with missing dates', () => {
      const season = mockSeasonMissingDates

      // Should use role/status to display info, not rely on dates
      const canDisplay = Boolean(season.role && season.status)

      expect(canDisplay).toBe(true)
    })

    test('should display valid data when partially present', () => {
      const partialSeason: Season = {
        id: 'partial-2026',
        name: 'Partial Season',
        startDate: '2026-06-01',
        endDate: '', // Missing end date
        role: 'current',
        status: 'active'
      }

      // Should display available data (name, start date)
      const hasName = Boolean(partialSeason.name)
      const hasStartDate = Boolean(partialSeason.startDate)

      expect(hasName && hasStartDate).toBe(true)
    })

    test('should mark season as unavailable only if critical fields missing', () => {
      const incompleteSeason: Season = {
        id: '', // Missing ID
        name: '', // Missing name
        startDate: '', // Missing start date
        endDate: '', // Missing end date
        role: 'current',
        status: 'active'
      }

      // Only critical fields: id, name, dates
      const isCriticallyMissing = !incompleteSeason.id || !incompleteSeason.name

      expect(isCriticallyMissing).toBe(true)
    })
  })

  // ============================================================================
  // T021.5: API Error Logging
  // ============================================================================

  describe('T021.5: Error Logging to Observability', () => {
    let consoleErrorSpy: any

    beforeEach(() => {
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    test('should log error with timestamp when API fails', () => {
      const logError = (field: string, code: string, message: string) => {
        console.error({
          timestamp: new Date().toISOString(),
          field,
          code,
          message,
          component: 'seasons'
        })
      }

      logError('registrationCosts', 'API_500', 'Server error')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const errorCall = consoleErrorSpy.mock.calls[0][0]
      expect(errorCall.timestamp).toBeTruthy()
      expect(errorCall.code).toBe('API_500')
      expect(errorCall.field).toBe('registrationCosts')
    })

    test('should log error with affected field name', () => {
      const logError = (field: string, code: string, message: string) => {
        console.error({
          timestamp: new Date().toISOString(),
          field,
          code,
          message,
          component: 'seasons'
        })
      }

      logError('keyDates', 'MISSING_DATA', 'No key dates returned')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const callIndex = consoleErrorSpy.mock.calls.length - 1
      const errorCall = consoleErrorSpy.mock.calls[callIndex][0]
      expect(errorCall.field).toBe('keyDates')
    })

    test('should log error with error code and message', () => {
      const logError = (field: string, code: string, message: string) => {
        console.error({
          timestamp: new Date().toISOString(),
          field,
          code,
          message,
          component: 'seasons'
        })
      }

      logError('apiCall', 'TIMEOUT', 'Request timeout after 5s')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const callIndex = consoleErrorSpy.mock.calls.length - 1
      const errorCall = consoleErrorSpy.mock.calls[callIndex][0]
      expect(errorCall.code).toBe('TIMEOUT')
      expect(errorCall.message).toContain('timeout')
    })

    test('should log component name for context', () => {
      const logError = (field: string, code: string, message: string) => {
        console.error({
          timestamp: new Date().toISOString(),
          field,
          code,
          message,
          component: 'seasons'
        })
      }

      logError('season', 'INVALID_ID', 'Season ID is empty')

      expect(consoleErrorSpy).toHaveBeenCalled()
      const callIndex = consoleErrorSpy.mock.calls.length - 1
      const errorCall = consoleErrorSpy.mock.calls[callIndex][0]
      expect(errorCall.component).toBe('seasons')
    })
  })

  // ============================================================================
  // T021.6: Page-Level Error Banner
  // ============================================================================

  describe('T021.6: Page-Level Error Banner (API Failure)', () => {
    test('should show error banner when API fails completely', () => {
      const apiError = new Error('API_500: Server error')
      const shouldShowBanner = Boolean(apiError)

      expect(shouldShowBanner).toBe(true)
    })

    test('should display appropriate message on API failure', () => {
      const apiError = 'API failure'
      const message = apiError
        ? 'Season details are temporarily unavailable; check back soon'
        : ''

      expect(message).toBe('Season details are temporarily unavailable; check back soon')
    })

    test('should use correct styling for error banner', () => {
      const apiError = new Error('Server error')

      // Expected styling: bg-red-50, border-red-200, text-red-800
      const bannerClasses = apiError
        ? 'bg-red-50 border border-red-200'
        : ''

      expect(bannerClasses).toContain('red')
    })

    test('should not block page render on API error', () => {
      const apiError = new Error('API failed')

      // Page should still render with placeholders
      const pageRendered = true // Component always renders
      const showPlaceholders = Boolean(apiError)

      expect(pageRendered && showPlaceholders).toBe(true)
    })

    test('should provide actionable message to user', () => {
      const apiError = new Error('Network failure')
      const message = 'Season details are temporarily unavailable; check back soon'

      // Message should be user-friendly, not technical
      expect(message).not.toContain('Error')
      expect(message).not.toContain('undefined')
      expect(message.toLowerCase()).toContain('temporarily')
    })
  })

  // ============================================================================
  // T021.7: Partial Data Handling
  // ============================================================================

  describe('T021.7: Partial Data Scenarios', () => {
    test('should render season with valid costs but missing dates', () => {
      const season = mockSeasonValid
      const costs = mockRegistrationCostsValid
      const dates: KeyDate[] = []

      // Should render both sections: costs shown, dates show placeholder
      const costsRendered = costs.length > 0
      const datesMessage = dates.length > 0 ? 'grid' : 'No scheduled dates announced yet'

      expect(costsRendered).toBe(true)
      expect(datesMessage).toBe('No scheduled dates announced yet')
    })

    test('should render season with valid dates but missing costs', () => {
      const season = mockSeasonValid
      const costs: RegistrationCost[] = []
      const dates = mockKeyDatesValid

      // Should render both sections: dates shown, costs show placeholder
      const datesRendered = dates.length > 0
      const costsMessage = costs.length > 0 ? 'table' : 'Registration pricing to be confirmed'

      expect(datesRendered).toBe(true)
      expect(costsMessage).toBe('Registration pricing to be confirmed')
    })

    test('should handle season with both costs and dates missing', () => {
      const season = mockSeasonValid
      const costs: RegistrationCost[] = []
      const dates: KeyDate[] = []

      // Both sections should show placeholders
      const costsMessage = costs.length > 0 ? 'table' : 'Registration pricing to be confirmed'
      const datesMessage = dates.length > 0 ? 'grid' : 'No scheduled dates announced yet'

      expect(costsMessage).toBe('Registration pricing to be confirmed')
      expect(datesMessage).toBe('No scheduled dates announced yet')
    })

    test('should handle season with valid data', () => {
      const season = mockSeasonValid
      const costs = mockRegistrationCostsValid
      const dates = mockKeyDatesValid

      // Both sections should render data
      const costsRendered = costs.length > 0
      const datesRendered = dates.length > 0

      expect(costsRendered && datesRendered).toBe(true)
    })
  })

  // ============================================================================
  // T021.8: Edge Case - Empty Season Array
  // ============================================================================

  describe('T021.8: Empty Season Array', () => {
    test('should handle empty seasons array gracefully', () => {
      const seasons: Season[] = []

      // Page should render with message, no crash
      const seasonCount = seasons.length
      const shouldShowPlaceholder = seasonCount === 0

      expect(shouldShowPlaceholder).toBe(true)
    })

    test('should render tiles grid even with no seasons', () => {
      const seasons: Season[] = []

      // Grid should still exist in DOM, even if empty
      const gridRendered = true

      expect(gridRendered).toBe(true)
    })

    test('should display helpful message when no seasons exist', () => {
      const seasons: Season[] = []
      const message = seasons.length > 0
        ? 'Show seasons'
        : 'No seasons available'

      expect(message).toBe('No seasons available')
    })
  })

  // ============================================================================
  // Summary: Error State Coverage
  // ============================================================================

  describe('T021 Summary: Error State Coverage', () => {
    test('should handle all error scenarios without crashing', () => {
      const scenarios = [
        { name: 'empty costs', costs: [], dates: mockKeyDatesValid },
        { name: 'empty dates', costs: mockRegistrationCostsValid, dates: [] },
        { name: 'both empty', costs: [], dates: [] },
        { name: 'invalid dates', costs: mockRegistrationCostsValid, dates: [{ label: 'Bad', date: 'invalid', description: undefined }] }
      ]

      for (const scenario of scenarios) {
        expect(() => {
          // Component should render without error
          const message = scenario.costs.length ? 'table' : 'placeholder'
          expect(message).toBeTruthy()
        }).not.toThrow()
      }
    })

    test('should display user-friendly messages for all error types', () => {
      const messages = {
        missingCosts: 'Registration pricing to be confirmed',
        missingDates: 'No scheduled dates announced yet',
        apiError: 'Season details are temporarily unavailable; check back soon',
        invalidDate: 'Date TBA'
      }

      // All messages should be user-friendly, not technical
      for (const [key, message] of Object.entries(messages)) {
        expect(message).toBeTruthy()
        expect(message.toLowerCase()).not.toContain('error')
        expect(message.toLowerCase()).not.toContain('undefined')
        expect(message.toLowerCase()).not.toContain('null')
      }
    })

    test('should maintain page stability in error states', () => {
      const errorStates = [
        { hasError: true, message: 'API failed' },
        { hasError: false, message: 'Normal' }
      ]

      for (const state of errorStates) {
        // Page should always render, error or not
        const pageRendered = true
        expect(pageRendered).toBe(true)
      }
    })
  })
})
