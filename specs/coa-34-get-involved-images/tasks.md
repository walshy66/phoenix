# Tasks: COA-34 — Get Involved Page: Images & Real Data

**Input**: Specs from `/specs/coa-34-get-involved-images/`  
**Strategy**: Option C Execution Windows (GSD-aligned, isolated 200k contexts)  
**Total Windows**: 4  
**Estimated Effort**: 4–6 hours  

---

## Format Guide

- **[P]**: Can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh ~200k token window, /clear between)
- **WINDOW_CHECKPOINT**: Validation gate before proceeding to next window
- **Traceability**: Each task traces back to spec (FR-XXX, AC-XXX)
- **Dependency**: Task blocking this work (if any)

---

## Execution Window 1: Alt Text Support Infrastructure

**Purpose**: Code changes to support descriptive alt text in the Event type, EventTile component, and parser. BLOCKING all data work.

**Token Budget**: 50–65k (code changes are lightweight)

**Checkpoint Validation**:
- [ ] Build succeeds with existing placeholder events
- [ ] EventTile component backwards-compatible (old events still render)
- [ ] Parser extracts `alt` field from events.md frontmatter
- [ ] All 4 code tasks pass review
- [ ] Can proceed to Window 2 (Image Sourcing)

---

### T001 [P] Add `alt` field to Event interface (types.ts)

**Window**: 1 (Alt Text Infrastructure)  
**Phase**: Type Definition  
**Traceability**: Spec § Implementation Notes "All events need descriptive alt text per WCAG"  
**Dependencies**: None  
**Description**: Add optional `alt?: string` field to the Event interface to support custom alt text per image.

**What to create**:
- **File**: `src/lib/events/types.ts`
- **Change**: Add optional `alt?: string` to Event interface
- **Backwards Compatibility**: Existing events without `alt` continue to work (fallback to `${title} - ${date}`)
- **Example**:
  ```typescript
  export interface Event {
    id: string;
    title: string;
    date: string;
    image: string;
    status: 'upcoming' | 'past';
    alt?: string;  // NEW: Optional descriptive alt text
    category?: string;
    description?: string;
    time?: string;
    location?: string;
  }
  ```

**Test**: Verify type compiles, existing placeholder events still type-check.

---

### T002 [P] Update EventTile.astro to use `alt` prop with fallback

**Window**: 1 (Alt Text Infrastructure)  
**Phase**: Component Props & Rendering  
**Traceability**: Spec AC-003 "Screen reader announces descriptive alt text"  
**Dependencies**: T001 (type updated)  
**Description**: Accept `alt` prop in EventTile component and apply it to the img element with graceful fallback to `${title} - ${date}`.

**What to modify**:
- **File**: `src/components/EventTile.astro`
- **Change**:
  1. Add `alt?: string` to component Props interface
  2. Update img tag: `alt={alt || \`${title} - ${date}\`}`
  3. Keep all other functionality unchanged
- **Example**:
  ```astro
  interface Props {
    id: string;
    title: string;
    date: string;
    image: string;
    alt?: string;  // NEW
    category?: string;
  }

  const { id, title, date, image, alt, category } = Astro.props;
  ---

  <div class="event-tile">
    <img 
      src={image} 
      alt={alt || `${title} - ${date}`}  // NEW: Use alt if provided, fallback
      class="..." 
    />
    <!-- rest unchanged -->
  </div>
  ```

**Test**: Build succeeds. Render a test event with alt and without alt. Both display without errors.

---

### T003 Update get-involved.astro parser to extract `alt` from frontmatter

**Window**: 1 (Alt Text Infrastructure)  
**Phase**: Data Parsing  
**Traceability**: Spec FR-003 "Each event entry MUST have descriptive alt text"  
**Dependencies**: T001 (type accepts alt)  
**Description**: Modify the Astro page parser to extract the optional `alt` field from the events.md YAML frontmatter and pass it to EventTile.

**What to modify**:
- **File**: `src/pages/get-involved.astro`
- **Change**:
  1. Locate the frontmatter parser (likely `getCollection()` or custom YAML extraction)
  2. Add `alt` to the destructured fields
  3. Ensure alt is passed to EventTile component invocation
- **Example**:
  ```astro
  // Before
  const { title, date, image, status } = event.data;

  // After
  const { title, date, image, status, alt } = event.data;

  // And in the template:
  <EventTile
    id={event.id}
    title={title}
    date={date}
    image={image}
    alt={alt}  // NEW: Pass alt through
  />
  ```

**Test**: Build succeeds. Inspect rendered HTML: existing placeholder events have fallback alt, new events with `alt` field use provided text.

---

### T004 [P] Update EventModal (if applicable) to use alt text

**Window**: 1 (Alt Text Infrastructure)  
**Phase**: Modal Component  
**Traceability**: Spec AC-004 "Modal displays correct title, date, and full poster image"  
**Dependencies**: T001 (type updated)  
**Description**: If EventModal component displays images, ensure it also respects the `alt` field. If no image displayed in modal, no change needed.

**What to modify**:
- **File**: `src/components/EventModal.astro` (or equivalent modal component)
- **Change**:
  1. Check if modal renders an image
  2. If yes, add `alt` prop to modal, apply same logic as EventTile (alt || fallback)
  3. If no, document that modal doesn't display images and no change is needed
- **Expected Outcome**: Modal (if it shows images) also uses descriptive alt text

**Test**: Build succeeds. If modal renders images, verify alt text is applied correctly.

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2 (Image Sourcing)**:

- [ ] Build runs without errors or warnings  
- [ ] All 4 code tasks completed and reviewed  
- [ ] Existing placeholder events still render correctly (backwards compatible)  
- [ ] New `alt` field is optional and parsed correctly  
- [ ] Alt text is applied to EventTile img tags  
- [ ] Modal (if applicable) also supports alt text  

**If checkpoint passes**: Proceed to Window 2. The code infrastructure is ready for real event data and images.

**If checkpoint fails**: Stay in Window 1, debug, and fix.

---

## Execution Window 2: Image Asset Sourcing & Optimisation

**Purpose**: Source all 14 event images from Linear issue, legacy site, or club social media. Optimise for web delivery. Create `public/images/events/` directory and place assets.

**Token Budget**: 40–55k (mostly manual asset processing, minimal code)

**Checkpoint Validation**:
- [ ] All 14 image files present in `public/images/events/`
- [ ] Each image under 200KB
- [ ] Total payload under 2MB
- [ ] Filenames match spec inventory (case-sensitive)
- [ ] Can proceed to Window 3 (events.md replacement)

---

### T005 Source and download all 14 event images

**Window**: 2 (Image Assets)  
**Phase**: Asset Sourcing  
**Traceability**: Spec FR-001 "System MUST add all 14 event images"  
**Dependencies**: None (can start immediately after Window 1)  
**Description**: Locate and download all 14 event poster images from the Linear COA-34 issue attachments, legacy Joomla site, or club social media. Store locally in a staging folder (not yet in public/).

**What to do**:
- **Reference**: Spec § Image Inventory (table with 14 filenames and event types)
- **Source locations**:
  1. Check Linear issue COA-34 for attachments
  2. Check legacy Joomla site (may have archives)
  3. Check club social media (Facebook, Instagram, etc.)
- **Verify**: All 14 images downloaded with correct filenames (case-sensitive):
  - 10 Monthly Posters (May, June, July, August, September, October, December 2025 + January, February, March 2026)
  - 2 Skills Clinic posters (Winter 2025 Session 1 & 2)
  - 1 Training Session graphic (NEW Training Session)
  - 1 Program poster (Fuel and Focus)
- **Note**: November 2025 poster does NOT exist (expected per spec note)

**Test**: All 14 files downloaded, no corrupted files, filenames match inventory.

---

### T006 [P] Optimise images to meet budget (200KB each, 2MB total)

**Window**: 2 (Image Assets)  
**Phase**: Image Optimisation  
**Traceability**: Spec NFR-002 "Total image payload under 2MB, individual images under 200KB"  
**Dependencies**: T005 (images sourced)  
**Description**: Compress/convert each image to meet size budget while preserving visual quality and text readability on posters.

**What to do**:
- **Tools**: Use `pngquant`, `optipng`, `imagemagick`, or online tools (TinyPNG, ImageOptim)
- **PNG Posters** (most files):
  - Run through `pngquant` (reduces color palette to 256 colors + alpha)
  - Run through `optipng -o2` (lossless optimisation)
  - Target: < 200KB per file
  - Verify text on posters remains readable
- **JPG File** (PHOENIX_Social_NEWTrainingSession.jpg):
  - Compress to 85% quality if over 200KB
  - Keep text/graphics crisp
- **WebP Conversion** (only if PNG compression fails):
  - Convert to WebP only if PNG still exceeds 200KB after pngquant + optipng
  - Ensure text remains sharp (test in browser)
- **Total Payload**: All 14 files combined < 2MB

**Test**: Run `du -sh public/images/events/` to verify total size < 2MB. Spot-check a few images in browser to confirm visual quality and readability.

---

### T007 Create `public/images/events/` directory and place optimised images

**Window**: 2 (Image Assets)  
**Phase**: Asset Placement  
**Traceability**: Spec FR-001 "System MUST add all 14 event images to public/images/events/"  
**Dependencies**: T006 (images optimised)  
**Description**: Create the public/images/events/ directory (if not exists) and move all 14 optimised image files with exact filenames matching the spec inventory.

**What to do**:
```bash
mkdir -p public/images/events/
# Move all 14 optimised images:
# PHOENIX_events_May25.png
# PHOENIX_events_June25.png
# ... (all 14 files from inventory)
# Each file must have exact filename match (case-sensitive)
```

**Verify**:
- [ ] `ls -la public/images/events/` shows all 14 files
- [ ] Each file shows size under 200KB
- [ ] Total `du -sh public/images/events/` shows under 2MB
- [ ] No typos or case mismatches in filenames

**Test**: All files present and correct size. Can list directory contents.

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3 (events.md replacement)**:

- [ ] All 14 images downloaded and optimised  
- [ ] All files placed in `public/images/events/`  
- [ ] Each file under 200KB  
- [ ] Total payload under 2MB  
- [ ] Filenames exactly match spec inventory (case-sensitive)  
- [ ] Build still succeeds (assets are static, no parsing yet)  

**If checkpoint passes**: Proceed to Window 3. Assets are ready. Data phase can now reference them.

**If checkpoint fails**: Stay in Window 2, re-optimise or re-source as needed.

---

## Execution Window 3: Event Data Replacement (events.md)

**Purpose**: Replace placeholder event entries in `src/data/events.md` with 14 real event entries from the spec inventory table, each with proper metadata, image paths, and alt text. Validate build.

**Token Budget**: 60–75k (data entry + validation + build testing)

**Checkpoint Validation**:
- [ ] Build runs without errors or warnings
- [ ] All 14 events parsed successfully (no YAML errors)
- [ ] No duplicate IDs
- [ ] All required fields present (id, title, date, image, status)
- [ ] Image paths match filenames in public/images/events/
- [ ] All events have `status: "past"`
- [ ] Events sorted by date descending (March 2026 first, May 2025 last)
- [ ] Can proceed to Window 4 (Integration Verification)

---

### T008 Remove placeholder events and set up event template structure

**Window**: 3 (Event Data)  
**Phase**: Data Replacement (Preparation)  
**Traceability**: Spec FR-002 "Create corresponding event entries in events.md"  
**Dependencies**: T007 (images in place)  
**Description**: Clear existing placeholder events from `src/data/events.md` and prepare YAML template structure for new entries.

**What to do**:
- **File**: `src/data/events.md`
- **Action**: Delete all existing placeholder event frontmatter blocks
- **Keep**: File header/description if present
- **Add**: YAML template for new entries (example below)
- **Expected format**:
  ```yaml
  ---
  id: events-may-2025
  title: "Coming Up May 2025"
  date: "2025-05-01"
  image: "/images/events/PHOENIX_events_May25.png"
  alt: "Coming Up May 2025 poster with Fuel and Focus workshop, uniforms required, and winter season start dates."
  status: "past"
  ---
  
  [Optional description here]
  
  ---
  id: events-june-2025
  ...
  ```

**Test**: File parses without errors. No events defined yet (file is essentially empty except template).

---

### T009 Populate events.md with 14 real event entries from spec inventory

**Window**: 3 (Event Data)  
**Phase**: Data Replacement (Entry Creation)  
**Traceability**: Spec § Image Inventory (all 14 entries with id, title, date, alt text)  
**Dependencies**: T008 (template ready)  
**Description**: Add all 14 real event entries to events.md, using data from the spec inventory table. Each entry includes id, title, date, image path, alt text, and status: "past".

**What to create**:

**Reference the spec inventory table for these 14 entries:**

1. **events-may-2025** — PHOENIX_events_May25.png (2025-05-01)
2. **events-june-2025** — PHOENIX_events_June25.png (2025-06-01)
3. **events-july-2025** — PHOENIX_events_July25.png (2025-07-01)
4. **events-august-2025** — PHOENIX_events_August25.png (2025-08-01)
5. **events-september-2025** — PHOENIX_events_September25.png (2025-09-01)
6. **events-october-2025** — PHOENIX_events_October25.png (2025-10-01)
7. **events-december-2025** — PHOENIX_events_December25.png (2025-12-01)
8. **events-january-2026** — PHOENIX_events_January26.png (2026-01-01)
9. **events-february-2026** — Phoenix_events_Feb26.png (2026-02-01)
10. **events-march-2026** — PHOENIX_events_march26.png (2026-03-01)
11. **skills-clinic-winter-2025-s1** — PHOENIX_SkillsClinic_2025Winter_1.png (2025-07-07)
12. **skills-clinic-winter-2025-s2** — PHOENIX_SkillsClinic_2025Winter_2.png (2025-07-14)
13. **new-training-session-2025** — PHOENIX_Social_NEWTrainingSession.jpg (2025-05-01)
14. **fuel-and-focus-2025** — FuelAndFocus.png (2025-05-01)

**For each entry**:
- Use id and title from inventory
- Set `date` to the date (approx) from inventory
- Set `image` to `/images/events/{exact-filename}`
- Set `alt` to the Alt Text from inventory
- Set `status: "past"` (all entries are past events as of April 2026)
- Optional fields (category, description) may be added if meaningful
- Do NOT include November 2025 (no poster exists)

**Verify chronological order** (by date, descending for past events):
- March 2026 first
- May 2025 last
- Mixed types (monthly, skills clinic, program, training) interspersed

**Test**: Build succeeds. All 14 entries parse without YAML errors.

---

### T010 Validate events.md build and verify image paths

**Window**: 3 (Event Data)  
**Phase**: Validation  
**Traceability**: Spec AC-005 "All 14 events pass validation, no missing required fields, no duplicate IDs"  
**Dependencies**: T009 (entries created)  
**Description**: Run build validation, check for YAML parsing errors, verify image paths exist, confirm no duplicates.

**What to do**:
```bash
npm run build
# Expected: Zero warnings, all 14 events parsed
# Check console for:
#   - YAML parse errors → fix in events.md
#   - Missing image files → verify in public/images/events/
#   - Missing required fields → add to entries in T009
#   - Duplicate IDs → rename if any

# Manual verification:
# 1. Check events.md for valid YAML:
cat src/data/events.md | head -100  # Spot-check syntax

# 2. Verify no duplicate IDs:
grep "^id:" src/data/events.md | sort | uniq -d
# Expected: No output (no duplicates)

# 3. Verify image file references exist:
grep "^image:" src/data/events.md | while read line; do
  path=$(echo $line | sed 's/.*: "//;s/"$//')
  if [ ! -f "public${path}" ]; then
    echo "Missing: public${path}"
  fi
done
# Expected: No missing files output
```

**Test**: Build succeeds with zero warnings. All 14 events validated. Image paths verified.

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4 (Integration Verification)**:

- [ ] Build runs without errors or warnings  
- [ ] All 14 event entries in events.md parse successfully  
- [ ] No duplicate event IDs  
- [ ] All required fields present (id, title, date, image, status)  
- [ ] All image paths reference files in `public/images/events/`  
- [ ] All events have `status: "past"`  
- [ ] Events are in date descending order (March 2026 first, May 2025 last)  
- [ ] Dev server runs and displays 14 past events in gallery  

**If checkpoint passes**: Proceed to Window 4. Data is ready. Final integration and verification remains.

**If checkpoint fails**: Stay in Window 3, fix YAML, image paths, or ordering.

---

## Execution Window 4: Integration Verification & Performance Validation

**Purpose**: End-to-end testing across viewports, interactions (modal, keyboard, screen reader), performance measurement, and final build validation. Confirm all acceptance criteria are met.

**Token Budget**: 50–65k (testing, Lighthouse audit, console verification)

**Checkpoint Validation**:
- [ ] All 14 event tiles display correctly on desktop (4-column grid)
- [ ] All 14 event tiles display correctly on tablet (2-column)
- [ ] All 14 event tiles display correctly on mobile (1-column, no horizontal overflow)
- [ ] No broken image indicators or 404 errors in console
- [ ] Alt text visible in DOM and announced by screen reader
- [ ] Clicking tiles opens modal with correct data and image
- [ ] Modal dismissal works (Escape, backdrop click, close button)
- [ ] Lighthouse audit: page load under 3s, images < 2MB total
- [ ] All AC-001 through AC-008 passing
- [ ] Ready for merge

---

### T011 [P] Visual rendering test — Desktop, tablet, mobile viewports

**Window**: 4 (Integration)  
**Phase**: Manual Browser Testing  
**Traceability**: Spec AC-001, AC-002 "All 14 images display correctly at all breakpoints"  
**Dependencies**: T010 (build validated, dev server running)  
**Description**: Manually test the Get Involved page in browser at three viewport sizes. Verify all 14 event tiles render, no broken images, layout responsive.

**What to test**:

**Desktop (>1024px)**:
- Navigate to `/get-involved`
- Verify "Past Events" section shows all 14 tiles
- Confirm 4-column grid layout
- Check no broken image icons
- Verify tiles are evenly spaced and aligned

**Tablet (640-1024px)**:
- Resize browser to 800px width or use device emulation
- Verify 2-column grid layout
- All 14 tiles visible (may require scrolling)
- No horizontal overflow
- Images scale proportionally

**Mobile (<640px)**:
- Resize to ~375px width or use device emulation
- Verify single-column stack
- All 14 tiles visible and scrollable
- No horizontal overflow or cut-off images
- Touch targets large enough (tiles clickable)

**Test Result**: All 14 tiles render correctly on all three breakpoints. No broken image indicators.

---

### T012 [P] Modal interaction test — Click, escape, backdrop, data accuracy

**Window**: 4 (Integration)  
**Phase**: Manual Browser Testing  
**Traceability**: Spec AC-004 "User clicks event tile, modal opens with correct title, date, image, and can dismiss"  
**Dependencies**: T010 (events loaded)  
**Description**: Test modal interaction for all 14 events. Verify correct data displayed and dismissal methods work.

**What to test**:

**For 3 sample events (May 2025, March 2026, Skills Clinic)**:
1. Click event tile
   - Modal opens (no freeze/lag)
   - Modal displays title (matches events.md entry)
   - Modal displays date (matches events.md entry)
   - Modal displays full poster image (correct image file)
   - No broken image indicators

2. Dismiss via Escape key
   - Modal closes
   - Focus returns to tile or page
   - No console errors

3. Re-open same tile, dismiss via backdrop click (outside modal)
   - Modal closes
   - Page remains unharmed

4. Re-open same tile, dismiss via close button (if visible)
   - Modal closes
   - Focus management OK

**Additional check**:
- Verify upcoming events section shows "No upcoming events scheduled. Check back soon!" placeholder (since all 14 events are past)

**Test Result**: Modal works correctly for all tested events. All dismiss methods function. Upcoming placeholder visible.

---

### T013 [P] Alt text and accessibility test — DOM inspection, screen reader

**Window**: 4 (Integration)  
**Phase**: Manual Browser Testing  
**Traceability**: Spec AC-003, NFR-001 "Each image has descriptive alt text"  
**Dependencies**: T010 (alt field in events.md)  
**Description**: Verify alt text is present in DOM and announced by screen reader for each image.

**What to test**:

**DOM Inspection** (browser DevTools):
- Right-click on a few event tiles, select "Inspect Element"
- Verify `<img>` tag has `alt` attribute with descriptive text
- Examples:
  - `alt="Coming Up May 2025 poster with Fuel and Focus workshop, uniforms required, and winter season start dates."`
  - `alt="Winter skills clinic session 1 poster for junior players aged 5 to 17 at Red Energy Arena."`
- Confirm alt text is NOT generic like "event image" or "May 2025"

**Screen Reader Test** (if available):
- Use NVDA (Windows) or built-in screen reader
- Tab through event tiles or use screen reader navigation
- Verify alt text is announced for each image
- Confirm text matches the spec inventory alt text

**Fallback Verification**:
- Check if any event lacks custom `alt` field
- Verify fallback to `${title} - ${date}` is applied
- Ensure no event lacks alt text entirely

**Test Result**: All 14 images have descriptive alt text in DOM. Screen reader announces alt text correctly.

---

### T014 Performance and console validation — Lighthouse, network tab, errors

**Window**: 4 (Integration)  
**Phase**: Automated & Manual Testing  
**Traceability**: Spec AC-006 "All images optimised, total payload under 2MB"  
**Dependencies**: T010 (build complete), T007 (images optimised)  
**Description**: Run Lighthouse audit on `/get-involved`, measure image payload, check for 404 errors and console warnings.

**What to test**:

**Lighthouse Audit**:
```bash
# Using Chrome DevTools Lighthouse or CLI
# Or: npm run build && open public/get-involved/index.html in Chrome
# Run Lighthouse audit on /get-involved
# Check:
# - Largest Contentful Paint (LCP): target < 3 seconds
# - Cumulative Layout Shift (CLS): minimize
# - First Input Delay (FID): < 100ms
# - No images flagged as oversized
```

**Network Tab Verification**:
- Open DevTools > Network tab
- Reload `/get-involved`
- Filter for images (event posters)
- Verify:
  - All 14 images load (no 404s)
  - Total size of all images < 2MB
  - Each image < 200KB
  - No failed requests

**Console Check**:
- Open DevTools > Console
- Reload page
- Verify:
  - No 404 errors for image files
  - No YAML parse warnings
  - No missing alt attribute warnings (if linting is enabled)
  - No layout shift errors

**Test Result**: Lighthouse score acceptable. Total images < 2MB. Zero console errors/warnings related to images.

---

### T015 Final acceptance criteria validation

**Window**: 4 (Integration)  
**Phase**: QA Checklist  
**Traceability**: All AC-001 through AC-008  
**Dependencies**: T011, T012, T013, T014 (all tests completed)  
**Description**: Complete checklist of all acceptance criteria. Confirm feature is complete and ready for merge.

**What to verify**:

| AC | Description | Status | Notes |
|----|-------------|--------|-------|
| AC-001 | All 14 images display in Events Gallery | ✓ T011 |  |
| AC-002 | Responsive on desktop (4-col), tablet (2-col), mobile (1-col) | ✓ T011 |  |
| AC-003 | Screen reader announces descriptive alt text | ✓ T013 |  |
| AC-004 | Click tile → modal opens with correct data and image | ✓ T012 |  |
| AC-005 | events.md parses without warnings, no missing fields, no duplicate IDs | ✓ T010 |  |
| AC-006 | Total image payload < 2MB, individual images < 200KB | ✓ T014 |  |
| AC-007 | All 14 events have status: "past", sorted descending (March 2026 first, May 2025 last) | ✓ T009 |  |
| AC-008 | Upcoming Events section shows placeholder "No upcoming events scheduled..." | ✓ T012 |  |

**Sign-Off**:
- [ ] All AC passing
- [ ] All T011–T014 tests completed and documented
- [ ] No regressions in existing COA-30 functionality
- [ ] Code review complete (if required by team)
- [ ] Ready for merge to main

**Test Result**: All acceptance criteria validated. Feature complete.

---

[WINDOW_CHECKPOINT_4 — FEATURE COMPLETE]

**Final Validation**:

- [ ] All 4 code/data/asset tasks from Windows 1–3 passed checkpoints  
- [ ] All 5 integration tests (T011–T015) passing  
- [ ] All AC-001 through AC-008 validated  
- [ ] Lighthouse audit acceptable  
- [ ] No console errors or warnings  
- [ ] No regressions in COA-30 components  
- [ ] Code is clean, builds pass, ready for merge  

---

## Summary Table

| Window | Purpose | Tasks | Token Budget | Checkpoint Gate |
|--------|---------|-------|--------------|-----------------|
| 1 | Alt Text Support | T001–T004 | 50–65k | Code compiles, backwards compatible |
| 2 | Image Assets | T005–T007 | 40–55k | All 14 images in place, < 2MB total |
| 3 | Event Data | T008–T010 | 60–75k | Build passes, 14 events validated |
| 4 | Integration & QA | T011–T015 | 50–65k | All AC passing, Lighthouse green |
| **Total** | **Feature Complete** | **15 tasks** | **~200–260k** | **Ready for merge** |

---

## Execution Strategy

### For Implement Agent (Option C — Windows)

1. **Start Window 1**: `/clear`, read this file, execute T001–T004 sequentially
2. **Validate Checkpoint 1**: Verify build succeeds, backwards compatibility confirmed
3. **Start Window 2**: `/clear`, read this file, execute T005–T007 (asset handling)
4. **Validate Checkpoint 2**: Verify all 14 images < 200KB, total < 2MB
5. **Start Window 3**: `/clear`, read this file, execute T008–T010 (data replacement)
6. **Validate Checkpoint 3**: Build passes, events.md validated
7. **Start Window 4**: `/clear`, read this file, execute T011–T015 (integration testing)
8. **Validate Checkpoint 4**: All AC passing, feature complete, ready for merge

### Context Isolation

- Each window operates in a fresh ~200k token context
- STATE.md tracks checkpoint pass/fail between windows
- Previous window's conversation history is NOT available (only checkpoint status)
- All file paths are absolute (never relative paths between windows)
- If a window fails, only that window is redone

---

## Key Rules

1. **Checkpoints Gate Progression**: Do NOT proceed to next window until current checkpoint passes
2. **Test-First Within Each Window**: Verify assumptions before implementing (especially Windows 1 & 3)
3. **Image Filenames Are Case-Sensitive**: Must match spec inventory exactly (e.g., `PHOENIX_events_May25.png` ≠ `phoenix_events_may25.png`)
4. **No Component Changes Unless Bug**: FR-007 states not to modify COA-30 components. Alt text addition is justified by accessibility bug (hardcoded fallback doesn't meet WCAG).
5. **All Events Are "past"**: Since all 14 posters are May 2025–March 2026 and today is April 2026, status MUST be "past" for all.
6. **Traceability Maintained**: Every task traces back to spec requirement or acceptance criterion.

---

## Next Steps

1. **Review this tasks.md file**: Understand window sequencing, dependencies, and checkpoints
2. **Implement Phase**: Pass this file to implement agent with `--option-c` flag
   - Implement agent will manage windows, checkpoint validation, and STATE.md updates
3. **Monitor Checkpoints**: Review checkpoint results between windows
4. **Merge**: After Checkpoint 4 passes, feature is complete and ready for PR review
