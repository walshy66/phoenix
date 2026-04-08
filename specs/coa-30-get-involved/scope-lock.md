# Scope Lock: Get Involved Events Page Redesign (COA-30)

## IN SCOPE
- Redesign `/get-involved` page to display dynamic event tiles from `src/data/events.md`
- Create reusable EventTile component for event cards
- Create reusable EventModal component for detail views with keyboard accessibility
- Implement status-based filtering (upcoming vs past) and chronological sorting
- Add visual distinction between Upcoming and Past Events sections
- Handle empty states: placeholder for no upcoming events, hide Past Events section when empty
- Implement image fallback for broken/missing images with proper alt text
- Provide maintainer workflow documentation for updating events via Claude Code
- Ensure WCAG AA accessibility compliance (keyboard navigation, focus management, ARIA labels)
- Build-time validation of events.md with warnings (not errors) for invalid events
- Responsive design across mobile (<640px), tablet (640-1024px), desktop (>1024px) breakpoints

## OUT OF SCOPE
- Pagination or "load more" functionality for large event lists (documented as future growth strategy)
- Custom navigation shells or alterations to BaseLayout structure
- Runtime database or API for event storage (events.md remains build-time source)
- New npm dependencies beyond existing Astro/Tailwind/browser APIs (vanilla JS for modal)
- Event creation UI within the site itself (maintainers use Claude Code workflow)
- Internationalization or multiple language support
- Advanced analytics or event tracking beyond basic rendering
- Integration with external calendar systems (iCal, Google Calendar, etc.)
- Ticketing or RSVP functionality for events
- Recurring event handling (each event instance must be separate entry)