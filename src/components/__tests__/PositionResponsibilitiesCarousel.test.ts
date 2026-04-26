import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf-8');

describe('PositionResponsibilitiesCarousel', () => {
  test('renders dialog semantics for the player resource modal', () => {
    const source = read('src/components/PositionResponsibilitiesCarousel.astro');

    expect(source).toContain('role="dialog"');
    expect(source).toContain('aria-modal="true"');
    expect(source).toContain('aria-labelledby="position-responsibilities-title"');
    expect(source).toContain('data-position-carousel-open');
    expect(source).toContain('data-resource-modal-target="position-responsibilities"');
  });

  test('includes carousel navigation, keyboard support, and timer reset behavior', () => {
    const source = read('src/components/PositionResponsibilitiesCarousel.astro');

    expect(source).toContain('setInterval');
    expect(source).toContain('8000');
    expect(source).toContain('ArrowRight');
    expect(source).toContain('ArrowLeft');
    expect(source).toContain('Escape');
    expect(source).toContain('resetTimer');
    expect(source).toContain('focus trap');
    expect(source).toContain('prefers-reduced-motion');
  });

  test('uses six position images with descriptive alt text', () => {
    const source = read('src/components/PositionResponsibilitiesCarousel.astro');

    expect(source).toContain('/images/positions/roles_1.jpeg');
    expect(source).toContain('/images/positions/roles_pg.jpeg');
    expect(source).toContain('/images/positions/roles_sg.jpeg');
    expect(source).toContain('/images/positions/roles_sf.jpeg');
    expect(source).toContain('/images/positions/roles_pf.jpeg');
    expect(source).toContain('/images/positions/roles_c.jpeg');
  });

  test('is surfaced as a normal resource card in both player and coaching sections', () => {
    const source = read('src/pages/resources/index.astro');

    expect(source).toContain("createPositionResponsibilitiesResource('player_resources'");
    expect(source).toContain("createPositionResponsibilitiesResource('coaching_resources'");
    expect(source).toContain("modalTarget: 'position-responsibilities'");
  });

  test('resource cards can render a modal-trigger button', () => {
    const source = read('src/components/ResourceItem.astro');

    expect(source).toContain('data-resource-modal-target');
    expect(source).toContain('isModalTrigger');
    expect(source).toContain('button');
  });
});
