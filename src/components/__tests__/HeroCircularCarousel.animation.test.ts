/**
 * T002: Unit tests for animation state and click queue
 *
 * Tests the isAnimating flag and click queue mechanism.
 * The new architecture uses `transitionend` (not setTimeout) to signal
 * completion.  The `currentAngle` accumulates without modulo so the CSS
 * transition always interpolates in the correct direction.
 *
 * Pure logic tested without DOM — mirrors carousel script internals.
 *
 * Traceability: FR-015, AC-16 through AC-19
 */

import { describe, test, expect } from 'vitest';

const STEP_DEG = 60; // degrees per step — matches component constant

// ─── 3D Cylinder animation controller ────────────────────────────────────────
// Mirrors the transitionend-based state machine inside HeroCircularCarousel.astro.
// Instead of setTimeout, callers invoke `fireTransitionEnd()` to simulate the
// CSS transition completing on the track element.

function makeAnimationController(totalSlides: number) {
  let currentIndex = 0;
  let currentAngle = 0;
  let isAnimating  = false;
  const queue: string[] = [];

  // Simulated transitionend callback (set when animation starts)
  let pendingTransitionEnd: (() => void) | null = null;

  function onAnimationComplete() {
    isAnimating = false;
    processQueue();
  }

  function processQueue() {
    if (queue.length === 0) return;
    const action = queue.shift()!;
    if (action === 'next') executeNext();
    else if (action === 'prev') executePrev();
  }

  function rotateToIndex(nextIdx: number, direction: 'next' | 'prev') {
    if (isAnimating || nextIdx === currentIndex) return;
    isAnimating = true;

    if (direction === 'next') {
      currentAngle -= STEP_DEG;
    } else {
      currentAngle += STEP_DEG;
    }
    currentIndex = nextIdx;

    // Register a one-shot transitionend callback
    pendingTransitionEnd = onAnimationComplete;
  }

  function nextIdx(): number {
    return (currentIndex + 1) % totalSlides;
  }

  function prevIdx(): number {
    return ((currentIndex - 1) % totalSlides + totalSlides) % totalSlides;
  }

  function executeNext() {
    rotateToIndex(nextIdx(), 'next');
  }

  function executePrev() {
    rotateToIndex(prevIdx(), 'prev');
  }

  function handleNext() {
    if (isAnimating) {
      queue.push('next');
      return;
    }
    executeNext();
  }

  function handlePrev() {
    if (isAnimating) {
      queue.push('prev');
      return;
    }
    executePrev();
  }

  // Simulate the CSS transitionend event firing
  function fireTransitionEnd() {
    if (pendingTransitionEnd) {
      const fn = pendingTransitionEnd;
      pendingTransitionEnd = null;
      fn();
    }
  }

  return {
    handleNext,
    handlePrev,
    fireTransitionEnd,
    getIsAnimating:  () => isAnimating,
    getCurrentIndex: () => currentIndex,
    getCurrentAngle: () => currentAngle,
    getQueue:        () => [...queue],
    getQueueLength:  () => queue.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Animation State — isAnimating flag', () => {
  test('isAnimating is false initially', () => {
    const ctrl = makeAnimationController(3);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('clicking next sets isAnimating = true during animation', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    expect(ctrl.getIsAnimating()).toBe(true);
  });

  test('clicking prev sets isAnimating = true during animation', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handlePrev();
    expect(ctrl.getIsAnimating()).toBe(true);
  });

  test('isAnimating returns to false after transitionend fires', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    expect(ctrl.getIsAnimating()).toBe(true);
    ctrl.fireTransitionEnd();
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('slide index advances after transitionend fires', () => {
    const ctrl = makeAnimationController(3);
    expect(ctrl.getCurrentIndex()).toBe(0);
    ctrl.handleNext();
    ctrl.fireTransitionEnd();
    expect(ctrl.getCurrentIndex()).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Animation State — currentAngle tracking', () => {
  test('currentAngle starts at 0', () => {
    const ctrl = makeAnimationController(3);
    expect(ctrl.getCurrentAngle()).toBe(0);
  });

  test('clicking next decrements currentAngle by STEP_DEG (60°)', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    expect(ctrl.getCurrentAngle()).toBe(-STEP_DEG);
  });

  test('clicking prev increments currentAngle by STEP_DEG (60°)', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handlePrev();
    expect(ctrl.getCurrentAngle()).toBe(STEP_DEG);
  });

  test('currentAngle accumulates without modulo (3 next clicks = −180°)', () => {
    const ctrl = makeAnimationController(6);
    ctrl.handleNext();
    ctrl.fireTransitionEnd();
    ctrl.handleNext();
    ctrl.fireTransitionEnd();
    ctrl.handleNext();
    ctrl.fireTransitionEnd();
    expect(ctrl.getCurrentAngle()).toBe(-3 * STEP_DEG);
  });

  test('currentAngle updates immediately when rotation starts (not on transitionend)', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    // Angle already updated — CSS transition uses this value right away
    expect(ctrl.getCurrentAngle()).toBe(-STEP_DEG);
    ctrl.fireTransitionEnd();
    // Angle unchanged after transitionend — it was set on start
    expect(ctrl.getCurrentAngle()).toBe(-STEP_DEG);
  });

  test('currentIndex updates immediately when rotation starts', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    // Index already advanced when rotateToIndex was called
    expect(ctrl.getCurrentIndex()).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Animation Queue — click queueing behavior', () => {
  test('queue is empty initially', () => {
    const ctrl = makeAnimationController(3);
    expect(ctrl.getQueueLength()).toBe(0);
  });

  test('clicking next while animating adds to queue', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext(); // starts animation
    ctrl.handleNext(); // should queue
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['next']);
  });

  test('clicking prev while animating adds to queue', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext(); // starts animation
    ctrl.handlePrev(); // should queue
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['prev']);
  });

  test('queue processes sequentially after transitionend fires', () => {
    const ctrl = makeAnimationController(5);
    ctrl.handleNext(); // index 0→1
    ctrl.handleNext(); // queued: 'next'
    ctrl.handleNext(); // queued: 'next'

    expect(ctrl.getQueueLength()).toBe(2);

    // Complete first animation → dequeues and starts second
    ctrl.fireTransitionEnd(); // index 1→2, starts next queued action
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getCurrentIndex()).toBe(2); // second animation already started

    ctrl.fireTransitionEnd(); // index 2→3, starts next queued action
    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getCurrentIndex()).toBe(3);
  });

  test('rapid 5 clicks execute in order without dropping any', () => {
    const ctrl = makeAnimationController(10);

    ctrl.handleNext(); // starts immediately
    ctrl.handleNext(); // queued [next]
    ctrl.handleNext(); // queued [next, next]
    ctrl.handleNext(); // queued [next, next, next]
    ctrl.handleNext(); // queued [next, next, next, next]

    expect(ctrl.getQueueLength()).toBe(4);

    ctrl.fireTransitionEnd(); // completes 1st, starts 2nd
    ctrl.fireTransitionEnd(); // completes 2nd, starts 3rd
    ctrl.fireTransitionEnd(); // completes 3rd, starts 4th
    ctrl.fireTransitionEnd(); // completes 4th, starts 5th
    ctrl.fireTransitionEnd(); // completes 5th

    expect(ctrl.getCurrentIndex()).toBe(5);
    expect(ctrl.getCurrentAngle()).toBe(-5 * STEP_DEG);
    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('mixed next and prev queue executes in correct order', () => {
    const ctrl = makeAnimationController(10);
    ctrl.handleNext(); // immediate: 0→1
    ctrl.handleNext(); // queued: next
    ctrl.handlePrev(); // queued: prev

    ctrl.fireTransitionEnd(); // 0→1 complete, dequeues next, starts 1→2
    ctrl.fireTransitionEnd(); // 1→2 complete, dequeues prev, starts 2→1
    ctrl.fireTransitionEnd(); // 2→1 complete

    expect(ctrl.getCurrentIndex()).toBe(1);
    expect(ctrl.getQueueLength()).toBe(0);
  });

  test('queue is empty after all animations complete', () => {
    const ctrl = makeAnimationController(5);
    ctrl.handleNext();
    ctrl.handleNext();

    ctrl.fireTransitionEnd();
    ctrl.fireTransitionEnd();

    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Animation State — no action while not animating', () => {
  test('handleNext when not animating does NOT add to queue', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    expect(ctrl.getQueueLength()).toBe(0); // executes directly, not queued
    expect(ctrl.getIsAnimating()).toBe(true);
  });

  test('handlePrev when not animating does NOT add to queue', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handlePrev();
    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Slide Index Looping with 3D angle', () => {
  test('next() loops slide index back to 0 from last slide', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 1
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 2
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 0 (loop)
    expect(ctrl.getCurrentIndex()).toBe(0);
  });

  test('currentAngle continues decreasing even when index wraps', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 1, angle −60
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 2, angle −120
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 0, angle −180
    // Angle is cumulative — no modulo
    expect(ctrl.getCurrentAngle()).toBe(-3 * STEP_DEG);
  });

  test('prev() loops slide index to last slide from 0', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handlePrev(); ctrl.fireTransitionEnd();
    expect(ctrl.getCurrentIndex()).toBe(2);
  });

  test('currentAngle increases on prev even when index wraps', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handlePrev(); ctrl.fireTransitionEnd(); // → 2, angle +60
    expect(ctrl.getCurrentAngle()).toBe(STEP_DEG);
  });
});
