import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons error-safe defaults', () => {
  test('all non-clickable cards have null navigation target', () => {
    expect(SEASON_CARDS.filter((card) => !card.clickable).every((card) => card.navigationTarget === null)).toBe(true)
  })
})
