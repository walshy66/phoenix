/**
 * COA-24: Seasons Page — Utility Functions
 *
 * Provides helper functions for formatting, filtering, and role determination.
 *
 * Traceability: FR-001 (display logic), Principle III (Backend Authority)
 */

import type { Season, SeasonRole } from './types';

/**
 * Format ISO 8601 date to readable string
 *
 * Example: '2026-06-01' → 'June 1, 2026'
 *
 * @param iso ISO 8601 date string (YYYY-MM-DD format)
 * @returns Readable date string or 'Date TBA' if invalid
 */
export function formatDate(iso: string): string {
  if (!iso || typeof iso !== 'string') {
    return 'Date TBA';
  }

  try {
    // Parse ISO date (YYYY-MM-DD or full ISO 8601)
    const date = new Date(iso);

    // Verify the date is valid
    if (isNaN(date.getTime())) {
      return 'Date TBA';
    }

    // Format using Intl.DateTimeFormat for locale-aware formatting
    const formatter = new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return formatter.format(date);
  } catch {
    return 'Date TBA';
  }
}

/**
 * Determine if archive should be shown based on season count
 *
 * Per spec FR-001: Archive only shows when 2+ distinct calendar years exist
 * IMPORTANT: This is a reference helper only. Backend MUST determine archive visibility.
 *
 * @param seasons Array of Season objects
 * @returns true if 2+ distinct calendar years present, false otherwise
 */
export function shouldShowArchive(seasons: Season[]): boolean {
  if (!seasons || seasons.length === 0) {
    return false;
  }

  // Extract unique years from all season dates
  const years = new Set<number>();

  seasons.forEach((season) => {
    try {
      const startYear = new Date(season.startDate).getFullYear();
      const endYear = new Date(season.endDate).getFullYear();

      years.add(startYear);
      years.add(endYear);
    } catch {
      // Skip seasons with invalid dates
    }
  });

  // Archive shows only if 2+ distinct years
  return years.size >= 2;
}

/**
 * Get human-readable season role label
 *
 * Converts backend role enum to display-friendly text.
 *
 * @param season Season object
 * @returns Human-readable role label ('Current', 'Next', 'Previous', 'Archive')
 */
export function getSeasonRoleLabel(season: Season): string {
  const roleMap: Record<string, string> = {
    current: 'Current',
    next: 'Next',
    previous: 'Previous',
    archive: 'Archive',
  };

  return roleMap[season.role] || 'Season';
}

/**
 * Format currency amount to AUD string
 *
 * Example: 150.00 → '$150.00'
 * Locale: en-AU (Australian Dollars)
 *
 * @param amount Numeric cost in AUD
 * @returns Formatted currency string (e.g., '$150.00')
 */
export function getCurrencyFormatted(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Price TBA';
  }

  try {
    const formatter = new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(amount);
  } catch {
    return 'Price TBA';
  }
}

/**
 * Get emoji icon for season role
 *
 * Used in SeasonTile for visual identification.
 * Current → 🏆, Next → 📅, Previous → 📚, Archive → 📦
 *
 * @param role Season role
 * @returns Emoji character
 */
export function getSeasonRoleEmoji(role: SeasonRole): string {
  const emojiMap: Record<SeasonRole, string> = {
    current: '🏆',
    next: '📅',
    previous: '📚',
    archive: '📦',
  };

  return emojiMap[role] || '🏆';
}
