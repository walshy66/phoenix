import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons keyboard expectations', () => {
  test('clickable cards count is 2', () => {
    expect(SEASON_CARDS.filter((s) => s.clickable)).toHaveLength(2)
  })

  test('disabled cards are intended to be skipped in tab order', () => {
    expect(SEASON_CARDS.filter((s) => !s.clickable).every((s) => s.navigationTarget === null)).toBe(true)
  })
})
