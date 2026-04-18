import { describe, expect, it } from 'vitest';
import guides from '../guides.json';

describe('guides resources', () => {
  it('contains the 15 guide resources in alphabetical order', () => {
    expect(guides).toHaveLength(15);
    expect(guides.map((guide) => guide.title)).toEqual([
      'Bridging Fund Coordinator',
      'Child Safety Officer',
      'Coach',
      'Coach - Quick Guide & Coach Kit Care',
      'Coach Coordinator',
      'Event Coordinator',
      'Smart Goals',
      'Social Media Coordinator',
      'Sponsorship Coordinator',
      'Team Manager',
      'Team Manager - Quick Guide',
      'Team Name',
      'Treasurer',
      'Uniform Coordinator',
      'Vice President',
    ]);
  });
});
