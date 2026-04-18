import { describe, expect, it } from 'vitest';
import type { Resource } from '../types';
import { extractAvailableSkills } from '../skills';

const resources: Resource[] = [
  {
    id: 'coach-1',
    title: 'Full Court Press Defence',
    section: 'coaching_resources',
    type: 'pdf',
    url: '/resources/full-court-press.pdf',
    tags: {
      age: ['U12'],
      category: ['Defence'],
      skill: ['Positioning', 'Communication'],
    },
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-04-18T10:00:00Z',
  },
  {
    id: 'coach-2',
    title: 'Ball Handling Basics',
    section: 'coaching_resources',
    type: 'external_link',
    url: 'https://example.com/ball-handling',
    tags: {
      age: ['U14'],
      category: ['Drills'],
      skill: ['Ball Handling', 'Positioning'],
    },
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
  },
  {
    id: 'player-1',
    title: 'Shooting Form Diagram',
    section: 'player_resources',
    type: 'image_png',
    fileRef: '/uploads/shooting-form.png',
    tags: {
      age: ['U10'],
      category: ['Solo'],
      skill: ['Shooting'],
    },
    createdAt: '2026-04-16T10:00:00Z',
    updatedAt: '2026-04-16T10:00:00Z',
  },
  {
    id: 'manager-1',
    title: 'Manager Guide',
    section: 'manager',
    type: 'pdf',
    url: '/resources/manager-guide.pdf',
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-15T10:00:00Z',
  },
];

describe('extractAvailableSkills', () => {
  it('returns unique skills for a section', () => {
    const result = extractAvailableSkills(resources, 'coaching_resources');
    expect(result).toEqual(['Ball Handling', 'Communication', 'Positioning']);
  });

  it('sorts skills alphabetically', () => {
    const result = extractAvailableSkills(resources, 'coaching_resources');
    expect(result).toEqual([...result].sort((a, b) => a.localeCompare(b)));
  });

  it('respects active age and category filters', () => {
    const result = extractAvailableSkills(resources, 'coaching_resources', {
      age: ['U12'],
      category: ['Defence'],
    });

    expect(result).toEqual(['Communication', 'Positioning']);
  });

  it('returns an empty array for sections with no skills', () => {
    const result = extractAvailableSkills(resources, 'manager');
    expect(result).toEqual([]);
  });

  it('filters to the requested section only', () => {
    const coachingSkills = extractAvailableSkills(resources, 'coaching_resources');
    const playerSkills = extractAvailableSkills(resources, 'player_resources');

    expect(coachingSkills).toContain('Ball Handling');
    expect(playerSkills).toEqual(['Shooting']);
  });
});
