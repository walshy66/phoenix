import { describe, expect, it } from 'vitest';
import type { Resource } from '../types';
import {
  filterByAge,
  filterByCategory,
  filterBySkill,
  filterResources,
  searchByKeyword,
} from '../filters';

const mockResources: Resource[] = [
  {
    id: 'coach-1',
    title: 'Full Court Press Defence',
    description: 'A guide to full court press and trap rotations.',
    section: 'coaching_resources',
    type: 'pdf',
    url: '/resources/full-court-press.pdf',
    tags: {
      age: ['U12', 'U14'],
      category: ['Defence'],
      skill: ['Positioning', 'Communication'],
    },
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-04-18T10:00:00Z',
  },
  {
    id: 'coach-2',
    title: 'Ball Handling Basics',
    description: 'Develop control and confidence with the ball.',
    section: 'coaching_resources',
    type: 'external_link',
    url: 'https://example.com/ball-handling',
    tags: {
      age: ['U12'],
      category: ['Drills'],
      skill: ['Ball Handling'],
    },
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
  },
  {
    id: 'coach-3',
    title: 'Zone Defence Concepts',
    description: 'Teach players how to move in a zone.',
    section: 'coaching_resources',
    type: 'youtube_link',
    url: 'https://youtu.be/example',
    tags: {
      age: ['U16+'],
      category: ['Defence', 'Plays'],
      skill: ['Rotation'],
    },
    createdAt: '2026-04-17T09:00:00Z',
    updatedAt: '2026-04-17T09:00:00Z',
  },
  {
    id: 'coach-4',
    title: 'Untagged Coaching Resource',
    section: 'coaching_resources',
    type: 'pdf',
    fileRef: '/resources/untagged.pdf',
    createdAt: '2026-04-16T10:00:00Z',
    updatedAt: '2026-04-16T10:00:00Z',
  },
  {
    id: 'guide-1',
    title: 'Basketball Rules Quick Reference',
    section: 'guides',
    type: 'pdf',
    url: '/resources/rules.pdf',
    createdAt: '2026-04-10T10:00:00Z',
    updatedAt: '2026-04-10T10:00:00Z',
  },
];

describe('resource filtering helpers', () => {
  it('filters resources by age values', () => {
    const result = filterByAge(mockResources, ['U12']);
    expect(result.map((r) => r.id)).toEqual(['coach-1', 'coach-2']);
  });

  it('filters resources by category values', () => {
    const result = filterByCategory(mockResources, ['Defence']);
    expect(result.map((r) => r.id)).toEqual(['coach-1', 'coach-3']);
  });

  it('filters resources by skill values', () => {
    const result = filterBySkill(mockResources, ['Ball Handling']);
    expect(result.map((r) => r.id)).toEqual(['coach-2']);
  });

  it('searches title and description case-insensitively', () => {
    const result = searchByKeyword(mockResources, 'PRESS');
    expect(result.map((r) => r.id)).toEqual(['coach-1']);
  });
});

describe('filterResources', () => {
  it('returns all resources in a section when no filters are active', () => {
    const result = filterResources(mockResources, { age: [], category: [], skill: [] }, '', 'coaching_resources');
    expect(result.map((r) => r.id)).toEqual(['coach-2', 'coach-1', 'coach-4', 'coach-3']);
  });

  it('applies AND-logic across active filter groups', () => {
    const result = filterResources(
      mockResources,
      { age: ['U12'], category: ['Defence'], skill: ['Communication'] },
      '',
      'coaching_resources',
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('coach-1');
  });

  it('combines keyword search with active filters', () => {
    const result = filterResources(
      mockResources,
      { age: ['U12'], category: [], skill: [] },
      'ball',
      'coaching_resources',
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('coach-2');
  });

  it('excludes resources missing a required tag when a filter is active', () => {
    const result = filterResources(
      mockResources,
      { age: ['U12'], category: [], skill: [] },
      '',
      'coaching_resources',
    );

    expect(result.some((r) => r.id === 'coach-4')).toBe(false);
  });

  it('sorts all sections alphabetically by title', () => {
    const result = filterResources(mockResources, { age: [], category: [], skill: [] }, '', 'coaching_resources');
    expect(result.map((r) => r.id)).toEqual(['coach-2', 'coach-1', 'coach-4', 'coach-3']);
  });

  it('sorts guides alphabetically by title', () => {
    const result = filterResources(mockResources, { age: [], category: [], skill: [] }, '', 'guides');
    expect(result.map((r) => r.id)).toEqual(['guide-1']);
  });

  it('returns an empty array when no resources match', () => {
    const result = filterResources(
      mockResources,
      { age: ['U8'], category: ['Tools'], skill: ['Leadership'] },
      'press',
      'coaching_resources',
    );

    expect(result).toEqual([]);
  });
});
