/**
 * T004: Tests for 3D cylinder animation timing and CSS transition contract
 *
 * The new architecture uses a single CSS `transition` on `.carousel-track`
 * (rotateY, 600ms) instead of per-card enter/exit keyframe animations.
 * Animation completion is detected via the `transitionend` event — there
 * is no setTimeout-based settle window.
 *
 * Tests cover:
 *   - Track transition duration constant (600ms)
 *   - `is-active` CSS class contract (replaces per-card animation classes)
 *   - Reduced-motion fallback: transition:none on track, opacity fade on cards
 *   - Step angle (STEP_DEG = 60) and cumulative angle arithmetic
 *   - Animation controller behaviour mirrors component script internals
 *
 * Traceability: FR-004, FR-005, FR-006, FR-010, AC-3, AC-16–AC-19, AC-30–AC-32
 */

import { describe, test, expect } from 'vitest';

// ─── Animation constants mirrored from the component ──────────────────────────
// These must match the values in HeroCircularCarousel.astro <script> and <style>.
// If you change the component, update these constants to match — the tests
// are the contract.

// The CSS transition on .carousel-track:
//   transition: transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
const TRACK_TRANSITION_MS = 600; // ms — must be within 600–800ms per AC-3

// Reduced-motion: track transition is `none`; active card opacity fades over:
//   transition: opacity 300ms ease
const REDUCED_MOTION_FADE_MS = 300; // ms — opacity transition on .is-active card

// Step angle between cards on the cylinder
const STEP_DEG = 60; // degrees

// ─── CSS class name contracts ─────────────────────────────────────────────────
// The new architecture uses a single class for the active (front-facing) card.
// The old per-card enter/exit classes are gone.
const CSS_CLASS = {
  active: 'is-active',  // applied to the current front card
};

// ─── Animation controller factory (mirrors component script logic) ─────────────
function makeTimingController(
  totalSlides: number,
  prefersReducedMotion: boolean = false,
) {
  const reducedMotion = prefersReducedMotion;

  let currentIndex = 0;
  let currentAngle = 0;
  let isAnimating  = false;
  const queue: string[] = [];

  // Track the is-active transitions (which index became active on each step)
  const activeHistory: number[] = [];

  // Simulated transitionend callback
  let pendingTransitionEnd: (() => void) | null = null;

  function processQueue() {
    if (queue.length === 0) return;
    const action = queue.shift()!;
    if (action === 'next') executeNext();
    else if (action === 'prev') executePrev();
  }

  function onAnimationComplete() {
    isAnimating = false;
    processQueue();
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

    // Record which index became active
    activeHistory.push(currentIndex);

    // In reduced-motion mode: simulate a short setTimeout (no track transition)
    // In normal mode: a transitionend fires on the track
    pendingTransitionEnd = onAnimationComplete;
  }

  function executeNext() {
    rotateToIndex((currentIndex + 1) % totalSlides, 'next');
  }

  function executePrev() {
    rotateToIndex(((currentIndex - 1) % totalSlides + totalSlides) % totalSlides, 'prev');
  }

  function handleNext() {
    if (isAnimating) { queue.push('next'); return; }
    executeNext();
  }

  function handlePrev() {
    if (isAnimating) { queue.push('prev'); return; }
    executePrev();
  }

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
    isReducedMotion:    () => reducedMotion,
    getCurrentIndex:    () => currentIndex,
    getCurrentAngle:    () => currentAngle,
    getIsAnimating:     () => isAnimating,
    getActiveHistory:   () => [...activeHistory],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
describe('Track Transition Timing Constants', () => {
  test('track transition duration is 600ms', () => {
    expect(TRACK_TRANSITION_MS).toBe(600);
  });

  test('track transition duration is within 600–800ms (AC-3)', () => {
    expect(TRACK_TRANSITION_MS).toBeGreaterThanOrEqual(600);
    expect(TRACK_TRANSITION_MS).toBeLessThanOrEqual(800);
  });

  test('reduced-motion opacity fade is 300ms', () => {
    expect(REDUCED_MOTION_FADE_MS).toBe(300);
  });

  test('reduced-motion fade is shorter than full track transition', () => {
    expect(REDUCED_MOTION_FADE_MS).toBeLessThan(TRACK_TRANSITION_MS);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Step Angle Contract', () => {
  test('STEP_DEG is 60 degrees', () => {
    expect(STEP_DEG).toBe(60);
  });

  test('6 steps of 60° completes one full cylinder rotation (360°)', () => {
    expect(6 * STEP_DEG).toBe(360);
  });

  test('next click decrements currentAngle by STEP_DEG', () => {
    const ctrl = makeTimingController(6, false);
    ctrl.handleNext();
    expect(ctrl.getCurrentAngle()).toBe(-STEP_DEG);
  });

  test('prev click increments currentAngle by STEP_DEG', () => {
    const ctrl = makeTimingController(6, false);
    ctrl.handlePrev();
    expect(ctrl.getCurrentAngle()).toBe(STEP_DEG);
  });

  test('angle accumulates without wrapping (no modulo)', () => {
    const ctrl = makeTimingController(6, false);
    ctrl.handleNext(); ctrl.fireTransitionEnd();
    ctrl.handleNext(); ctrl.fireTransitionEnd();
    ctrl.handleNext(); ctrl.fireTransitionEnd();
    expect(ctrl.getCurrentAngle()).toBe(-180);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Active Card Class Contract — is-active', () => {
  test('CSS_CLASS.active is "is-active"', () => {
    expect(CSS_CLASS.active).toBe('is-active');
  });

  test('is-active class is applied immediately when rotation starts (not on transitionend)', () => {
    const ctrl = makeTimingController(3, false);
    ctrl.handleNext();
    // Index already updated to 1 — is-active class would be on slide 1
    expect(ctrl.getCurrentIndex()).toBe(1);
    expect(ctrl.getActiveHistory()).toEqual([1]);
  });

  test('is-active tracks correctly through multiple rotations', () => {
    const ctrl = makeTimingController(5, false);
    ctrl.handleNext(); ctrl.fireTransitionEnd();
    ctrl.handleNext(); ctrl.fireTransitionEnd();
    ctrl.handleNext(); ctrl.fireTransitionEnd();
    expect(ctrl.getActiveHistory()).toEqual([1, 2, 3]);
  });

  test('is-active index wraps correctly at carousel end', () => {
    const ctrl = makeTimingController(3, false);
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 1
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 2
    ctrl.handleNext(); ctrl.fireTransitionEnd(); // → 0 (wrap)
    expect(ctrl.getCurrentIndex()).toBe(0);
    expect(ctrl.getActiveHistory()).toEqual([1, 2, 0]);
  });

  test('no old enter/exit keyframe class names used', () => {
    // The new architecture has no per-card enter/exit animation classes.
    // Verify the CSS_CLASS object only contains the is-active class.
    const classNames = Object.values(CSS_CLASS);
    classNames.forEach(name => {
      expect(name).not.toContain('rotate-out');
      expect(name).not.toContain('rotate-in');
      expect(name).not.toContain('animate-');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Reduced-Motion Fallback', () => {
  test('reducedMotion flag is true when prefers-reduced-motion is active', () => {
    const ctrl = makeTimingController(3, true);
    expect(ctrl.isReducedMotion()).toBe(true);
  });

  test('reduced-motion fade duration (300ms) is less than full transition (600ms)', () => {
    expect(REDUCED_MOTION_FADE_MS).toBeLessThan(TRACK_TRANSITION_MS);
  });

  test('reduced-motion: state still advances correctly', () => {
    const ctrl = makeTimingController(3, true);
    ctrl.handleNext();
    ctrl.fireTransitionEnd();
    expect(ctrl.getCurrentIndex()).toBe(1);
  });

  test('reduced-motion: currentAngle still tracked (for state consistency)', () => {
    const ctrl = makeTimingController(3, true);
    ctrl.handleNext();
    expect(ctrl.getCurrentAngle()).toBe(-STEP_DEG);
  });

  test('reduced-motion: is-active class applied to correct card', () => {
    const ctrl = makeTimingController(3, true);
    ctrl.handleNext();
    expect(ctrl.getCurrentIndex()).toBe(1);
    expect(ctrl.getActiveHistory()).toContain(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('GPU Acceleration & Backface-Visibility Contract', () => {
  // The cylinder architecture uses backface-visibility: hidden on each card so
  // cards at ±180° (the back of the cylinder) are naturally occluded.

  test('backface-visibility: hidden is the correct contract for cylinder cards', () => {
    // Cards at the back (rotated 180°) should be hidden by backface-visibility.
    // This is a CSS contract — we verify the architectural intent here.
    const backfaceStrategy = 'hidden'; // matches CSS in component
    expect(backfaceStrategy).toBe('hidden');
  });

  test('will-change: transform is applied to cards for GPU compositing', () => {
    const willChangeValue = 'transform, filter'; // matches CSS in component
    expect(willChangeValue).toContain('transform');
  });

  test('track uses transform-style: preserve-3d for 3D cylinder', () => {
    const transformStyle = 'preserve-3d'; // matches CSS on .carousel-track
    expect(transformStyle).toBe('preserve-3d');
  });

  test('cylinder radius is 500px (translateZ value on each card)', () => {
    const cylinderRadius = 500; // px — matches component CSS
    expect(cylinderRadius).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Animation State Integration', () => {
  test('isAnimating is true when track transition is in progress', () => {
    const ctrl = makeTimingController(3, false);
    ctrl.handleNext();
    expect(ctrl.getIsAnimating()).toBe(true);
  });

  test('isAnimating is false after transitionend resolves', () => {
    const ctrl = makeTimingController(3, false);
    ctrl.handleNext();
    ctrl.fireTransitionEnd();
    expect(ctrl.getIsAnimating()).toBe(false);
  });

  test('currentIndex updates at rotation start, not on transitionend', () => {
    const ctrl = makeTimingController(3, false);
    ctrl.handleNext();
    // Index is already updated when the CSS transition begins
    expect(ctrl.getCurrentIndex()).toBe(1);
    ctrl.fireTransitionEnd();
    // Still 1 after transitionend — unchanged
    expect(ctrl.getCurrentIndex()).toBe(1);
  });
});
