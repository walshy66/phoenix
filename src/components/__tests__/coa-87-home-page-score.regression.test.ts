import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8');

describe('COA-87 home score regression coverage', () => {
  test('the homepage score toggle stays centralized and enabled for live score display', () => {
    const flags = read('src/lib/home-scores/feature-flags.ts');
    const index = read('src/pages/index.astro');

    expect(flags).toContain('export const HOME_SCORES_ENABLED = true;');
    expect(flags).toContain('export const shouldRenderHomeScores = HOME_SCORES_ENABLED;');
    expect(index).toContain("from '../lib/home-scores/feature-flags'");
    expect(index).toContain('HOME_SCORES_ENABLED &&');
  });

  test('the homepage score carousel reads the live scores overlay without regressing route pages', () => {
    const carousel = read('src/components/HomeScoresCarousel.astro');

    expect(carousel).toContain("fetch('/live-data/live-scores.json', { cache: 'no-store' })");
    expect(carousel).toContain('homeScore: typeof live.homeScore ===');
    expect(carousel).toContain("status: 'live'");
  });

  test('the existing carousel implementation and scores routes remain intact', () => {
    const carousel = read('src/components/HomeScoresCarousel.astro');
    const scoresPage = read('src/pages/scores.astro');
    const scoreDetailPage = read('src/pages/scores/[gameId].astro');

    expect(carousel).toContain('Latest Results');
    expect(carousel).toContain('data-home-scores-root');
    expect(scoresPage).toContain('BaseLayout');
    expect(scoreDetailPage).toContain('BaseLayout');
  });
});
