# Quickstart: COA-30 Get Involved Events Testing & Verification

This guide provides step-by-step instructions for manually testing the Get Involved Events feature.

---

## Prerequisites

- Node 22.12.0+ installed
- Project cloned and dependencies installed: `npm install`
- You are on branch `coa-30-get-involved`
- Terminal open at project root: `/c/Users/camer/Documents/phoenix/`

---

## Part 1: Setup & Build

### 1.1 Start Development Server

```bash
npm run dev
```

Expected output:
```
> astro dev
...
Server running at http://localhost:3000
```

### 1.2 Verify Initial Build

Open browser to `http://localhost:3000/get-involved`

Expected:
- Page loads without errors
- No console errors (F12 → Console tab)
- Hero section visible: "GET INVOLVED"
- Upcoming Events section visible with event tiles

---

## Part 2: Event Tiles & Filtering

### 2.1 Upcoming Events Section

**Acceptance Criteria**:
- [ ] Section heading reads "UPCOMING EVENTS"
- [ ] Each event displays as a tile with:
  - Event title (bold)
  - Event date (top right)
  - Event image
  - Category badge
- [ ] Tiles arranged in responsive grid
- [ ] Tiles are clickable (cursor changes to pointer)

**Test Steps**:
1. Scroll to Upcoming Events section
2. Verify tile layout matches wireframe
3. Hover over a tile (should show slight highlight/shadow)
4. Note any missing or broken images

### 2.2 Past Events Section

**Acceptance Criteria**:
- [ ] Section heading reads "PAST EVENTS" (visually distinct from Upcoming)
- [ ] Heading styling different (e.g., color, font size, or underline)
- [ ] Each past event displays as a tile (same format as upcoming)
- [ ] Section appears BELOW Upcoming Events
- [ ] If no past events: section hidden (not showing empty placeholder)

**Test Steps**:
1. Scroll down past Upcoming Events section
2. Verify Past Events section visible and distinct
3. Compare visual styling between two sections
4. Note visual distinction (e.g., heading color, background, spacing)

### 2.3 Sorting & Order

**Acceptance Criteria**:
- [ ] Upcoming events sorted chronologically ascending (next date first)
- [ ] Past events sorted chronologically descending (most recent first)
- [ ] If same date, sorted alphabetically by title (tiebreaker)

**Test Steps**:
1. Note dates of first 3 upcoming events (should be increasing)
2. Note dates of first 3 past events (should be decreasing)
3. If there are same-date events, verify alphabetical order

Example:
```
Upcoming (ascending):
- Event A: April 15
- Event B: April 22
- Event C: May 1

Past (descending):
- Event X: April 1
- Event Y: March 25
- Event Z: March 10
```

---

## Part 3: Modal Interaction

### 3.1 Open Modal via Click

**Acceptance Criteria**:
- [ ] Click on event tile → modal opens
- [ ] Modal appears centered on screen
- [ ] Modal has semi-transparent dark backdrop
- [ ] Modal is in focus (other page content dimmed)

**Test Steps**:
1. Click on any event tile
2. Verify modal appears with animation (fade-in, scale-up)
3. Verify backdrop dims page content
4. Verify modal content readable (text black on white background)

### 3.2 Modal Content Display

**Acceptance Criteria**:
- [ ] Modal displays event title (as heading)
- [ ] Modal displays event date
- [ ] Modal displays event image (or fallback if broken)
- [ ] Modal displays optional fields IF present:
  - Time (if provided in events.md)
  - Location (if provided in events.md)
  - Description (if provided in events.md)
- [ ] Optional fields are gracefully omitted if not provided (no empty labels)

**Test Steps**:
1. Open a modal for an event with all fields (title, date, time, location, description, image)
2. Verify all fields displayed
3. Open a modal for an event with minimal fields (title, date, image only)
4. Verify optional fields absent (no "Time: " or "Location: " empty labels)

### 3.3 Close Modal via Close Button

**Acceptance Criteria**:
- [ ] Modal has visible close button (×) in top-right corner
- [ ] Click close button → modal closes
- [ ] Focus returns to the tile that was clicked

**Test Steps**:
1. Open a modal
2. Click close button (×)
3. Modal closes with animation (fade-out, scale-down)
4. Verify page content returns to normal
5. Verify focus on the tile you clicked (may see focus outline)

### 3.4 Close Modal via Backdrop Click

**Acceptance Criteria**:
- [ ] Click on dark backdrop (outside modal) → modal closes
- [ ] Focus returns to the tile that was clicked

**Test Steps**:
1. Open a modal
2. Click on dark backdrop area (NOT on modal content)
3. Modal closes
4. Verify focus on tile

### 3.5 Close Modal via Escape Key

**Acceptance Criteria**:
- [ ] Press Escape key while modal open → modal closes
- [ ] Focus returns to the tile that was clicked

**Test Steps**:
1. Open a modal
2. Press Escape key on keyboard
3. Modal closes
4. Verify focus on tile

---

## Part 4: Responsive Design

### 4.1 Mobile Layout (<640px)

**Setup**: Open browser DevTools (F12) → Device toolbar → iPhone SE (375px width)

**Acceptance Criteria**:
- [ ] Event tiles stack in 1 column (not 2)
- [ ] Tiles full width with padding (no overflow)
- [ ] Modal visible and accessible on small screen
- [ ] Tap targets (tiles, close button) minimum 44x44px
- [ ] Close button remains visible when scrolling modal content
- [ ] Text readable (not too small)

**Test Steps**:
1. Resize browser to 375px width
2. Verify tiles stack in 1 column
3. Verify no horizontal scroll
4. Open modal → verify fits on screen
5. Verify close button accessible (top-right corner visible)
6. Try scrolling long description → close button stays visible
7. Tap a tile → modal opens without issues

### 4.2 Tablet Layout (640-1024px)

**Setup**: DevTools → iPad (768px width)

**Acceptance Criteria**:
- [ ] Event tiles in 2-3 column grid
- [ ] Grid centered and readable
- [ ] Modal responsive on medium screen
- [ ] Proper spacing between tiles

**Test Steps**:
1. Resize to 768px
2. Verify tiles in 2-column grid (or 3 if space allows)
3. Verify proper spacing
4. Open modal → verify readable

### 4.3 Desktop Layout (>1024px)

**Setup**: DevTools → No device restriction (full screen, >1024px)

**Acceptance Criteria**:
- [ ] Event tiles in 3-4 column grid
- [ ] Grid matches existing page layout (ScoreCard style)
- [ ] All sections horizontally aligned
- [ ] Modal centered and properly sized

**Test Steps**:
1. Resize to 1400px+ width
2. Verify 3-4 column grid
3. Verify alignment with other page sections (Sponsors, Volunteers)
4. Open modal → verify not too large on screen

---

## Part 5: Image Handling

### 5.1 Valid Images Display

**Acceptance Criteria**:
- [ ] All event tiles with valid images show the image
- [ ] Images properly sized (not stretched, correct aspect ratio)
- [ ] Images load without 404 errors

**Test Steps**:
1. Open DevTools (F12) → Network tab
2. Reload page
3. Filter Network tab to images (type: img)
4. Verify no red 404 errors
5. Verify images display correctly in tiles and modal

### 5.2 Fallback Image on 404

**Acceptance Criteria**:
- [ ] If event image missing or broken:
  - Fallback placeholder icon displayed
  - Alt text correct format: "[Event Title] — [Date]"
- [ ] No broken image icon visible
- [ ] Page still renders correctly

**Test Steps** (if event with broken image exists):
1. Open tile with broken image
2. Verify fallback placeholder visible (e.g., calendar icon, event badge)
3. Inspect alt text: should be "[Event Title] — [Date]"
4. Open DevTools → verify 404 error logged for image

---

## Part 6: Keyboard Navigation & Accessibility

### 6.1 Keyboard Tab Navigation

**Acceptance Criteria**:
- [ ] Tab through page focuses event tiles in order
- [ ] Tab/Shift+Tab cycles through focusable elements
- [ ] Focus outline visible on tiles

**Test Steps**:
1. Press Tab repeatedly on /get-involved page
2. Verify event tiles receive focus (focus ring visible)
3. Verify focus order logical (left-to-right, top-to-bottom)
4. Note any other focusable elements (headers, buttons)

### 6.2 Open Modal via Keyboard

**Acceptance Criteria**:
- [ ] Tab to a tile → tile focused
- [ ] Press Enter or Space → modal opens
- [ ] Keyboard users can access event details

**Test Steps**:
1. Tab to an event tile
2. Press Enter
3. Verify modal opens
4. Repeat with Space key

### 6.3 Focus Trap in Modal

**Acceptance Criteria**:
- [ ] Modal open → Tab cycles through modal elements only
- [ ] Tab does not escape to background page
- [ ] Shift+Tab cycles backward within modal

**Test Steps**:
1. Open modal
2. Press Tab repeatedly
3. Focus should cycle: close button → event title → description → back to close button
4. Focus should NOT reach page elements behind modal
5. Verify Shift+Tab cycles backward

### 6.4 Focus Return After Close

**Acceptance Criteria**:
- [ ] Close modal (button, Escape, backdrop click)
- [ ] Focus returns to the tile that was clicked

**Test Steps**:
1. Tab to an event tile
2. Press Enter to open modal
3. Press Escape to close
4. Verify focus back on the tile (focus ring visible)

### 6.5 Screen Reader Testing

**Setup**: Enable screen reader (Windows: Narrator, Mac: VoiceOver, Windows: NVDA if available)

**Acceptance Criteria**:
- [ ] Event sections announced as headings (h2 or h3)
- [ ] Event tiles announced with title and date
- [ ] Modal announced as dialog/modal region
- [ ] Close button labeled ("Close modal" or "Close")
- [ ] Event details announced (title, date, time, location, description)
- [ ] Images announced with alt text

**Test Steps** (with screen reader enabled):
1. Navigate to Get Involved page
2. Use arrow keys to navigate
3. Verify section headings announced ("Upcoming Events", "Past Events")
4. Verify event titles announced
5. Open modal
6. Verify modal announced as dialog
7. Navigate within modal
8. Verify all content readable

---

## Part 7: Build-Time Validation

### 7.1 Valid Events Render

**Acceptance Criteria**:
- [ ] Build completes successfully: `npm run build`
- [ ] No errors in build output
- [ ] All valid events render on page

**Test Steps**:
```bash
npm run build
```

Expected output:
```
Building...
✓ Built successfully
```

### 7.2 Error Handling for Invalid Events

**Acceptance Criteria**:
- [ ] Missing required field → build warning logged
- [ ] Malformed YAML → build warning (not error)
- [ ] Duplicate event ID → first used, second skipped with warning
- [ ] Invalid date format → event skipped with warning
- [ ] Invalid status → event skipped with warning
- [ ] Build completes successfully despite warnings
- [ ] Valid events still render

**Test Steps** (if invalid events in events.md):
1. Intentionally add malformed event to events.md
2. Run `npm run build`
3. Check output for warning message (not error)
4. Verify build completes
5. Verify valid events still render

---

## Part 8: Performance

### 8.1 Page Load Time

**Acceptance Criteria**:
- [ ] Page load time < 3 seconds
- [ ] No layout shift or jank when page loads

**Test Steps**:
1. Open DevTools (F12) → Lighthouse tab
2. Run Lighthouse audit (Performance focus)
3. Check Page Load metric < 3 seconds
4. Check CLS (Cumulative Layout Shift) < 0.1
5. Observe page rendering (should be smooth, no flashing)

### 8.2 Modal Animation Performance

**Acceptance Criteria**:
- [ ] Modal open/close animation smooth (60fps)
- [ ] No frame drops or stuttering

**Test Steps**:
1. Open DevTools → Performance tab
2. Start recording
3. Click event tile to open modal
4. Stop recording
5. Analyze frame rate (should be consistent 60fps)
6. Look for frame drops (red bars in timeline)

### 8.3 Build Time

**Acceptance Criteria**:
- [ ] Build completes in < 30 seconds

**Test Steps**:
```bash
time npm run build
```

Expected: Real time < 30s

---

## Part 9: Edge Cases

### 9.1 No Upcoming Events

**Setup**: If events.md has no upcoming events (all marked "past")

**Acceptance Criteria**:
- [ ] Upcoming Events section hidden (not showing)
- [ ] No "No upcoming events" message visible

**Test Steps**:
1. If no upcoming events in events.md, verify section not rendered
2. Check page source (Ctrl+U) for "Upcoming Events" heading
3. Should not be present

### 9.2 No Past Events

**Setup**: If events.md has no past events (all marked "upcoming")

**Acceptance Criteria**:
- [ ] Past Events section hidden (not showing)
- [ ] No "No past events" message visible

**Test Steps**:
1. If no past events in events.md, verify section not rendered
2. Check page source (Ctrl+U) for "Past Events" heading
3. Should not be present

### 9.3 Very Long Description

**Setup**: Create event with description > 500 characters

**Acceptance Criteria**:
- [ ] Tile: description truncated (max 100 chars or 2 lines with ellipsis)
- [ ] Modal: full description visible, scrollable if needed

**Test Steps**:
1. Create event with long description (500+ chars)
2. View tile: description should be truncated
3. Open modal: full description visible
4. If very long: modal content scrollable, close button stays visible

### 9.4 Missing Optional Fields

**Setup**: Create event with only required fields (id, title, date, image, status)

**Acceptance Criteria**:
- [ ] Tile displays correctly (title, date, image only)
- [ ] Modal displays correctly (no empty "Time:", "Location:", etc.)

**Test Steps**:
1. Create minimal event (no time, location, description)
2. View on page
3. Verify layout not broken
4. Open modal
5. Verify no empty fields

---

## Part 10: Maintainer Workflow (Claude Code)

### 10.1 Add New Event via Claude Code

**Acceptance Criteria**:
- [ ] Provide event data to Claude Code in markdown format
- [ ] Claude Code generates updated events.md
- [ ] Generated file is valid YAML (no parse errors)
- [ ] New events appear on page after rebuild

**Test Steps**:
1. Go to Claude Code
2. Paste prompt:
   ```
   Hi Claude, I have a new event for the website:
   
   - Event: Bendigo Phoenix vs Carlton
     Date: May 22, 2026
     Time: 7:00 PM
     Location: Bendigo Arena
     Status: Upcoming
     Description: Away game. Come support!
     Image: phoenix-vs-carlton.png
   
   Please update the events.md file and send me the updated version.
   ```
3. Claude generates updated events.md
4. Copy output to `src/data/events.md`
5. Run `npm run build`
6. Verify no errors
7. Start dev server: `npm run dev`
8. Navigate to `/get-involved`
9. Verify new event appears in Upcoming Events section

### 10.2 Change Event Status via Claude Code

**Acceptance Criteria**:
- [ ] Provide status change to Claude Code
- [ ] Claude generates updated events.md
- [ ] Event moves from Upcoming to Past (or vice versa)

**Test Steps**:
1. Note an event currently in "Upcoming" section
2. Go to Claude Code:
   ```
   Hi Claude, please mark the "Junior Clinic" event as past.
   Here's the current events.md:
   
   [PASTE CURRENT events.md]
   
   Update status to "past" and send me the updated version.
   ```
3. Claude generates updated events.md
4. Copy to `src/data/events.md`
5. Run `npm run build`
6. Verify event no longer in Upcoming Events
7. Verify event appears in Past Events section (or section hidden if no past events)

### 10.3 Add Multiple Events in Batch

**Acceptance Criteria**:
- [ ] Provide multiple new events to Claude Code
- [ ] All events added correctly
- [ ] File remains valid YAML

**Test Steps**:
1. Go to Claude Code with 3-5 new events:
   ```
   Add these events:
   
   1. Match vs Brisbane - June 5, 2026 at 6:30 PM - Bendigo Arena
   2. Community Open Day - June 12, 2026 (all day)
   3. Fundraiser Night - June 20, 2026 at 7:00 PM
   
   Please generate the updated events.md.
   ```
2. Claude adds all events
3. Copy to events.md
4. Run build
5. Verify all 3 events appear on page

---

## Part 11: Visual Regression Check

### 11.1 Compare with Wireframe

**Acceptance Criteria**:
- [ ] Event tiles match wireframe layout
- [ ] Modal matches wireframe design
- [ ] Colors match brand palette (purple, gold, black)
- [ ] Typography correct (headings bold, body regular)
- [ ] Spacing and alignment consistent

**Test Steps**:
1. Have wireframe/design file open
2. Compare tile layout: title, date, image positioning
3. Compare modal layout: title, image, details
4. Compare colors (use color picker in DevTools)
5. Compare heading sizes (inspect font-size)

### 11.2 No Layout Shift

**Acceptance Criteria**:
- [ ] Page loads without content jumping
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] Grid stable (tiles don't move after initial load)

**Test Steps**:
1. Open DevTools → Lighthouse
2. Run audit
3. Check CLS metric (should be green, < 0.1)

---

## Testing Checklist

Print this and check off as you verify:

**Functional**:
- [ ] Upcoming Events section visible
- [ ] Past Events section visible (or hidden if no events)
- [ ] Event tiles clickable
- [ ] Modal opens/closes (click, backdrop, Escape)
- [ ] Modal displays all fields (title, date, image, optional fields)
- [ ] Events sorted correctly (upcoming ascending, past descending)
- [ ] Images display (or fallback on 404)

**Responsive**:
- [ ] Mobile (375px): 1 column, no overflow
- [ ] Tablet (768px): 2 column grid
- [ ] Desktop (1400px): 3-4 column grid
- [ ] Modal fits on mobile screen
- [ ] Close button accessible on mobile

**Accessibility**:
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus trap in modal
- [ ] Focus returns to tile after close
- [ ] Alt text on images correct
- [ ] Color contrast WCAG AA
- [ ] Screen reader announces sections and events

**Performance**:
- [ ] Page load < 3 seconds
- [ ] CLS < 0.1
- [ ] Build completes in < 30 seconds

**Maintainer Workflow**:
- [ ] Claude Code prompt works with markdown format
- [ ] Claude Code prompt works with JSON format
- [ ] Claude Code prompt works with natural language
- [ ] Generated events.md valid YAML
- [ ] Build completes after update
- [ ] New events appear on page

---

## Troubleshooting

**Problem**: Events not rendering
- **Fix**: Check events.md exists at `src/data/events.md`
- **Fix**: Run `npm run build` to see parse errors

**Problem**: Modal not opening
- **Fix**: Check browser console (F12) for JS errors
- **Fix**: Verify event ID is unique

**Problem**: Image showing as broken
- **Fix**: Check image path in events.md (should start with `/`)
- **Fix**: Verify image file exists in `public/images/events/`
- **Fix**: Check file name spelling (case-sensitive)

**Problem**: Build failing
- **Fix**: Check events.md for YAML syntax (valid indentation, quotes)
- **Fix**: Verify required fields present (id, title, date, image, status)
- **Fix**: Check date format is YYYY-MM-DD

**Problem**: Page slow to load
- **Fix**: Minimize number of events in events.md (for testing)
- **Fix**: Check image file sizes (should be < 200KB each)
- **Fix**: Run Lighthouse audit to identify bottleneck

---

## Sign-Off

**Tested by**: [QA Engineer Name]
**Date**: [Date]
**Result**: ✅ PASS / ❌ FAIL / ⚠️ NEEDS WORK

Notes:
[Add any issues found or deviations from spec]

---

**Next**: If all tests pass, feature ready for deployment!
