/**
 * T004: Verify Season fixtures and types
 *
 * Simple test to ensure all fixture types are valid and can be imported.
 * This validates the foundation (types + fixtures) for Window 1.
 *
 * Traceability: T001, T002, T004 (Window 1 Foundation)
 */

import { describe, test, expect } from 'vitest';
import type { Season, KeyDate, RegistrationCost } from '../../lib/seasons/types';
import {
  mockSeasonCurrent,
  mockSeasonNext,
  mockSeasonPrevious,
  mockKeyDates,
  mockRegistrationCosts,
  mockAllSeasons,
  completeTestDataSet,
} from './fixtures';

describe('Seasons Fixtures: Type Validation', () => {
  test('mockSeasonCurrent type-checks against Season interface', () => {
    const season: Season = mockSeasonCurrent;
    expect(season.id).toBe('winter-2026');
    expect(season.role).toBe('current');
    expect(season.status).toBe('active');
  });

  test('mockSeasonNext has correct role and status', () => {
    const season: Season = mockSeasonNext;
    expect(season.role).toBe('next');
    expect(season.status).toBe('coming_soon');
  });

  test('mockSeasonPrevious has correct role and status', () => {
    const season: Season = mockSeasonPrevious;
    expect(season.role).toBe('previous');
    expect(season.status).toBe('completed');
  });

  test('mockKeyDates array type-checks and has expected structure', () => {
    const dates: KeyDate[] = mockKeyDates;
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toHaveProperty('label');
    expect(dates[0]).toHaveProperty('date');
  });

  test('mockRegistrationCosts array type-checks and has expected structure', () => {
    const costs: RegistrationCost[] = mockRegistrationCosts;
    expect(costs.length).toBeGreaterThan(0);
    expect(costs[0]).toHaveProperty('id');
    expect(costs[0]).toHaveProperty('category');
    expect(costs[0]).toHaveProperty('cost');
    expect(typeof costs[0].cost).toBe('number');
  });

  test('mockAllSeasons contains exactly 3 seasons in expected order', () => {
    expect(mockAllSeasons).toHaveLength(3);
    expect(mockAllSeasons[0].role).toBe('current');
    expect(mockAllSeasons[1].role).toBe('next');
    expect(mockAllSeasons[2].role).toBe('previous');
  });

  test('completeTestDataSet has all properties populated', () => {
    const { season, keyDates, registrationCosts } = completeTestDataSet;
    expect(season).toBeDefined();
    expect(keyDates).toBeDefined();
    expect(registrationCosts).toBeDefined();
    expect(Array.isArray(keyDates)).toBe(true);
    expect(Array.isArray(registrationCosts)).toBe(true);
  });

  test('Season interface enforces required fields', () => {
    // This test validates that the Season interface is properly constrained
    const season = mockSeasonCurrent;
    const requiredFields: (keyof Season)[] = ['id', 'name', 'startDate', 'endDate', 'role', 'status'];
    requiredFields.forEach((field) => {
      expect(season).toHaveProperty(field);
      expect(season[field]).toBeDefined();
    });
  });

  test('KeyDate interface enforces required fields', () => {
    const date = mockKeyDates[0];
    expect(date).toHaveProperty('label');
    expect(date).toHaveProperty('date');
    expect(date.label).toBeTruthy();
    expect(date.date).toBeTruthy();
  });

  test('RegistrationCost interface enforces required fields', () => {
    const cost = mockRegistrationCosts[0];
    expect(cost).toHaveProperty('id');
    expect(cost).toHaveProperty('category');
    expect(cost).toHaveProperty('cost');
    expect(cost.id).toBeTruthy();
    expect(cost.category).toBeTruthy();
    expect(typeof cost.cost).toBe('number');
  });
});
