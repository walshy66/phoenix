import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/playhq-sync.yml', 'utf8');

describe('playhq-sync workflow', () => {
  test('runs once daily at 4pm AEST on game days and Sunday', () => {
    expect(workflow).toContain("- cron: '0 6 * * 0,1,2,3,5'");
    expect(workflow).not.toContain("30 5-13 * * 1,2,3,5");
    expect(workflow).not.toContain("0 14 * * 0");
    expect(workflow).not.toContain("0 15 * * 0");
  });

  test('does not gate scheduled runs behind Melbourne window checks', () => {
    expect(workflow).not.toMatch(/Melbourne refresh window|within_window|Australia\/Melbourne/);
    expect(workflow).not.toMatch(/steps\.window\.outputs\.within_window/);
  });

  test('keeps manual mode selector and performs full rebuild deploy without committing data', () => {
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).toContain('type: choice');
    expect(workflow).toContain('- full');
    expect(workflow).toContain('- static');

    expect(workflow).toContain('node scripts/scrape-playhq-teams.js');
    expect(workflow).toContain('node scripts/scrape-playhq-teams-details.js');
    expect(workflow).toContain('npm run scores:refresh');
    expect(workflow).toContain('node scripts/scrape-weekly-games.js');
    expect(workflow).toContain('node scripts/write-round-files.js');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('Deploy to VentraIP via FTPS');
    expect(workflow).toContain('lftp -c');

    expect(workflow).not.toMatch(/git add|git commit|git push/);
    expect(workflow).not.toContain('contents: write');
  });
});
