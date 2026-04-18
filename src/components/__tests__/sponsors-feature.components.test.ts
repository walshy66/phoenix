import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('COA-58 sponsor component contracts', () => {
  test('SponsorCard renders secure external sponsor links and graceful fallback handling', () => {
    const content = read('src/components/SponsorCard.astro');

    expect(content).toContain('target="_blank"');
    expect(content).toContain('rel="noopener noreferrer"');
    expect(content).toContain('aria-label={`Visit ${sponsor.name} (opens in new tab)`}');
    expect(content).toContain('alt={`${sponsor.name} logo`}');
    expect(content).toContain('loading={loading}');
    expect(content).toContain('decoding={loadingMode}');
    expect(content).toContain('onerror="this.hidden=true; this.previousElementSibling?.classList.remove(\'hidden\');"');
    expect(content).toContain('data-testid={`sponsor-card-${sponsor.id}`}');
    expect(content).toContain("layout === 'carousel'");
  });

  test('SponsorStrip restores the scrolling sponsor strip with the first logo card and CTA cards', () => {
    const content = read('src/components/SponsorStrip.astro');

    expect(content).toContain('OUR PROUD SPONSORS');
    expect(content).toContain("/images/sponsors/sponsor_mbauto.png");
    expect(content).toContain('MB Automation Victoria logo');
    expect(content).toContain('Become a Sponsor');
    expect(content).toContain('mailto:hello@bendigophoenix.org.au?subject=Sponsorship%20Enquiry');
    expect(content).toContain('marquee-track flex gap-6 w-max');
  });
});
