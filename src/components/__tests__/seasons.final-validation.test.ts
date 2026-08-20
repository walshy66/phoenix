import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('seasons final validation', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')

  test('keeps slam dunk assistance callout and confidential email path', () => {
    expect(pageSource).toContain('Need Financial Assistance?')
    expect(pageSource).toContain('Slam Dunk Bridging Fund')
    expect(pageSource).toContain('/about#slam-dunk')
    expect(pageSource).toContain('mailto(clubProfile.contact.generalEmail)')
  })

  test('removes lower Season History & Links strip from the redesigned page', () => {
    expect(pageSource).not.toContain('Season History & Links')
    expect(pageSource).not.toContain('id="seasons-grid"')
  })

  test('uses BaseLayout wrapper', () => {
    expect(pageSource).toContain("import BaseLayout from '../layouts/BaseLayout.astro'")
  })
})
