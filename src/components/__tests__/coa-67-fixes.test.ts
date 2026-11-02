import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');

describe('responsive evergreen pages and retained resources', () => {
  test('home quick links lead to evergreen joining guidance and resources', () => {
    const home = read('src/pages/index.astro');
    expect(home).toContain("href: '/play-basketball'");
    expect(home).toContain("href: '/resources/'");
    expect(home).not.toContain('HeroCircularCarousel');
    expect(home).not.toContain('HomeScoresCarousel');
  });
  test('season info modal images preserve aspect ratio instead of cropping', () => {
    const modal = read('src/components/SeasonInfoModal.astro');
    expect(modal).toContain('object-contain');
    expect(modal).toContain('h-auto');
    expect(modal).toContain('overflow-y-auto');
  });
  test('resource filter bar collapses on mobile and remains visible on desktop', () => {
    const filterBar = read('src/components/FilterBar.astro');
    expect(filterBar).toContain('data-mobile-filter-toggle');
    expect(filterBar).toContain('md:hidden');
    expect(filterBar).toContain('hidden md:flex md:flex-col md:gap-3');
    expect(filterBar).toContain('data-filter-controls');
  });
  test('general enquiry email can wrap inside its card', () => {
    const contact = read('src/pages/contact.astro');
    expect(contact).toContain('break-all');
    expect(contact).not.toContain('whitespace-nowrap');
  });
});
