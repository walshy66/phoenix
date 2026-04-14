import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('seasons performance assumptions', () => {
  const pageSource = readFileSync(resolve(process.cwd(), 'src/pages/seasons.astro'), 'utf-8')

  test('contains no fetch call in seasons page', () => {
    expect(pageSource).not.toContain('fetch(')
  })
})
