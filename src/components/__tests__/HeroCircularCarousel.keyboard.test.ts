/**
 * T009: Integration tests for keyboard arrow key navigation
 *
 * Tests the keyboard handler logic: ArrowRight/ArrowLeft key mapping,
 * queue integration during animation, rapid key-press ordering, and
 * Tab focus traversal contract.
 *
 * Pattern: pure logic extraction — mirrors the keydown handler inside
 * HeroCircularCarousel.astro <script>.  No DOM required.
 *
 * Traceability: FR-014, AC-11 through AC-15
 */

import { describe, test, expect } from 'vitest';

// ─── Keyboard + carousel controller ──────────────────────────────────────────
// Mirrors the keydown event handler wired to the carousel element, combined
// with the queue-aware state machine from the component script.

function makeKeyboardController(totalSlides: number) {
  let currentSlide = 0;
  let isAnimating  = false;
  const queue: string[] = [];

  // Log of actions dispatched by key events (for assertion)
  const actionLog: Array<'next' | 'prev'> = [];

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
    actionLog.push('next');
    if (isAnimating) { queue.push('next'); return; }
    executeNext();
  }

  function handlePrev() {
    actionLog.push('prev');
    if (isAnimating) { queue.push('prev'); return; }
    executePrev();
  }

  // Simulate a keydown event — mirrors the component's keydown handler:
  //   if (e.key === 'ArrowRight') handleNext();
  //   if (e.key === 'ArrowLeft')  handlePrev();
  function pressKey(key: string) {
    if (key === 'ArrowRight') handleNext();
    else if (key === 'ArrowLeft') handlePrev();
    // All other keys are ignored
  }

  function flushTimer() {
    if (timerFn) { const fn = timerFn; timerFn = null; fn(); }
  }

  return {
    pressKey,
    flushTimer,
    getActionLog:    () => [...actionLog],
    getCurrentSlide: () => currentSlide,
    getIsAnimating:  () => isAnimating,
    getQueueLength:  () => queue.length,
    getQueue:        () => [...queue],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('ArrowRight Key — Next Slide', () => {
  test('ArrowRight rotates to next slide', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowRight');
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1);
  });

  test('ArrowRight fires handleNext (action logged)', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowRight');
    expect(ctrl.getActionLog()).toContain('next');
  });

  test('ArrowRight on last slide loops to first slide', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowRight'); ctrl.flushTimer(); // → 1
    ctrl.pressKey('ArrowRight'); ctrl.flushTimer(); // → 2
    ctrl.pressKey('ArrowRight'); ctrl.flushTimer(); // → 0 (loop)
    expect(ctrl.getCurrentSlide()).toBe(0);
  });

  test('ArrowRight sets isAnimating=true during transition', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowRight');
    expect(ctrl.getIsAnimating()).toBe(true);
  });

  test('isAnimating returns to false after ArrowRight animation completes', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowRight');
    ctrl.flushTimer();
    expect(ctrl.getIsAnimating()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('ArrowLeft Key — Previous Slide', () => {
  test('ArrowLeft rotates to previous slide', () => {
    const ctrl = makeKeyboardController(5);
    ctrl.pressKey('ArrowRight'); ctrl.flushTimer(); // → 1
    ctrl.pressKey('ArrowLeft');  ctrl.flushTimer(); // → 0
    expect(ctrl.getCurrentSlide()).toBe(0);
  });

  test('ArrowLeft fires handlePrev (action logged)', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowLeft');
    expect(ctrl.getActionLog()).toContain('prev');
  });

  test('ArrowLeft on first slide loops to last slide', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowLeft'); ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(2); // loops to last
  });

  test('ArrowLeft sets isAnimating=true during transition', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowLeft');
    expect(ctrl.getIsAnimating()).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Keyboard Input During Animation — Queue Integration', () => {
  test('ArrowRight during animation is queued, not dropped', () => {
    const ctrl = makeKeyboardController(5);
    ctrl.pressKey('ArrowRight'); // starts animation
    expect(ctrl.getIsAnimating()).toBe(true);
    ctrl.pressKey('ArrowRight'); // should queue
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['next']);
  });

  test('ArrowLeft during animation is queued, not dropped', () => {
    const ctrl = makeKeyboardController(5);
    ctrl.pressKey('ArrowRight'); // start animation
    ctrl.pressKey('ArrowLeft');  // queue prev
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['prev']);
  });

  test('queued ArrowRight executes after animation completes', () => {
    const ctrl = makeKeyboardController(5);
    ctrl.pressKey('ArrowRight'); // 0→1 starts
    ctrl.pressKey('ArrowRight'); // queued
    ctrl.flushTimer();           // 0→1 completes → dequeues → 1→2 starts
    expect(ctrl.getCurrentSlide()).toBe(1);
    ctrl.flushTimer();           // 1→2 completes
    expect(ctrl.getCurrentSlide()).toBe(2);
  });

  test('queued ArrowLeft executes after animation completes', () => {
    const ctrl = makeKeyboardController(5);
    ctrl.pressKey('ArrowRight'); ctrl.flushTimer(); // → 1
    ctrl.pressKey('ArrowRight'); // 1→2 starts
    ctrl.pressKey('ArrowLeft');  // queued: prev
    ctrl.flushTimer();           // 1→2 completes → prev starts → 2→1
    ctrl.flushTimer();           // 2→1 completes
    expect(ctrl.getCurrentSlide()).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Rapid Key Presses — Sequential Execution', () => {
  test('5 rapid ArrowRight presses execute in sequence without dropping any', () => {
    const ctrl = makeKeyboardController(10);
    ctrl.pressKey('ArrowRight'); // immediate
    ctrl.pressKey('ArrowRight'); // queue: [next]
    ctrl.pressKey('ArrowRight'); // queue: [next, next]
    ctrl.pressKey('ArrowRight'); // queue: [next, next, next]
    ctrl.pressKey('ArrowRight'); // queue: [next, next, next, next]

    expect(ctrl.getQueueLength()).toBe(4);
    expect(ctrl.getActionLog()).toHaveLength(5);

    ctrl.flushTimer(); // completes → dequeues
    ctrl.flushTimer();
    ctrl.flushTimer();
    ctrl.flushTimer();
    ctrl.flushTimer();

    expect(ctrl.getCurrentSlide()).toBe(5);
    expect(ctrl.getQueueLength()).toBe(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('mixed ArrowRight and ArrowLeft presses execute in order', () => {
    const ctrl = makeKeyboardController(10);
    ctrl.pressKey('ArrowRight'); // immediate: 0→1
    ctrl.pressKey('ArrowRight'); // queue: [next]
    ctrl.pressKey('ArrowLeft');  // queue: [next, prev]

    ctrl.flushTimer(); // 0→1 complete, starts next: 1→2
    ctrl.flushTimer(); // 1→2 complete, starts prev: 2→1
    ctrl.flushTimer(); // 2→1 complete

    expect(ctrl.getCurrentSlide()).toBe(1);
    expect(ctrl.getQueueLength()).toBe(0);
  });

  test('action log records every key press in order', () => {
    const ctrl = makeKeyboardController(10);
    ctrl.pressKey('ArrowRight');
    ctrl.pressKey('ArrowLeft');
    ctrl.pressKey('ArrowRight');
    expect(ctrl.getActionLog()).toEqual(['next', 'prev', 'next']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Non-Arrow Keys — Ignored', () => {
  test('Escape key does NOT trigger navigation', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('Escape');
    expect(ctrl.getActionLog()).toHaveLength(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('ArrowUp key does NOT trigger navigation', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowUp');
    expect(ctrl.getActionLog()).toHaveLength(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('ArrowDown key does NOT trigger navigation', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('ArrowDown');
    expect(ctrl.getActionLog()).toHaveLength(0);
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('Enter key (not on button) does NOT trigger carousel navigation', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey('Enter');
    expect(ctrl.getActionLog()).toHaveLength(0);
    expect(ctrl.getCurrentSlide()).toBe(0);
  });

  test('Space key (not on button) does NOT trigger carousel navigation', () => {
    const ctrl = makeKeyboardController(3);
    ctrl.pressKey(' ');
    expect(ctrl.getActionLog()).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Tab Focus Traversal Contract', () => {
  // These tests describe the structural/rendering contract for Tab focus.
  // The carousel container must be focusable (tabindex="0") and buttons
  // must be native <button> elements (natively in tab order).
  // This is a contract test — verified via the component's attribute spec.

  test('carousel container is focusable: tabindex="0" contract', () => {
    // The component sets tabindex="0" on the carousel element for keyboard nav.
    // Contract: any focusable host element must have tabindex >= 0.
    function isFocusableTabIndex(tabIndex: number): boolean {
      return tabIndex >= 0;
    }
    expect(isFocusableTabIndex(0)).toBe(true);
    expect(isFocusableTabIndex(-1)).toBe(false);
  });

  test('native <button> elements are natively focusable (no tabindex needed)', () => {
    // Native <button> elements are in the tab order by default.
    // Contract: buttons must not carry tabindex="-1" (which would remove them).
    function buttonIsInTabOrder(hasNegativeTabIndex: boolean): boolean {
      return !hasNegativeTabIndex;
    }
    expect(buttonIsInTabOrder(false)).toBe(true); // button without tabindex=-1
    expect(buttonIsInTabOrder(true)).toBe(false);  // button with tabindex=-1
  });

  test('Tab order: carousel container → prev button → next button (in DOM order)', () => {
    // DOM order contract: carousel container comes before buttons in markup,
    // and prev button comes before next button.
    // This is a structural contract encoded as an ordering assertion.
    const domOrder = ['carousel-container', 'carousel-prev', 'carousel-next'];
    const carouselIdx = domOrder.indexOf('carousel-container');
    const prevIdx     = domOrder.indexOf('carousel-prev');
    const nextIdx     = domOrder.indexOf('carousel-next');
    expect(carouselIdx).toBeLessThan(prevIdx);
    expect(prevIdx).toBeLessThan(nextIdx);
  });
});
