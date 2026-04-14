import { describe, test, expect } from 'vitest'
import { formatDate, getCurrencyFormatted, getSeasonAriaLabel } from './utils'
import type { SeasonCardConfig } from './types'

describe('formatDate', () => {
  test('formats valid ISO date', () => {
    expect(formatDate('2026-06-01')).toMatch(/2026/)
  })

  test('returns Date TBA for invalid date', () => {
    expect(formatDate('bad-date')).toBe('Date TBA')
  })
})

describe('getCurrencyFormatted', () => {
  test('formats AUD values', () => {
    expect(getCurrencyFormatted(150)).toContain('150')
  })

  test('returns Price TBA for invalid values', () => {
    expect(getCurrencyFormatted(Number.NaN)).toBe('Price TBA')
  })
})

describe('getSeasonAriaLabel', () => {
  const base: Omit<SeasonCardConfig, 'clickable' | 'navigationExternal' | 'navigationTarget'> = {
    id: 'winter-2026',
    name: 'Winter 2026',
    status: 'active',
    role: 'current',
    statusBadgeLabel: 'Grading',
    icon: '❄️',
  }

  test('returns internal navigation aria label', () => {
    expect(
      getSeasonAriaLabel({
        ...base,
        clickable: true,
        navigationExternal: false,
        navigationTarget: '/teams',
      })
    ).toBe('Winter 2026, Grading, view Teams page')
  })

  test('returns external navigation aria label', () => {
    expect(
      getSeasonAriaLabel({
        ...base,
        clickable: true,
        navigationExternal: true,
        navigationTarget: 'https://example.com',
      })
    ).toBe('Winter 2026, Grading, view on PlayHQ (opens in new tab)')
  })

  test('returns disabled aria label', () => {
    expect(
      getSeasonAriaLabel({
        ...base,
        clickable: false,
        navigationExternal: false,
        navigationTarget: null,
      })
    ).toBe('Winter 2026, Grading, not yet available')
  })
})
