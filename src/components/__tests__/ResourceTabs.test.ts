import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8');

describe('ResourceTabs', () => {
  test('renders a horizontal mobile carousel with gradient affordances', () => {
    const tabs = read('src/components/ResourceTabs.astro');

    expect(tabs).toContain('data-resource-tabs-scroller');
    expect(tabs).toContain('overflow-x-auto scroll-smooth');
    expect(tabs).toContain('data-tab-fade-left');
    expect(tabs).toContain('data-tab-fade-right');
  });

  test('supports keyboard navigation and active tab focus management', () => {
    const tabs = read('src/components/ResourceTabs.astro');

    expect(tabs).toContain('ArrowRight');
    expect(tabs).toContain('ArrowLeft');
    expect(tabs).toContain('Home');
    expect(tabs).toContain('End');
    expect(tabs).toContain('scrollIntoView');
  });

  test('preserves tab semantics for the resources page', () => {
    const tabs = read('src/components/ResourceTabs.astro');

    expect(tabs).toContain('role="tablist"');
    expect(tabs).toContain('role="tab"');
    expect(tabs).toContain('aria-selected');
    expect(tabs).toContain('aria-controls');
  });
});
