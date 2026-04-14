export interface TrainingSession {
  day: string
  timeSlots: {
    time: string
    ageGroups: string[]
  }[]
}

export interface Venue {
  id: string
  name: string
  shortCode: string
  address: string
  suburb: string
  parking: string | null
  contact: string | null
  mapUrl: string | null
  trainingSchedule: TrainingSession[]
}

export const VENUES: Venue[] = [
  {
    id: 'bse',
    name: 'Bendigo South East College',
    shortCode: 'BSE',
    address: '56 Ellis St, Flora Hill VIC 3550 (Enter via Keck St)',
    suburb: 'Flora Hill',
    parking: null,
    contact: null,
    mapUrl: 'https://maps.app.goo.gl/FCia6GfDHqZwHWq6A',
    trainingSchedule: [
      {
        day: 'Sunday',
        timeSlots: [
          { time: '4–5pm', ageGroups: ['U10 Girls', 'U14 & U16 Girls'] },
          { time: '5–7pm', ageGroups: ['U16 & U18 Boys'] },
        ],
      },
    ],
  },
  {
    id: 'vcc',
    name: 'Victory Christian College',
    shortCode: 'VCC',
    address: '6 Kairn Rd, Strathdale VIC 3550',
    suburb: 'Strathdale',
    parking: null,
    contact: null,
    mapUrl: 'https://maps.app.goo.gl/y1g1ByEkq3HA3AAF7',
    trainingSchedule: [
      {
        day: 'Wednesday',
        timeSlots: [
          { time: '6–7pm', ageGroups: ['U10 Boys & Girls'] },
          { time: '7–8pm', ageGroups: ['U12 Boys'] },
        ],
      },
    ],
  },
]
