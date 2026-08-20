import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8');

describe('team page ladder detail toggle', () => {
  test('renders a two-state Standard and Full ladder toggle with Standard as the initial state', () => {
    const page = read('src/pages/teams/[slug].astro');

    expect(page).toContain('aria-label="Ladder detail level"');
    expect(page).toContain('data-ladder-view="standard"');
    expect(page).toContain('data-ladder-view="full"');
    expect(page).toContain("setView('standard')");
    expect(page).not.toContain('data-ladder-view="compact"');
    expect(page).not.toContain('Compact</button>');
  });

  test('Standard view keeps core ladder columns and Full view adds B/F/A/% details', () => {
    const page = read('src/pages/teams/[slug].astro');

    for (const heading of ['>P</th>', '>W</th>', '>L</th>', '>D</th>', '>Pts</th>']) {
      expect(page).toContain(heading);
    }

    for (const heading of ['>B</th>', '>F</th>', '>A</th>', '>%</th>']) {
      expect(page).toContain(heading);
    }

    expect(page).toContain("['byes', 'bye', 'bonus', 'bonusPoints']");
    expect(page).toContain("['pointsFor', 'for', 'scoredFor']");
    expect(page).toContain("['pointsAgainst', 'against', 'scoredAgainst']");
    expect(page).toContain("['percentage', 'percent']");
  });

  test('desktop ladder full view does not depend on a horizontal-scroll wrapper and Phoenix row remains gold-accented', () => {
    const page = read('src/pages/teams/[slug].astro');

    expect(page).toContain('overflow-x-auto lg:overflow-visible');
    expect(page).toContain('table-fixed');
    expect(page).toContain('border-l-4 border-brand-gold');
    expect(page).toContain('bg-brand-gold/10');
    expect(page).toContain('font-black text-brand-purple');
  });
});
