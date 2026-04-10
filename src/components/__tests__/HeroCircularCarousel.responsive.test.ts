/**
 * T011 / T015: Responsive layout tests — breakpoint scaling and portrait aspect ratio
 *
 * Tests the sizing contract for the carousel container across four
 * canonical breakpoints (320px, 768px, 1024px, 1920px) and verifies
 * the 3:4 portrait aspect ratio is maintained.
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
//   Tablet  (768–1023):  min(80vw, 400)        ← 80vw or 400px fixed
//   Desktop (1024+):     450                   ← fixed 450px
//   Ultra-wide (1920+):  450                   ← no further scaling
//
// Minimum clamp: never narrower than 280px.

const MIN_WIDTH = 280; // px — hard minimum

function containerWidth(vw: number): number {
  let w: number;
  if (vw < 768) {
    // Mobile: 90vw or viewport minus 32px padding (16px each side)
    w = Math.min(vw * 0.9, vw - 32);
  } else if (vw < 1024) {
    // Tablet: 80vw or 400px
    w = Math.min(vw * 0.8, 400);
  } else {
    // Desktop and ultra-wide: fixed 450px
    w = 450;
  }
  // Apply minimum clamp
  return Math.max(w, MIN_WIDTH);
}

// ─── Portrait aspect ratio helper ────────────────────────────────────────────
// The carousel viewport uses aspect-ratio: 3 / 4
// Height = width × (4/3)

function viewportHeight(width: number): number {
  return width * (4 / 3);
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
    // Should not exceed vw - 32px (leaves padding on each side)
    expect(w).toBeLessThanOrEqual(vw - 32);
  });

  test('container width is at least 280px minimum', () => {
    const w = containerWidth(vw);
    expect(w).toBeGreaterThanOrEqual(MIN_WIDTH);
  });

  test('portrait aspect ratio (3:4) is maintained at 320px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    const ratio = aspectRatio(w, h);
    // 3:4 = 0.75
    expect(ratio).toBeCloseTo(0.75, 5);
  });

  test('portrait height is taller than width (portrait orientation)', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(h).toBeGreaterThan(w);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Tablet Breakpoint — 768px viewport', () => {
  const vw = 768;

  test('container width is at most 400px at 768px', () => {
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(400);
  });

  test('container width is at most 80vw at 768px', () => {
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw * 0.8);
  });

  test('portrait aspect ratio (3:4) maintained at 768px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(aspectRatio(w, h)).toBeCloseTo(0.75, 5);
  });

  test('container is readable — width >= 300px at tablet', () => {
    const w = containerWidth(vw);
    expect(w).toBeGreaterThanOrEqual(300);
  });

  test('tablet at 1023px stays under 400px', () => {
    const w = containerWidth(1023);
    expect(w).toBeLessThanOrEqual(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Desktop Breakpoint — 1024px viewport', () => {
  const vw = 1024;

  test('container width is fixed 450px at 1024px', () => {
    const w = containerWidth(vw);
    expect(w).toBe(450);
  });

  test('portrait aspect ratio (3:4) maintained at 1024px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(aspectRatio(w, h)).toBeCloseTo(0.75, 5);
  });

  test('desktop at 1440px still uses 450px (no up-scaling)', () => {
    const w = containerWidth(1440);
    expect(w).toBe(450);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Ultra-wide Breakpoint — 1920px viewport', () => {
  const vw = 1920;

  test('container width is fixed 450px at 1920px (no scaling beyond desktop)', () => {
    const w = containerWidth(vw);
    expect(w).toBe(450);
  });

  test('portrait aspect ratio (3:4) maintained at 1920px', () => {
    const w = containerWidth(vw);
    const h = viewportHeight(w);
    expect(aspectRatio(w, h)).toBeCloseTo(0.75, 5);
  });

  test('ultra-wide does not cause carousel to grow beyond 450px', () => {
    const w = containerWidth(2560);
    expect(w).toBe(450);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Portrait Aspect Ratio (3:4) Invariant', () => {
  const breakpoints = [320, 375, 414, 768, 1024, 1440, 1920];

  for (const vw of breakpoints) {
    test(`aspect ratio is 3:4 at ${vw}px viewport`, () => {
      const w = containerWidth(vw);
      const h = viewportHeight(w);
      expect(aspectRatio(w, h)).toBeCloseTo(0.75, 5);
    });
  }

  test('height is always greater than width (portrait, not landscape)', () => {
    for (const vw of breakpoints) {
      const w = containerWidth(vw);
      const h = viewportHeight(w);
      expect(h).toBeGreaterThan(w);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Device Rotation — Landscape Handling', () => {
  // When a phone rotates to landscape, vw >> vh.
  // The carousel should stay within visible bounds.
  // Contract: width never exceeds min(450, vw) — no overflow.

  test('landscape mobile (568px wide): container width within viewport', () => {
    const vw = 568; // iPhone SE landscape
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw);
  });

  test('landscape tablet (1024px wide): container uses 450px fixed', () => {
    const vw = 1024; // iPad landscape
    const w = containerWidth(vw);
    expect(w).toBeLessThanOrEqual(vw);
    expect(w).toBe(450); // hits desktop breakpoint
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
  // These tests verify the CSS sizing decisions encoded in the component:
  //   .carousel-container: clamp-based width at different breakpoints.
  // They document the intent and serve as regression tests for CSS edits.

  test('mobile formula: min(90vw, vw - 32) — preserves 16px horizontal padding', () => {
    // At 360px: min(324, 328) = 324
    const vw = 360;
    const expected = Math.max(Math.min(vw * 0.9, vw - 32), MIN_WIDTH);
    expect(containerWidth(vw)).toBe(expected);
  });

  test('tablet formula: min(80vw, 400) — caps at 400px before desktop', () => {
    // At 768px: min(614.4, 400) = 400
    const vw = 768;
    expect(containerWidth(vw)).toBe(400);
  });

  test('desktop formula: fixed 450px — no viewport-relative scaling', () => {
    expect(containerWidth(1024)).toBe(450);
    expect(containerWidth(1600)).toBe(450);
    expect(containerWidth(1920)).toBe(450);
  });

  test('minimum width of 280px prevents carousel from becoming unusable', () => {
    // Even at very narrow viewport (e.g., 300px), stays at 280px minimum
    const w = containerWidth(300);
    expect(w).toBeGreaterThanOrEqual(MIN_WIDTH);
  });
});
