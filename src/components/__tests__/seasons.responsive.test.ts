import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('seasons responsive classes', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')

  test('season grid uses 1/2 column breakpoints (2x2 on larger screens)', () => {
    expect(pageSource).toContain('grid grid-cols-1 gap-6 sm:grid-cols-2')
    expect(pageSource).not.toContain('lg:grid-cols-4')
  })

  test('training grid uses 1/2 column breakpoints', () => {
    expect(pageSource).toContain('grid grid-cols-1 gap-6 sm:grid-cols-2')
  })
})
