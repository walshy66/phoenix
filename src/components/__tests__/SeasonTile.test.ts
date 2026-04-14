import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'
import { getSeasonAriaLabel } from '../../lib/seasons/utils'

const winter = SEASON_CARDS[0]
const summer = SEASON_CARDS[1]
const upcoming = SEASON_CARDS[2]

describe('SeasonTile contract data', () => {
  test('internal card config is non-external /teams link', () => {
    expect(winter.clickable).toBe(true)
    expect(winter.navigationTarget).toBe('/teams')
    expect(winter.navigationExternal).toBe(false)
    expect(getSeasonAriaLabel(winter)).toContain('view Teams page')
  })

  test('external card config requires target blank rel noopener noreferrer', () => {
    expect(summer.clickable).toBe(true)
    expect(summer.navigationExternal).toBe(true)
    expect(summer.navigationTarget).toContain('playhq.com')
    expect(getSeasonAriaLabel(summer)).toContain('opens in new tab')
  })

  test('disabled card config is non-clickable', () => {
    expect(upcoming.clickable).toBe(false)
    expect(upcoming.navigationTarget).toBeNull()
    expect(getSeasonAriaLabel(upcoming)).toContain('not yet available')
  })

  test('badge labels are explicit display labels', () => {
    expect(winter.statusBadgeLabel).toBe('Grading')
    expect(summer.statusBadgeLabel).toBe('Complete')
    expect(upcoming.statusBadgeLabel).toBe('Not Taking Registrations')
  })

  test('cards include configured icons', () => {
    expect(winter.icon).toBe('❄️')
    expect(summer.icon).toBe('🏁')
    expect(upcoming.icon).toBe('🛑')
  })
})
