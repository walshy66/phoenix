import { describe, expect, test } from 'vitest';
import { buildGameDetailViewModel, groupFixturesByDay, sortFixturesForDay } from './fixtures';

const rawFixtures = [
  {
    fixtureId: 'g-1',
    homeTeam: 'Phoenix U14',
    awayTeam: 'Heat U14',
    grade: 'U14 Boys',
    venue: 'Court 1',
    kickoffAt: '2026-04-13T18:30:00+10:00',
  },
  {
    fixtureId: 'g-2',
    homeTeam: 'Phoenix U14',
    awayTeam: 'Lions U14',
    grade: 'U14 Boys',
    venue: 'Court 2',
    kickoffAt: '2026-04-13T08:30:00+10:00',
  },
  {
    fixtureId: 'g-3',
    homeTeam: 'Phoenix U14',
    awayTeam: 'Bulls U14',
    grade: 'U14 Boys',
    venue: 'Court 1',
    dayOfWeek: 'Monday',
    kickoffAt: '',
  },
  {
    fixtureId: 'g-4',
    homeTeam: 'Phoenix U16',
    awayTeam: 'Rockets U16',
    grade: 'U16 Girls',
    venue: 'Court 3',
    kickoffAt: '2026-04-17T19:00:00+10:00',
  },
  {
    fixtureId: 'g-5',
    homeTeam: 'Phoenix U16',
    awayTeam: 'Wolves U16',
    grade: 'U16 Girls',
    venue: 'Court 3',
    kickoffAt: '2026-04-16T19:00:00+10:00', // Thursday (excluded)
  },
];

describe('scores/fixtures', () => {
  test('sorts kickoff ascending with TBA entries last', () => {
    const mondayOnly = rawFixtures.filter((f) => ['g-1', 'g-2', 'g-3'].includes(f.fixtureId));
    const sorted = sortFixturesForDay(mondayOnly, 'Australia/Melbourne');

    expect(sorted.map((f) => f.fixtureId)).toEqual(['g-2', 'g-1', 'g-3']);
    expect(sorted[2].kickoffDisplay).toBe('TBA');
  });

  test('groups fixtures into fixed Mon/Tue/Wed/Fri buckets and excludes Thu/Sat/Sun', () => {
    const grouped = groupFixturesByDay(rawFixtures, 'Australia/Melbourne');

    expect(Object.keys(grouped)).toEqual(['monday', 'tuesday', 'wednesday', 'friday']);
    expect(grouped.monday.map((f) => f.fixtureId)).toEqual(['g-2', 'g-1', 'g-3']);
    expect(grouped.tuesday).toEqual([]);
    expect(grouped.wednesday).toEqual([]);
    expect(grouped.friday.map((f) => f.fixtureId)).toEqual(['g-4']);
  });

  test('suppresses hidden squad and player fields in details model', () => {
    const detail = buildGameDetailViewModel({
      fixtureId: 'g-6',
      homeTeam: 'Phoenix U18',
      awayTeam: 'Eagles U18',
      kickoffAt: '2026-04-17T20:00:00+10:00',
      venue: 'Court 2',
      squads: [
        {
          teamName: 'Phoenix U18',
          hidden: true,
          players: [{ name: 'Hidden Player', hidden: false }],
        },
        {
          teamName: 'Eagles U18',
          hidden: false,
          players: [
            { name: 'Visible Player', hidden: false },
            { name: 'Hidden Player 2', hidden: true },
          ],
        },
      ],
    });

    expect(detail.squads).toHaveLength(1);
    expect(detail.squads?.[0].teamName).toBe('Eagles U18');
    expect(detail.squads?.[0].players).toEqual([{ name: 'Visible Player' }]);
  });
});
