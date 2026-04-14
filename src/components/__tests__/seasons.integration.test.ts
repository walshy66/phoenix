import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons integration data', () => {
  test('renders four cards in fixed order', () => {
    expect(SEASON_CARDS.map((s) => s.name)).toEqual([
      'Winter 2026',
      'Summer 2025/26',
      'Summer 2026/27',
      'Archive',
    ])
  })

  test('winter route is internal and summer route is external', () => {
    expect(SEASON_CARDS[0].navigationTarget).toBe('/teams')
    expect(SEASON_CARDS[0].navigationExternal).toBe(false)

    expect(SEASON_CARDS[1].navigationTarget).toContain('playhq.com')
    expect(SEASON_CARDS[1].navigationExternal).toBe(true)
  })
})
