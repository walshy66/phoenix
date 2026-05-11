import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const workflowPath = '.github/workflows/score-sync.yml';
const workflow = existsSync(workflowPath) ? readFileSync(workflowPath, 'utf8') : '';
const scriptPath = 'scripts/sync-scores.js';
const script = existsSync(scriptPath) ? readFileSync(scriptPath, 'utf8') : '';

describe('score-sync workflow', () => {
  test('replaces live-scores polling with 5-minute score sync during game windows', () => {
    expect(existsSync('.github/workflows/live-scores-poll.yml')).toBe(false);
    expect(workflow).toContain("- cron: '*/5 6-14 * * 1,2,3,5'");
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('timeout-minutes: 4');
  });

  test('runs score sync without Astro build or git mutation', () => {
    expect(workflow).toContain('node scripts/sync-scores.js');
    expect(workflow).toContain('Install lftp');
    expect(workflow).not.toMatch(/npm run build|astro build/);
    expect(workflow).not.toMatch(/git add|git commit|git push/);
    expect(workflow).not.toContain('contents: write');
  });

  test('sync script writes round files, home games, live-scores overlay, and FTPs only live-data JSON files', () => {
    expect(script).toContain('scripts/write-round-files.js');
    expect(script).toContain('scripts/write-home-games-from-rounds.js');
    expect(script).toContain('scripts/poll-live-scores.js');
    expect(script).toContain('SCORE_SYNC_SKIP_FTP');
    expect(script).toContain('public/live-data/rounds/*.json');
    expect(script).toContain('public/live-data/live-scores.json');
    expect(script).toContain('public/live-data/home-games.json');
    expect(script).not.toMatch(/npm run build|astro build|git commit|mirror --reverse/);
  });
});
