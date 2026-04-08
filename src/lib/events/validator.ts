// Event validation utility
// Validates individual event objects for required fields and correct formats

import { Event } from './types';

/**
 * Validate an event object
 * Returns true if valid, false otherwise
 * Logs specific warnings for invalid fields
 */
export function validateEvent(event: Partial<Event>): boolean {
  const requiredFields: Array<keyof Event> = ['id', 'title', 'date', 'image', 'status'];

  // Check required fields
  for (const field of requiredFields) {
    if (!(field in event) || !event[field]) {
      console.warn(`Validation error: Event missing required field "${field}"`, event);
      return false;
    }
  }

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    console.warn(`Validation error: Event has invalid date format "${event.date}"`, event);
    return false;
  }

  // Validate status is either 'upcoming' or 'past'
  if (event.status !== 'upcoming' && event.status !== 'past') {
    console.warn(`Validation error: Event has invalid status "${event.status}"`, event);
    return false;
  }

  // Validate time format if provided (HH:MM)
  if (event.time && !/^\d{2}:\d{2}$/.test(event.time)) {
    console.warn(`Validation warning: Event time format should be HH:MM, got "${event.time}"`, event);
    // Not returning false here as time is optional and we want to be lenient
  }

  // Validate updated format if provided (ISO date)
  if (event.updated && !/^\d{4}-\d{2}-\d{2}$/.test(event.updated)) {
    console.warn(`Validation warning: Event updated field should be YYYY-MM-DD, got "${event.updated}"`, event);
    // Not returning false here as updated is optional and for maintainer reference only
  }

  return true;
}

/**
 * Validate an array of events
 * Returns array of valid events and logs warnings for invalid ones
 */
export function validateEvents(events: Partial<Event>[]): Event[] {
  const validEvents: Event[] = [];

  for (const event of events) {
    if (validateEvent(event)) {
      validEvents.push(event as Event);
    }
  }

  return validEvents;
}