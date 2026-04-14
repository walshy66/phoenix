import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('seasons final validation', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')

  test('keeps slam dunk assistance callout', () => {
    expect(pageSource).toContain('Need Financial Assistance?')
    expect(pageSource).toContain('Slam Dunk Bridging Fund')
  })

  test('uses BaseLayout wrapper', () => {
    expect(pageSource).toContain("import BaseLayout from '../layouts/BaseLayout.astro'")
  })
})
