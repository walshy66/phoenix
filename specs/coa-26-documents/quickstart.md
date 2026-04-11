# Quickstart: Documents Feature Testing & Verification

**Date**: 2026-04-11 | **Branch**: cameronwalsh/coa-26-documents

---

## Overview

This guide provides step-by-step instructions to manually test and verify the COA-26 Documents feature (Club Policies, Team Manager Resources, and Guides) during development and before merge.

---

## Setup

### Prerequisites

- Node 20+ installed
- Phoenix repository cloned and on branch `cameronwalsh/coa-26-documents`
- All PDF files placed in `/public/resources/club-policies/` and `/public/resources/team-manager/`
- `src/data/guides.json` created with at least one guide entry
- `src/lib/resources/types.ts` updated with `'managers'` in `ResourceAudience`

### Start Development Server

```bash
cd /path/to/phoenix
npm install
npm run dev
```

Server runs at `http://localhost:3000` (or configured port).

---

## Feature 1: Club Policies on About Page

### Manual Test: Browse & Expand Policies

**User Story**: "Visitor browses Club Policies on About page and reads policies inline"

**Steps**:
1. Navigate to `http://localhost:3000/about` in browser
2. Scroll to **Club Policies** section
3. Verify section title and layout

**Expected Results**:
- [ ] Club Policies section visible below main About content
- [ ] Policies displayed in a **two-column grid** on desktop (≥sm breakpoint)
- [ ] Policies in **single-column layout** on mobile (375px)
- [ ] Policies listed in **strict alphabetical order** by name (verify manually)

**Data to Check**:
- [ ] Six or more policies visible
- [ ] Examples: "Child Protection Policy", "Code of Conduct", "Privacy Policy", etc.

---

### Manual Test: View PDF Policy Inline

**User Story**: "Visitor clicks expand button on a PDF policy and views it inline"

**Steps**:
1. On the About page, locate the Club Policies section
2. Find a policy with a **PDF icon** (not an external link icon)
3. Click the **expand button** (or policy name)
4. Observe the PDF embed

**Expected Results**:
- [ ] PDF renders **inline** on the same page (no navigation, no new tab)
- [ ] PDF **fills the column width** and displays at usable height (≥400px)
- [ ] PDF **viewer controls visible** (scroll, zoom, page navigation from browser)
- [ ] PDF **loads within 3 seconds** (Chrome DevTools: Slow 3G throttle)
- [ ] **Only one PDF expanded at a time** (opening a second collapses the first)

**Troubleshooting**:
- If PDF doesn't render: Check file path in `clubPolicies` array
- If PDF loads very slowly: PDF may need compression (should be <5MB)
- If multiple PDFs expanded: Check accordion JavaScript logic

---

### Manual Test: Download PDF Policy

**User Story**: "Visitor clicks download button on expanded PDF and downloads file"

**Steps**:
1. Expand a PDF policy (see previous test)
2. Look for a **download button** near the PDF embed
3. Click the download button
4. Check browser downloads folder

**Expected Results**:
- [ ] File **downloads to local device**
- [ ] Filename **matches policy name** (e.g., `code-of-conduct.pdf`, not `document.pdf`)
- [ ] Downloaded file is a **valid, readable PDF**
- [ ] Download completes within reasonable time (<5 seconds)

**Verification**:
- Open downloaded PDF in PDF reader (Adobe Reader, built-in viewer, etc.)
- Verify content matches the embedded PDF

---

### Manual Test: External Policy Links

**User Story**: "Visitor clicks external policy link and it opens in a new tab"

**Steps**:
1. On the About page, find a policy with an **external link icon** (not PDF)
2. Example policies: "Child Protection Policy", "Gender, Disrespect & Violence"
3. Click the policy link
4. Observe new tab behavior

**Expected Results**:
- [ ] Link **opens in a new tab**
- [ ] **About page stays open** (not replaced)
- [ ] New tab shows the **target website** (e.g., bendigobasketball.com.au)
- [ ] Link icon **visually distinct** from PDF icon (color, symbol, or styling)

**Browser Check**:
- Verify `target="_blank"` in HTML (inspect element)
- Verify `rel="noopener noreferrer"` present (security best practice)

---

### Responsive Test: Club Policies at Different Viewports

**User Story**: "Visitor views Club Policies on mobile (375px) and desktop (1440px)"

**Steps**:
1. Open About page in Chrome
2. Open DevTools (F12)
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test at three viewport sizes: **375px**, **768px**, **1440px**

**Expected Results**:

| Viewport | Layout | Behavior |
|----------|--------|----------|
| **375px** | Single-column grid | Policies stack vertically; PDF embeds narrow but readable |
| **768px** | Flexible (1-2 columns) | Policies may wrap; embed fills available width |
| **1440px** | Two-column grid | Policies side-by-side; embeds full width of column |

**Specific Checks**:
- [ ] No horizontal scrolling at any viewport
- [ ] Text does not overflow containers
- [ ] PDF embeds maintain minimum usable height on mobile
- [ ] Buttons are tappable (≥44px on mobile)

---

### Accessibility Test: Keyboard Navigation

**User Story**: "Visitor uses keyboard to navigate and expand policies"

**Steps**:
1. On About page, navigate to Club Policies section
2. Press **Tab** to focus on first policy item
3. Press **Enter** or **Space** to expand (if PDF)
4. Verify expand/collapse state
5. Press **Tab** again to focus next item

**Expected Results**:
- [ ] All policy items are **focusable** via Tab key
- [ ] Focused items show **visible focus outline**
- [ ] Press **Enter** or **Space** on a PDF item **toggles expand/collapse**
- [ ] External link items navigate to URL when Enter is pressed
- [ ] **Only one PDF can be expanded at a time** even via keyboard

**ARIA Check**:
- Inspect HTML: `aria-expanded="true|false"` attribute present on accordion buttons
- Inspect HTML: `aria-controls="..."` attribute pointing to PDF embed element

---

### Accessibility Test: Screen Reader

**Steps** (with NVDA on Windows or VoiceOver on macOS):
1. Enable screen reader
2. Navigate to Club Policies section
3. Have screen reader read the section

**Expected Announcements**:
- [ ] "Club Policies" heading announced
- [ ] Each policy name announced with icon hint ("PDF" or "External link")
- [ ] Expanded PDF: Announces `title` attribute on embed (e.g., "Code of Conduct PDF")
- [ ] External links announce: "Opens in new tab" or similar

---

### Edge Case Test: Missing or Broken PDF

**Preparation**: Temporarily modify one `filePath` to a non-existent file.

**Steps**:
1. Reload About page
2. Expand the policy with the broken path
3. Observe error handling

**Expected Results**:
- [ ] No console JavaScript error
- [ ] **User-friendly message displayed** (e.g., "Document temporarily unavailable")
- [ ] Policy item still visible in list
- [ ] **Fallback download link visible** if available
- [ ] Page doesn't crash or show blank space

**Revert**: Change the `filePath` back to the correct path.

---

## Feature 2: Team Manager Resources on Resources Page

### Manual Test: Manager Tab Visibility

**User Story**: "Team manager navigates to Resources page and sees Manager tab"

**Steps**:
1. Navigate to `http://localhost:3000/resources` in browser
2. Observe the tab bar at the top of the content section
3. Count visible tabs

**Expected Results**:
- [ ] **Three tabs visible**: "Coaching Resources", "Player Resources", "Manager Resources"
- [ ] **Manager tab is NOT hidden** (no `display: none` or similar)
- [ ] Manager tab is **clickable and focusable**
- [ ] Tab bar layout is clean and aligned with other tabs

**HTML Check** (Inspect Element):
- Verify `id="tab-managers"` button does NOT have `class="hidden"`
- Verify other tabs (`tab-coaching`, `tab-players`) are visible

---

### Manual Test: Manager Tab Content

**User Story**: "Team manager clicks Manager tab and sees manager-specific resources"

**Steps**:
1. On Resources page, click the **Manager Resources** tab
2. Observe the content panel

**Expected Results**:
- [ ] Manager tab becomes **active/selected** (visual indicator)
- [ ] **Content panel updates** to show manager resources
- [ ] Manager resource cards display using **same layout as Coaching/Player tabs**
- [ ] Each card shows:
  - [ ] Document title
  - [ ] Description
  - [ ] Category label
  - [ ] Action button (download or open link)

**Data Check**:
- [ ] Eight manager resources visible (from `manager-resources.json`)
- [ ] Examples: "Club Constitution & By-Laws", "Annual Budget Template", etc.

---

### Manual Test: Manager Tab Filter Bar Suppression

**User Story**: "Team manager views Manager tab and sees no filter controls"

**Steps**:
1. Click on **Coaching Resources** tab
2. **Observe filter bar** (age and category chips visible)
3. Click on **Manager Resources** tab
4. **Observe filter bar** (should disappear)

**Expected Results**:
- [ ] **Coaching tab**: Filter bar visible with age/category chips
- [ ] **Switch to Manager tab**: Filter bar **completely hidden**
- [ ] **No age group chips** displayed
- [ ] **No category chips** displayed
- [ ] **No "Clear filters" button** displayed
- [ ] **Switch back to Coaching**: Filter bar **reappears**

**HTML Check**:
- Inspect `id="filters-managers"` element
- Verify it has `class="hidden"` that is NOT toggled by tab switching

---

### Manual Test: Manager Document Links

**User Story**: "Team manager clicks on a document link and it opens"

**Steps**:
1. Click on Manager Resources tab
2. Find a document card (e.g., "Club Constitution & By-Laws")
3. Click the action button/link on the card
4. Observe document loading or download

**Expected Results**:
- [ ] **PDF documents**: Download initiated to user's device
- [ ] **External links**: Open in new tab (if applicable)
- [ ] **No errors** or broken links (verify URLs in `manager-resources.json`)
- [ ] Each document **downloads/opens successfully**

---

### Responsive Test: Manager Tab at Different Viewports

**Steps**:
1. Open Resources page in Chrome
2. Toggle DevTools device toolbar
3. Test at **375px**, **768px**, **1440px**

**Expected Results**:
- [ ] Manager resource cards **display in responsive grid** at all sizes
- [ ] Cards **stack on mobile**, **arrange in rows on desktop**
- [ ] All cards **readable and clickable** at each viewport

---

## Feature 3: Guides Tab on Resources Page

### Manual Test: Guides Tab Visibility

**User Story**: "Coach navigates to Resources page and sees Guides tab"

**Steps**:
1. Navigate to `http://localhost:3000/resources`
2. Observe the tab bar

**Expected Results**:
- [ ] **Four tabs visible**: "Coaching Resources", "Player Resources", "Manager Resources", "Guides"
- [ ] **Guides tab appears last** (or as positioned in HTML)
- [ ] Tab is **clickable and styled consistently** with other tabs

---

### Manual Test: Guides Tab Content

**User Story**: "Coach clicks Guides tab and sees instructional videos"

**Steps**:
1. On Resources page, click the **Guides** tab
2. Observe the content panel

**Expected Results**:
- [ ] Guides tab becomes **active/selected**
- [ ] **Content panel shows guide cards**
- [ ] Each guide card displays:
  - [ ] Video title (e.g., "How to Score a Game")
  - [ ] Category label (e.g., "PlayHQ")
  - [ ] **Embedded YouTube video player** with standard controls
  - [ ] Optional: Description text

**Data Check**:
- [ ] At least one guide visible (initial: "How to Score a Game")
- [ ] Guide videos **categorized** (grouped by category or labeled)

---

### Manual Test: YouTube Video Embed

**User Story**: "Coach watches an embedded YouTube video in the Guides tab"

**Steps**:
1. Click on Guides tab (see previous test)
2. Locate an embedded YouTube video
3. Click **Play button** on the video
4. Observe video playback

**Expected Results**:
- [ ] Video **plays inline** (no navigation to YouTube required)
- [ ] **Standard YouTube controls visible**:
  - [ ] Play/Pause
  - [ ] Progress bar (seek)
  - [ ] Volume control
  - [ ] Fullscreen button
  - [ ] Settings (captions, quality if available)
- [ ] Video **fills the card width** on desktop
- [ ] Video maintains **16:9 aspect ratio** (not stretched or squished)
- [ ] **No console errors** during playback

---

### Responsive Test: YouTube Embeds at Mobile (375px)

**User Story**: "Coach watches guide on mobile phone"

**Steps**:
1. Open Resources page in Chrome
2. DevTools: Toggle device toolbar, set to 375px
3. Navigate to Guides tab
4. Click play on a video
5. Test fullscreen and controls

**Expected Results**:
- [ ] Video **maintains 16:9 aspect ratio** on mobile
- [ ] Video **fills screen width** without overflow
- [ ] **All controls usable** on touch device (buttons large enough)
- [ ] **Fullscreen works** and fills viewport properly
- [ ] **Captions (CC) button** visible if available on source video

---

### Accessibility Test: Guides Keyboard Navigation

**Steps**:
1. On Guides tab, press **Tab** to navigate between guide cards
2. Press **Enter** on a card to focus the video player
3. Use **keyboard controls** to play/pause (spacebar), seek (arrow keys), etc.

**Expected Results**:
- [ ] Guide cards are **focusable** and show focus indicator
- [ ] YouTube embed is **keyboard accessible** (play, pause, seek, fullscreen)
- [ ] Tab order is **logical and usable**

**ARIA Check**:
- Inspect `<iframe>` element
- Verify `title="..."` attribute describing the video
- Verify `allowfullscreen` attribute present

---

### Accessibility Test: Guides Screen Reader

**Steps**:
1. Enable screen reader (NVDA/VoiceOver)
2. Navigate to Guides tab
3. Have screen reader read guide cards

**Expected Announcements**:
- [ ] "Guides" tab announced when focused
- [ ] Guide title announced
- [ ] Category announced (e.g., "PlayHQ")
- [ ] Embedded video announced with descriptive `title`
- [ ] Example: "How to Score a Game, PlayHQ video"

---

## Integration Tests: Tab Navigation & Filter Bar

### Manual Test: Tab Switching Flow

**Scenario**: "User switches between all four tabs, filters applied"

**Setup**:
1. On Resources page, apply a filter on Coaching tab (click a category chip)
2. Verify filter is active (chip highlighted, filter summary shown)

**Steps**:
1. Click **Player Resources** tab
2. Verify filters hidden and panel updated
3. Click **Manager Resources** tab
4. Verify **NO filters visible** even though filter-managers div exists
5. Click **Guides** tab
6. Verify **NO filters visible**
7. Click **Coaching Resources** tab
8. Verify **filter is still active** (filter state persisted)

**Expected Results**:
- [ ] Filter bar **hidden when Manager or Guides tab active**
- [ ] Filter bar **shows when Coaching or Player tab active**
- [ ] Filter state **preserved when switching away and back** to Coaching tab
- [ ] **No console errors** during tab switching

---

### Manual Test: Guides Tab Keyboard Navigation

**User Story**: "Coach uses arrow keys to navigate between tabs including Guides"

**Steps**:
1. On Resources page, focus the tab bar (click a tab button)
2. Press **Right Arrow** to move to next tab
3. Continue until you reach the **Guides tab**
4. Press **Left Arrow** to move backward

**Expected Results**:
- [ ] **Arrow key navigation works** between all tabs
- [ ] **Guides tab is included** in the tab navigation cycle
- [ ] Pressing Right on Guides wraps to first tab (or stops)
- [ ] Pressing Left on first tab wraps to Guides (or stops)
- [ ] Focused tab shows **active styling**

---

## Complete Feature Verification Checklist

### About Page - Club Policies

- [ ] Club Policies section visible and positioned correctly
- [ ] Policies listed in strict alphabetical order
- [ ] Two-column layout on desktop (≥sm breakpoint)
- [ ] Single-column layout on mobile (<sm breakpoint)
- [ ] PDF items show document/expand icon
- [ ] External items show external-link icon with distinct styling
- [ ] Click PDF policy → embeds inline within page
- [ ] Download button present on expanded PDF
- [ ] Download button produces correct filename
- [ ] Expanding one policy collapses another (accordion)
- [ ] External links open in new tab; About page remains open
- [ ] Missing/broken PDF displays friendly error message
- [ ] No console JavaScript errors
- [ ] Keyboard navigation: Tab and Enter/Space functional
- [ ] Screen reader: Policies announced; external links announce "(opens in new tab)"
- [ ] Responsive: Verified at 375px, 768px, 1440px
- [ ] PDF loads within 3 seconds on 3G throttle

### Resources Page - Manager Tab

- [ ] Manager tab visible on page load (not hidden)
- [ ] Manager tab clickable and active state visible
- [ ] Manager resource cards use same layout as Coaching/Player
- [ ] All 8 manager resources display correctly
- [ ] No filter bar visible when Manager tab active
- [ ] Filter bar hidden even when switching tabs
- [ ] Manager documents open/download correctly
- [ ] No console JavaScript errors
- [ ] Keyboard: Tab navigation and arrow keys work
- [ ] Responsive: Verified at 375px, 768px, 1440px

### Resources Page - Guides Tab

- [ ] Guides tab visible in tab bar (after Manager tab)
- [ ] Guides tab clickable and active state visible
- [ ] Guide cards display with title, category, and YouTube embed
- [ ] YouTube videos play inline with standard controls
- [ ] Guides grouped or labeled by category
- [ ] YouTube embeds maintain 16:9 aspect ratio at all viewports
- [ ] Fullscreen works on desktop and mobile
- [ ] No filter bar visible for Guides tab
- [ ] No console JavaScript errors
- [ ] Keyboard: Tab navigation and arrow keys work
- [ ] Responsive: Verified at 375px, 768px, 1440px

### Accessibility (All Features)

- [ ] axe DevTools scan: No critical/serious violations
- [ ] ARIA attributes correct (`aria-expanded`, `aria-controls`, etc.)
- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announcements correct and descriptive
- [ ] Focus indicators visible on all focusable elements
- [ ] No layout shifts during interaction

### Performance & Errors

- [ ] No JavaScript console errors
- [ ] PDF files compress to <5MB
- [ ] PDF loads within 3 seconds on 3G
- [ ] YouTube embeds load and play without errors
- [ ] Page navigation smooth and responsive
- [ ] No broken links in data files

---

## Browser Testing

Test on the latest versions of:
- [ ] Chrome / Chromium Edge
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Safari (iOS, if available)

**Key checks**:
- [ ] PDF embeds render
- [ ] YouTube embeds load
- [ ] Responsive layout works
- [ ] No console errors
- [ ] All interactions smooth

---

## Automated Tests (Vitest)

If component tests are written, verify:

```bash
npm run test
```

Expected results:
- [ ] All tests pass
- [ ] No skipped tests
- [ ] Coverage targets met (if defined)

---

## Build & Deployment Verification

### Development Build

```bash
npm run dev
```

- [ ] Development server starts
- [ ] Site loads without errors
- [ ] All features accessible
- [ ] Hot reload works

### Production Build

```bash
npm run build
```

- [ ] Build completes without errors or warnings
- [ ] No TypeScript errors
- [ ] Static assets generated correctly

### Production Preview

```bash
npm run preview
```

- [ ] Preview server starts
- [ ] Site loads and functions identically to dev
- [ ] All features work
- [ ] Performance acceptable

---

## Known Issues & Workarounds

### Issue: PDF doesn't render in Firefox

**Cause**: Some PDFs may have compatibility issues

**Workaround**: Provide fallback download link; user can download and view locally

---

### Issue: YouTube video blocked by CORS

**Cause**: Unlikely; YouTube embeds should work

**Workaround**: Verify YouTube URL is correct format; check browser console for details

---

### Issue: Filters reappear on Manager tab after page reload

**Cause**: Filter state may be stored in localStorage

**Workaround**: Clear browser cache and localStorage; verify `switchTab()` function suppresses filters-managers

---

## Troubleshooting Guide

### Club Policies not alphabetical

**Check**: Verify `clubPolicies` array is sorted in `about.astro`

```javascript
const sortedPolicies = clubPolicies.sort((a, b) => 
  a.name.localeCompare(b.name)
);
```

---

### Manager tab still hidden

**Check**: Verify `hidden` class removed from `tab-managers` button in `resources/index.astro`

```html
<!-- Should NOT have class="hidden" -->
<button id="tab-managers" role="tab" class="tab-btn ...">
  Manager Resources
</button>
```

---

### Filters visible on Manager tab

**Check**: Verify `switchTab()` function suppresses `filters-managers`

```javascript
function switchTab(tabName) {
  // Hide all filter bars first
  document.querySelectorAll('[id^="filters-"]').forEach(el => {
    el.classList.add('hidden');
  });
  // Show only the appropriate filter bar
  if (tabName !== 'managers') {
    const filterBar = document.getElementById(`filters-${tabName}`);
    if (filterBar) filterBar.classList.remove('hidden');
  }
  // Manager tab: keep filters-managers hidden (no show)
}
```

---

### YouTube embeds not loading

**Check**: Verify YouTube URL format in `guides.json` is correct

Valid formats:
- `https://youtu.be/OdTboL_uYqk`
- `https://www.youtube.com/watch?v=OdTboL_uYqk`

---

## Success Criteria

All items in the manual QA checklist must pass before merge:

1. ✅ All Club Policies visible and functional
2. ✅ Manager tab visible and no filters shown
3. ✅ Guides tab visible with working YouTube embeds
4. ✅ All responsive at 375px, 768px, 1440px
5. ✅ No console errors
6. ✅ Keyboard navigation functional
7. ✅ Screen reader friendly
8. ✅ No WCAG violations
9. ✅ PDF performance acceptable
10. ✅ Builds without errors

---

## Next Steps

After completing all manual QA:

1. [ ] Commit any fixes to the feature branch
2. [ ] Run full test suite (`npm test`)
3. [ ] Request code review
4. [ ] Merge to `main` branch
5. [ ] Deploy to staging/production

---

## Support & Questions

For implementation questions, refer to:
- `spec.md` — Full feature requirements
- `plan.md` — Technical architecture and decisions
- `data-model.md` — Data structure details
- `contracts.md` — API and data contracts
- `research.md` — Technology decisions and alternatives
