import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

describe('COA-53 UI touch-up', () => {
  test('uses standardized hero padding across target pages', () => {
    const heroPages = [
      'src/pages/teams.astro',
      'src/pages/about.astro',
      'src/pages/scores.astro',
      'src/pages/seasons.astro',
      'src/pages/contact.astro',
      'src/pages/get-involved.astro',
      'src/pages/resources/index.astro',
    ];

    heroPages.forEach((page) => {
      const content = read(page);
      expect(content).toMatch(/py-12\s+lg:py-8/);
    });
  });

  test('teams, about and scores heroes include one-line descriptive text', () => {
    expect(read('src/pages/teams.astro')).toContain('Explore Phoenix teams by age group, division, and game night.');
    expect(read('src/pages/about.astro')).toContain('Learn about our club story, values, and commitment to every player.');
    expect(read('src/pages/scores.astro')).toContain('Follow weekly results, fixtures, and game-day outcomes across all divisions.');
  });

  test('resources hero no longer includes decorative circle elements', () => {
    const resources = read('src/pages/resources/index.astro');
    expect(resources).not.toContain('-bottom-16 -left-16');
    expect(resources).not.toContain('-top-16 -right-16');
  });

  test('scores grid and contact spacing use refined responsive classes', () => {
    const scores = read('src/pages/scores.astro');
    expect(scores).toContain('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6');

    const contact = read('src/pages/contact.astro');
    expect(contact).toContain('section class="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 bg-white"');
  });

  test('score and team cards share core card styling vocabulary', () => {
    const scoreCard = read('src/components/ScoreCard.astro');
    expect(scoreCard).toContain('card-hover bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100');

    const teams = read('src/pages/teams.astro');
    expect(teams).toContain("team-tile card-hover block bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col");
    expect(teams).toContain('<div class="p-4 flex-1">');
  });
});
