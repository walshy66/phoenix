# Quickstart: Testing Position Responsibilities Carousel

**Feature**: COA-88 — Add Position Responsibilities Carousel  
**Branch**: `cameronwalsh/coa-88-add-coaching-resources`

---

## Setup (After Implementation)

### 1. Ensure Images Are in Place

```bash
# Check position images exist in public directory
ls -la /public/images/positions/

# Expected files:
# - roles-point-guard.png
# - roles-shooting-guard.png
# - roles-small-forward.png
# - roles-power-forward.png
# - roles-center.png
# - roles-coach.png
```

### 2. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000` (or similar — check terminal output)

### 3. Navigate to Coaching Resources Page

```
http://localhost:3000/coaching-resources
```

---

## Manual Testing Checklist

### Page Load & Card Display

- [ ] Coaching resources page loads without errors
- [ ] "Position Responsibilities" card appears in the resources grid
- [ ] Card thumbnail shows first position image (point guard)
- [ ] Card description is visible: "Visual guide to the key responsibilities..."
- [ ] Card styling matches other resource cards (same colors, spacing, font)

---

### Modal Open/Close

#### Via Click
- [ ] Click "Position Responsibilities" card
- [ ] Modal opens smoothly (no layout shift, no page scroll)
- [ ] Modal title: "Position Responsibilities"
- [ ] First position image (Point Guard) displays centered

#### Via Close Button
- [ ] Close button (X) visible in top-right corner
- [ ] Click close button
- [ ] Modal closes smoothly
- [ ] Focus returns to the "Position Responsibilities" card
- [ ] Keyboard focus visible on card (outline)

#### Via Escape Key
- [ ] Modal open
- [ ] Press Escape key
- [ ] Modal closes
- [ ] Focus returns to card

#### Via Backdrop Click
- [ ] Modal open
- [ ] Click dark area outside the modal (backdrop)
- [ ] Modal closes
- [ ] Focus returns to card

---

### Carousel Navigation

#### Auto-Advance (8 seconds)
- [ ] Open modal (Point Guard image shows)
- [ ] Wait 8 seconds without interacting
- [ ] Image automatically changes to Shooting Guard
- [ ] Wait another 8 seconds
- [ ] Image changes to Small Forward
- [ ] Continue for all 6 positions
- [ ] After Coach (6th), wraps back to Point Guard

**Timing Check**: Use browser DevTools timer or stopwatch:
- Write down time modal opens
- Note time each image changes
- Verify interval ≈ 8 seconds between changes

#### Next Button
- [ ] Open modal (Point Guard visible)
- [ ] Click "Next" button (right arrow on right side)
- [ ] Shooting Guard appears **immediately**
- [ ] Auto-advance timer resets (wait 8s from click, verify next change)

#### Prev Button
- [ ] Click "Prev" button (left arrow on left side)
- [ ] Goes back to Point Guard immediately
- [ ] Auto-advance timer resets

#### Wrap-Around (Last to First)
- [ ] Navigate to last position (Coach)
- [ ] Click "Next"
- [ ] Wraps to Point Guard (first position)

#### Wrap-Around (First to Last)
- [ ] Navigate back to Point Guard (if needed)
- [ ] Click "Prev"
- [ ] Wraps to Coach (last position)

---

### Keyboard Navigation

#### Arrow Keys (Must be focused in modal)
- [ ] Open modal
- [ ] Click inside modal to ensure focus
- [ ] Press **Right Arrow** key
- [ ] Carousel advances to next position
- [ ] Press **Left Arrow** key
- [ ] Carousel goes back to previous position
- [ ] Verify wrapping with arrows at first/last position

#### Escape Key (Close)
- [ ] Open modal
- [ ] Press **Escape** key
- [ ] Modal closes
- [ ] Focus returns to card

#### Tab Navigation (Focus Trap)
- [ ] Open modal
- [ ] Press **Tab** key repeatedly
- [ ] Focus moves between: Close button → Prev button → Next button → Close button (cycle)
- [ ] Focus does NOT escape to page content below modal
- [ ] Press **Shift+Tab** (reverse)
- [ ] Focus cycles backward through buttons

---

### Responsive Design

#### Mobile (320px width)
**Using DevTools Device Emulation**:
```
Chrome DevTools → Device Toolbar → iPhone 12 Mini
or
Chrome DevTools → Device Toolbar → 320px width
```

- [ ] Modal opens and fills screen properly (not cut off)
- [ ] Image scales down appropriately (visible and readable)
- [ ] Close button is large and easy to tap (44×44px minimum)
- [ ] Prev/Next buttons are large and easy to tap (44×44px minimum)
- [ ] Buttons don't overlap the image
- [ ] Text is readable (no tiny font)
- [ ] Modal title and position label visible

#### Tablet (768px width)
```
Chrome DevTools → Device Toolbar → iPad
or
Resize browser window to 768px
```

- [ ] Modal is nicely centered on screen
- [ ] Image displays at medium size (not too small, not huge)
- [ ] Buttons are positioned on sides of image
- [ ] Spacing is proportional and balanced
- [ ] Text is readable

#### Desktop (1440px width)
```
Chrome DevTools → Device Toolbar → Disable device mode
or
Full-width browser window
```

- [ ] Modal is centered with proper max-width
- [ ] Image displays at larger size, maintains quality
- [ ] All text and buttons clearly visible
- [ ] Hover states work on buttons (color change, cursor pointer)

---

### Accessibility Checks

#### Keyboard-Only User
- [ ] Can open card (Tab to card, Enter/Space to click)
- [ ] Can navigate carousel (arrow keys)
- [ ] Can close modal (Escape, Tab to close button + Enter)
- [ ] Can see focus indicators on all buttons (visible outline/ring)
- [ ] Never trapped in any interaction

#### Screen Reader (NVDA, JAWS, VoiceOver)
- [ ] Modal title announced: "Position Responsibilities" or similar
- [ ] Image alt text announced: e.g., "Point Guard: Controls the game..."
- [ ] Buttons announced with labels:
  - "Previous position"
  - "Next position"
  - "Close modal"
- [ ] Carousel role announced: "carousel" or "slide region"
- [ ] Current position labeled (e.g., "Slide 1 of 6")

#### Tab Order (Inspector)
```
DevTools → Elements → Tab through elements
```

- [ ] Tab starts at close button
- [ ] Next Tab: Prev button
- [ ] Next Tab: Next button
- [ ] Next Tab: Back to close button (cycle)
- [ ] Tab does not exit modal to page content

---

### Image Loading

#### Successful Load (Normal Path)
- [ ] All 6 images load correctly
- [ ] Images display at correct resolution
- [ ] No broken image icons (missing image symbols)

#### Simulate Broken Image (DevTools)
```
1. Right-click on image in modal
2. Open DevTools (Inspect)
3. Edit the src attribute to something invalid
4. Press Enter / Tab away
5. Observe fallback behavior
```

- [ ] Image fails to load
- [ ] Fallback message appears (e.g., "Image unavailable")
- [ ] Modal remains open and dismissible
- [ ] Can still navigate to other slides
- [ ] Can close modal normally (Escape, click close button)

---

### Performance & Smoothness

#### Animation Smoothness (60 FPS)
- [ ] Auto-advance transitions are smooth (no stuttering, jank)
- [ ] Next/Prev clicks are responsive (immediate, no lag)
- [ ] Modal open/close is smooth
- [ ] No visible frame drops

**Check in DevTools**:
```
DevTools → Performance → Record → Auto-advance carousel → Stop
Look for green (60+ FPS) in FPS meter, no red spikes
```

#### Page Performance
- [ ] Page loads quickly (coaching resources page)
- [ ] Modal opens without delay
- [ ] No memory leaks (run modal open/close cycle 5 times, check memory in DevTools)

---

### Edge Cases

#### Rapid Clicking
- [ ] Click Next button 5 times very quickly
- [ ] Carousel should handle it gracefully (not queue 5 transitions, or debounce)
- [ ] No animation conflicts
- [ ] State remains consistent

#### Modal Close While Auto-Advancing
- [ ] Open modal
- [ ] Wait 5 seconds (carousel mid-dwell)
- [ ] Close modal (click button or Escape)
- [ ] Auto-advance timer stops (no more transitions happening)
- [ ] No errors in console

#### Keyboard Focus Lost
- [ ] Open modal
- [ ] Click on modal background (non-interactive area)
- [ ] Press arrow key (or Escape)
- [ ] Keyboard commands still work (navigation continues)
- [ ] No JavaScript errors

#### Browser Tab Hidden
- [ ] Open modal, let carousel auto-advance
- [ ] Switch to another browser tab
- [ ] Switch back to this tab after 30 seconds
- [ ] Carousel should resume smoothly (or have paused while hidden, depending on implementation)

---

### Browser Compatibility

Test on the following (if available):
- [ ] Chrome/Chromium 120+
- [ ] Firefox 120+
- [ ] Safari 16+ (macOS)
- [ ] Edge 120+
- [ ] Safari iOS 16+ (iPhone)

**Known Issues to Watch**:
- CSS 3D transforms: Not used (so no compatibility issues)
- CSS transitions: Well-supported on all modern browsers
- CSS Grid/Flexbox: Well-supported
- EventTarget methods: Well-supported

---

### Console Errors

- [ ] Open DevTools (F12 or Cmd+Option+I)
- [ ] Go to Console tab
- [ ] Open modal and interact with carousel
- [ ] No red errors should appear
- [ ] No yellow warnings (acceptable in some cases)
- [ ] No "undefined is not a function" errors

---

## Test Data / Scenario

### Scenario 1: Coach Learning Positions
**User Goal**: A coach wants to quickly review all position responsibilities

1. Navigate to coaching resources
2. Find "Position Responsibilities" card
3. Click to open modal
4. Watch carousel auto-advance through all 6 positions (1 minute)
5. Optional: Click back to review a specific position
6. Close modal

**Success**: Coach can easily see all positions and their roles.

---

### Scenario 2: Player Checking Their Role
**User Goal**: A player wants to see what responsibilities their position has

1. Open modal
2. Use arrow keys to navigate to their position (e.g., "Center")
3. Read the position responsibilities (image + alt text)
4. Close modal

**Success**: Player understands their position requirements.

---

### Scenario 3: Mobile User on Phone
**User Goal**: User on 5" phone wants to view positions

1. Navigate to page on mobile device (or emulate in DevTools)
2. Tap "Position Responsibilities" card
3. Modal opens and fills screen
4. Tap Next/Prev buttons to navigate (buttons are large and easy to tap)
5. Images scale properly and are readable
6. Close modal

**Success**: Mobile user has good experience with large touch targets.

---

## Debugging Tips

### Issue: Auto-advance not working
- [ ] Check browser console for JavaScript errors
- [ ] Verify modal is actually open (not hidden)
- [ ] Check DevTools timer (wait exact 8 seconds)
- [ ] Verify carousel element exists in DOM (DevTools Inspector)
- [ ] Check for conflicting CSS or JavaScript

### Issue: Images not loading
- [ ] Check file paths in `/public/images/positions/`
- [ ] Verify image file names match data structure
- [ ] Check browser Network tab (DevTools) for 404 errors
- [ ] Verify image files exist and are readable

### Issue: Keyboard navigation not working
- [ ] Ensure modal is focused (click inside modal first)
- [ ] Check that keyboard event listeners are attached (DevTools)
- [ ] Verify keyboard event names (keydown vs. keyup)
- [ ] Check for event.preventDefault() calls blocking navigation

### Issue: Focus trap not working
- [ ] Check FOCUSABLE selector (DevTools: query selector)
- [ ] Verify buttons have correct classes/attributes
- [ ] Check for display: none on buttons (hidden buttons not in trap)
- [ ] Verify focus trap code is running on Tab key

### Issue: Modal won't close
- [ ] Check close button click handler (DevTools)
- [ ] Verify modal.classList.add/remove('hidden') is working
- [ ] Check for JavaScript errors preventing close
- [ ] Try Escape key as alternative

---

## Performance Profiling

### Record Carousel Animation
```
1. Open DevTools → Performance
2. Click Record
3. Wait for carousel auto-advance (8+ seconds)
4. Stop recording
5. Analyze flame chart
   - Should see smooth horizontal timeline (no spikes)
   - FPS should be 50+ (target 60)
   - No long tasks (> 50ms)
```

### Memory Leak Check
```
1. Open DevTools → Memory
2. Take heap snapshot
3. Open/close modal 10 times
4. Take another heap snapshot
5. Compare snapshots
   - Should not see exponential growth
   - Modal component should be garbage collected when closed
```

---

## Accessibility Audit

### Using axe DevTools Browser Extension
```
1. Install axe DevTools (Chrome, Firefox)
2. Open coaching resources page
3. Click axe DevTools icon → Scan
4. Look for violations (should be zero for this feature)
5. Review best practices (informational)
```

### Manual Keyboard Navigation Test
```
1. Open page
2. Close DevTools (don't use mouse)
3. Tab through entire page
4. Verify focus is always visible
5. Open modal (Tab + Enter)
6. Navigate carousel (arrow keys)
7. Close modal (Escape)
8. Focus returned to card
```

---

## Checklist Summary

**Core Functionality**: [ ] 15/15 Acceptance Criteria Pass  
**Accessibility**: [ ] All keyboard + ARIA checks pass  
**Responsive**: [ ] Mobile (320px), Tablet (768px), Desktop (1440px) work  
**Performance**: [ ] 60fps animations, no memory leaks  
**Cross-Browser**: [ ] Chrome, Firefox, Safari tested  
**Errors**: [ ] No console errors or warnings  

---

## Sign-Off

Once all checks above pass, the feature is ready for QA/staging.

**Tested by**: ________________  
**Date**: ________________  
**Branch**: `cameronwalsh/coa-88-add-coaching-resources`

---

**Created by**: Claude Code Plan Agent  
**Date**: 2026-04-25
