# Task Ledger: COA-34 — Get Involved Page Images & Real Data

**Feature**: COA-34 - Get Involved Page: Images and Real Data
**Tracking**: Automated task management across 4 execution windows
**Last Updated**: 2026-04-09

---

## Window 1: Alt Text Support Infrastructure ✓ COMPLETE

### T001: Add `alt` field to Event interface
- **Status**: DONE
- **File**: `src/lib/events/types.ts`
- **Changes**: Added optional `alt?: string` field to Event interface
- **Evidence**: Field added at line ~40 in types.ts, compiles without error
- **Date Completed**: 2026-04-09

### T002: Update EventTile.astro to use `alt` prop
- **Status**: DONE
- **File**: `src/components/EventTile.astro`
- **Changes**: Added `alt` prop, uses with fallback `alt || \`${title} - ${date}\``
- **Evidence**: img tag updated to accept alt prop, backwards compatible
- **Date Completed**: 2026-04-09

### T003: Update get-involved.astro parser to pass `alt`
- **Status**: DONE
- **File**: `src/pages/get-involved.astro`
- **Changes**: Parser extracts `alt` from frontmatter, passes to EventTile
- **Evidence**: Alt field passed in both EventTile invocations (placeholders and real events)
- **Date Completed**: 2026-04-09

### T004: Update EventModal to use alt text
- **Status**: DONE
- **File**: `src/components/EventModal.astro`
- **Changes**: Modal uses custom alt with fallback
- **Evidence**: alt applied in modal image display (line ~71)
- **Date Completed**: 2026-04-09

### Window 1 Checkpoint ✓
- [x] Build runs without errors or warnings
- [x] All 4 code tasks completed and reviewed
- [x] Existing placeholder events render correctly (backwards compatible)
- [x] Alt field is optional and parsed correctly
- [x] Alt text applied to EventTile img tags
- [x] Modal supports alt text

**Result**: PASS — Ready for Window 2

---

## Window 2: Image Asset Sourcing & Optimization (IN_PROGRESS)

### T005: Source and download all 14 event images
- **Status**: AWAITING MANUAL ACTION
- **Blocker**: Cannot download from Linear programmatically (sandbox constraints)
- **Action Required**: Manual download from Linear COA-34 issue
- **Instructions**: See WINDOW_2_IMAGE_SOURCING_GUIDE.md (T005 section)
- **Images to Download**: 14 files (case-sensitive filenames)
  - PHOENIX_events_May25.png
  - PHOENIX_events_June25.png
  - PHOENIX_events_July25.png
  - PHOENIX_events_August25.png
  - PHOENIX_events_September25.png
  - PHOENIX_events_October25.png
  - PHOENIX_events_December25.png
  - PHOENIX_events_January26.png
  - Phoenix_events_Feb26.png
  - PHOENIX_events_march26.png
  - PHOENIX_SkillsClinic_2025Winter_1.png
  - PHOENIX_SkillsClinic_2025Winter_2.png
  - PHOENIX_Social_NEWTrainingSession.jpg
  - FuelAndFocus.png
- **Estimated Time**: 5-10 minutes
- **Verification**: All 14 files downloaded, filenames match spec (case-sensitive)

### T006: Optimize images to meet budget
- **Status**: BLOCKED (waiting on T005)
- **Dependencies**: T005 (images must be downloaded first)
- **Requirements**:
  - Individual image < 200KB
  - Total payload < 2MB
  - Text on posters remains readable
- **Tools**: pngquant, optipng, TinyPNG, or ImageMagick
- **Instructions**: See WINDOW_2_IMAGE_SOURCING_GUIDE.md (T006 section)
- **Estimated Time**: 10-15 minutes

### T007: Place optimized images in directory
- **Status**: BLOCKED (waiting on T006)
- **Dependencies**: T006 (images must be optimized first)
- **File Location**: `public/images/events/`
- **Requirements**:
  - All 14 files present with exact filenames
  - Each file < 200KB
  - Total directory < 2MB
  - Remove any .md documentation files
- **Instructions**: See WINDOW_2_IMAGE_SOURCING_GUIDE.md (T007 section)
- **Estimated Time**: 2-3 minutes

### Window 2 Checkpoint (PENDING)
- [ ] All 14 images downloaded (T005)
- [ ] All images optimized (T006)
- [ ] All images placed in `public/images/events/` (T007)
- [ ] Each file < 200KB
- [ ] Total payload < 2MB
- [ ] Filenames match inventory exactly
- [ ] Build succeeds with no errors
- [ ] No console warnings about missing images

**Awaiting**: Manual download of images from Linear

---

## Window 3: Event Data Replacement (PENDING)

### T008: Remove placeholder events and setup template
- **Status**: PENDING
- **Blocker**: Waiting on Window 2 checkpoint pass
- **File**: `src/data/events.md`
- **Task**: Delete placeholder entries, prepare YAML template
- **Estimated Time**: 5 minutes

### T009: Populate events.md with 14 real entries
- **Status**: PENDING
- **Blocker**: Waiting on T008
- **File**: `src/data/events.md`
- **Entries**: 14 event entries from spec inventory
- **Fields**: id, title, date, image (path to public/images/events/), alt, status
- **All Status**: "past" (dates are May 2025 - March 2026)
- **Estimated Time**: 20-30 minutes

### T010: Validate events.md build and verify image paths
- **Status**: PENDING
- **Blocker**: Waiting on T009
- **Task**: Run build, verify no YAML errors, check image paths exist
- **Estimated Time**: 5 minutes

### Window 3 Checkpoint (PENDING)
- [ ] Build runs without errors or warnings
- [ ] All 14 event entries parse successfully
- [ ] No duplicate IDs
- [ ] All required fields present
- [ ] Image paths match files in public/images/events/
- [ ] All events have status: "past"
- [ ] Events sorted descending by date (March 2026 first)

---

## Window 4: Integration Verification & Performance (PENDING)

### T011: Visual rendering test (Desktop, tablet, mobile)
- **Status**: PENDING
- **File**: N/A (manual browser testing)
- **Test**: All 14 tiles display correctly at 3 breakpoints
- **Estimated Time**: 10 minutes

### T012: Modal interaction test (Click, escape, backdrop)
- **Status**: PENDING
- **File**: N/A (manual browser testing)
- **Test**: Modal opens/closes correctly, displays right data
- **Estimated Time**: 10 minutes

### T013: Alt text and accessibility test
- **Status**: PENDING
- **File**: N/A (manual browser testing)
- **Test**: DOM inspection, screen reader verification
- **Estimated Time**: 10 minutes

### T014: Performance and console validation
- **Status**: PENDING
- **File**: N/A (Lighthouse audit, console check)
- **Test**: Images load under 3s, total < 2MB, zero 404s
- **Estimated Time**: 10 minutes

### T015: Final acceptance criteria validation
- **Status**: PENDING
- **File**: N/A (checklist)
- **Test**: All AC-001 through AC-008 passing
- **Estimated Time**: 5 minutes

### Window 4 Checkpoint (PENDING)
- [ ] All 14 tiles render correctly (desktop/tablet/mobile)
- [ ] Modal works correctly
- [ ] Alt text verified in DOM and screen reader
- [ ] Performance acceptable (< 3s load, < 2MB total)
- [ ] All AC-001 through AC-008 passing
- [ ] Ready for merge

---

## Summary

| Window | Tasks | Status | Blocker |
|--------|-------|--------|---------|
| 1 | T001-T004 | ✓ COMPLETE | None |
| 2 | T005-T007 | IN_PROGRESS | Manual image download from Linear |
| 3 | T008-T010 | PENDING | Window 2 checkpoint |
| 4 | T011-T015 | PENDING | Window 3 checkpoint |

**Total Tasks**: 15
**Completed**: 4 (T001-T004)
**In Progress**: 3 (T005-T007, blocked on manual action)
**Pending**: 8 (T008-T015)

---

## Next Steps

1. **Download images** from Linear COA-34 (T005) — Manual, 5-10 min
2. **Optimize images** to < 200KB each (T006) — 10-15 min
3. **Place in directory** (T007) — 2-3 min
4. **Commit** changes
5. **Validate** Window 2 checkpoint
6. Continue with Windows 3 and 4

**See also**: 
- STATE.md (current status)
- WINDOW_2_IMAGE_SOURCING_GUIDE.md (detailed instructions)
- WINDOW_2_SUMMARY.md (overview)
