import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

const workflows = readdirSync('.github/workflows').filter(name => /\.ya?ml$/.test(name));

describe('evergreen site operation', () => {
  test('has no recurring data jobs or PlayHQ dependency in deployment', () => {
    for (const file of workflows) {
      const workflow = readFileSync(`.github/workflows/${file}`, 'utf8');
      expect(workflow).not.toMatch(/schedule:|cron:|PLAYHQ_|scrape-playhq|scores:refresh/);
    }
    expect(workflows).toContain('deploy.yml');
    const deploy = readFileSync('.github/workflows/deploy.yml', 'utf8');
    expect(deploy).toContain('npm run build');
    expect(deploy).toContain('npm run check:evergreen');
    expect(deploy).not.toContain("--exclude-glob 'live-data/**'");
  });
});
