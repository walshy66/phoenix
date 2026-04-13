const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'friday'] as const;

type DayKey = (typeof DAY_KEYS)[number];

type RawSquadPlayer = {
  name?: string;
  hidden?: boolean;
  visibilityFlags?: { hidden?: boolean };
};

type RawSquad = {
  teamName?: string;
  hidden?: boolean;
  visibilityFlags?: { hidden?: boolean };
  players?: RawSquadPlayer[];
};

export type RawFixture = {
  fixtureId?: string;
  gameId?: string;
  id?: string;
  homeTeam?: string;
  awayTeam?: string;
  grade?: string;
  venue?: string;
  court?: string;
  kickoffAt?: string | null;
  dayOfWeek?: string;
  squads?: RawSquad[];
};

export type NormalizedFixture = {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  grade: string | null;
  venue: string | null;
  court: string | null;
  kickoffAt: string | null;
  kickoffDisplay: string;
  dayKey: DayKey | null;
};

const DAY_NAME_TO_KEY: Record<string, DayKey | null> = {
  monday: 'monday',
  tuesday: 'tuesday',
  wednesday: 'wednesday',
  thursday: null,
  friday: 'friday',
  saturday: null,
  sunday: null,
  mon: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  wed: 'wednesday',
  thu: null,
  thur: null,
  thurs: null,
  fri: 'friday',
  sat: null,
  sun: null,
};

function parseKickoff(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDayKeyFromKickoff(kickoff: Date | null, timeZone: string): DayKey | null {
  if (!kickoff) return null;
  const weekday = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    weekday: 'long',
  })
    .format(kickoff)
    .toLowerCase();

  return DAY_NAME_TO_KEY[weekday] ?? null;
}

function getDayKeyFromHint(dayOfWeek?: string): DayKey | null {
  if (!dayOfWeek) return null;
  return DAY_NAME_TO_KEY[dayOfWeek.trim().toLowerCase()] ?? null;
}

function getKickoffDisplay(kickoff: Date | null, timeZone: string): string {
  if (!kickoff) return 'TBA';
  return new Intl.DateTimeFormat('en-AU', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(kickoff);
}

export function normalizeFixture(raw: RawFixture, timeZone = 'Australia/Melbourne'): NormalizedFixture {
  const kickoff = parseKickoff(raw.kickoffAt);
  const dayKey = getDayKeyFromKickoff(kickoff, timeZone) ?? getDayKeyFromHint(raw.dayOfWeek);

  return {
    fixtureId: raw.fixtureId ?? raw.gameId ?? raw.id ?? 'unknown-fixture',
    homeTeam: raw.homeTeam ?? 'TBD',
    awayTeam: raw.awayTeam ?? 'TBD',
    grade: raw.grade ?? null,
    venue: raw.venue ?? null,
    court: raw.court ?? null,
    kickoffAt: kickoff ? kickoff.toISOString() : null,
    kickoffDisplay: getKickoffDisplay(kickoff, timeZone),
    dayKey,
  };
}

function fixtureSort(a: NormalizedFixture, b: NormalizedFixture): number {
  const aTimed = Boolean(a.kickoffAt);
  const bTimed = Boolean(b.kickoffAt);

  if (aTimed && bTimed) {
    return new Date(a.kickoffAt as string).getTime() - new Date(b.kickoffAt as string).getTime();
  }

  if (aTimed && !bTimed) return -1;
  if (!aTimed && bTimed) return 1;

  return `${a.homeTeam}-${a.awayTeam}`.localeCompare(`${b.homeTeam}-${b.awayTeam}`);
}

export function sortFixturesForDay(fixtures: RawFixture[], timeZone = 'Australia/Melbourne'): NormalizedFixture[] {
  return fixtures.map((fixture) => normalizeFixture(fixture, timeZone)).sort(fixtureSort);
}

export function groupFixturesByDay(fixtures: RawFixture[], timeZone = 'Australia/Melbourne'): Record<DayKey, NormalizedFixture[]> {
  const grouped: Record<DayKey, NormalizedFixture[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    friday: [],
  };

  const seen = new Set<string>();

  for (const fixture of fixtures) {
    const normalized = normalizeFixture(fixture, timeZone);

    if (!normalized.dayKey) continue;
    if (seen.has(normalized.fixtureId)) continue;

    seen.add(normalized.fixtureId);
    grouped[normalized.dayKey].push(normalized);
  }

  for (const key of DAY_KEYS) {
    grouped[key].sort(fixtureSort);
  }

  return grouped;
}

export function buildGameDetailViewModel(raw: RawFixture, timeZone = 'Australia/Melbourne') {
  const normalized = normalizeFixture(raw, timeZone);

  const squads = (raw.squads ?? [])
    .filter((squad) => !squad.hidden && !squad.visibilityFlags?.hidden)
    .map((squad) => ({
      teamName: squad.teamName ?? 'Team',
      players: (squad.players ?? [])
        .filter((player) => !player.hidden && !player.visibilityFlags?.hidden)
        .map((player) => ({ name: player.name ?? 'Player' })),
    }));

  return {
    fixtureId: normalized.fixtureId,
    homeTeam: normalized.homeTeam,
    awayTeam: normalized.awayTeam,
    kickoffAt: normalized.kickoffAt,
    kickoffDisplay: normalized.kickoffDisplay,
    venue: normalized.venue,
    court: normalized.court,
    grade: normalized.grade,
    squads,
  };
}
