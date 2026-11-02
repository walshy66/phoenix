import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');

describe('evergreen navigation and shared page shell', () => {
  test('navigation exposes only the agreed evergreen destinations', () => {
    const nav = read('src/components/Navbar.astro');
    for (const href of ['/', '/play-basketball', '/about', '/get-involved', '/resources', '/contact']) {
      expect(nav).toContain(`href: '${href}'`);
    }
    expect(nav).not.toMatch(/href: '\/(seasons|teams|scores)'/);
  });
  test('retained and replacement pages use the shared layout and responsive hero sizing', () => {
    for (const route of ['about', 'play-basketball', 'contact', 'get-involved', 'resources/index']) {
      const content = read(`src/pages/${route}.astro`);
      expect(content).toContain('<BaseLayout');
      expect(content).toContain('py-12');
      expect(content).toContain('lg:py-8');
    }
  });
  test('resources hero remains free of decorative circles', () => {
    const resources = read('src/pages/resources/index.astro');
    expect(resources).not.toContain('-bottom-16 -left-16');
    expect(resources).not.toContain('-top-16 -right-16');
  });
});
