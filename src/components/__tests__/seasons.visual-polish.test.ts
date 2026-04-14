import { describe, test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('season tile visual polish classes', () => {
  const tileSource = readFileSync(resolve(process.cwd(), 'src/components/SeasonTile.astro'), 'utf-8')

  test('uses brand focus ring class', () => {
    expect(tileSource).toContain('focus-visible:ring-brand-purple')
  })

  test('does not use old blue token classes', () => {
    expect(tileSource).not.toContain('bg-blue-100')
    expect(tileSource).not.toContain('text-blue-800')
    expect(tileSource).not.toContain('focus:ring-blue-500')
  })
})
