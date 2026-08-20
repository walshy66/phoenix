import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const teamPageSource = () =>
  readFileSync(resolve(process.cwd(), 'src/pages/teams/[slug].astro'), 'utf-8');

describe('team page Ladder Command layout', () => {
  test('uses a schedule-left and sticky-ladder-right desktop command layout', () => {
    const source = teamPageSource();

    expect(source).toContain('data-layout="ladder-command"');
    expect(source).toContain('lg:grid-cols-2');
    expect(source).toContain('data-layout-region="schedule-left"');
    expect(source).toContain('data-layout-region="sticky-ladder-right"');
    expect(source).toContain('lg:sticky lg:top-24');
  });

  test('keeps Phoenix branding and existing back/loading/error hooks', () => {
    const source = teamPageSource();

    expect(source).toContain('border-brand-gold');
    expect(source).toContain('bg-brand-purple');
    expect(source).toContain('text-brand-gold');
    expect(source).toContain('id="team-loading"');
    expect(source).toContain("Could not load team data. Please try again later.");
    expect(source).toContain('href="/teams"');
    expect(source).toContain('Back to Teams');
  });

  test('supports mobile stacking without clipping venue or court text', () => {
    const source = teamPageSource();

    expect(source).toContain('grid grid-cols-1 items-start');
    expect(source).toContain('col-span-3 min-w-0 space-y-1 text-xs text-gray-500 md:col-span-1');
    expect(source).toContain('<p class="break-words" title="${esc(game.venue)}">');
    expect(source).toContain('<p class="break-words">${esc(game.court ?? \'Court TBC\')}</p>');
    expect(source).not.toContain('<p class="truncate" title="${esc(game.venue)}">');
    expect(source).not.toContain('<p class="truncate">${esc(game.court ?? \'Court TBC\')}</p>');
  });

  test('continues to expose existing static team paths from teams data', () => {
    const source = teamPageSource();

    expect(source).toContain('export async function getStaticPaths()');
    expect(source).toContain("scripts', 'teams-data.json");
    expect(source).toContain('return teams.map(team => ({ params: { slug: team.slug } }));');
  });
});
