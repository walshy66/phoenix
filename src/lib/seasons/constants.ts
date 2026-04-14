import type { SeasonCardConfig } from './types'

export const SEASON_CARDS: SeasonCardConfig[] = [
  {
    id: 'winter-2026',
    name: 'Winter 2026',
    role: 'current',
    status: 'active',
    clickable: true,
    navigationTarget: '/teams',
    navigationExternal: false,
    statusBadgeLabel: 'Grading',
    icon: '❄️',
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
    id: 'summer-2026-27',
    name: 'Summer 2026/27',
    role: 'next',
    status: 'coming_soon',
    clickable: false,
    navigationTarget: null,
    navigationExternal: false,
    statusBadgeLabel: 'Not Taking Registrations',
    icon: '🛑',
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
