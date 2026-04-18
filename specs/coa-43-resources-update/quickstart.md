# Quickstart: Testing COA-43 Resources Update

---

## Overview

This guide walks through manual testing of the COA-43 Resources Update feature. It covers filter and search behavior, keyboard navigation, responsive design, and accessibility.

---

## Setup

### Prerequisites

- Node 20+ installed
- Project dependencies installed (`npm install`)
- Git branch: `cameronwalsh/coa-43-resources-update`

### Start Local Dev Server

```bash
npm run dev
```

The site opens at `http://localhost:3000/` (or similar). Navigate to **Resources** → **Coaching Resources** tab.

---

## Test Data

### Sample Resources in Coaching Section

| Title | Age | Category | Skill | Type |
|-------|-----|----------|-------|------|
| U12 Defence Fundamentals | U12 | Defence | Positioning | PDF |
| Full Court Press — U14 | U14 | Defence | Rotation | PDF |
| Zone Defence — U16+ | U16+ | Defence | Awareness | Link |
| Dribble Drive Offence — U14 | U14 | Offence | Spacing | Link |
| Ball Handling Drills — U8 | U8 | Drills | Ball Control | Link |
| Court Time Calculator | All Ages | Tools | Time Mgmt | Link |

---

## Test Plan

### 1. AND-Logic Filtering (User Story 1)

**Objective**: Verify that multiple filter selections apply AND-logic (all must match).

#### Test 1.1: Single Filter

1. Open **Coaching Resources** tab
2. Click **Age: U12** filter
3. **Expected**: Only resources with `age: U12` display
   - ✓ "U12 Defence Fundamentals"
   - ✗ "Full Court Press — U14" (age is U14, not U12)
4. **Result**: PASS / FAIL

#### Test 1.2: Two Filters (Age + Category)

1. Keep **Age: U12** active
2. Click **Category: Defence** filter
3. **Expected**: Only resources with `age: U12` AND `category: Defence` display
   - ✓ "U12 Defence Fundamentals"
4. **Result**: PASS / FAIL

#### Test 1.3: Three Filters (Age + Category + Skill)

1. Keep **Age: U12** and **Category: Defence** active
2. Click **Skill: Positioning** filter (if available)
3. **Expected**: Only resources with ALL three tags display
   - ✓ "U12 Defence Fundamentals" (if tagged with Positioning)
4. **Result**: PASS / FAIL

#### Test 1.4: Remove a Filter

1. With three filters active, click **Age: U12** to toggle it off
2. **Expected**: Results update immediately to show resources matching Age (removed) AND Category: Defence AND Skill: Positioning
3. No page reload occurs
4. **Result**: PASS / FAIL

#### Test 1.5: Clear All Filters

1. With filters active, scroll down and click **Clear filters** button (or equivalent)
2. **Expected**: All filters deselect; all resources in section display
3. **Result**: PASS / FAIL

---

### 2. Keyword Search (User Story 2)

**Objective**: Verify search matches title and description text (case-insensitive, partial match).

#### Test 2.1: Search by Title

1. Open **Coaching Resources**, no filters active
2. Click search input (if present in this section)
3. Type: `"defence"`
4. Press **Enter** or wait for debounce (~300ms)
5. **Expected**: Only resources with "defence" in title or description display
   - ✓ "U12 Defence Fundamentals"
   - ✓ "Full Court Press — U14" (if description mentions defence)
   - ✗ "Dribble Drive Offence" (doesn't match "defence")
6. **Result**: PASS / FAIL

#### Test 2.2: Search + Filter (AND-Logic)

1. Keep search for `"defence"`
2. Click **Age: U12** filter
3. **Expected**: Only resources matching BOTH search AND filter display
   - ✓ "U12 Defence Fundamentals" (has "defence" AND age U12)
   - ✗ "Full Court Press — U14" (has "defence" but age is U14, not U12)
4. **Result**: PASS / FAIL

#### Test 2.3: Clear Search

1. With search active, clear the input field (backspace or Ctrl+A Delete)
2. **Expected**: All filtered resources display (search cleared, filter still active)
3. **Result**: PASS / FAIL

#### Test 2.4: Case-Insensitive Match

1. Search for: `"DEFENCE"` (uppercase)
2. **Expected**: Same results as lowercase `"defence"`
3. **Result**: PASS / FAIL

---

### 3. Section-Aware Filters (User Story 3)

**Objective**: Verify that some sections have filters, others don't.

#### Test 3.1: Coaching Resources Tab

1. Click **Coaching Resources** tab
2. **Expected**: Filter bar visible with Age, Category, Skill, and Search
3. **Result**: PASS / FAIL

#### Test 3.2: Player Resources Tab

1. Click **Player Resources** tab
2. **Expected**: Filter bar visible with Age and Category (different values than Coaching)
3. **Result**: PASS / FAIL

#### Test 3.3: Manager Resources Tab

1. Click **Manager Resources** tab
2. **Expected**: NO filter bar visible
3. **Expected**: Resources sorted alphabetically by title (A–Z)
4. **Result**: PASS / FAIL

#### Test 3.4: Guides Tab

1. Click **Guides** tab
2. **Expected**: NO filter bar visible
3. **Expected**: Resources sorted alphabetically by title (A–Z)
4. **Result**: PASS / FAIL

---

### 4. Graceful Degradation (User Story 4)

**Objective**: Verify resources with incomplete metadata display correctly.

#### Test 4.1: Resource with No Tags

1. Create or add a test resource with only `title` and `type` (no tags)
2. Navigate to **Guides** tab (no filters)
3. **Expected**: Resource displays with title and type
4. Navigate to **Coaching Resources** tab, no filters active
5. **Expected**: Resource still displays
6. Activate **Age: U12** filter
7. **Expected**: Resource hidden (no age tag, so doesn't match filter)
8. **Result**: PASS / FAIL

#### Test 4.2: Resource with Partial Tags

1. Create a resource with `age` and `category` tags, but no `skill` tag
2. Activate **Age: U12** and **Category: Defence** filters
3. **Expected**: Resource displays (matches both active filters)
4. Activate **Skill: Positioning** filter
5. **Expected**: Resource hidden (no skill tag, so doesn't match filter)
6. Deactivate **Skill** filter
7. **Expected**: Resource displays again
8. **Result**: PASS / FAIL

#### Test 4.3: Search Matches Incomplete Metadata

1. Create a resource with only `title` and `type` (no description or tags)
2. Search for a keyword in the title (e.g., search "drill" for title "Dribbling Drills")
3. **Expected**: Resource appears in search results
4. **Result**: PASS / FAIL

---

### 5. No Results State

**Objective**: Verify clear feedback when no resources match filters/search.

#### Test 5.1: No Matching Filters

1. Open **Coaching Resources**
2. Activate **Age: U8**, **Category: Defence**, **Skill: Ball Handling**
3. **Expected**: If no resource has all three tags, a "No results found" message displays
4. Click **Clear filters** button
5. **Expected**: All resources display again
6. **Result**: PASS / FAIL

#### Test 5.2: No Matching Search

1. Open **Coaching Resources**
2. Search for: `"xyz123"` (nonsense keyword)
3. **Expected**: "No results found" message displays
4. Clear search
5. **Expected**: All resources display again
6. **Result**: PASS / FAIL

---

### 6. Keyboard Navigation (Accessibility)

**Objective**: Verify all controls are accessible via keyboard.

#### Test 6.1: Tab to Search Input

1. Open **Coaching Resources**
2. Press **Tab** repeatedly to focus search input
3. **Expected**: Search input has visible focus ring (e.g., blue border)
4. Type a keyword
5. Press **Enter** or **Tab** to move to next element
6. **Expected**: Search executes; focus moves to next focusable element
7. **Result**: PASS / FAIL

#### Test 6.2: Tab to Filter Buttons

1. Press **Tab** to reach filter buttons (Age, Category, Skill)
2. **Expected**: Each button has a visible focus ring
3. Press **Space** or **Enter** to toggle filter state
4. **Expected**: Filter state changes (button appears selected/active)
5. **Result**: PASS / FAIL

#### Test 6.3: Shift+Tab (Reverse Navigation)

1. Focus a filter button
2. Press **Shift+Tab** to move backwards
3. **Expected**: Focus moves to previous focusable element
4. **Result**: PASS / FAIL

#### Test 6.4: Escape to Close (if applicable)

1. If a modal/dropdown opens, press **Escape**
2. **Expected**: Modal closes; focus returns to trigger element
3. **Result**: PASS / FAIL (if modal exists)

---

### 7. Screen Reader Announcements

**Objective**: Verify screen reader announces result count and filter changes.

#### Test 7.1: Result Count Announcement (NVDA/JAWS/VoiceOver)

1. Open **Coaching Resources** in a screen reader (Windows: NVDA, Mac: VoiceOver)
2. Apply a filter (e.g., Age: U12)
3. **Expected**: Screen reader announces something like "5 resources found" or similar
4. Apply another filter
5. **Expected**: Screen reader announces updated count
6. **Result**: PASS / FAIL

#### Test 7.2: Filter State Announcement

1. Focus a filter button with screen reader active
2. Press **Space** to toggle
3. **Expected**: Screen reader announces button state (e.g., "pressed" or "selected")
4. **Result**: PASS / FAIL

---

### 8. Responsive Design

**Objective**: Verify filter bar and resources are readable on mobile, tablet, and desktop.

#### Test 8.1: Mobile (375px viewport)

1. Open browser DevTools
2. Set viewport to **375px width** (e.g., iPhone SE)
3. Open **Coaching Resources**
4. **Expected**: Filter bar is sticky (visible as you scroll) but not stuck at top
5. **Expected**: Filters wrap to multiple lines if needed (no horizontal scroll)
6. **Expected**: Resources display in single column or wrap naturally
7. Click filter buttons and verify they remain accessible (not cut off)
8. **Result**: PASS / FAIL

#### Test 8.2: Tablet (768px viewport)

1. Set viewport to **768px width**
2. **Expected**: Filter bar spans mostly horizontally (fewer wraps than mobile)
3. **Expected**: Resources display in 2-column grid or similar
4. **Result**: PASS / FAIL

#### Test 8.3: Desktop (1440px viewport)

1. Set viewport to **1440px width**
2. **Expected**: Filter bar is full width with all filters visible
3. **Expected**: Resources display in 3+ column grid
4. **Result**: PASS / FAIL

#### Test 8.4: Image Aspect Ratio (if images present)

1. Add image resources (PNG, JPEG, GIF) to data
2. View in resource grid
3. **Expected**: Images maintain original aspect ratio (no letterboxing or distortion)
4. **Result**: PASS / FAIL

---

### 9. Performance

**Objective**: Verify filtering and search operations are fast (<100ms).

#### Test 9.1: Filter Responsiveness

1. Open **Coaching Resources**
2. Quickly click multiple filters (e.g., Age, Category, Skill)
3. **Expected**: Results update within ~100ms (no noticeable lag)
4. **Result**: PASS / FAIL

#### Test 9.2: Search Responsiveness

1. Open **Coaching Resources**
2. Type a keyword and watch results update
3. **Expected**: Results update within ~100ms (with debounce, noticeable after pause)
4. **Result**: PASS / FAIL

#### Test 9.3: No Console Errors

1. Open browser DevTools console (F12)
2. Apply filters and search
3. **Expected**: No JavaScript errors or warnings
4. **Result**: PASS / FAIL

---

### 10. Data Integrity

**Objective**: Verify JSON data conforms to schema.

#### Test 10.1: Run Validation Script

```bash
npm run validate-resources
```

**Expected**: All resources pass schema validation (or script reports specific errors).

**Result**: PASS / FAIL

---

## Test Report Template

Use this template to document test results:

```markdown
# Test Report: COA-43 Resources Update

**Date**: YYYY-MM-DD
**Tester**: Name
**Browser**: Chrome 120 on Windows 11 | Firefox 121 on macOS | Safari on iOS

## Summary
- [ ] All tests passed
- [x] Some tests failed (see details)
- [ ] Critical issues found

## Detailed Results

### 1. AND-Logic Filtering
- [ ] Test 1.1 (Single Filter): PASS / FAIL
- [ ] Test 1.2 (Two Filters): PASS / FAIL
- [ ] Test 1.3 (Three Filters): PASS / FAIL
- [ ] Test 1.4 (Remove Filter): PASS / FAIL
- [ ] Test 1.5 (Clear All): PASS / FAIL

### 2. Keyword Search
- [ ] Test 2.1 (Search by Title): PASS / FAIL
- [ ] Test 2.2 (Search + Filter): PASS / FAIL
- [ ] Test 2.3 (Clear Search): PASS / FAIL
- [ ] Test 2.4 (Case-Insensitive): PASS / FAIL

### 3. Section-Aware Filters
- [ ] Test 3.1 (Coaching Tab): PASS / FAIL
- [ ] Test 3.2 (Player Tab): PASS / FAIL
- [ ] Test 3.3 (Manager Tab): PASS / FAIL
- [ ] Test 3.4 (Guides Tab): PASS / FAIL

### 4. Graceful Degradation
- [ ] Test 4.1 (No Tags): PASS / FAIL
- [ ] Test 4.2 (Partial Tags): PASS / FAIL
- [ ] Test 4.3 (Search + Incomplete): PASS / FAIL

### 5. No Results State
- [ ] Test 5.1 (No Matching Filters): PASS / FAIL
- [ ] Test 5.2 (No Matching Search): PASS / FAIL

### 6. Keyboard Navigation
- [ ] Test 6.1 (Tab to Search): PASS / FAIL
- [ ] Test 6.2 (Tab to Filters): PASS / FAIL
- [ ] Test 6.3 (Shift+Tab): PASS / FAIL
- [ ] Test 6.4 (Escape): PASS / FAIL

### 7. Screen Reader
- [ ] Test 7.1 (Result Count): PASS / FAIL
- [ ] Test 7.2 (Filter State): PASS / FAIL

### 8. Responsive Design
- [ ] Test 8.1 (Mobile 375px): PASS / FAIL
- [ ] Test 8.2 (Tablet 768px): PASS / FAIL
- [ ] Test 8.3 (Desktop 1440px): PASS / FAIL
- [ ] Test 8.4 (Image Aspect Ratio): PASS / FAIL

### 9. Performance
- [ ] Test 9.1 (Filter Response): PASS / FAIL
- [ ] Test 9.2 (Search Response): PASS / FAIL
- [ ] Test 9.3 (No Console Errors): PASS / FAIL

### 10. Data Integrity
- [ ] Test 10.1 (Validation Script): PASS / FAIL

## Issues Found

| ID | Title | Severity | Steps to Reproduce | Expected | Actual |
|----|----|----------|-------------------|----------|--------|
| BUG-01 | Filter not updating | High | Click Age: U12 | Results filter | No change |

## Sign-Off

- [ ] All tests passed; ready for merge
- [ ] Some tests failed; documented above; ready for merge pending fixes
- [ ] Critical issues; DO NOT MERGE

**Tester Signature**: _________ **Date**: _________
```

---

## Troubleshooting

### Filter Button Not Toggling

**Symptoms**: Click filter button, but it doesn't change state.

**Steps**:
1. Check browser console for JavaScript errors
2. Verify filter button has `aria-pressed` attribute
3. Try hard refresh (Ctrl+Shift+R)
4. Clear browser cache

### Search Not Working

**Symptoms**: Type keyword, no results change.

**Steps**:
1. Verify search input is visible in Coaching/Player sections only
2. Type slowly and watch for debounce delay (300ms)
3. Try pressing **Enter** explicitly
4. Check console for errors

### No Results Message Not Appearing

**Symptoms**: Filters produce zero matches, but no message shown.

**Steps**:
1. Verify HTML contains "No results" template or element
2. Check CSS display property (may be hidden)
3. Verify filter logic is correct in JavaScript

### Keyboard Focus Not Visible

**Symptoms**: Tab through page, but can't see which element is focused.

**Steps**:
1. Check CSS for `focus:ring-2` or `focus:outline` classes
2. Verify Tailwind config includes focus styles
3. Try forcing focus indicator: `outline: 2px solid blue;`

---

## Additional Resources

- **Spec**: `specs/coa-43-resources-update/spec.md`
- **Data Model**: `specs/coa-43-resources-update/data-model.md`
- **Implementation Plan**: `specs/coa-43-resources-update/plan.md`
- **Tasks**: `specs/coa-43-resources-update/tasks.md`

