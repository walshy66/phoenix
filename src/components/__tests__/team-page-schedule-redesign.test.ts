import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = () => readFileSync(resolve(process.cwd(), 'src/pages/teams/[slug].astro'), 'utf-8');

describe('team page schedule redesign', () => {
  test('sorts the schedule by newest/highest round before rendering rows', () => {
    const astro = source();

    expect(astro).toContain('function roundSortValue(game)');
    expect(astro).toContain('const sortedFixture = fixture');
    expect(astro).toContain('roundSortValue(b.game) - roundSortValue(a.game)');
    expect(astro).toContain('sortedFixture.map(game =>');
  });

  test('renders home/away teams and scores as matching stacked rows', () => {
    const astro = source();

    expect(astro).toContain('${esc(game.homeTeam)}</p>');
    expect(astro).toContain('${esc(game.awayTeam)}</p>');
    expect(astro).toContain('${hasScore ? esc(game.homeScore) :');
    expect(astro).toContain('${hasScore ? esc(game.awayScore) :');
    expect(astro.indexOf('${esc(game.homeTeam)}</p>')).toBeLessThan(astro.indexOf('${esc(game.awayTeam)}</p>'));
    expect(astro.indexOf('${hasScore ? esc(game.homeScore) :')).toBeLessThan(astro.indexOf('${hasScore ? esc(game.awayScore) :'));
  });

  test('uses distinct result/live badge colors and keeps live independent from score text', () => {
    const astro = source();

    expect(astro).toContain("bg-emerald-600 text-white");
    expect(astro).toContain("bg-rose-600 text-white");
    expect(astro).toContain("bg-slate-500 text-white");
    expect(astro).toContain("bg-amber-400");
    expect(astro).toContain('const livePill = isLive');
    expect(astro).not.toContain('isLive && !isCompleted');
    expect(astro).toContain('${hasScore ? esc(game.homeScore) :');
    expect(astro).toContain('${hasScore ? esc(game.awayScore) :');
  });

  test('emphasises Phoenix team names and preserves game detail links', () => {
    const astro = source();

    expect(astro).toContain('function isPhoenixTeam(name)');
    expect(astro).toContain("/phoenix/i.test");
    expect(astro).toContain("'text-brand-purple font-black'");
    expect(astro).toContain('href="/scores/game?id=${esc(game.id)}"');
  });
});
