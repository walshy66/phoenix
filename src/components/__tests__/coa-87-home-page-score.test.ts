import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8');

describe('COA-87/COA-182 home page score feature flag behavior', () => {
  test('homepage reads a central enabled toggle before rendering the score carousel', () => {
    const index = read('src/pages/index.astro');
    const flags = read('src/lib/home-scores/feature-flags.ts');

    expect(flags).toContain('export const HOME_SCORES_ENABLED = true;');
    expect(index).toContain("from '../lib/home-scores/feature-flags'");
    expect(index).toContain('const homeGamesArtifact = HOME_SCORES_ENABLED ? loadInitialHomeArtifact() : null;');
  });

  test('homepage still gates rendering through the centralized feature flag', () => {
    const index = read('src/pages/index.astro');

    expect(index).toContain('{HOME_SCORES_ENABLED && (');
    expect(index).toContain('<HomeScoresCarousel artifact={homeGamesArtifact} liveRefreshMs={300000} />');
  });
});
