import { describe, test, expect } from 'vitest'
import { VENUES } from '../../data/venues'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('training information section', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')

  test('has two configured venues', () => {
    expect(VENUES).toHaveLength(2)
    expect(VENUES.map((v) => v.shortCode)).toEqual(['BSE', 'VCC'])
  })

  test('venues include schedule data', () => {
    expect(VENUES[0].trainingSchedule[0].day).toBe('Sunday')
    expect(VENUES[1].trainingSchedule[0].day).toBe('Wednesday')
  })

  test('section heading uses Club Training Information wording', () => {
    expect(pageSource).toContain('Club Training Information')
  })

  test('map links open in new tab with safe rel', () => {
    expect(pageSource).toContain('target="_blank"')
    expect(pageSource).toContain('rel="noopener noreferrer"')
  })

  test('training section appears before season grid in source order', () => {
    const trainingIdx = pageSource.indexOf('training-info-heading')
    const seasonsIdx = pageSource.indexOf('id="seasons-grid"')

    expect(trainingIdx).toBeGreaterThan(-1)
    expect(seasonsIdx).toBeGreaterThan(-1)
    expect(trainingIdx).toBeLessThan(seasonsIdx)
  })

  test('section is guarded by VENUES length check', () => {
    expect(pageSource).toContain('{VENUES.length > 0 && (')
  })

  test('schedule rows use a clear 2-column layout with no dash separator', () => {
    expect(pageSource).toContain('grid grid-cols-[88px_1fr] gap-3 text-sm')
    expect(pageSource).not.toContain('{slot.time} — {slot.ageGroups.join(\', \')}')
  })
})
