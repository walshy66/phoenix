# Tasks: COA-61 — Seasons Update

**Branch**: `cameronwalsh/coa-61-seasons-update` | **Plan**: `specs/coa-61-seasons-update/plan.md`

---

## Execution Window 1: Data & Components Foundation

### Task 1.1: Create season-info.ts Data File

**Description**: Create `src/data/season-info.ts` with `ImageSubCard` and `SeasonInfoCard` TypeScript interfaces, plus the `SEASON_INFO_CARDS` array containing all 4 card definitions. Use placeholder copy for non-Training modals; Training sub-cards remain empty (sourced from VENUES).

**Acceptance**:
- File created at `src/data/season-info.ts`
- Interfaces export cleanly with correct prop types
- `SEASON_INFO_CARDS` array contains 4 cards: training, uniforms, clearances, registration (in order)
- Image sources point to `/uploads/*.png` files listed in plan
- TypeScript compiles without errors
- Placeholder `alt` text and titles are descriptive but indicate they are placeholders

**Dependency**: None

---

### Task 1.2: Build SeasonInfoCard.astro Component

**Description**: Create `src/components/SeasonInfoCard.astro` — a button-styled card component. Props: `id`, `label`, `icon`, `description`, `ariaLabel`. Renders icon (emoji), label, and description. Includes `data-modal-id` attribute and `focus-visible:ring-2 focus-visible:ring-brand-purple` styling.

**Acceptance**:
- Component renders as a `<button type="button">` 
- Styling matches plan: white bg, border, rounded-xl, hover effects, focus ring
- `aria-label` attribute populated from prop
- `data-modal-id` set to the `id` prop
- Component visually distinct from `SeasonTile.astro` (white + border, no coloured background)

**Dependency**: Requires Task 1.1 (data types reference, optional)

---

### Task 1.3: Build SeasonInfoModal.astro Component

**Description**: Create `src/components/SeasonInfoModal.astro` — renders all 4 modal variants, initially hidden. Props: `card: SeasonInfoCard`, `venues: Venue[]`. Each modal includes: backdrop, header with title and close button (X), scrollable body with sub-card grid. Pre-render all 4 modals at build time; each identified by `id="season-info-modal-{id}"`.

**Modal layouts**:
- **Training**: venue sub-cards (text-only, 2 cols desktop / 1 col mobile)
- **Uniforms**: image sub-cards (2x2 desktop / 1 col mobile)
- **Clearances**: 1 centered image sub-card
- **Registration**: image sub-cards (2 cols desktop / 1 col mobile)

**Accessibility**: Each modal has `role="dialog"`, `aria-modal="true"`, `aria-labelledby="{title-id}"`. Close button has `aria-label="Close {title}"` and `min-h-[44px] min-w-[44px]`.

**Acceptance**:
- Component renders 4 hidden modal `<div>` containers (one per call)
- Each modal has correct backdrop, header, close button, and sub-card grid
- Training sub-cards extracted from existing `seasons.astro` venue markup pattern
- Image sub-cards include `loading="lazy"` and placeholder broken-image handling
- Clearance image link includes `target="_blank" rel="noopener noreferrer"`
- All `aria-*` attributes correctly set

**Dependency**: Requires Task 1.1 (season-info.ts) and understanding of VENUES structure

---

## Execution Window 2: Page Integration & Scripting

### Task 2.1: Replace Club Training Section in seasons.astro

**Description**: Modify `src/pages/seasons.astro` to replace the existing Club Training Information section (lines ~26–72) with the new Season Information section. Add imports for `SeasonInfoCard`, `SeasonInfoModal`, and `SEASON_INFO_CARDS`. Render the 4-card grid and all 4 modals.

**Acceptance**:
- Old "Club Training Information" section removed
- New "Season Information" section renders with heading "Season Information", gold underline, and 4 cards in a grid
- Grid is responsive: 1 col mobile, 2 cols tablet, 4 cols desktop
- All 4 modals rendered below the section
- Season tile grid (existing), financial assistance callout, and grading section remain untouched
- Page builds cleanly; no TypeScript errors
- Verify via browser: 4 Season Information cards visible on `/seasons`

**Dependency**: Requires Tasks 1.2 and 1.3

---

### Task 2.2: Add Modal Script to seasons.astro

**Description**: Add a `<script>` block at the bottom of `seasons.astro` (inside `<BaseLayout>`, after modal components). Wire all card buttons to their modals. Implement open/close logic, focus management, focus trap, Escape key, and backdrop click handling.

**Script responsibilities**:
- Card click → open corresponding modal
- Close button or backdrop click → close modal
- Escape key → close modal
- Tab focus trap (only focusable elements inside modal)
- Focus returns to triggering card on close
- Only one modal open at a time

**Selectors**: Use `[data-modal-id]` for cards, `[data-close-btn]` for close button, `[data-modal-backdrop]` for backdrop.

**Acceptance**:
- Modals open/close on click, Escape, and backdrop click
- Focus trap prevents Tab from exiting modal
- Focus returns to triggering card
- Only one modal open at a time
- Rapid card clicks don't stack modals
- Modal is keyboard-only accessible (no mouse required)

**Dependency**: Requires Task 2.1

---

### Task 2.3: Add data Attributes to Modal Component

**Description**: Update `SeasonInfoModal.astro` to add the missing `data-close-btn` and `data-modal-backdrop` attributes that the script selects. Close button gets `data-close-btn`, backdrop `<div>` gets `data-modal-backdrop`.

**Acceptance**:
- Close button has `data-close-btn` attribute
- Backdrop div has `data-modal-backdrop` attribute
- Script selectors match these attributes
- Script wiring test still passes (modals open/close)

**Dependency**: Requires Tasks 1.3 and 2.2

---

## Execution Window 3: Verification & Edge Cases

### Task 3.1: Responsive Design & Visual Pass

**Description**: Test the page at multiple breakpoints (320px, 640px, 1024px) in the browser. Verify card grid and modal sub-card grids respond correctly. Confirm no horizontal overflow on very small screens.

**Test plan**:
- 320px: card grid single column; Training/Uniforms/Registration sub-card grids single column; Clearance centered
- 640px: card grid 2 columns; Training/Registration 2 cols; Uniforms 2x2 grid (4 items)
- 1024px+: card grid 4 columns; grids unchanged

**Acceptance**:
- All layouts render without horizontal overflow
- Cards and sub-cards are consistently sized within their respective grids
- Modal fits on screen at all breakpoints (full-screen on mobile, floating on desktop)
- Text is readable at all sizes

**Dependency**: Requires Task 2.1

---

### Task 3.2: Keyboard & Focus Accessibility

**Description**: Manual keyboard-only navigation test. No mouse. Verify all cards, buttons, and links are reachable via Tab. Verify focus trap works. Verify Escape closes modal.

**Test steps**:
1. Tab to each Season Information card — confirm visible focus ring
2. Press Enter on Training card — modal opens, focus on close button
3. Tab through modal focusable elements (close button, venue links if any)
4. Shift+Tab — wraps to last focusable element
5. Escape — modal closes, focus returns to Training card
6. Tab to Clearance card, open, Tab to clearance image link, Enter — opens external link in new tab
7. Escape — closes modal (not the tab), focus to Clearance card

**Acceptance**:
- All 4 cards reach via Tab
- Focus ring visible on all cards
- Modal opens on Enter/Space
- Focus moves to close button on open
- Tab cycles only within modal
- Escape closes modal
- Focus returns to triggering card
- External link opens in new tab without closing modal

**Dependency**: Requires Tasks 2.1 and 2.2

---

### Task 3.3: Edge Cases & Error Handling

**Description**: Test edge cases and error conditions.

**Test cases**:
1. **Broken image**: Temporarily remove or corrupt one image src in the browser DevTools. Confirm modal renders a placeholder (neutral background visible, alt text area); layout does not collapse.
2. **Very small screen (< 375px)**: Resize to 320px, confirm no horizontal overflow.
3. **Rapid clicks**: Click a card rapidly 3–4 times. Confirm modal opens only once; no duplicate modals or stacking.
4. **Modal switch**: Open Training modal, then click Uniforms while Training is open. Confirm Training closes first, then Uniforms opens.

**Acceptance**:
- Broken images show a neutral background; sub-card does not collapse
- No horizontal scroll on 320px
- Rapid clicks open modal once only
- Modals switch cleanly (close-then-open behavior)

**Dependency**: Requires Tasks 2.1, 2.2, and 2.3

---

## Execution Window 4: Content & Final Handoff

### Task 4.1: Confirm Image-to-Sub-Card Mapping

**Description**: Verify with content owner (or based on available uploads) that the image file mapping in the data file matches intended sub-cards. Update `season-info.ts` if mapping needs adjustment. Confirm all image files exist in `/public/uploads/`.

**Current mapping** (from plan):
- `uniform_how-to_order.png` → Uniforms — How To
- `uniform_numbers.png` → Uniforms — Numbers
- `uniform_loan_program.png` → Uniforms — Loan
- `uniform_2nd_hand.png` → Uniforms — 2nd Hand
- `registration_clearance.png` → Clearances (clickable)
- `registration_how_to.png` → Registration — How To
- `registration_winter26_fees.png` → Registration — Fees

**Acceptance**:
- All image files exist in `/public/uploads/`
- Mapping confirmed or updated
- `src/data/season-info.ts` reflects final image paths
- No broken image links

**Dependency**: None (can run in parallel with earlier tasks)

---

### Task 4.2: Update Sub-Card Copy & Alt Text

**Description**: Replace placeholder copy in `season-info.ts` with final titles, descriptions, and `imageAlt` values. Ensure alt text is descriptive and non-empty.

**Acceptance**:
- All `title` fields are final copy (not placeholders)
- All `imageAlt` fields are descriptive (not empty)
- `description` fields (if used) are final copy
- Alt text matches image content (accessibility-first)

**Dependency**: Requires Task 4.1

---

### Task 4.3: Final QA & Sign-Off

**Description**: Run through all 16 acceptance criteria from the spec (manual browser tests). Confirm all pass. Verify existing page sections (season tiles, financial assistance callout, grading) are intact. Record any issues or blockers.

**Acceptance criteria checklist** (from spec):
1. AC-01: 4 Season Information cards visible
2. AC-02: Training modal opens with 2 venue sub-cards
3. AC-03: Uniforms modal 2x2 grid (desktop)
4. AC-04: Uniforms modal 1-column (mobile)
5. AC-05: Registration modal opens with 2 sub-cards
6. AC-06: Clearances modal opens with 1 centered sub-card
7. AC-07: Clearance image link opens in new tab; modal stays open
8. AC-08: X closes modal; focus returns to card
9. AC-09: Escape closes modal; focus returns to card
10. AC-10: Backdrop click closes modal
11. AC-11: Tab cycles only within modal (focus trap)
12. AC-12: Tab to card, Enter/Space opens modal; focus to close button
13. AC-13: Existing sections (tiles, callout, grading) intact
14. AC-14: 4 cards in 1 row on desktop (> 1024px)
15. AC-15: 4 cards in 1 column on mobile (< 640px)
16. AC-16: Broken images show placeholder; layout intact

**Acceptance**:
- All 16 ACs pass
- No regressions in existing sections
- No console errors or warnings
- Ready for merge

**Dependency**: Requires Tasks 1.1–4.2

---

## Summary

**Total tasks**: 13  
**Execution windows**: 4  
**Order**: Sequential (each window depends on prior tasks; some tasks within a window can run in parallel)

Window 1 (foundation): Data file + 2 components  
Window 2 (integration): Page integration + script + component updates  
Window 3 (verification): Responsive, keyboard, edge cases  
Window 4 (handoff): Image mapping, copy, final QA
