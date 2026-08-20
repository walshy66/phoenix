import { describe, test, expect } from 'vitest'
import { VENUES } from '../../data/venues'
import { SEASON_INFO_CARDS } from '../../data/season-info'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('season information section', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')
  const modalSource = readFileSync(resolve(process.cwd(), 'src/components/SeasonInfoModal.astro'), 'utf-8')

  test('has four configured season information cards in expected order', () => {
    expect(SEASON_INFO_CARDS).toHaveLength(4)
    expect(SEASON_INFO_CARDS.map((card) => card.id)).toEqual([
      'training',
      'uniforms',
      'clearances',
      'registration',
    ])
  })

  test('training data source still uses configured venues', () => {
    expect(VENUES).toHaveLength(2)
    expect(VENUES.map((v) => v.shortCode)).toEqual(['BSE', 'VCC'])
  })

  test('renders Season Information, Training, and Season History in the approved order', () => {
    const seasonInfoIdx = pageSource.indexOf('season-info-heading')
    const checklistIdx = pageSource.indexOf('id="summer-checklist"')
    const bridgingIdx = pageSource.indexOf('Need Financial Assistance?')
    const trainingIdx = pageSource.indexOf('id="training"')
    const seasonsIdx = pageSource.indexOf('id="seasons-grid"')

    expect(seasonInfoIdx).toBeGreaterThan(-1)
    expect(checklistIdx).toBeGreaterThan(seasonInfoIdx)
    expect(bridgingIdx).toBeGreaterThan(checklistIdx)
    expect(trainingIdx).toBeGreaterThan(bridgingIdx)
    expect(seasonsIdx).toBeGreaterThan(trainingIdx)
  })

  test('training section includes Winter 2026 details, Summer TBC note, and venue map links', () => {
    expect(pageSource).toContain('Winter 2026 Training Details')
    expect(pageSource).toContain('Summer 2026/27 training details are TBC')
    VENUES.forEach((venue) => {
      expect(venue.mapUrl).not.toBeNull()
    })
    expect(pageSource).toContain('VENUES.map')
    expect(pageSource).toContain('venue.mapUrl')
  })

  test('modal markup includes dialog semantics and safe external links', () => {
    expect(modalSource).toContain('role="dialog"')
    expect(modalSource).toContain('aria-modal="true"')
    expect(modalSource).toContain('target="_blank"')
    expect(modalSource).toContain('rel="noopener noreferrer"')
    expect(modalSource).toContain('data-close-btn')
    expect(modalSource).toContain('data-modal-backdrop')
  })

  test('image cards include lazy loading and explicit dimensions', () => {
    expect(modalSource).toContain('loading="lazy"')
    expect(modalSource).toContain('width="1400"')
    expect(modalSource).toContain('height="780"')
  })
})
