import { describe, test, expect } from 'vitest'
import { SEASON_CARDS } from '../../lib/seasons/constants'
import { getSeasonAriaLabel } from '../../lib/seasons/utils'

const winter = SEASON_CARDS[0]
const summerEnquiry = SEASON_CARDS[1]
const completedSummer = SEASON_CARDS[2]
const archive = SEASON_CARDS[3]

describe('SeasonTile contract data', () => {
  test('internal card config is non-external /teams link', () => {
    expect(winter.clickable).toBe(true)
    expect(winter.navigationTarget).toBe('/teams')
    expect(winter.navigationExternal).toBe(false)
    expect(getSeasonAriaLabel(winter)).toContain('view Teams page')
  })

  test('summer enquiry card opens the registration enquiry modal', () => {
    expect(summerEnquiry.clickable).toBe(true)
    expect(summerEnquiry.navigationTarget).toBeNull()
    expect(summerEnquiry.enquiryModalId).toBe('summer-2026-27-registration-enquiry')
  })

  test('external card config requires target blank rel noopener noreferrer', () => {
    expect(completedSummer.clickable).toBe(true)
    expect(completedSummer.navigationExternal).toBe(true)
    expect(completedSummer.navigationTarget).toContain('playhq.com')
    expect(getSeasonAriaLabel(completedSummer)).toContain('opens in new tab')
  })

  test('disabled card config is non-clickable', () => {
    expect(archive.clickable).toBe(false)
    expect(archive.navigationTarget).toBeNull()
    expect(getSeasonAriaLabel(archive)).toContain('not yet available')
  })

  test('badge labels are explicit display labels', () => {
    expect(winter.statusBadgeLabel).toBe('Live')
    expect(summerEnquiry.statusBadgeLabel).toBe('Registrations Open')
    expect(completedSummer.statusBadgeLabel).toBe('Complete')
    expect(archive.statusBadgeLabel).toBe('Coming Soon')
  })

  test('cards include configured icons', () => {
    expect(winter.icon).toBe('❄️')
    expect(summerEnquiry.icon).toBe('🔥')
    expect(completedSummer.icon).toBe('🏁')
    expect(archive.icon).toBe('🗄️')
  })
})
