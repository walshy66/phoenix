import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8')

describe('COA-67 fixes', () => {
  test('home page quick links point to the corrected team and resources routes', () => {
    const index = read('src/pages/index.astro')

    expect(index).toContain("title: 'Teams'")
    expect(index).toContain("href: '/teams/'")
    expect(index).toContain("desc: 'Your team results and ladder'")
    expect(index).toContain("title: 'Coaching Resources'")
    expect(index).toContain("href: '/resources/'")
  })

  test('season info modal images preserve aspect ratio instead of cropping', () => {
    const modal = read('src/components/SeasonInfoModal.astro')

    expect(modal).toContain('object-contain')
    expect(modal).toContain('h-auto')
    expect(modal).toContain('overflow-y-auto')
  })

  test('resource filter bar collapses on mobile and remains visible on desktop', () => {
    const filterBar = read('src/components/FilterBar.astro')

    expect(filterBar).toContain('data-mobile-filter-toggle')
    expect(filterBar).toContain('md:hidden')
    expect(filterBar).toContain('hidden md:flex md:flex-col md:gap-3')
    expect(filterBar).toContain('data-filter-controls')
  })

  test('teams filters wrap on mobile instead of forcing horizontal overflow', () => {
    const teams = read('src/pages/teams.astro')

    expect(teams).toContain('flex flex-wrap gap-2 py-3')
    expect(teams).toContain('id="filter-bar"')
  })

  test('contact email rows stack cleanly on mobile and stay inside the card', () => {
    const contact = read('src/pages/contact.astro')

    expect(contact).toContain('sm:flex-row')
    expect(contact).toContain('break-all')
    expect(contact).not.toContain('whitespace-nowrap')
  })
})
