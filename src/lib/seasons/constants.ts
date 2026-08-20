import type { SeasonCardConfig } from './types'

export const SUMMER_2026_27_ENQUIRY_MODAL_ID = 'summer-2026-27-registration-enquiry'

export const SEASON_CARDS: SeasonCardConfig[] = [
  {
    id: 'winter-2026',
    name: 'Winter 2026',
    role: 'current',
    status: 'active',
    clickable: true,
    navigationTarget: '/teams',
    navigationExternal: false,
    statusBadgeLabel: 'Live',
    icon: '❄️',
  },
  {
    id: 'summer-2026-27',
    name: 'Summer 2026/27',
    role: 'next',
    status: 'registration_open',
    clickable: true,
    navigationTarget: null,
    navigationExternal: false,
    statusBadgeLabel: 'Registrations Open',
    icon: '🔥',
    enquiryModalId: SUMMER_2026_27_ENQUIRY_MODAL_ID,
  },
  {
    id: 'summer-2025-26',
    name: 'Summer 2025/26',
    role: 'previous',
    status: 'completed',
    clickable: true,
    navigationTarget:
      'https://www.playhq.com/basketball-victoria/org/bendigo-basketball-association/domestic-competition-summer-202526/0bf74768',
    navigationExternal: true,
    statusBadgeLabel: 'Complete',
    icon: '🏁',
  },
  {
    id: 'archive',
    name: 'Archive',
    role: 'archive',
    status: 'coming_soon',
    clickable: false,
    navigationTarget: null,
    navigationExternal: false,
    statusBadgeLabel: 'Coming Soon',
    icon: '🗄️',
  },
]
