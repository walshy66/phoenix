import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons integration data', () => {
  test('renders four cards in fixed order', () => {
    expect(SEASON_CARDS.map((s) => s.name)).toEqual([
      'Winter 2026',
      'Summer 2026/27',
      'Summer 2025/26',
      'Archive',
    ])
  })

  test('winter route is internal, upcoming summer opens enquiry, and previous summer is external', () => {
    expect(SEASON_CARDS[0].navigationTarget).toBe('/teams')
    expect(SEASON_CARDS[0].navigationExternal).toBe(false)

    expect(SEASON_CARDS[1].navigationTarget).toBeNull()
    expect(SEASON_CARDS[1].enquiryModalId).toBe('summer-2026-27-registration-enquiry')

    expect(SEASON_CARDS[2].navigationTarget).toContain('playhq.com')
    expect(SEASON_CARDS[2].navigationExternal).toBe(true)
  })
})
