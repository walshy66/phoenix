import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'
import { VENUES } from '../../data/venues'

describe('seasons fixtures sanity', () => {
  test('season cards fixture exists', () => {
    expect(SEASON_CARDS.length).toBe(4)
  })

  test('venue fixture exists', () => {
    expect(VENUES.length).toBe(2)
  })
})
