// Event Parser Unit Tests
// Tests are written first (TDD). Run with: npx vitest run

import { describe, test, expect } from 'vitest';
import {
  parseEvents,
  validateEvent,
  validateEvents,
  filterByStatus,
  sortChronologically,
  getUpcomingEvents,
  getPastEvents
} from '.';

// Test data
const validEventYaml = `
---
id: "test-event-1"
title: "Test Event"
date: "2026-05-15"
time: "19:30"
location: "Test Location"
description: "This is a test event"
image: "/images/events/test.jpg"
status: "upcoming"
updated: "2026-04-08"
---`;

const invalidEventMissingFieldYaml = `
---
id: "test-event-2"
title: "Test Event Missing Date"
date: "2026-05-15"
image: "/images/events/test.jpg"
status: "upcoming"
---`;

const invalidEventBadDateYaml = `
---
id: "test-event-3"
title: "Test Event Bad Date"
date: "2026/05/15"
time: "19:30"
location: "Test Location"
description: "This is a test event"
image: "/images/events/test.jpg"
status: "upcoming"
updated: "2026-04-08"
---`;

const invalidEventBadStatusYaml = `
---
id: "test-event-4"
title: "Test Event Bad Status"
date: "2026-05-15"
time: "19:30"
location: "Test Location"
description: "This is a test event"
image: "/images/events/test.jpg"
status: "cancelled"
updated: "2026-04-08"
---`;

const multipleEventsYaml = `
---
id: "upcoming-event"
title: "Upcoming Event"
date: "2026-05-15"
image: "/images/events/upcoming.jpg"
status: "upcoming"
---
---
id: "past-event"
title: "Past Event"
date: "2026-03-15"
image: "/images/events/past.jpg"
status: "past"
---
---
id: "another-upcoming"
title: "Another Upcoming Event"
date: "2026-05-10"
image: "/images/events/another-upcoming.jpg"
status: "upcoming"
---
`;

describe('Event Parser', () => {
  test('parse valid YAML frontmatter block', () => {
    const events = parseEvents(validEventYaml);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: "test-event-1",
      title: "Test Event",
      date: "2026-05-15",
      time: "19:30",
      location: "Test Location",
      description: "This is a test event",
      image: "/images/events/test.jpg",
      status: "upcoming",
      updated: "2026-04-08"
    });
  });

  test('parse multiple YAML blocks', () => {
    const events = parseEvents(multipleEventsYaml);
    expect(events).toHaveLength(3);
    expect(events[0].id).toBe("upcoming-event");
    expect(events[1].id).toBe("past-event");
    expect(events[2].id).toBe("another-upcoming");
  });

  test('skip invalid YAML blocks (missing required field)', () => {
    const events = parseEvents(invalidEventMissingFieldYaml);
    expect(events).toHaveLength(0); // Should skip invalid event
  });

  test('skip invalid YAML blocks (bad date format)', () => {
    const events = parseEvents(invalidEventBadDateYaml);
    expect(events).toHaveLength(0); // Should skip invalid event
  });

  test('skip invalid YAML blocks (bad status)', () => {
    const events = parseEvents(invalidEventBadStatusYaml);
    expect(events).toHaveLength(0); // Should skip invalid event
  });
});

describe('Event Validator', () => {
  test('validate valid event object', () => {
    const event = {
      id: "test-event",
      title: "Test Event",
      date: "2026-05-15",
      time: "19:30",
      location: "Test Location",
      description: "This is a test event",
      image: "/images/events/test.jpg",
      status: "upcoming",
      updated: "2026-04-08"
    };

    expect(validateEvent(event)).toBe(true);
  });

  test('invalidate event missing required field', () => {
    const event = {
      id: "test-event",
      title: "Test Event",
      // missing date
      image: "/images/events/test.jpg",
      status: "upcoming"
    };

    expect(validateEvent(event)).toBe(false);
  });

  test('invalidate event with bad date format', () => {
    const event = {
      id: "test-event",
      title: "Test Event",
      date: "2026/05/15", // Invalid format
      image: "/images/events/test.jpg",
      status: "upcoming"
    };

    expect(validateEvent(event)).toBe(false);
  });

  test('invalidate event with bad status', () => {
    const event = {
      id: "test-event",
      title: "Test Event",
      date: "2026-05-15",
      image: "/images/events/test.jpg",
      status: "cancelled" // Invalid status
    };

    expect(validateEvent(event)).toBe(false);
  });

  test('validate array of events mixes valid and invalid', () => {
    const events = [
      {
        id: "valid-event",
        title: "Valid Event",
        date: "2026-05-15",
        image: "/images/events/valid.jpg",
        status: "upcoming"
      },
      {
        id: "invalid-event",
        title: "Invalid Event",
        // missing date
        image: "/images/events/invalid.jpg",
        status: "upcoming"
      }
    ];

    const validEvents = validateEvents(events);
    expect(validEvents).toHaveLength(1);
    expect(validEvents[0].id).toBe("valid-event");
  });
});

describe('Event Filters', () => {
  const testEvents = [
    {
      id: "upcoming-1",
      title: "Upcoming Event 1",
      date: "2026-05-15",
      image: "/images/events/upcoming1.jpg",
      status: "upcoming"
    },
    {
      id: "upcoming-2",
      title: "Upcoming Event 2",
      date: "2026-05-20",
      image: "/images/events/upcoming2.jpg",
      status: "upcoming"
    },
    {
      id: "past-1",
      title: "Past Event 1",
      date: "2026-03-15",
      image: "/images/events/past1.jpg",
      status: "past"
    },
    {
      id: "past-2",
      title: "Past Event 2",
      date: "2026-03-10",
      image: "/images/events/past2.jpg",
      status: "past"
    }
  ];

  test('filter upcoming events correctly', () => {
    const upcoming = filterByStatus(testEvents, 'upcoming');
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].id).toBe("upcoming-1");
    expect(upcoming[1].id).toBe("upcoming-2");
  });

  test('filter past events correctly', () => {
    const past = filterByStatus(testEvents, 'past');
    expect(past).toHaveLength(2);
    expect(past[0].id).toBe("past-1");
    expect(past[1].id).toBe("past-2");
  });

  test('sort chronologically ascending', () => {
    const sorted = sortChronologically(testEvents, 'asc');
    // Should be: past-2 (Mar 10), past-1 (Mar 15), upcoming-1 (May 15), upcoming-2 (May 20)
    expect(sorted[0].id).toBe("past-2");
    expect(sorted[1].id).toBe("past-1");
    expect(sorted[2].id).toBe("upcoming-1");
    expect(sorted[3].id).toBe("upcoming-2");
  });

  test('sort chronologically descending', () => {
    const sorted = sortChronologically(testEvents, 'desc');
    // Should be: upcoming-2 (May 20), upcoming-1 (May 15), past-1 (Mar 15), past-2 (Mar 10)
    expect(sorted[0].id).toBe("upcoming-2");
    expect(sorted[1].id).toBe("upcoming-1");
    expect(sorted[2].id).toBe("past-1");
    expect(sorted[3].id).toBe("past-2");
  });

  test('getUpcomingEvents returns correctly sorted upcoming events', () => {
    const upcoming = getUpcomingEvents(testEvents);
    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].id).toBe("upcoming-1"); // Earlier date first
    expect(upcoming[1].id).toBe("upcoming-2");
  });

  test('getPastEvents returns correctly sorted past events', () => {
    const past = getPastEvents(testEvents);
    expect(past).toHaveLength(2);
    expect(past[0].id).toBe("past-1"); // Most recent first (Mar 15 before Mar 10)
    expect(past[1].id).toBe("past-2");
  });

  test('sort tiebreaker by title when dates are equal', () => {
    const tiebreakerEvents = [
      {
        id: "event-b",
        title: "B Event",
        date: "2026-05-15",
        image: "/images/events/b.jpg",
        status: "upcoming"
      },
      {
        id: "event-a",
        title: "A Event",
        date: "2026-05-15",
        image: "/images/events/a.jpg",
        status: "upcoming"
      }
    ];

    const sorted = sortChronologically(tiebreakerEvents, 'asc');
    expect(sorted[0].title).toBe("A Event"); // Alphabetical tiebreaker
    expect(sorted[1].title).toBe("B Event");
  });
});