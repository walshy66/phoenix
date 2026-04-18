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
  mapImageSrc: string | null
  mapImageAlt: string | null
  mapEmbedSrc: string | null
  labelSuffix: string | null
  trainingSchedule: TrainingSession[]
}

export const VENUES: Venue[] = [
  {
    id: 'bse',
    name: 'Bendigo South East College',
    shortCode: 'BSE',
    address: 'Keck St, Flora Hill VIC 3550',
    suburb: 'Flora Hill',
    parking: null,
    contact: null,
    mapUrl: 'https://maps.app.goo.gl/LtV3Z1tyBqdnpBMa9',
    mapImageSrc: null,
    mapImageAlt: 'Map preview for Bendigo South East College',
    mapEmbedSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1597.8623417329936!2d144.2971367499597!3d-36.777171696597804!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad75b6f50e06873%3A0x44ebd7ac801751c!2sFlora%20Hill%20Stadium!5e0!3m2!1sen!2sau!4v1776475773180!5m2!1sen!2sau',
    labelSuffix: 'Flora Hill Stadium',
    trainingSchedule: [
      {
        day: 'Sunday',
        timeSlots: [
          { time: '4–5pm', ageGroups: ['U10s (Firebirds)', 'U14s (Boys)', 'U14 & U16 (Girls)'] },
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
    mapImageSrc: '/images/venues/vcc-map.svg',
    mapImageAlt: 'Map preview for Victory Christian College',
    mapEmbedSrc: 'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3195.4811116623387!2d144.3165807!3d-36.7830136!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad75bd7fcad8ba9%3A0x29a0c0c0dbf412f7!2sVictory%20Christian%20College!5e0!3m2!1sen!2sau!4v1776475828569!5m2!1sen!2sau',
    labelSuffix: null,
    trainingSchedule: [
      {
        day: 'Wednesday',
        timeSlots: [
          { time: '6–7pm', ageGroups: ['U10s (Thunder & Go Getters)'] },
          { time: '7–8pm', ageGroups: ['U12s (Boys)'] },
        ],
      },
    ],
  },
]
