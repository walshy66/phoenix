import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SEASON_CARDS } from '../../lib/seasons/constants'
import { SEASON_INFO_CARDS } from '../../data/season-info'

describe('seasons phase b preserved links and actions', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')
  const modalSource = readFileSync(resolve(process.cwd(), 'src/components/SeasonInfoModal.astro'), 'utf-8')
  const dataSource = readFileSync(resolve(process.cwd(), 'src/data/season-info.ts'), 'utf-8')

  test('top panels preserve winter and summer primary actions', () => {
    expect(pageSource).toContain('Winter 2026')
    expect(pageSource).toContain('href="/teams"')
    expect(pageSource).toContain('href="#training"')
    expect(pageSource).toContain('href="/scores"')
    expect(pageSource).toContain('Summer 2026/27')
    expect(pageSource).toContain('data-registration-enquiry-trigger')
    expect(pageSource).toContain('href="#summer-checklist"')
  })

  test('summer checklist renders required steps in mobile stacking order', () => {
    const expectedOrder = [
      'Fees',
      'Uniforms',
      'Clearances',
      'Training',
    ]

    let cursor = pageSource.indexOf('id="summer-checklist"')
    expect(cursor).toBeGreaterThan(-1)
    for (const label of expectedOrder) {
      const next = pageSource.indexOf(label, cursor)
      expect(next).toBeGreaterThan(cursor)
      cursor = next
    }
  })

  test('uniforms checklist exposes four clickable mini-actions and preserves real links', () => {
    expect(pageSource).toContain('Ordering')
    expect(pageSource).toContain('Numbers')
    expect(pageSource).toContain('Loan Program')
    expect(pageSource).toContain('Second-hand')
    expect(pageSource).not.toContain('Uniform Information</button>')
    expect(pageSource).toContain('data-zoom-src={card.imageSrc}')
    expect(modalSource).toContain('https://www.stepinsports.com.au/product-category/phoenix-basketball/')
    expect(dataSource).toContain('https://www.facebook.com/share/p/18Nvdb7fjm/')
  })

  test('fees and image-only actions use existing zoom/enlarge behavior', () => {
    expect(pageSource).toContain('data-infographic-zoom-trigger')
    expect(modalSource).toContain('data-infographic-zoom-trigger')
    expect(modalSource).toContain('data-zoom-src={subCard.imageSrc}')
    expect(dataSource).toContain("id: 'registration-fees'")
    expect(dataSource).toContain("id: 'uniform-numbers'")
    expect(dataSource).toContain("id: 'uniform-loan'")
  })

  test('clearance and allowed playhq competition links remain, but public registration links are not exposed', () => {
    const previousSummer = SEASON_CARDS.find((season) => season.id === 'summer-2025-26')
    expect(previousSummer?.navigationTarget).toContain('playhq.com/basketball-victoria/org')
    const publicRegistrationPath = ['playhq.com/basketball-victoria', 'register'].join('/')
    expect(previousSummer?.navigationTarget).not.toContain(publicRegistrationPath)

    const clearance = SEASON_INFO_CARDS.find((card) => card.id === 'clearances')?.subCards[0]
    expect(clearance?.linkUrl).toBe('https://form.jotform.com/222288044427860')

    expect(pageSource + modalSource + dataSource).not.toContain(publicRegistrationPath)
  })
})
