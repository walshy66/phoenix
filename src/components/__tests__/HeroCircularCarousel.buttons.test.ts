/**
 * T007: Contract tests for next/prev button interaction
 *
 * Tests button behaviour: focusability contract, ARIA state during animation,
 * re-enablement after animation, focus retention, and keyboard activation
 * (Enter/Space).
 *
 * Pattern: pure logic extraction — mirrors the carousel script internals.
 * No DOM required; uses the button-interaction controller factory.
 *
 * Traceability: FR-014, AC-11 through AC-15
 */

import { describe, test, expect } from 'vitest';

// ─── Button interaction controller ────────────────────────────────────────────
// Mirrors the button-related state managed inside HeroCircularCarousel.astro
// <script>.  Buttons are NEVER hard-disabled in the component (FR-015 / T006
// spec); instead they use aria-disabled and queue clicks.  This factory
// captures the aria-disabled toggling and queue behaviour for button presses.

interface ButtonState {
  ariaDisabled: boolean;   // true while animation is running
  focused: boolean;        // whether button retains focus
  clickCount: number;      // total clicks received
}

function makeButtonController(totalSlides: number, animDurationMs = 600) {
  let currentSlide = 0;
  let isAnimating  = false;
  const queue: string[] = [];

  const nextBtn: ButtonState = { ariaDisabled: false, focused: false, clickCount: 0 };
  const prevBtn: ButtonState = { ariaDisabled: false, focused: false, clickCount: 0 };

  // Track which button triggered the last action (for focus-retention tests)
  let lastFocusedButton: 'next' | 'prev' | null = null;

  let timerFn: (() => void) | null = null;

  function setAriaDisabled(val: boolean) {
    nextBtn.ariaDisabled = val;
    prevBtn.ariaDisabled = val;
  }

  function processQueue() {
    if (queue.length === 0) return;
    const action = queue.shift()!;
    if (action === 'next') executeNext();
    else if (action === 'prev') executePrev();
  }

  function executeNext() {
    isAnimating = true;
    setAriaDisabled(true);
    const nextIdx = (currentSlide + 1) % totalSlides;
    timerFn = () => {
      currentSlide = nextIdx;
      isAnimating  = false;
      setAriaDisabled(false);
      // Restore focus to the button that triggered the action
      if (lastFocusedButton === 'next') nextBtn.focused = true;
      else if (lastFocusedButton === 'prev') prevBtn.focused = true;
      processQueue();
    };
  }

  function executePrev() {
    isAnimating = true;
    setAriaDisabled(true);
    const prevIdx = ((currentSlide - 1) % totalSlides + totalSlides) % totalSlides;
    timerFn = () => {
      currentSlide = prevIdx;
      isAnimating  = false;
      setAriaDisabled(false);
      if (lastFocusedButton === 'next') nextBtn.focused = true;
      else if (lastFocusedButton === 'prev') prevBtn.focused = true;
      processQueue();
    };
  }

  function clickNext(withFocus = false) {
    nextBtn.clickCount++;
    if (withFocus) {
      nextBtn.focused      = true;
      lastFocusedButton    = 'next';
    }
    if (isAnimating) {
      queue.push('next');
      return;
    }
    executeNext();
  }

  function clickPrev(withFocus = false) {
    prevBtn.clickCount++;
    if (withFocus) {
      prevBtn.focused   = true;
      lastFocusedButton = 'prev';
    }
    if (isAnimating) {
      queue.push('prev');
      return;
    }
    executePrev();
  }

  // Simulate keyboard activation (Enter or Space on focused button)
  function keyActivateNext(key: 'Enter' | ' ') {
    if (key === 'Enter' || key === ' ') clickNext(true);
  }

  function keyActivatePrev(key: 'Enter' | ' ') {
    if (key === 'Enter' || key === ' ') clickPrev(true);
  }

  function flushTimer() {
    if (timerFn) { const fn = timerFn; timerFn = null; fn(); }
  }

  return {
    clickNext,
    clickPrev,
    keyActivateNext,
    keyActivatePrev,
    flushTimer,
    getNextBtn:       () => ({ ...nextBtn }),
    getPrevBtn:       () => ({ ...prevBtn }),
    getCurrentSlide:  () => currentSlide,
    getIsAnimating:   () => isAnimating,
    getQueueLength:   () => queue.length,
    getQueue:         () => [...queue],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Button Focusability Contract', () => {
  test('next button is focusable (not aria-disabled initially)', () => {
    const ctrl = makeButtonController(3);
    expect(ctrl.getNextBtn().ariaDisabled).toBe(false);
  });

  test('prev button is focusable (not aria-disabled initially)', () => {
    const ctrl = makeButtonController(3);
    expect(ctrl.getPrevBtn().ariaDisabled).toBe(false);
  });

  test('buttons have tabindex-compatible state: ariaDisabled false at rest', () => {
    const ctrl = makeButtonController(4);
    // No animation started — both buttons should be interactable
    expect(ctrl.getNextBtn().ariaDisabled).toBe(false);
    expect(ctrl.getPrevBtn().ariaDisabled).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Button ARIA State During Animation', () => {
  test('clicking next sets aria-disabled=true during animation', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickNext();
    expect(ctrl.getNextBtn().ariaDisabled).toBe(true);
    expect(ctrl.getPrevBtn().ariaDisabled).toBe(true);
  });

  test('clicking prev sets aria-disabled=true during animation', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickPrev();
    expect(ctrl.getPrevBtn().ariaDisabled).toBe(true);
    expect(ctrl.getNextBtn().ariaDisabled).toBe(true);
  });

  test('both buttons become aria-disabled simultaneously during animation', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickNext();
    const next = ctrl.getNextBtn();
    const prev = ctrl.getPrevBtn();
    expect(next.ariaDisabled).toBe(prev.ariaDisabled);
    expect(next.ariaDisabled).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Button Re-Enablement After Animation', () => {
  test('buttons re-enable (aria-disabled=false) after animation completes', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickNext();
    expect(ctrl.getNextBtn().ariaDisabled).toBe(true);
    ctrl.flushTimer();
    expect(ctrl.getNextBtn().ariaDisabled).toBe(false);
    expect(ctrl.getPrevBtn().ariaDisabled).toBe(false);
  });

  test('carousel rotates correctly when animation re-enables', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickNext();
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1);
    expect(ctrl.getIsAnimating()).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Focus Retention After Animation', () => {
  test('next button retains focus after animation completes', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickNext(true); // click with focus
    expect(ctrl.getNextBtn().focused).toBe(true);
    ctrl.flushTimer();
    // Focus should be restored to the next button
    expect(ctrl.getNextBtn().focused).toBe(true);
  });

  test('prev button retains focus after animation completes', () => {
    const ctrl = makeButtonController(3);
    ctrl.clickPrev(true); // click with focus
    ctrl.flushTimer();
    expect(ctrl.getPrevBtn().focused).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Keyboard Activation — Enter and Space', () => {
  test('pressing Enter on next button triggers carousel rotation', () => {
    const ctrl = makeButtonController(3);
    ctrl.keyActivateNext('Enter');
    expect(ctrl.getIsAnimating()).toBe(true);
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1);
  });

  test('pressing Space on next button triggers carousel rotation', () => {
    const ctrl = makeButtonController(3);
    ctrl.keyActivateNext(' ');
    expect(ctrl.getIsAnimating()).toBe(true);
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(1);
  });

  test('pressing Enter on prev button triggers carousel rotation', () => {
    const ctrl = makeButtonController(5);
    ctrl.clickNext();
    ctrl.flushTimer(); // go to slide 1 first
    ctrl.keyActivatePrev('Enter');
    expect(ctrl.getIsAnimating()).toBe(true);
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(0);
  });

  test('pressing Space on prev button triggers carousel rotation', () => {
    const ctrl = makeButtonController(5);
    ctrl.clickNext();
    ctrl.flushTimer(); // go to slide 1
    ctrl.keyActivatePrev(' ');
    ctrl.flushTimer();
    expect(ctrl.getCurrentSlide()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Click Queueing During Animation', () => {
  test('clicking next while animating queues the action', () => {
    const ctrl = makeButtonController(4);
    ctrl.clickNext(); // starts animation
    ctrl.clickNext(); // should queue
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['next']);
  });

  test('queued click executes after animation completes', () => {
    const ctrl = makeButtonController(4);
    ctrl.clickNext();
    ctrl.clickNext();
    ctrl.flushTimer(); // complete first → starts second
    expect(ctrl.getCurrentSlide()).toBe(1);
    ctrl.flushTimer(); // complete second
    expect(ctrl.getCurrentSlide()).toBe(2);
    expect(ctrl.getQueueLength()).toBe(0);
  });

  test('clicking prev while animating queues the action', () => {
    const ctrl = makeButtonController(4);
    ctrl.clickNext(); // starts animation
    ctrl.clickPrev(); // should queue
    expect(ctrl.getQueueLength()).toBe(1);
    expect(ctrl.getQueue()).toEqual(['prev']);
  });

  test('clicking button while animating does NOT drop clicks', () => {
    const ctrl = makeButtonController(10);
    ctrl.clickNext();               // immediate
    ctrl.clickNext();               // queued: [next]
    ctrl.clickNext();               // queued: [next, next]
    ctrl.clickNext();               // queued: [next, next, next]

    expect(ctrl.getQueueLength()).toBe(3);
    expect(ctrl.getNextBtn().clickCount).toBe(4);

    ctrl.flushTimer();
    ctrl.flushTimer();
    ctrl.flushTimer();
    ctrl.flushTimer();

    expect(ctrl.getCurrentSlide()).toBe(4);
    expect(ctrl.getQueueLength()).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Button Rendering Contract (2+ slides)', () => {
  test('navigation is enabled when slide count is 2 or more', () => {
    // Logic contract: showNav = count >= 2
    function showNav(count: number): boolean {
      return count >= 2;
    }
    expect(showNav(1)).toBe(false);
    expect(showNav(2)).toBe(true);
    expect(showNav(3)).toBe(true);
    expect(showNav(10)).toBe(true);
  });

  test('navigation is suppressed for single-slide carousel', () => {
    function showNav(count: number): boolean {
      return count >= 2;
    }
    expect(showNav(1)).toBe(false);
    expect(showNav(0)).toBe(false);
  });
});
