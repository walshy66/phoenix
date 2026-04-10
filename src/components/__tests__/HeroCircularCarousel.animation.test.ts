/**
 * T002: Unit tests for animation state and click queue
 *
 * Tests the isAnimating flag and click queue mechanism.
 * Pure logic tested without DOM — mirrors carousel script internals.
 *
 * Traceability: FR-015, AC-16 through AC-19
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

// Simulates the carousel animation controller logic
// as it would exist in HeroCircularCarousel.astro <script>
function makeAnimationController(totalSlides: number, animationDurationMs = 700) {
  let currentSlide = 0;
  let isAnimating = false;
  const queue: string[] = [];
  let _timerCallback: (() => void) | null = null;

  // Simulate setting a timer (injectable for testing)
  let _setTimeoutFn: (fn: () => void, ms: number) => void = (fn, _ms) => {
    _timerCallback = fn;
  };

  function setTimeoutImpl(fn: typeof _setTimeoutFn) {
    _setTimeoutFn = fn;
  }

  // Flush the pending timer (used in tests to simulate animation completing)
  function flushTimer() {
    if (_timerCallback) {
      const fn = _timerCallback;
      _timerCallback = null;
      fn();
    }
  }

  function processQueue() {
    if (queue.length === 0) return;
    const action = queue.shift()!;
    if (action === 'next') executeNext();
    else if (action === 'prev') executePrev();
  }

  function executeNext() {
    isAnimating = true;
    const nextSlide = (currentSlide + 1) % totalSlides;
    _setTimeoutFn(() => {
      currentSlide = nextSlide;
      isAnimating = false;
      processQueue();
    }, animationDurationMs);
  }

  function executePrev() {
    isAnimating = true;
    const prevSlide = ((currentSlide - 1) % totalSlides + totalSlides) % totalSlides;
    _setTimeoutFn(() => {
      currentSlide = prevSlide;
      isAnimating = false;
      processQueue();
    }, animationDurationMs);
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

  return {
    handleNext,
    handlePrev,
    flushTimer,
    setTimeoutImpl,
    getIsAnimating: () => isAnimating,
    getCurrentSlide: () => currentSlide,
    getQueue: () => [...queue],
    getQueueLength: () => queue.length,
  };
}

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

  test('isAnimating returns to false after animation completes', () => {
    const ctrl = makeAnimationController(3);
    ctrl.handleNext();
    expect(ctrl.getIsAnimating()).toBe(true);
    ctrl.flushTimer();
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('slide advances after animation completes', () => {
    const ctrl = makeAnimationController(3);
    expect(ctrl.getCurrentSlide()).toBe(0);
    ctrl.handleNext();
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1);
  });
});

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

  test('queue processes sequentially after animation completes', () => {
    const ctrl = makeAnimationController(5);
    ctrl.handleNext(); // slide 0→1
    ctrl.handleNext(); // queued: 'next'
    ctrl.handleNext(); // queued: 'next'

    expect(ctrl.getQueueLength()).toBe(2);

    // Complete first animation → dequeues and starts second
    ctrl.flushTimer(); // slide 1→2, starts next queued action
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getCurrentSlide()).toBe(1); // first animation completed

    ctrl.flushTimer(); // slide 2→3, starts next queued action
    expect(ctrl.getQueueLength()).toBe(0); // queue drained
    expect(ctrl.getCurrentSlide()).toBe(2);
  });

  test('rapid 5 clicks execute in order without dropping any', () => {
    const ctrl = makeAnimationController(10);

    // 5 rapid next clicks
    ctrl.handleNext(); // starts immediately
    ctrl.handleNext(); // queued [next]
    ctrl.handleNext(); // queued [next, next]
    ctrl.handleNext(); // queued [next, next, next]
    ctrl.handleNext(); // queued [next, next, next, next]

    expect(ctrl.getQueueLength()).toBe(4);

    // Process all 5 animations in order
    ctrl.flushTimer(); // completes 1st, starts 2nd
    ctrl.flushTimer(); // completes 2nd, starts 3rd
    ctrl.flushTimer(); // completes 3rd, starts 4th
    ctrl.flushTimer(); // completes 4th, starts 5th
    ctrl.flushTimer(); // completes 5th

    // Should have advanced 5 slides total
    expect(ctrl.getCurrentSlide()).toBe(5);
    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('mixed next and prev queue executes in correct order', () => {
    const ctrl = makeAnimationController(10);
    ctrl.handleNext(); // immediate: 0→1
    ctrl.handleNext(); // queued: next
    ctrl.handlePrev(); // queued: prev

    ctrl.flushTimer(); // 0→1, dequeues next, starts 1→2
    ctrl.flushTimer(); // 1→2, dequeues prev, starts 2→1
    ctrl.flushTimer(); // 2→1 (note: third animation starts from slide 2 in the queue order, prev brings back to 1)

    expect(ctrl.getCurrentSlide()).toBe(1);
    expect(ctrl.getQueueLength()).toBe(0);
  });

  test('queue is empty after all animations complete', () => {
    const ctrl = makeAnimationController(5);
    ctrl.handleNext();
    ctrl.handleNext();

    ctrl.flushTimer();
    ctrl.flushTimer();

    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });
});

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
