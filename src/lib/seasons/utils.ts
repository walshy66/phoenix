import type { Season, SeasonCardConfig, SeasonRole } from './types'

export function formatDate(iso: string): string {
  if (!iso || typeof iso !== 'string') return 'Date TBA'

  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return 'Date TBA'

    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  } catch {
    return 'Date TBA'
  }
}

export function shouldShowArchive(seasons: Season[]): boolean {
  if (!seasons || seasons.length === 0) return false

  const years = new Set<number>()
  seasons.forEach((season) => {
    try {
      years.add(new Date(season.startDate).getFullYear())
      years.add(new Date(season.endDate).getFullYear())
    } catch {
      // noop
    }
  })

  return years.size >= 2
}

export function getSeasonRoleLabel(season: Season): string {
  const roleMap: Record<string, string> = {
    current: 'Current',
    next: 'Next',
    previous: 'Previous',
    archive: 'Archive',
  }

  return roleMap[season.role] || 'Season'
}

export function getCurrencyFormatted(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Price TBA'

  try {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return 'Price TBA'
  }
}

export function getSeasonRoleEmoji(role: SeasonRole): string {
  const emojiMap: Record<SeasonRole, string> = {
    current: '🏆',
    next: '📅',
    previous: '📚',
    archive: '📦',
  }

  return emojiMap[role] || '🏆'
}

export function getSeasonAriaLabel(season: SeasonCardConfig): string {
  if (season.clickable && season.navigationExternal) {
    return `${season.name}, ${season.statusBadgeLabel}, view on PlayHQ (opens in new tab)`
  }

  if (season.clickable) {
    return `${season.name}, ${season.statusBadgeLabel}, view Teams page`
  }

  return `${season.name}, ${season.statusBadgeLabel}, not yet available`
}
