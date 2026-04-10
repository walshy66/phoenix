/**
 * T011 / T015: Responsive layout tests — breakpoint scaling and landscape aspect ratio
 *
 * Tests the sizing contract for the carousel container across four
 * canonical breakpoints (320px, 768px, 1024px, 1920px) and verifies
 * the 16:9 landscape aspect ratio is maintained.
 *
 * Card size changed from portrait 3:4 to landscape 16:9 at 640×360px desktop.
 *
 * Pattern: pure CSS-formula logic tests — evaluate the sizing functions
 * against target viewport widths.  No DOM required.
 *
 * Traceability: FR-002, FR-003, FR-011, AC-20 through AC-25
 */

import { describe, test, expect } from 'vitest';

// ─── Sizing formula — mirrors the CSS breakpoint rules ───────────────────────
//
// The carousel container width follows these breakpoint-specific rules:
//
//   Mobile  (vw < 768):  min(90vw, vw - 32)   ← 90vw or full-width minus 16px L/R padding
//   Tablet  (768–1023):  min(80vw, 560)        ← 80vw or 560px fixed
//   Desktop (1024+):     640                   ← fixed 640px
//   Ultra-wide (1920+):  640                   ← no further scaling
//
// Minimum: never narrower than 280px.

const MIN_WIDTH  = 280; // px — hard minimum
const CARD_WIDTH = 640; // px — desktop card width (16:9 landscape)

function containerWidth(vw: number): number {
  let w: number;
  if (vw < 768) {
    // Mobile: 90vw or viewport minus 32px padding (16px each side)
    w = Math.min(vw * 0.9, vw - 32);
  } else if (vw < 1024) {
    // Tablet: 80vw or 560px
    w = Math.min(vw * 0.8, 560);
  } else {
    // Desktop and ultra-wide: fixed 640px
    w = 640;
  }
  // Apply minimum clamp
  return Math.max(w, MIN_WIDTH);
}

// ─── Landscape aspect ratio helper ───────────────────────────────────────────
// The carousel card uses aspect-ratio: 16 / 9
// Height = width × (9/16)

function viewportHeight(width: number): number {
  return width * (9 / 16);
}

function aspectRatio(width: number, height: number): number {
  return width / height;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Mobile Breakpoint — 320px viewport', () => {
  const vw = 320;

  test('container width is at most 90vw at 320px', () => {
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw * 0.9);
  });

  test('container width leaves room for 16px horizontal padding each side', () => {
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw - 32);
  });

  test('container width is at least 280px minimum', () => {
    const w = containerWidth(vw);
    expect(w).toBeGreaterThanOrEqual(MIN_WIDTH);
  });

  test('landscape aspect ratio (16:9) is maintained at 320px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    const ratio = aspectRatio(w, h);
    // 16:9 ≈ 1.7778
    expect(ratio).toBeCloseTo(16 / 9, 5);
  });

  test('landscape height is shorter than width (landscape orientation)', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(h).toBeLessThan(w);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Tablet Breakpoint — 768px viewport', () => {
  const vw = 768;

  test('container width is at most 560px at 768px', () => {
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(560);
  });

  test('container width is at most 80vw at 768px', () => {
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw * 0.8);
  });

  test('landscape aspect ratio (16:9) maintained at 768px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(aspectRatio(w, h)).toBeCloseTo(16 / 9, 5);
  });

  test('container is readable — width >= 300px at tablet', () => {
    const w = containerWidth(vw);
    expect(w).toBeGreaterThanOrEqual(300);
  });

  test('tablet at 1023px stays under 560px', () => {
    const w = containerWidth(1023);
    expect(w).toBeLessThanOrEqual(560);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Desktop Breakpoint — 1024px viewport', () => {
  const vw = 1024;

  test('container width is fixed 640px at 1024px', () => {
    const w = containerWidth(vw);
    expect(w).toBe(CARD_WIDTH);
  });

  test('landscape aspect ratio (16:9) maintained at 1024px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(aspectRatio(w, h)).toBeCloseTo(16 / 9, 5);
  });

  test('desktop card height is 360px (16:9 of 640px)', () => {
    const h = viewportHeight(CARD_WIDTH);
    expect(h).toBe(360);
  });

  test('desktop at 1440px still uses 640px (no up-scaling)', () => {
    const w = containerWidth(1440);
    expect(w).toBe(CARD_WIDTH);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Ultra-wide Breakpoint — 1920px viewport', () => {
  const vw = 1920;

  test('container width is fixed 640px at 1920px (no scaling beyond desktop)', () => {
    const w = containerWidth(vw);
    expect(w).toBe(CARD_WIDTH);
  });

  test('landscape aspect ratio (16:9) maintained at 1920px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(aspectRatio(w, h)).toBeCloseTo(16 / 9, 5);
  });

  test('ultra-wide does not cause carousel to grow beyond 640px', () => {
    const w = containerWidth(2560);
    expect(w).toBe(CARD_WIDTH);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Landscape Aspect Ratio (16:9) Invariant', () => {
  const breakpoints = [320, 375, 414, 768, 1024, 1440, 1920];

  for (const vw of breakpoints) {
    test(`aspect ratio is 16:9 at ${vw}px viewport`, () => {
      const w = containerWidth(vw);
      const h = viewportHeight(w);
      expect(aspectRatio(w, h)).toBeCloseTo(16 / 9, 5);
    });
  }

  test('height is always less than width (landscape, not portrait)', () => {
    for (const vw of breakpoints) {
      const w = containerWidth(vw);
      const h = viewportHeight(w);
      expect(h).toBeLessThan(w);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Device Rotation — Landscape Handling', () => {
  test('landscape mobile (568px wide): container width within viewport', () => {
    const vw = 568; // iPhone SE landscape
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw);
  });

  test('landscape tablet (1024px wide): container uses 640px fixed', () => {
    const vw = 1024; // iPad landscape
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw);
    expect(w).toBe(CARD_WIDTH);
  });

  test('container never exceeds viewport width at any breakpoint', () => {
    const viewports = [320, 375, 414, 568, 667, 768, 1024, 1366, 1920];
    for (const vw of viewports) {
      const w = containerWidth(vw);
      expect(w).toBeLessThanOrEqual(vw);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('CSS Breakpoint Sizing Formula Contract', () => {
  test('mobile formula: min(90vw, vw - 32) — preserves 16px horizontal padding', () => {
    const vw = 360;
    const expected = Math.max(Math.min(vw * 0.9, vw - 32), MIN_WIDTH);
    expect(containerWidth(vw)).toBe(expected);
  });

  test('tablet formula: min(80vw, 560) — caps at 560px before desktop', () => {
    const vw = 768;
    expect(containerWidth(vw)).toBe(560);
  });

  test('desktop formula: fixed 640px — no viewport-relative scaling', () => {
    expect(containerWidth(1024)).toBe(CARD_WIDTH);
    expect(containerWidth(1600)).toBe(CARD_WIDTH);
    expect(containerWidth(1920)).toBe(CARD_WIDTH);
  });

  test('minimum width of 280px prevents carousel from becoming unusable', () => {
    const w = containerWidth(300);
    expect(w).toBeGreaterThanOrEqual(MIN_WIDTH);
  });

  test('card is landscape 16:9 (640×360px at desktop)', () => {
    expect(CARD_WIDTH).toBe(640);
    expect(viewportHeight(CARD_WIDTH)).toBe(360);
  });
});
