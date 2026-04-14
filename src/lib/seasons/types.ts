/**
 * Seasons domain types
 */

export type SeasonRole = 'current' | 'next' | 'previous' | 'archive'
export type SeasonStatus = 'active' | 'coming_soon' | 'completed'

export interface Season {
  id: string
  name: string
  startDate: string
  endDate: string
  role: SeasonRole
  status: SeasonStatus
}

export interface SeasonCardConfig {
  id: string
  name: string
  status: SeasonStatus
  role: SeasonRole
  clickable: boolean
  navigationTarget: string | null
  navigationExternal: boolean
  statusBadgeLabel: string
  icon: string
}

export interface KeyDate {
  label: string
  date: string
  description?: string
}

export interface RegistrationCost {
  id: string
  category: string
  cost: number
  description?: string
}
