import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('seasons responsive classes', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')
  const modalSource = readFileSync(resolve(process.cwd(), 'src/components/SeasonInfoModal.astro'), 'utf-8')

  test('season information top panels use responsive two-column layout', () => {
    expect(pageSource).toContain('grid grid-cols-1 gap-6 lg:grid-cols-2')
  })

  test('training, uniforms and registration modal grids collapse to one column on mobile', () => {
    expect(modalSource).toContain('grid grid-cols-1 gap-6 justify-items-center sm:grid-cols-2')
  })
})
