# Research & Design Decisions: COA-30 Get Involved Events

---

## Design Decisions Summary

### Decision 1: Empty Past Events Section - Hide vs. Show Placeholder

**Question**: Should the Past Events section be hidden if empty, or show a placeholder message?

**Chosen**: Hide section entirely

**Rationale**:
- Past events are secondary engagement value; MVP launches with 3-5 past events
- Showing empty section wastes vertical space with no information
- Cleaner UX: user doesn't think about past events if none exist yet
- As club matures and builds history, section naturally appears
- Implementation: One-line conditional check in page component

**Alternatives Rejected**:
- Show placeholder ("No past events yet"): Adds clutter for MVP; takes space
- Lazy-load past events: Adds complexity; unnecessary for MVP

---

### Decision 2: Modal Implementation - Custom vs. Library

**Question**: Build custom modal or use headless-ui (or similar)?

**Chosen**: Custom vanilla JavaScript + Astro + Tailwind CSS

**Rationale**:
- **Principle VIII (Dependency Hygiene)**: No new npm dependencies
- **Simplicity**: Modal is straightforward interaction (open/close, focus trap, Escape key)
- **Maintainability**: 100 lines of JS; easy to understand and modify
- **Flexibility**: Full control over animations, styling, behavior
- **Reusability**: Component pattern allows use in other features (e.g., Player modals, Sponsor details)
- **Bundle**: No penalty; vanilla JS is smallest possible

**Implementation Sketch**:
```astro
<!-- EventModal.astro -->
---
interface Props {
  event: Event;
}

const { event } = Astro.props;
---

<div id={`modal-${event.id}`} class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
  <div class="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
    <!-- Modal content -->
    <button class="close-btn" aria-label="Close modal">×</button>
    <!-- Event details -->
  </div>
</div>

<script define:vars={{ eventId: event.id }}>
  // Focus trap, close on Escape/backdrop, return focus on close
</script>
```

**Alternatives Rejected**:
- headless-ui: Adds 7KB+ overhead; overkill for single modal
- Third-party modal library: Increases dependency surface; harder to customize
- HTML `<dialog>` element: Good option, but less control over animations; consider for Phase 2 refactor

---

### Decision 3: Today's Date Reference - Build Time vs. Client Time

**Question**: How do we determine "today" for filtering upcoming vs. past events?

**Chosen**: Use Astro build time as "today"

**Rationale**:
- **Principle III (Backend Authority)**: All event filtering deterministic at build time
- **No Client-Side Logic**: Avoids client-side date comparison (simpler, faster, deterministic)
- **Deployment Model**: events.md regenerated on each deploy; build time is reliable reference
- **Status Changes**: Event moves from "upcoming" → "past" after date passes; maintainer deploys to reflect
- **Timezone**: AEST assumed for Bendigo context; documented in events.md examples
- **Predictability**: All filtering verifiable during build; no surprises at runtime

**Implementation**:
```typescript
// In parser/filters.ts
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const upcoming = events.filter(e => e.date >= today);
const past = events.filter(e => e.date < today);
```

**Edge Case**: Event date passes at 3pm, but site built in morning?
- Event still shows as "upcoming" until next deploy
- Acceptable trade-off; events naturally transition when maintainer reviews and deploys
- If real-time transition needed, move date comparison to client (future enhancement)

**Alternatives Rejected**:
- Client-side comparison: Violates Principle III; relies on client time (unreliable)
- Server-side API endpoint: Overkill; static site doesn't have server
- Scheduled rebuilds: Complex infrastructure; simpler to deploy when date passes

---

### Decision 4: Modal Animation - Duration, Easing, Effects

**Question**: What animation effect for modal entrance/exit?

**Chosen**: Fade-in + scale-up with 250ms duration

**Rationale**:
- **Performance**: 250ms is imperceptible yet smooth (not instantaneous, not slow)
- **UX**: Scale-up conveys importance; fade-in is elegant
- **Tailwind**: Easy to implement with opacity + scale utilities + transition
- **Mobile**: Quick enough to feel responsive; not jarring on slow devices

**CSS Implementation**:
```css
/* modal.initial: opacity-0 scale-95 */
/* modal.active: opacity-100 scale-100 */
/* transition-all duration-250 ease-out */
```

**Backdrop Effect**:
- Semi-transparent black (bg-black/50)
- Optional: Slight blur on page content (backdrop-blur-sm)
- Prevents accidental clicks on page elements while modal open

---

### Decision 5: Image Asset Organization

**Question**: Where do event images live? Size/format requirements?

**Chosen**: `public/images/events/` directory

**Rationale**:
- **Convention**: Matches site structure (public/images/team/, public/images/heroes/)
- **Accessibility**: Public directory is served statically; no auth needed
- **Clarity**: Event images obviously event-related

**Asset Requirements** (documented for maintainers):
- **Directory**: `public/images/events/`
- **Filename**: kebab-case (e.g., "phoenix-vs-albury.png")
- **Size**: 400x250px recommended (4:3 aspect ratio)
- **Format**: PNG (preferred), JPG (acceptable)
- **File Size**: < 200KB per image
- **Optimization**: Run through ImageOptim or equivalent before upload

**Path Format in events.md**:
```yaml
image: "/images/events/phoenix-vs-albury.png"
```

**Fallback on Missing Image**:
- Display SVG icon: calendar, basketball, event badge
- Alt text: "[Event Title] — [Date]"
- Logged warning at build time for maintainer awareness

---

### Decision 6: Sorting Tiebreaker - Same Date Events

**Question**: If two events share same date, how to sort?

**Chosen**: Alphabetical by event title

**Rationale**:
- **Deterministic**: No ambiguity; always same order
- **Intuitive**: Alphabetical is familiar tiebreaker
- **Rare**: Most dates unique; tiebreaker rarely triggered
- **Stable**: Sort order stable across builds (important for user expectations)

**Implementation**:
```typescript
events.sort((a, b) => {
  const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
  if (dateCompare !== 0) return dateCompare; // sort by date first
  return a.title.localeCompare(b.title); // tiebreaker: alphabetical
});
```

---

### Decision 7: Pagination Strategy for Future Growth

**Question**: How to handle 100+ past events without infinite scroll?

**Chosen**: No pagination MVP; document growth strategy for Phase 2

**Rationale**:
- **MVP Scope**: 5-10 upcoming, 3-5 past events; page load remains fast
- **Future Decision**: When past events exceed 20, revisit approach
- **Options for Phase 2**:
  1. "Show More" button: Load additional past events on demand
  2. Pagination: "Past Events Page 1 of 3" with next/prev
  3. Year filter: "Past Events 2025", "Past Events 2024" tabs
  4. Time limit: Show only last 12 months of past events
- **Note**: events.md format supports unlimited events; no schema change needed

**Measurable Trigger**: If build time increases > 5% or page load increases > 0.5s, revisit

---

### Decision 8: Maintainer Workflow - Claude Code Integration

**Question**: How do maintainers update events without developer help?

**Chosen**: Claude Code prompt template + one-page guide

**Rationale**:
- **User Outcomes**: US-3 explicitly requires maintainer independence
- **Sustainability**: Without this, events become stale; feature loses credibility
- **Accessibility**: Non-technical users need clear, simple workflow
- **Automation**: Claude Code can parse flexible formats and generate valid events.md

**Workflow**:

1. **Maintainer provides data** to Claude Code in one of these formats:
   - Markdown list (bullets or blocks)
   - JSON array
   - Natural language ("Add an event on May 15 called Season Launch at 6:30pm")

2. **Claude Code prompt**:
   - Parses input (flexible format detection)
   - Generates updated events.md with new/modified events
   - Validates output is valid YAML
   - Provides review and commit instructions

3. **Validation & Commit**:
   - Maintainer reviews generated events.md
   - Runs `npm run build` locally to verify parsing
   - Commits to branch and creates PR
   - Optional: CI runs build; maintainer merges

**Prompt Template** (for Claude Code):

```
You are a helpful assistant for managing event data for Bendigo Phoenix Basketball Club website.

Maintainer wants to update events. They've provided the following information:

[MAINTAINER INPUT HERE]

Your task:
1. Parse the input (it may be markdown, JSON, natural language, or mixed format)
2. For each event, extract or infer:
   - id (unique kebab-case slug)
   - title (event name)
   - date (YYYY-MM-DD format)
   - image (path like /images/events/event-name.png)
   - status ("upcoming" or "past")
   - Optional: time (HH:MM), location, description, updated (today's date)
3. Generate an updated events.md file with all events (old + new)
4. Validate the output is valid YAML
5. Provide the updated events.md and commit instructions

Required fields: id, title, date, image, status
Optional fields: time, location, description, updated

Event format example:
---
id: "bendigo-phoenix-vs-albury"
title: "Bendigo Phoenix vs Albury"
date: "2026-05-15"
time: "19:30"
location: "Bendigo Basketball Stadium"
description: "Home game — support your team!"
image: "/images/events/may-match.png"
status: "upcoming"
updated: "2026-04-08"
---

Preserve all existing events in the output. Only modify or add events as specified.
Do NOT delete events unless explicitly told to.

Output the complete updated events.md ready to commit to src/data/events.md.
```

**Supported Input Formats**:

1. **Markdown list**:
   ```
   - Event: Bendigo Phoenix vs Albury
     Date: May 15, 2026
     Time: 6:30 PM
     Location: Basketball Stadium
     Status: Upcoming
     Description: Home game, come support!
     Image: may-match.png
   ```

2. **JSON array**:
   ```json
   [
     {
       "title": "Bendigo Phoenix vs Albury",
       "date": "2026-05-15",
       "time": "19:30",
       "location": "Bendigo Basketball Stadium",
       "status": "upcoming",
       "image": "/images/events/may-match.png"
     }
   ]
   ```

3. **Natural language**:
   ```
   Add an upcoming event: Bendigo Phoenix vs Albury on May 15, 2026 at 6:30 PM 
   at Bendigo Basketball Stadium. It's a home game. 
   Also mark the Junior Clinic (March 20) as past.
   ```

4. **CSV-style**:
   ```
   Event Name | Date | Time | Location | Status | Description
   Bendigo Phoenix vs Albury | 2026-05-15 | 19:30 | Bendigo Basketball Stadium | upcoming | Home game
   ```

**One-Page Maintainer Guide**:

```markdown
# Event Update Guide for Bendigo Phoenix

## How to Update Events (Non-Technical)

1. **Prepare your event data** in one of these formats:
   - Simple bullet list
   - JSON array (if you copy from elsewhere)
   - Just describe it in plain English
   - Paste a CSV or table

2. **Go to Claude Code** and paste:
   ```
   Hi Claude, I have new events for the website:
   
   [YOUR EVENT DATA HERE]
   
   Please update the events file and send me the updated version to commit.
   ```

3. **Claude will generate an updated events.md file**

4. **Review the output** — does it look right?

5. **Copy the events.md content** into your editor at:
   `src/data/events.md`

6. **Test locally** (optional):
   ```bash
   npm run build
   # If no errors, you're good!
   ```

7. **Commit and push**:
   ```bash
   git add src/data/events.md
   git commit -m "events: add May match and Junior Clinic"
   git push
   ```

8. **Create PR** on GitHub

## Event Fields Explained

- **Title**: Event name (required)
- **Date**: YYYY-MM-DD format, e.g., 2026-05-15 (required)
- **Time**: HH:MM in 24-hour format, e.g., 19:30 (optional, for time-specific events)
- **Location**: Venue name, e.g., "Bendigo Basketball Stadium" (optional)
- **Status**: Either "upcoming" or "past" (required)
- **Image**: File path, e.g., "/images/events/may-match.png" (required)
- **Description**: A sentence or two about the event (optional)

## Example: How to Provide Event Data

Pick whichever feels easiest:

### Option 1: Bullet List
```
- Bendigo Phoenix vs Albury: May 15, 2026 at 6:30 PM
  Location: Basketball Stadium
  Home game
- Junior Clinic: April 20, 2026
  For kids 8-14
  Free clinic
- (Mark the March launch event as past)
```

### Option 2: Natural Language
```
We have a match against Albury on May 15 at 6:30 PM 
at the Basketball Stadium. Also a junior clinic on April 20. 
And the March launch event is now past.
```

### Option 3: Copy-Paste Format
```
| Event | Date | Time | Location | Type |
|-------|------|------|----------|------|
| Bendigo Phoenix vs Albury | 2026-05-15 | 19:30 | Basketball Stadium | Upcoming |
| Junior Clinic | 2026-04-20 | | | Upcoming |
```

## Images

For each event, you need an image file. Upload to:
- Directory: `public/images/events/`
- Format: PNG or JPG
- Size: Around 400x250 pixels
- Keep file size under 200KB

When giving Claude the event data, just say:
```
Image file: may-match.png
```

Claude will automatically add the path: `/images/events/may-match.png`

## Questions?

If something doesn't work:
1. Check the date format is YYYY-MM-DD
2. Check the status is "upcoming" or "past"
3. Check the image file name matches a file in public/images/events/
4. Ask a developer to review the events.md file for syntax errors
```

---

## Alternatives Considered & Rejected

### Modal: HTML `<dialog>` Element
**Pros**: Native HTML element, browser handles focus trap
**Cons**: Less control over animation, older browser support uncertain, Astro intergration unclear
**Decision**: Defer to Phase 2 if needed; custom implementation proven simpler for MVP

### Event Storage: JSON Array
**Pros**: Native JS format, easier to parse
**Cons**: YAML front-matter matches pattern used elsewhere (scores, teams), more readable for non-devs
**Decision**: Stick with YAML front-matter

### Pagination: Infinite Scroll
**Pros**: Modern UX pattern
**Cons**: More complex; past events rarely scrolled through (users search for specific events)
**Decision**: Defer to Phase 2; MVP simpler with "Show More" button

### Date Filtering: Client-Side JavaScript
**Pros**: Real-time filtering (event transitions exactly when date reaches "today")
**Cons**: Violates Principle III; relies on client time (user could change clock); adds complexity
**Decision**: Build-time filtering is more reliable

---

## Open Questions & Future Enhancements

1. **Image Format Standards**: Should we auto-convert JPG to WebP for better compression?
   - Decision deferred to Phase 2 if bundle size becomes issue
   - Current: Support PNG/JPG; document optimization guidelines

2. **Search/Filter UI**: Should visitors search for events by keyword or filter by type?
   - Current: No search; all events visible on page
   - Future: Add filter tabs (e.g., "Matches" vs. "Clinics" vs. "Community")

3. **Calendar View**: Should events be displayed as calendar grid instead of list?
   - Current: Grid of tiles (mimics ScoreCard layout)
   - Future: Add calendar view as alternative display mode

4. **Email Notifications**: Should maintainers be notified when event becomes "past"?
   - Current: Manual maintainer action (deploy to change status)
   - Future: Scheduled build at midnight; auto-transition events

5. **Event Recurrence**: Should recurring events (weekly matches) be supported?
   - Current: No; each match entered separately
   - Future: Add `recurrence` field (e.g., "weekly", "every 2 weeks") with end date

6. **RSVP/Registration**: Should visitors RSVP for events?
   - Current: No RSVP capability; events are informational
   - Future: Integrate with CRM or Google Forms for registration

7. **Event Categories/Tags**: Should events be grouped by type (Match, Clinic, Community)?
   - Current: No categories; flat list
   - Future: Add `category` field and filter UI

---

## Testing & Validation Plan

### Claude Code Prompt Validation (Phase 5)

Test prompt with 3+ input formats:

1. **Test 1: Markdown bullet list**
   - Input: Markdown with 2 new events, 1 status change
   - Output: Valid events.md
   - Verify: No YAML errors, correct IDs, dates, status

2. **Test 2: JSON array**
   - Input: JSON with 3 events
   - Output: Valid events.md (mixed with existing)
   - Verify: Dates parsed correctly, status "upcoming"/"past", image paths

3. **Test 3: Natural language**
   - Input: Plain English ("Add match on May 15 at 6:30 PM at Basketball Stadium. Junior Clinic April 20 for kids. Mark March launch as past.")
   - Output: Valid events.md
   - Verify: All events created, no duplicates, status transitions work

4. **Round-trip Test**
   - Generate events.md via Claude Code
   - Run parser on output
   - Verify all events parse correctly
   - Re-render on page
   - Check visual layout correct

---

## Performance Considerations

### Build Time
- Target: Build completes in < 30 seconds with 20 events
- Parsing: Simple regex/string split; < 5ms for 100 events
- No performance concern at MVP scale

### Bundle Size
- Modal JS: ~100 lines; minimal impact
- No new CSS (all Tailwind utilities)
- No new npm dependencies
- Estimated impact: < 2KB gzipped

### Page Load
- Target: < 3 seconds (NFR-013)
- events.md: Static assets; cached by browser
- Modal JS: Deferred; only loads on demand
- Estimated: < 2 seconds on typical 4G

### Image Optimization
- Recommend ImageOptim before upload
- WebP conversion deferred to Phase 2
- Current: 6-10 images at 400x250px; ~600KB uncompressed, ~100KB gzipped

---

## Rollback Plan

**If events.md becomes corrupted or breaks build**:

1. Revert latest commit: `git revert HEAD`
2. Redeploy site
3. Review events.md for YAML syntax errors
4. Fix and commit again

**If modal causes accessibility issues**:

1. Temporarily hide modal (add `display: none`)
2. Show event details inline on tile click (fallback)
3. Investigate focus trap implementation
4. Deploy hotfix

**If event image causes 404 storm**:

1. Check image path in events.md
2. Verify image file exists in `public/images/events/`
3. Update event with correct image path
4. Redeploy

---

## Documentation Checklist

- [ ] plan.md (this document's companion) — technical approach & phased delivery
- [ ] research.md (this document) — design decisions & Claude Code workflow
- [ ] Event update guide (one-page) — maintainer instructions
- [ ] Claude Code prompt template — Claude Code skill definition
- [ ] API docs (inline code comments) — Parser, filters, validator modules
- [ ] Example events.md — Seed data with 5 upcoming, 3 past events
- [ ] Quickstart.md — Manual testing guide for QA

---

## Sign-Off

**Design reviewed by**: Implementation team
**Date**: 2026-04-08
**Status**: Ready for Phase 1 kickoff

All design decisions aligned with 9 constitutional principles.
All TBD items in spec resolved with rationale documented above.
