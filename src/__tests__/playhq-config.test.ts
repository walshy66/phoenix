import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const scriptPaths = [
  'scripts/scrape-playhq.js',
  'scripts/scrape-playhq-teams.js',
  'scripts/scrape-playhq-teams-details.js',
  'scripts/test-playhq-api.js',
  'scripts/scrape-weekly-games.js',
];

describe('PlayHQ configuration', () => {
  test('scraper and PlayHQ test scripts do not hardcode Phoenix-specific PlayHQ configuration', () => {
    const forbidden = [
      '4a1e6a01-32f3-477d-9c08-4d9ec6b50148',
      '90c7fb8e-b434-42ea-9af5-625235ca11e7',
      'b3efb4fc-f645-4b5a-a777-50cc99464849',
      '0bf74768-492e-4f43-adcf-c863f59c9422',
      'Bendigo Phoenix',
    ];

    for (const scriptPath of scriptPaths) {
      const source = readFileSync(scriptPath, 'utf8');
      for (const value of forbidden) {
        expect(source, `${scriptPath} must not hardcode ${value}`).not.toContain(value);
      }
    }
  });

  test('central PlayHQ config defaults the tenant while failing explicitly for missing club-specific values', async () => {
    const { getPlayHQConfig } = await import(new URL('../../scripts/lib/playhq-config.js', import.meta.url).href);

    const config = getPlayHQConfig({
      env: {},
      readLocalEnvVar: () => undefined,
    });
    expect(config.tenant).toBe('bv');

    expect(() =>
      getPlayHQConfig({
        env: {},
        readLocalEnvVar: () => undefined,
        required: ['apiKey', 'seasonIds'],
      }),
    ).toThrow('Missing required PlayHQ configuration: PLAYHQ_API_KEY, PLAYHQ_SEASON_IDS');
  });
});
