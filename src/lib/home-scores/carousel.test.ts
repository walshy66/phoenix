import { describe, expect, test } from 'vitest';
import { getNextIndex, getPrevIndex, onManualNavigation, shouldResumeAutoRotation } from './carousel';

describe('home-scores/carousel helpers', () => {
  test('loops next index from last to first', () => {
    expect(getNextIndex(2, 3)).toBe(0);
  });

  test('loops prev index from first to last', () => {
    expect(getPrevIndex(0, 3)).toBe(2);
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
