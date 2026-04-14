import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from './constants'

describe('SEASON_CARDS', () => {
  test('has exactly 4 cards in required order', () => {
    expect(SEASON_CARDS).toHaveLength(4)
    expect(SEASON_CARDS.map((s) => s.id)).toEqual([
      'winter-2026',
      'summer-2025-26',
      'summer-2026-27',
      'archive',
    ])
  })

  test('has clickable state true,true,false,false', () => {
    expect(SEASON_CARDS.map((s) => s.clickable)).toEqual([true, true, false, false])
  })

  test('has navigationExternal true only for Summer 2025/26', () => {
    const externals = SEASON_CARDS.filter((s) => s.navigationExternal)
    expect(externals).toHaveLength(1)
    expect(externals[0].id).toBe('summer-2025-26')
  })
})
