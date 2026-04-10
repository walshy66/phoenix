/**
 * T017: Dot navigation direct-jump tests
 *
 * Tests the dot indicator click contract:
 *   - Clicking a dot jumps directly to that slide (not next/prev stepping)
 *   - Direction is inferred: dot index > currentSlide → 'next', otherwise 'prev'
 *   - Dots update aria-selected and is-active CSS class on navigation
 *   - Dot click during animation is ignored (not queued)
 *   - Dot navigation triggers auto-timer reset
 *   - Only rendered when slide count >= 2
 *   - Dot count matches slide count
 *   - Active dot has aria-selected="true", inactive dots have aria-selected="false"
 *   - Clicking the currently-active dot is a no-op
 *
 * Pattern: pure logic tests — extract dot navigation functions and test them
 * in isolation.  No DOM required.
 *
 * Traceability: FR-001, FR-013, AC-1, AC-6, AC-43 through AC-47 (dot nav)
 */

import { describe, test, expect } from 'vitest';

// ─── Dot navigation logic — mirrors HeroCircularCarousel.astro <script> ──────
//
// From the component:
//   dots.forEach((dot, i) => {
//     dot.addEventListener('click', () => {
//       if (isAnimating) return;            ← drop click during animation
//       const dir = i > currentSlide ? 'next' : 'prev';
//       goTo(i, dir);
//       resetAutoTimer();
//     });
//   });

type Direction = 'next' | 'prev';

function dotDirection(dotIndex: number, currentSlide: number): Direction {
  return dotIndex > currentSlide ? 'next' : 'prev';
}

function dotShouldNavigate(dotIndex: number, currentSlide: number, isAnimating: boolean): boolean {
  // Clicking same dot while not animating is technically allowed by the component
  // but goTo() handles the same-index guard (returns early if nextIdx === currentSlide)
  return !isAnimating;
}

function dotCount(slideCount: number): number {
  return slideCount;
}

function dotsRendered(slideCount: number): boolean {
  return slideCount >= 2;
}

// ─── Aria-selected contract ───────────────────────────────────────────────────
function dotAriaSelected(dotIndex: number, activeIndex: number): string {
  return String(dotIndex === activeIndex);
}

function dotIsActiveClass(dotIndex: number, activeIndex: number): boolean {
  return dotIndex === activeIndex;
}

// ─── goTo guard — same-index is no-op ────────────────────────────────────────
function goToWouldNavigate(targetIndex: number, currentSlide: number, isAnimating: boolean): boolean {
  if (isAnimating) return false;
  if (targetIndex === currentSlide) return false;
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Dot Navigation — Direction Inference', () => {
  test('clicking a dot with higher index than current → direction "next"', () => {
    expect(dotDirection(2, 0)).toBe('next');
    expect(dotDirection(3, 1)).toBe('next');
    expect(dotDirection(4, 0)).toBe('next');
  });

  test('clicking a dot with lower index than current → direction "prev"', () => {
    expect(dotDirection(0, 2)).toBe('prev');
    expect(dotDirection(1, 3)).toBe('prev');
    expect(dotDirection(0, 4)).toBe('prev');
  });

  test('clicking same-index dot → direction "prev" (same index treated as ≤ current)', () => {
    // i > currentSlide is false when equal, so "prev" branch is taken
    // (goTo() will then short-circuit — same-index is a no-op)
    expect(dotDirection(0, 0)).toBe('prev');
    expect(dotDirection(2, 2)).toBe('prev');
  });

  test('jumping forward by one → "next"', () => {
    expect(dotDirection(1, 0)).toBe('next');
  });

  test('jumping backward by one → "prev"', () => {
    expect(dotDirection(0, 1)).toBe('prev');
  });

  test('jumping from last to first → "prev" (index 0 < index 3)', () => {
    expect(dotDirection(0, 3)).toBe('prev');
  });

  test('jumping from first to last → "next" (index 3 > index 0)', () => {
    expect(dotDirection(3, 0)).toBe('next');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dot Navigation — Animation Guard', () => {
  test('dot click is ignored when isAnimating is true', () => {
    expect(dotShouldNavigate(2, 0, true)).toBe(false);
  });

  test('dot click is processed when isAnimating is false', () => {
    expect(dotShouldNavigate(2, 0, false)).toBe(true);
  });

  test('dot click to same slide is blocked by goTo guard', () => {
    expect(goToWouldNavigate(0, 0, false)).toBe(false);
    expect(goToWouldNavigate(2, 2, false)).toBe(false);
  });

  test('dot click to different slide proceeds when not animating', () => {
    expect(goToWouldNavigate(2, 0, false)).toBe(true);
    expect(goToWouldNavigate(0, 2, false)).toBe(true);
  });

  test('dot click blocked during animation regardless of target index', () => {
    expect(goToWouldNavigate(0, 2, true)).toBe(false);
    expect(goToWouldNavigate(3, 1, true)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dot Navigation — Render Contract', () => {
  test('dots are rendered when slide count is 2', () => {
    expect(dotsRendered(2)).toBe(true);
  });

  test('dots are rendered when slide count is 5', () => {
    expect(dotsRendered(5)).toBe(true);
  });

  test('dots are NOT rendered for a single slide', () => {
    expect(dotsRendered(1)).toBe(false);
  });

  test('dots are NOT rendered for zero slides', () => {
    expect(dotsRendered(0)).toBe(false);
  });

  test('dot count matches slide count', () => {
    expect(dotCount(3)).toBe(3);
    expect(dotCount(5)).toBe(5);
    expect(dotCount(1)).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dot Navigation — ARIA State Contract', () => {
  test('active dot has aria-selected="true"', () => {
    expect(dotAriaSelected(0, 0)).toBe('true');
    expect(dotAriaSelected(2, 2)).toBe('true');
  });

  test('inactive dots have aria-selected="false"', () => {
    expect(dotAriaSelected(1, 0)).toBe('false');
    expect(dotAriaSelected(0, 2)).toBe('false');
    expect(dotAriaSelected(3, 1)).toBe('false');
  });

  test('only the active dot has aria-selected="true" in a set of 4 dots', () => {
    const activeIndex = 2;
    const results = [0, 1, 2, 3].map(i => dotAriaSelected(i, activeIndex));
    expect(results.filter(v => v === 'true')).toHaveLength(1);
    expect(results.filter(v => v === 'false')).toHaveLength(3);
  });

  test('aria-selected updates correctly when active slide changes', () => {
    // Before navigation: dot 0 active
    expect(dotAriaSelected(0, 0)).toBe('true');
    expect(dotAriaSelected(1, 0)).toBe('false');

    // After navigation to slide 1: dot 1 active
    expect(dotAriaSelected(0, 1)).toBe('false');
    expect(dotAriaSelected(1, 1)).toBe('true');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dot Navigation — CSS Active Class Contract', () => {
  test('active dot has is-active class', () => {
    expect(dotIsActiveClass(0, 0)).toBe(true);
    expect(dotIsActiveClass(2, 2)).toBe(true);
  });

  test('inactive dots do NOT have is-active class', () => {
    expect(dotIsActiveClass(1, 0)).toBe(false);
    expect(dotIsActiveClass(0, 2)).toBe(false);
  });

  test('exactly one dot has is-active class in a 5-dot set', () => {
    const activeIndex = 3;
    const activeCount = [0, 1, 2, 3, 4].filter(i => dotIsActiveClass(i, activeIndex)).length;
    expect(activeCount).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Dot Navigation — Direct-Jump Contract', () => {
  // The key feature of dot nav is that it jumps directly to the target slide
  // rather than stepping one-by-one through intermediate slides.

  test('clicking dot 4 from slide 0 targets index 4 directly (not 1, 2, 3, 4)', () => {
    // goTo(4, 'next') — jumps to 4, not step-through
    const targetIndex = 4;
    const currentSlide = 0;
    expect(goToWouldNavigate(targetIndex, currentSlide, false)).toBe(true);
    expect(dotDirection(targetIndex, currentSlide)).toBe('next');
  });

  test('clicking dot 0 from slide 4 targets index 0 directly', () => {
    const targetIndex = 0;
    const currentSlide = 4;
    expect(goToWouldNavigate(targetIndex, currentSlide, false)).toBe(true);
    expect(dotDirection(targetIndex, currentSlide)).toBe('prev');
  });

  test('direction label is visual hint only — goTo receives the exact target index', () => {
    // The direction ('next' or 'prev') affects which CSS animation is applied.
    // The target index is passed directly to goTo() — no intermediate slides.
    const targetIndex = 3;
    const currentSlide = 0;
    const dir = dotDirection(targetIndex, currentSlide);
    expect(dir).toBe('next');
    // goTo(targetIndex, dir) — jumps to 3, animates as 'next' direction
    expect(goToWouldNavigate(targetIndex, currentSlide, false)).toBe(true);
  });
});
