import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('COA-58 sponsor page integration', () => {
  test('home page renders the sponsor strip with the restored scrolling cards', () => {
    const content = read('src/pages/index.astro');

    expect(content).toContain("import SponsorStrip from '../components/SponsorStrip.astro';");
    expect(content).toContain('<SponsorStrip />');
  });

  test('get-involved page uses slot 1 for the sponsor logo and preserves the remaining grid placeholders', () => {
    const content = read('src/pages/get-involved.astro');

    expect(content).toContain("import SponsorCard from '../components/SponsorCard.astro';");
    expect(content).toContain("import sponsorsData from '../data/sponsors.json';");
    expect(content).toContain('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4');
    expect(content).toContain('sponsorsData.sponsors.length > 0');
    expect(content).toContain('<SponsorCard sponsor={sponsorsData.sponsors[0]} layout="grid" isFirstSponsor />');
    expect(content).toContain('mailto:hello@bendigophoenix.org.au?subject=Sponsorship%20Enquiry');
    expect(content).toContain('your logo here');
    expect(content).toContain('OUR PROUD SPONSORS');
  });
});
