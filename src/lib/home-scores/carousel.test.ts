import { describe, expect, test } from 'vitest';
import { getInitialCarouselIndex, getMaxCarouselIndex, getMelbourneIsoDate, getNextIndex, getPrevIndex, getSlidesPerView, onManualNavigation, shouldResumeAutoRotation } from './carousel';

describe('home-scores/carousel helpers', () => {
  test('returns responsive slides per view by breakpoint', () => {
    expect(getSlidesPerView(375)).toBe(1);
    expect(getSlidesPerView(800)).toBe(2);
    expect(getSlidesPerView(1280)).toBe(3);
  });

  test('calculates max carousel index from visible cards', () => {
    expect(getMaxCarouselIndex(1, 1)).toBe(0);
    expect(getMaxCarouselIndex(3, 3)).toBe(0);
    expect(getMaxCarouselIndex(6, 3)).toBe(3);
  });

  test('loops next index from last visible frame to first', () => {
    expect(getNextIndex(3, 6, 3)).toBe(0);
  });

  test('loops prev index from first visible frame to last', () => {
    expect(getPrevIndex(0, 6, 3)).toBe(3);
  });

  test('returns Melbourne-local ISO date', () => {
    expect(getMelbourneIsoDate(new Date('2026-04-15T10:00:00+10:00'))).toBe('2026-04-15');
  });

  test('starts carousel at today or next upcoming game and clamps for visible cards', () => {
    const kickoffDates = ['2026-04-20', '2026-04-20', '2026-04-21', '2026-04-22', '2026-04-24'];
    expect(getInitialCarouselIndex(kickoffDates, 3, new Date('2026-04-22T10:00:00+10:00'))).toBe(2);
    expect(getInitialCarouselIndex(kickoffDates, 3, new Date('2026-04-24T10:00:00+10:00'))).toBe(2);
    expect(getInitialCarouselIndex(kickoffDates, 1, new Date('2026-04-21T10:00:00+10:00'))).toBe(2);
  });

  test('manual navigation pauses auto-rotation', () => {
    const state = onManualNavigation({ isAutoRotating: true, lastInteractionAt: 0 }, 1000);
    expect(state.isAutoRotating).toBe(false);
    expect(state.lastInteractionAt).toBe(1000);
  });

  test('auto-rotation resumes only after idle delay', () => {
    expect(shouldResumeAutoRotation(1000, 3000, 2500)).toBe(false);
    expect(shouldResumeAutoRotation(1000, 4001, 3000)).toBe(true);
  });
});
