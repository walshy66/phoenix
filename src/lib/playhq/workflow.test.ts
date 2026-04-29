import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/playhq-sync.yml'), 'utf8');

describe('playhq sync workflow', () => {
  test('runs hourly at :30 during the evening window with a Melbourne time gate', () => {
    expect(workflow).toContain("cron: '30 5-13 * * 1,2,3,5'");
    expect(workflow).toContain('Check Melbourne refresh window');
    expect(workflow).toContain('Australia/Melbourne');
    expect(workflow).toContain('4:30pm');
    expect(workflow).toContain('11:30pm');
  });
});
