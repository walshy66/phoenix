import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';

const workflow = readFileSync('.github/workflows/playhq-sync.yml', 'utf8');

describe('playhq-sync workflow', () => {
  test('runs hourly at :30 during the Melbourne evening game-day window', () => {
    expect(workflow).toContain("- cron: '30 5-13 * * 1,2,3,5'");
    expect(workflow).not.toContain("0 6 * * 0,1,2,3,5");
    expect(workflow).not.toContain("0 14 * * 0");
    expect(workflow).not.toContain("0 15 * * 0");
  });

  test('gates scheduled runs against Melbourne local time', () => {
    expect(workflow).toContain('Check Melbourne refresh window');
    expect(workflow).toContain('Australia/Melbourne');
    expect(workflow).toContain('4:30pm');
    expect(workflow).toContain('11:30pm');
    expect(workflow).toContain("steps.melbourne-window.outputs.should_run == 'true'");
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
