/**
 * T008: Integration tests for touch swipe gesture (45px threshold)
 *
 * Tests the swipe-gesture detection logic: direction mapping, threshold
 * enforcement, queue integration during animation, and rapid-swipe ordering.
 *
 * Pattern: pure logic extraction — mirrors the touchstart/touchend handler
 * inside HeroCircularCarousel.astro <script>.  No DOM required.
 *
 * Traceability: FR-013, AC-7 through AC-10
 */

import { describe, test, expect } from 'vitest';

// ─── Swipe constants mirrored from the component ──────────────────────────────
const SWIPE_THRESHOLD = 45; // px — minimum horizontal distance to trigger a swipe

// ─── Swipe + carousel controller ─────────────────────────────────────────────
// Combines touch swipe detection with the queue-aware carousel state,
// mirroring the real touchstart/touchend listeners in the component.

function makeSwipeController(totalSlides: number, animDurationMs = 600) {
  let currentSlide = 0;
  let isAnimating  = false;
  const queue: string[] = [];

  // Swipe tracking (mirrors touchstart state variable)
  let touchStartX = 0;

  // Record which swipe actions fired (for assertion)
  const swipeLog: Array<'next' | 'prev'> = [];

  let timerFn: (() => void) | null = null;

  function processQueue() {
    if (queue.length === 0) return;
    const action = queue.shift()!;
    if (action === 'next') executeNext();
    else if (action === 'prev') executePrev();
  }

  function executeNext() {
    isAnimating = true;
    const nextIdx = (currentSlide + 1) % totalSlides;
    timerFn = () => {
      currentSlide = nextIdx;
      isAnimating  = false;
      processQueue();
    };
  }

  function executePrev() {
    isAnimating = true;
    const prevIdx = ((currentSlide - 1) % totalSlides + totalSlides) % totalSlides;
    timerFn = () => {
      currentSlide = prevIdx;
      isAnimating  = false;
      processQueue();
    };
  }

  function handleNext() {
    swipeLog.push('next');
    if (isAnimating) { queue.push('next'); return; }
    executeNext();
  }

  function handlePrev() {
    swipeLog.push('prev');
    if (isAnimating) { queue.push('prev'); return; }
    executePrev();
  }

  // Simulate touchstart event
  function touchStart(clientX: number) {
    touchStartX = clientX;
  }

  // Simulate touchend event — mirrors the component logic exactly:
  //   const dx = changedTouches[0].clientX - touchStartX;
  //   if (Math.abs(dx) >= SWIPE_THRESHOLD) {
  //     if (dx < 0) handleNext();  // swipe left = next
  //     else        handlePrev();  // swipe right = prev
  //   }
  function touchEnd(endClientX: number) {
    const dx = endClientX - touchStartX;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx < 0) handleNext();  // swipe left = next
      else        handlePrev();  // swipe right = prev
    }
  }

  function flushTimer() {
    if (timerFn) { const fn = timerFn; timerFn = null; fn(); }
  }

  return {
    touchStart,
    touchEnd,
    flushTimer,
    getSwipeLog:     () => [...swipeLog],
    getCurrentSlide: () => currentSlide,
    getIsAnimating:  () => isAnimating,
    getQueueLength:  () => queue.length,
    getQueue:        () => [...queue],
  };
}

// Helper: simulate a complete swipe gesture
function swipe(ctrl: ReturnType<typeof makeSwipeController>, deltaX: number) {
  ctrl.touchStart(0);
  ctrl.touchEnd(deltaX);
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Swipe Threshold', () => {
  test('swipe left 45px triggers next slide', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, -45); // exactly at threshold — swipe left
    expect(ctrl.getSwipeLog()).toContain('next');
  });

  test('swipe right 45px triggers previous slide', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, 45); // exactly at threshold — swipe right
    expect(ctrl.getSwipeLog()).toContain('prev');
  });

  test('swipe left > 45px triggers next slide', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, -100);
    expect(ctrl.getSwipeLog()).toContain('next');
  });

  test('swipe right > 45px triggers previous slide', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, 100);
    expect(ctrl.getSwipeLog()).toContain('prev');
  });

  test('swipe left < 45px does NOT trigger rotation', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, -44); // just under threshold
    expect(ctrl.getSwipeLog()).toHaveLength(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('swipe right < 45px does NOT trigger rotation', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, 44); // just under threshold
    expect(ctrl.getSwipeLog()).toHaveLength(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('swipe of 0px (tap) does NOT trigger rotation', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, 0);
    expect(ctrl.getSwipeLog()).toHaveLength(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('swipe of 1px does NOT trigger rotation', () => {
    const ctrl = makeSwipeController(3);
    swipe(ctrl, 1);
    expect(ctrl.getSwipeLog()).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Swipe Direction Mapping', () => {
  test('swipe left (negative dx) maps to next slide', () => {
    const ctrl = makeSwipeController(5);
    swipe(ctrl, -80); // swipe left
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1); // advanced forward
  });

  test('swipe right (positive dx) maps to previous slide', () => {
    const ctrl = makeSwipeController(5);
    // Start at slide 2 first
    swipe(ctrl, -80); ctrl.flushTimer(); // → slide 1
    swipe(ctrl, -80); ctrl.flushTimer(); // → slide 2

    swipe(ctrl, 80);  // swipe right → back to slide 1
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1);
  });

  test('swipe left on last slide loops to slide 0', () => {
    const ctrl = makeSwipeController(3);
    // Advance to last slide (index 2)
    swipe(ctrl, -80); ctrl.flushTimer(); // → 1
    swipe(ctrl, -80); ctrl.flushTimer(); // → 2
    // Swipe left on last slide
    swipe(ctrl, -80); ctrl.flushTimer(); // → 0 (loop)
    expect(ctrl.getCurrentSlide()).toBe(0);
  });

  test('swipe right on first slide loops to last slide', () => {
    const ctrl = makeSwipeController(3);
    // Swipe right from slide 0
    swipe(ctrl, 80); ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(2); // loops to last
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Swipe During Animation — Queue Integration', () => {
  test('swipe during animation is queued, not dropped', () => {
    const ctrl = makeSwipeController(5);
    swipe(ctrl, -80); // starts animation
    expect(ctrl.getIsAnimating()).toBe(true);
    swipe(ctrl, -80); // should queue
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['next']);
  });

  test('swipe while animating does NOT execute immediately', () => {
    const ctrl = makeSwipeController(5);
    swipe(ctrl, -80); // slide 0 → 1 (animating)
    swipe(ctrl, -80); // queued
    expect(ctrl.getCurrentSlide()).toBe(0); // still mid-animation
  });

  test('queued swipe executes after animation completes', () => {
    const ctrl = makeSwipeController(5);
    swipe(ctrl, -80); // 0→1 starts
    swipe(ctrl, -80); // queued
    ctrl.flushTimer(); // 0→1 completes → dequeues → 1→2 starts
    expect(ctrl.getCurrentSlide()).toBe(1);
    ctrl.flushTimer(); // 1→2 completes
    expect(ctrl.getCurrentSlide()).toBe(2);
  });

  test('swipe right during animation queues prev action', () => {
    const ctrl = makeSwipeController(5);
    swipe(ctrl, -80); // forward animation starts
    swipe(ctrl, 80);  // swipe right = prev — should queue
    expect(ctrl.getQueue()).toEqual(['prev']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Rapid Swipe Sequence', () => {
  test('multiple rapid swipes execute in order without dropping any', () => {
    const ctrl = makeSwipeController(10);
    swipe(ctrl, -80); // immediate
    swipe(ctrl, -80); // queued: [next]
    swipe(ctrl, -80); // queued: [next, next]
    swipe(ctrl, -80); // queued: [next, next, next]

    expect(ctrl.getQueueLength()).toBe(3);
    expect(ctrl.getSwipeLog()).toHaveLength(4);

    ctrl.flushTimer();
    ctrl.flushTimer();
    ctrl.flushTimer();
    ctrl.flushTimer();

    expect(ctrl.getCurrentSlide()).toBe(4);
    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('alternating swipe directions execute in correct order', () => {
    const ctrl = makeSwipeController(10);
    swipe(ctrl, -80); // immediate: 0→1
    swipe(ctrl, -80); // queue: [next]
    swipe(ctrl, 80);  // queue: [next, prev]

    ctrl.flushTimer(); // 0→1, starts next → 1→2
    ctrl.flushTimer(); // 1→2, starts prev → 2→1
    ctrl.flushTimer(); // 2→1

    expect(ctrl.getCurrentSlide()).toBe(1);
    expect(ctrl.getQueueLength()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Swipe State Reset Between Gestures', () => {
  test('second swipe gesture uses its own start point (not contaminated by prior)', () => {
    const ctrl = makeSwipeController(5);
    // First gesture: start at 0, end at -100 (swipe left → next)
    ctrl.touchStart(0);
    ctrl.touchEnd(-100);
    ctrl.flushTimer(); // settle

    // Second gesture: start at 200, end at 160 (dx = -40, under threshold)
    ctrl.touchStart(200);
    ctrl.touchEnd(160); // dx = -40 — must NOT trigger (under 45px)

    const log = ctrl.getSwipeLog();
    expect(log).toHaveLength(1); // only one action fired total
  });

  test('touchStart correctly resets reference point', () => {
    const ctrl = makeSwipeController(5);
    ctrl.touchStart(500);     // start at 500
    ctrl.touchEnd(500 - 50);  // dx = -50 → swipe left (next)
    expect(ctrl.getSwipeLog()).toContain('next');
    ctrl.flushTimer();

    // New gesture at different origin
    ctrl.touchStart(300);
    ctrl.touchEnd(300 + 50); // dx = +50 → swipe right (prev)
    expect(ctrl.getSwipeLog()).toContain('prev');
  });
});
