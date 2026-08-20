import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons integration invariants', () => {
  test('only archive is disabled', () => {
    const disabled = SEASON_CARDS.filter((s) => !s.clickable).map((s) => s.id)
    expect(disabled).toEqual(['archive'])
  })

  test('status badge labels match expected values', () => {
    expect(SEASON_CARDS.map((s) => s.statusBadgeLabel)).toEqual([
      'Live',
      'Registrations Open',
      'Complete',
      'Coming Soon',
    ])
  })
})
