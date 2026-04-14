import { describe, test, expect } from 'vitest'
import { getSeasonAriaLabel } from '../../lib/seasons/utils'
import { SEASON_CARDS } from '../../lib/seasons/constants'

describe('seasons keyboard aria labels', () => {
  test('winter label includes status and teams action', () => {
    expect(getSeasonAriaLabel(SEASON_CARDS[0])).toContain('Grading')
    expect(getSeasonAriaLabel(SEASON_CARDS[0])).toContain('view Teams page')
  })

  test('disabled labels communicate not available', () => {
    expect(getSeasonAriaLabel(SEASON_CARDS[2])).toContain('Not Taking Registrations')
    expect(getSeasonAriaLabel(SEASON_CARDS[2])).toContain('not yet available')
    expect(getSeasonAriaLabel(SEASON_CARDS[3])).toContain('not yet available')
  })
})
