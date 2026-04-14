import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'
import { getSeasonAriaLabel } from '../../lib/seasons/utils'

describe('seasons accessibility', () => {
  test('all cards have descriptive aria labels', () => {
    SEASON_CARDS.forEach((card) => {
      const label = getSeasonAriaLabel(card)
      expect(label).toContain(card.name)
      expect(label).toContain(card.statusBadgeLabel)
    })
  })

  test('external card explicitly marked as opening in new tab in label', () => {
    expect(getSeasonAriaLabel(SEASON_CARDS[1])).toContain('opens in new tab')
  })
})
