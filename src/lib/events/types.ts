// Event and EventSection TypeScript interfaces
// Based on the specification in plan.md lines 157-176

export interface Event {
  // Required fields
  id: string;              // Unique slug (kebab-case, e.g., "phoenix-vs-albury")
  title: string;           // Event name
  date: string;            // ISO date YYYY-MM-DD
  image: string;           // Relative path, e.g., "/images/events/may-match.png"
  status: 'upcoming' | 'past'; // Controls which section

  // Optional fields
  alt?: string;            // Descriptive alt text for image (WCAG compliance)
  time?: string;           // HH:MM (24-hour, AEST)
  location?: string;       // Venue/location name
  description?: string;    // Event description (max 500 chars recommended)
  updated?: string;        // ISO date of last update (maintainer reference only)
}

export interface EventSection {
  title: 'Upcoming Events' | 'Past Events';
  events: Event[];
  visibility: boolean;     // true if section should render
}