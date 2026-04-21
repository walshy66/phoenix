import { describe, expect, it } from 'vitest';
import { isWithinGameWindow } from './game-window';

describe('isWithinGameWindow', () => {
  it('returns true on Monday evening', () => {
    expect(isWithinGameWindow(new Date('2026-04-20T20:00:00'))).toBe(true);
  });

  it('returns false on Thursday', () => {
    expect(isWithinGameWindow(new Date('2026-04-23T20:00:00'))).toBe(false);
  });

  it('returns false before 4:30pm', () => {
    expect(isWithinGameWindow(new Date('2026-04-20T15:00:00'))).toBe(false);
  });
});
