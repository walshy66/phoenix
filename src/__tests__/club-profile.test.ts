import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const highLeverageTemplateFiles = [
  'src/layouts/BaseLayout.astro',
  'src/components/Footer.astro',
  'src/pages/contact.astro',
  'src/pages/seasons.astro',
  'src/pages/get-involved.astro',
];

describe('club profile config', () => {
  test('centralises reusable club identity, contact, social, meta and venue values', async () => {
    const { clubProfile } = await import('../config/club-profile');

    expect(clubProfile).toMatchObject({
      name: 'Bendigo Phoenix Basketball Club',
      legalName: 'Phoenix United Basketball Development Club Inc.',
      shortName: 'Bendigo Phoenix',
      teamPrefix: 'PHOENIX',
      location: {
        city: 'Bendigo',
        region: 'Central Victoria',
        state: 'VIC',
      },
      contact: {
        generalEmail: 'hello@bendigophoenix.org.au',
      },
      socials: {
        facebook: {
          url: 'https://facebook.com/phoenixunitedbasketball',
          handle: 'phoenixunitedbasketball',
        },
        instagram: {
          url: 'https://instagram.com/bendigophoenix',
          handle: '@bendigophoenix',
        },
      },
      meta: {
        siteTitle: 'Bendigo Phoenix Basketball',
        defaultDescription: 'Bendigo Phoenix Basketball Club — Where Community Meets Competition',
        siteUrl: 'https://bendigophoenix.org.au',
      },
      venues: {
        home: {
          name: 'Bendigo Stadium',
        },
      },
    });
  });

  test('layout, footer and high-leverage pages consume club profile instead of duplicating template identity values', () => {
    const forbiddenByFile = new Map([
      ['src/layouts/BaseLayout.astro', ['Bendigo Phoenix Basketball Club — Where Community Meets Competition', 'Bendigo Phoenix Basketball', 'https://bendigophoenix.org.au']],
      ['src/components/Footer.astro', ['Phoenix United Basketball Development Club Inc.', 'hello@bendigophoenix.org.au', 'https://facebook.com/phoenixunitedbasketball', 'https://instagram.com/bendigophoenix', 'Bendigo Stadium']],
      ['src/pages/contact.astro', ['hello@bendigophoenix.org.au', 'https://facebook.com/phoenixunitedbasketball', 'https://instagram.com/bendigophoenix', 'Bendigo Stadium']],
      ['src/pages/seasons.astro', ['hello@bendigophoenix.org.au']],
      ['src/pages/get-involved.astro', ['hello@bendigophoenix.org.au?subject=Sponsorship%20Enquiry', 'hello@bendigophoenix.org.au?subject=Volunteering%20Enquiry']],
    ]);

    for (const filePath of highLeverageTemplateFiles) {
      const source = readFileSync(filePath, 'utf8');
      expect(source, `${filePath} should import clubProfile`).toContain('clubProfile');

      for (const value of forbiddenByFile.get(filePath) ?? []) {
        expect(source, `${filePath} must not duplicate ${value}`).not.toContain(value);
      }
    }
  });
});
