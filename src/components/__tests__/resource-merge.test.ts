import { describe, expect, test, vi, beforeEach } from 'vitest';
import {
  mergeEntries,
  transformCandidate,
  isIsoDate,
  filterApproved,
} from '../../../scripts/merge-resources.js';

const fixtureExistingCoaching = [
  {
    id: 'coaching-001',
    title: 'Existing Defence Guide',
    description: 'Existing manual entry',
    audience: 'coaching',
    category: 'Defence',
    ageGroup: 'U14',
    type: 'pdf',
    url: 'https://existing.example/defence.pdf',
    dateAdded: '2026-04-01',
  },
  {
    id: 'coaching-002',
    title: 'Existing Drill',
    description: 'Existing manual entry',
    audience: 'coaching',
    category: 'Drills',
    ageGroup: 'All Ages',
    type: 'video',
    url: 'https://existing.example/drill-video',
    dateAdded: '2026-04-02',
  },
];

const fixtureExistingPlayers = [
  {
    id: 'player-001',
    title: 'Existing Player Guide',
    description: 'Existing manual entry',
    audience: 'players',
    category: 'Development',
    ageGroup: 'U12',
    type: 'pdf',
    url: 'https://existing.example/player-guide.pdf',
    dateAdded: '2026-04-03',
  },
];

const fixtureCandidates = [
  {
    title: 'Approved Coaching Resource',
    sourceUrl: 'https://source.example/new-coaching-video',
    sourceDomain: 'Basketball Victoria',
    inferredType: 'video',
    inferredCategory: 'Defence',
    inferredAgeGroup: 'U14',
    inferredAudience: 'coaching',
    reachable: true,
    status: 'approved',
  },
  {
    title: 'Uncategorised Approved',
    sourceUrl: 'https://source.example/uncategorised',
    sourceDomain: 'NBL',
    inferredType: 'link',
    inferredCategory: 'uncategorised',
    inferredAgeGroup: 'All Ages',
    inferredAudience: 'coaching',
    reachable: true,
    status: 'approved',
  },
  {
    title: 'Duplicate URL',
    sourceUrl: 'https://existing.example/defence.pdf',
    sourceDomain: 'Basketball Australia',
    inferredType: 'pdf',
    inferredCategory: 'Defence',
    inferredAgeGroup: 'U14',
    inferredAudience: 'coaching',
    reachable: true,
    status: 'approved',
  },
  {
    title: 'Rejected Entry',
    sourceUrl: 'https://source.example/rejected',
    sourceDomain: 'WNBA',
    inferredType: 'link',
    inferredCategory: 'Offence',
    inferredAgeGroup: 'All Ages',
    inferredAudience: 'coaching',
    reachable: true,
    status: 'rejected',
  },
  {
    title: 'Pending Entry',
    sourceUrl: 'https://source.example/pending',
    sourceDomain: 'NBA',
    inferredType: 'video',
    inferredCategory: 'Drills',
    inferredAgeGroup: 'All Ages',
    inferredAudience: 'coaching',
    reachable: true,
    status: 'pending',
  },
  {
    title: 'Approved Players Resource',
    sourceUrl: 'https://source.example/player-resource',
    sourceDomain: 'WNBL',
    inferredType: 'pdf',
    inferredCategory: 'Development',
    inferredAgeGroup: 'U12',
    inferredAudience: 'players',
    reachable: true,
    status: 'approved',
  },
];

describe('resource merge logic', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('1. approved valid new URL is added', () => {
    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    expect(result.coaching.some((r) => r.url === 'https://source.example/new-coaching-video')).toBe(true);
  });

  test('2. uncategorised approved entry is skipped with warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    expect(result.coaching.some((r) => r.url === 'https://source.example/uncategorised')).toBe(false);
    expect(warn).toHaveBeenCalled();
  });

  test('3. duplicate URL is skipped with log', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    expect(result.coaching.filter((r) => r.url === 'https://existing.example/defence.pdf')).toHaveLength(1);
    expect(log).toHaveBeenCalled();
  });

  test('4. rejected entry is not added', () => {
    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    expect(result.coaching.some((r) => r.url === 'https://source.example/rejected')).toBe(false);
  });

  test('5. pending entry is not added', () => {
    const approved = filterApproved(fixtureCandidates);
    expect(approved.some((c) => c.sourceUrl === 'https://source.example/pending')).toBe(false);
  });

  test('6. coaching and players entries route to correct outputs', () => {
    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    expect(result.coaching.some((r) => r.url === 'https://source.example/new-coaching-video')).toBe(true);
    expect(result.players.some((r) => r.url === 'https://source.example/player-resource')).toBe(true);
  });

  test('7. existing entries are preserved', () => {
    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    expect(result.coaching.find((r) => r.id === 'coaching-001')).toBeTruthy();
    expect(result.players.find((r) => r.id === 'player-001')).toBeTruthy();
  });

  test('8. idempotent when run twice on same candidates', () => {
    const first = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    const second = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: first.coaching,
      existingPlayers: first.players,
      today: '2026-04-13',
    });

    expect(second.coaching.length).toBe(first.coaching.length);
    expect(second.players.length).toBe(first.players.length);
  });

  test('9. merged entries include sourceDomain', () => {
    const resource = transformCandidate({
      candidate: fixtureCandidates[0],
      audience: 'coaching',
      existingIds: ['coaching-001'],
      dateAdded: '2026-04-13',
    });

    expect(resource.sourceDomain).toBe('Basketball Victoria');
  });

  test('10. merged entries include ISO dateAdded', () => {
    const resource = transformCandidate({
      candidate: fixtureCandidates[0],
      audience: 'coaching',
      existingIds: ['coaching-001'],
      dateAdded: '2026-04-13',
    });

    expect(isIsoDate(resource.dateAdded)).toBe(true);
  });

  test('11. generated id follows audience-source-slug-number and avoids collisions', () => {
    const resource = transformCandidate({
      candidate: fixtureCandidates[0],
      audience: 'coaching',
      existingIds: ['coaching-basketball-victoria-001', 'coaching-basketball-victoria-002'],
      dateAdded: '2026-04-13',
    });

    expect(resource.id).toBe('coaching-basketball-victoria-003');
  });

  test('12. output JSON is parseable and has required Resource fields', () => {
    const result = mergeEntries({
      candidates: fixtureCandidates,
      existingCoaching: fixtureExistingCoaching,
      existingPlayers: fixtureExistingPlayers,
      today: '2026-04-13',
    });

    const parsed = JSON.parse(JSON.stringify(result.coaching));
    for (const item of parsed) {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.description).toBeTruthy();
      expect(item.audience).toBeTruthy();
      expect(item.category).toBeTruthy();
      expect(item.ageGroup).toBeTruthy();
      expect(item.type).toBeTruthy();
      expect(item.url).toBeTruthy();
      expect(item.dateAdded).toBeTruthy();
    }
  });
});
