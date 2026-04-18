import { describe, expect, test } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('COA-58 sponsor data', () => {
  test('sponsors.json exists and includes the MB Automation Victoria sponsor contract', () => {
    const raw = read('src/data/sponsors.json');
    const data = JSON.parse(raw) as {
      sponsors: Array<{ id: string; name: string; logo: string; link: string; joinedDate: string }>;
      sponsorCountThreshold: number;
      ctaLink: string;
    };

    expect(Array.isArray(data.sponsors)).toBe(true);
    expect(data.sponsors).toHaveLength(1);
    expect(data.sponsorCountThreshold).toBe(6);
    expect(data.ctaLink).toContain('mailto:hello@bendigophoenix.org.au?subject=Sponsorship%20Enquiry');

    const sponsor = data.sponsors[0];
    expect(sponsor).toMatchObject({
      id: 'mbauto',
      name: 'MB Automation Victoria',
      logo: '/images/sponsors/sponsor_mbauto.png',
      link: 'https://www.facebook.com/mb.automation.vic',
      joinedDate: '2024-01-15',
    });
    expect(existsSync(join(root, 'public/images/sponsors/sponsor_mbauto.png'))).toBe(true);
  });
});
