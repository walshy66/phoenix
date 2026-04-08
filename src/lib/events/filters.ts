// Event filtering and sorting utilities
// Filters events by status and sorts them chronologically with tiebreaker

import { Event } from './types';

/**
 * Filter events by status (upcoming or past)
 * @param events Array of events to filter
 * @param status Either 'upcoming' or 'past'
 * @returns Filtered array of events
 */
export function filterByStatus(events: Event[], status: 'upcoming' | 'past'): Event[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison

  return events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0); // Set to start of day

    if (status === 'upcoming') {
      // Upcoming: date >= today (build date)
      return eventDate >= today;
    } else {
      // Past: date < today (build date)
      return eventDate < today;
    }
  });
}

/**
 * Sort events chronologically with tiebreaker by title
 * @param events Array of events to sort
 * @param order Either 'asc' (ascending) or 'desc' (descending)
 * @returns Sorted array of events
 */
export function sortChronologically(events: Event[], order: 'asc' | 'desc' = 'asc'): Event[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    // If dates are different, sort by date
    if (dateA !== dateB) {
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // If dates are the same, sort alphabetically by title (tiebreaker)
    return a.title.localeCompare(b.title);
  });
}

/**
 * Get upcoming events sorted chronologically (earliest first)
 * @param events Array of all events
 * @returns Upcoming events sorted ascending by date
 */
export function getUpcomingEvents(events: Event[]): Event[] {
  return sortChronologically(filterByStatus(events, 'upcoming'), 'asc');
}

/**
 * Get past events sorted chronologically (most recent first)
 * @param events Array of all events
 * @returns Past events sorted descending by date
 */
export function getPastEvents(events: Event[]): Event[] {
  return sortChronologically(filterByStatus(events, 'past'), 'desc');
}