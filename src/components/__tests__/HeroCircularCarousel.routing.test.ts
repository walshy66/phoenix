/**
 * T001: Unit tests for slide routing (next, prev, looping)
 *
 * Tests the core slide indexing and modulo-based looping logic.
 * These functions are extracted from the carousel component logic
 * for pure unit testing without a DOM.
 *
 * Traceability: FR-001, AC-1 through AC-6
 */

import { describe, test, expect } from 'vitest';

// Pure slide routing logic — mirrors what's inside HeroCircularCarousel.astro <script>
// These functions are tested in isolation before the component is built.

function makeRouter(totalSlides: number) {
  let currentSlide = 0;

  function next(): number {
    currentSlide = (currentSlide + 1) % totalSlides;
    return currentSlide;
  }

  function prev(): number {
    currentSlide = ((currentSlide - 1) % totalSlides + totalSlides) % totalSlides;
    return currentSlide;
  }

  function getCurrent(): number {
    return currentSlide;
  }

  function goTo(index: number): number {
    if (index < 0 || index >= totalSlides) {
      throw new RangeError(`Slide index ${index} out of bounds [0, ${totalSlides - 1}]`);
    }
    currentSlide = index;
    return currentSlide;
  }

  return { next, prev, getCurrent, goTo };
}

describe('Slide Routing — next()', () => {
  test('next() increments currentSlide by 1', () => {
    const r = makeRouter(5);
    expect(r.next()).toBe(1);
    expect(r.next()).toBe(2);
  });

  test('next() from last slide loops back to 0', () => {
    const r = makeRouter(3);
    r.goTo(2); // last slide
    expect(r.next()).toBe(0);
  });

  test('next() loops correctly with 5 slides', () => {
    const r = makeRouter(5);
    r.goTo(4); // last slide
    expect(r.next()).toBe(0);
  });

  test('next() loops correctly with 10 slides', () => {
    const r = makeRouter(10);
    r.goTo(9); // last slide
    expect(r.next()).toBe(0);
  });
});

describe('Slide Routing — prev()', () => {
  test('prev() decrements currentSlide by 1', () => {
    const r = makeRouter(5);
    r.goTo(3);
    expect(r.prev()).toBe(2);
    expect(r.prev()).toBe(1);
  });

  test('prev() from first slide loops to last slide', () => {
    const r = makeRouter(3);
    expect(r.getCurrent()).toBe(0); // starts at 0
    expect(r.prev()).toBe(2); // wraps to last
  });

  test('prev() from first slide loops correctly with 5 slides', () => {
    const r = makeRouter(5);
    expect(r.prev()).toBe(4);
  });

  test('prev() from first slide loops correctly with 10 slides', () => {
    const r = makeRouter(10);
    expect(r.prev()).toBe(9);
  });
});

describe('Slide Routing — modulo arithmetic correctness', () => {
  test('currentSlide index never goes below 0 after prev()', () => {
    const counts = [2, 3, 5, 10];
    for (const count of counts) {
      const r = makeRouter(count);
      // Rapidly call prev many times — should never be negative
      for (let i = 0; i < count * 3; i++) {
        const idx = r.prev();
        expect(idx).toBeGreaterThanOrEqual(0);
      }
    }
  });

  test('currentSlide index never exceeds slide count - 1 after next()', () => {
    const counts = [2, 3, 5, 10];
    for (const count of counts) {
      const r = makeRouter(count);
      for (let i = 0; i < count * 3; i++) {
        const idx = r.next();
        expect(idx).toBeLessThan(count);
      }
    }
  });

  test('full cycle: next() through all slides returns to start', () => {
    const count = 5;
    const r = makeRouter(count);
    for (let i = 0; i < count; i++) {
      r.next();
    }
    expect(r.getCurrent()).toBe(0);
  });

  test('full cycle: prev() through all slides returns to start', () => {
    const count = 5;
    const r = makeRouter(count);
    for (let i = 0; i < count; i++) {
      r.prev();
    }
    expect(r.getCurrent()).toBe(0);
  });

  test('modulo arithmetic works with 2 slides (minimum)', () => {
    const r = makeRouter(2);
    expect(r.next()).toBe(1);
    expect(r.next()).toBe(0);
    expect(r.prev()).toBe(1);
    expect(r.prev()).toBe(0);
  });
});

describe('Slide Routing — goTo()', () => {
  test('goTo() sets currentSlide to specified index', () => {
    const r = makeRouter(5);
    r.goTo(3);
    expect(r.getCurrent()).toBe(3);
  });

  test('goTo() throws RangeError for negative index', () => {
    const r = makeRouter(5);
    expect(() => r.goTo(-1)).toThrow(RangeError);
  });

  test('goTo() throws RangeError for index >= slide count', () => {
    const r = makeRouter(5);
    expect(() => r.goTo(5)).toThrow(RangeError);
  });

  test('goTo(0) works when already at 0', () => {
    const r = makeRouter(5);
    expect(r.goTo(0)).toBe(0);
  });
});
