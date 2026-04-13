export type WeekWindow = {
  startDate: string;
  endDate: string;
  timezone: string;
};

const WEEKDAY_INDEX: Record<string, number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 7,
};

function getIsoDateInTimezone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getWeekdayIndexInTimezone(date: Date, timeZone: string): number {
  const weekday = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    weekday: 'short',
  })
    .format(date)
    .slice(0, 3)
    .toLowerCase();

  return WEEKDAY_INDEX[weekday] ?? 1;
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

export function getUpcomingWeekWindow(referenceDate = new Date(), timeZone = 'Australia/Melbourne'): WeekWindow {
  const localIsoDate = getIsoDateInTimezone(referenceDate, timeZone);
  const weekdayIndex = getWeekdayIndexInTimezone(referenceDate, timeZone);

  const offsetToMonday = weekdayIndex <= 5 ? 1 - weekdayIndex : 8 - weekdayIndex;
  const monday = addDaysToIsoDate(localIsoDate, offsetToMonday);
  const friday = addDaysToIsoDate(monday, 4);

  return {
    startDate: monday,
    endDate: friday,
    timezone: timeZone,
  };
}
