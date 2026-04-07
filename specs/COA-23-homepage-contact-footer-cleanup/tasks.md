# Tasks: COA-23 — Homepage, Contact & Footer Cleanup

## Status: READY

---

## Window 1: Foundation
**Purpose**: Remove welcome section from homepage to establish clean foundation

### Tasks
- [ ] T001 Remove "Welcome to the Phoenix Family" section from homepage
  **File**: `src/pages/index.astro`
  **Change**: Remove the entire `<section class="py-20 ...">` block (lines 126–144) containing the welcome headings, gold divider, and two paragraphs.
  **Acceptance**:
  - Homepage loads with no "Welcome to the Phoenix Family" heading or section content visible
  - Score tracker (Latest Results, dark background) renders as the immediate next section after the hero carousel
  - No visual gap, orphaned spacer, or doubled padding between hero and score tracker

### Window Checkpoint
- WINDOW_CHECKPOINT_1: Homepage welcome section removed cleanly
  - ✅ No "Welcome to the Phoenix Family" heading or section content visible
  - ✅ Score tracker renders as immediate next section after hero
  - ✅ No visual gaps or orphaned containers
  - ✅ Page loads without errors

---

## Window 2: P1 Contact Updates
**Purpose**: Simplify Contact Us page by removing Find Us section and updating email contacts

### Tasks
- [ ] T002 Remove "Find Us" section from Contact Us page
  **File**: `src/pages/contact.astro`
  **Change**: Remove the entire `<section class="py-8 ... pb-16">` block (lines 97–117) containing the "Find Us" heading, map placeholder div, and Google Maps link.
  **Acceptance**:
  - Contact page loads with no "Find Us" heading, map placeholder, or Google Maps link visible
  - Page bottom transitions cleanly into the footer with no orphaned containers

- [ ] T003 Update Email card on Contact Us page
  **File**: `src/pages/contact.astro`
  **Change**: Replace the inner `<div>` of the Email card (lines 42–55) with three labelled email entries — General Enquiries, President, Treasurer. Remove the existing single email link and descriptive paragraph. All three entries must be `mailto:` anchor links using the correct addresses from the spec.
  **Acceptance**:
  - Three email entries visible on the Contact page, each with a label and email address
  - Clicking each triggers a mailto compose action for the correct address
  - Card outer structure (icon, wrapper) unchanged

### Window Checkpoint
- WINDOW_CHECKPOINT_2: Contact page updates complete
  - ✅ No "Find Us" section visible
  - ✅ Three email contacts displayed: General Enquiries, President, Treasurer
  - ✅ All email entries are functional mailto links
  - ✅ Page layout transitions cleanly into footer
  - ✅ No orphaned containers or spacing issues

---

## Window 3: P2 Footer Restructure
**Purpose**: Restructure footer from 3 columns to 4 columns with Quick Links as standalone column

### Tasks
- [ ] T004 Restructure footer from 3 columns to 4 columns
  **File**: `src/components/Footer.astro`
  **Changes**:
  1. Update grid wrapper class from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`
  2. Remove the Quick Links sub-section (`<div class="mt-6 space-y-1">` block and its `<h3>`) from inside the Follow Us column
  3. Add a new fourth `<div>` column after the Follow Us column containing the Quick Links heading and the same four links in the same order with identical classes
  **Acceptance**:
  - Footer renders 4 columns on desktop (≥1024px)
  - Footer renders 2×2 grid on tablet (768px–1023px)
  - Footer stacks single column on mobile (<768px)
  - "Quick Links" is a standalone column — not nested under "Follow Us"
  - All four Quick Links items present, in original order, with original hrefs
  - No footer content lost or reordered

### Window Checkpoint
- WINDOW_CHECKPOINT_3: Footer restructure complete
  - ✅ Footer renders 4 columns on desktop (≥1024px)
  - ✅ Footer renders 2×2 grid on tablet (768px–1023px)
  - ✅ Footer stacks single column on mobile (<768px)
  - ✅ "Quick Links" is standalone column (not nested under Follow Us)
  - ✅ All Quick Links items present and unchanged
  - ✅ No footer content lost or reordered

---

## Window 4: Polish & Validation
**Purpose**: Final validation, testing, and cleanup

### Tasks
- [ ] T005 Validate all changes work together and meet acceptance criteria
  **Change**: Run final validation of all implemented changes
  **Acceptance**:
  - All acceptance criteria from spec.md are met
  - No regressions in existing functionality
  - Responsive behavior preserved at all breakpoints
  - Accessibility maintained (keyboard navigable, proper ARIA where needed)

- [ ] T006 Clean up any temporary files or artifacts
  **Change**: Remove any temporary files created during implementation
  **Acceptance**:
  - No temporary files remain in the codebase
  - Implementation is clean and ready for review

### Window Checkpoint
- WINDOW_CHECKPOINT_4: Final validation complete
  - ✅ All acceptance criteria met (SC-001 through SC-007)
  - ✅ All testable scenarios validated
  - ✅ Responsive behavior verified
  - ✅ No regressions detected
  - ✅ Ready for merge

---