import { describe, expect, test } from 'vitest';
import { getUpcomingWeekWindow } from './week-window';

describe('scores/week-window', () => {
  test('uses current week Monday-Friday when reference date is weekday (Melbourne)', () => {
    const reference = new Date('2026-04-15T10:00:00+10:00'); // Wednesday
    const window = getUpcomingWeekWindow(reference, 'Australia/Melbourne');

    expect(window.startDate).toBe('2026-04-13');
    expect(window.endDate).toBe('2026-04-17');
    expect(window.timezone).toBe('Australia/Melbourne');
  });

  test('rolls to next week Monday-Friday when reference date is Saturday', () => {
    const reference = new Date('2026-04-18T10:00:00+10:00'); // Saturday
    const window = getUpcomingWeekWindow(reference, 'Australia/Melbourne');

    expect(window.startDate).toBe('2026-04-20');
    expect(window.endDate).toBe('2026-04-24');
  });

  test('rolls to next week Monday-Friday when reference date is Sunday', () => {
    const reference = new Date('2026-04-19T10:00:00+10:00'); // Sunday
    const window = getUpcomingWeekWindow(reference, 'Australia/Melbourne');

    expect(window.startDate).toBe('2026-04-20');
    expect(window.endDate).toBe('2026-04-24');
  });
});
