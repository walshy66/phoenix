import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import { SEASON_INFO_CARDS } from '../../data/season-info'
import { VENUES } from '../../data/venues'
import { clubProfile } from '../../config/club-profile'
import { SEASON_CARDS, SUMMER_2026_27_ENQUIRY_MODAL_ID } from '../../lib/seasons/constants'

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8')

const pageSource = readSource('src/pages/seasons.astro')
const modalSource = readSource('src/components/SeasonInfoModal.astro')
const constantsSource = readSource('src/lib/seasons/constants.ts')
const seasonInfoSource = readSource('src/data/season-info.ts')
const venuesSource = readSource('src/data/venues.ts')

const allSeasonLinkSources = [pageSource, modalSource, constantsSource, seasonInfoSource, venuesSource].join('\n')
const publicPlayHqRegistrationPattern = /playhq\.com\/basketball-victoria\/register/i

describe('Seasons Phase B link preservation', () => {
  test('preserves current season and scores/results destinations', () => {
    const winter = SEASON_CARDS.find((season) => season.id === 'winter-2026')

    expect(winter).toMatchObject({
      clickable: true,
      navigationTarget: '/teams',
      navigationExternal: false,
    })
    expect(existsSync(resolve(process.cwd(), 'src/pages/scores.astro'))).toBe(true)
  })

  test('preserves Summer 2026/27 registration enquiry mailto and popup action path', () => {
    const summer = SEASON_CARDS.find((season) => season.id === 'summer-2026-27')

    expect(summer).toMatchObject({
      clickable: true,
      navigationTarget: null,
      navigationExternal: false,
      enquiryModalId: SUMMER_2026_27_ENQUIRY_MODAL_ID,
    })
    expect(pageSource).toContain(`id={SUMMER_2026_27_ENQUIRY_MODAL_ID}`)
    expect(pageSource).toContain('registrationEnquiryMailto')
    expect(pageSource).toContain('`mailto:${clubProfile.contact.generalEmail}?subject=${encodeURIComponent(registrationEnquirySubject)}')
    expect(modalSource).toContain('data-registration-enquiry-trigger')
    expect(modalSource).toContain(`data-registration-enquiry-modal-id="${SUMMER_2026_27_ENQUIRY_MODAL_ID}"`)
  })

  test('preserves allowed external PlayHQ competition link without exposing public registration links', () => {
    const summer2025 = SEASON_CARDS.find((season) => season.id === 'summer-2025-26')
    const playHqLinks = SEASON_CARDS.map((season) => season.navigationTarget).filter(
      (target): target is string => typeof target === 'string' && target.includes('playhq.com'),
    )

    expect(summer2025).toMatchObject({
      clickable: true,
      navigationExternal: true,
    })
    expect(summer2025?.navigationTarget).toContain('playhq.com/basketball-victoria/org/bendigo-basketball-association')
    expect(summer2025?.navigationTarget).toContain('domestic-competition-summer-202526')
    expect(playHqLinks).toEqual([summer2025?.navigationTarget])
    expect(playHqLinks.every((link) => /domestic-competition|archive/i.test(link))).toBe(true)
    expect(allSeasonLinkSources).not.toMatch(publicPlayHqRegistrationPattern)
  })

  test('preserves clearance, second-hand uniform, and Step In Sports uniform links', () => {
    const linkedSubCards = SEASON_INFO_CARDS.flatMap((card) => card.subCards).filter((subCard) => subCard.linkUrl)

    expect(linkedSubCards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'clearance-portal',
          linkUrl: 'https://form.jotform.com/222288044427860',
        }),
        expect.objectContaining({
          id: 'uniform-2nd-hand',
          linkUrl: 'https://www.facebook.com/share/p/18Nvdb7fjm/',
        }),
      ]),
    )
    expect(modalSource).toContain('https://www.stepinsports.com.au/product-category/phoenix-basketball/')
    expect(modalSource).toContain('Order uniform here with Step In Sports')
  })

  test('preserves venue map links for every configured training venue', () => {
    expect(VENUES).not.toHaveLength(0)
    VENUES.forEach((venue) => {
      expect(venue.mapUrl, `${venue.name} needs a map URL`).toMatch(/^https:\/\/maps\.app\.goo\.gl\//)
    })
    expect(modalSource).toContain('href={venue.mapUrl}')
  })

  test('preserves assistance fund and club email contact links', () => {
    expect(pageSource).toContain('href="/about#slam-dunk"')
    expect(pageSource).toContain('Slam Dunk Bridging Fund')
    expect(pageSource).toContain('href={mailto(clubProfile.contact.generalEmail)}')
    expect(clubProfile.contact.generalEmail).toBe('hello@bendigophoenix.org.au')
  })
})
