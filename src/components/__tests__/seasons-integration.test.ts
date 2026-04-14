import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons integration invariants', () => {
  test('disabled cards are upcoming + archive', () => {
    const disabled = SEASON_CARDS.filter((s) => !s.clickable).map((s) => s.id)
    expect(disabled).toEqual(['summer-2026-27', 'archive'])
  })

  test('status badge labels match expected values', () => {
    expect(SEASON_CARDS.map((s) => s.statusBadgeLabel)).toEqual([
      'Grading',
      'Complete',
      'Not Taking Registrations',
      'Coming Soon',
    ])
  })
})
