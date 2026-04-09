# Window 2 Summary: Image Asset Sourcing & Optimization

## Current Status
- **Window 1**: COMPLETE ✓ (Alt Text Infrastructure)
- **Window 2**: READY FOR EXECUTION (Blocked on manual image download)
- **Blocker Type**: Expected - requires manual download from Linear

## What's Done (Automated)

### Infrastructure Prepared
- [x] Alt text support added to Event type, EventTile, EventModal, and parser
- [x] Build validation shows Window 1 changes are backwards compatible
- [x] Directory `public/images/events/` ready for images
- [x] Complete optimization and verification guide created

### Documentation Created
- [x] Complete image inventory (14 files, exact filenames, alt text)
- [x] Detailed download instructions for Linear images
- [x] Optimization commands (pngquant, optipng, online tools)
- [x] File size budget verification checklist
- [x] Checkpoint validation criteria

## What YOU Need to Do (Manual)

### Step 1: Download 14 Images from Linear (5-10 minutes)
**Location**: Linear issue COA-34
**URL**: https://linear.app/coachcw/issue/COA-34

1. Open the issue in browser
2. Scroll to the bottom
3. Find the 14 embedded images (event posters)
4. Right-click each image → "Save image as..."
5. Save to temporary folder (e.g., `C:\temp\images-staging\`)

**CRITICAL**: Names must match spec (case-sensitive):
```
PHOENIX_events_May25.png          ← Capital P and X
PHOENIX_events_June25.png
PHOENIX_events_July25.png
PHOENIX_events_August25.png
PHOENIX_events_September25.png
PHOENIX_events_October25.png
PHOENIX_events_December25.png
PHOENIX_events_January26.png
Phoenix_events_Feb26.png           ← Capital P, lowercase 'hoenix'
PHOENIX_events_march26.png         ← Lowercase 'm'
PHOENIX_SkillsClinic_2025Winter_1.png
PHOENIX_SkillsClinic_2025Winter_2.png
PHOENIX_Social_NEWTrainingSession.jpg
FuelAndFocus.png
```

### Step 2: Optimize Images (10-15 minutes)
Once downloaded, optimize to meet budget:

**Requirements**:
- Each image < 200KB
- Total < 2MB (average 143KB per image)
- Text on posters remains readable

**Easy option**: Use https://tinypng.com
- Upload all 14 files
- Download compressed versions
- Check sizes

**Command-line option** (if tools installed):
```bash
# For PNG files
pngquant --quality=70-80 --strip input.png -o output.png

# For JPEG
jpegoptim --max=85 input.jpg -o output.jpg
```

### Step 3: Place Images in Directory (2-3 minutes)
```bash
# Copy optimized images
cp /path/to/optimized-images/* public/images/events/

# Verify
ls -la public/images/events/
du -sh public/images/events/  # Should show < 2MB
```

## Quick Validation Checklist

**Before proceeding to Window 3**, verify:

- [ ] All 14 images downloaded
- [ ] Filenames match spec exactly (case-sensitive)
- [ ] All images optimized
- [ ] Each image < 200KB
- [ ] Total directory < 2MB
- [ ] `npm run build` succeeds without errors
- [ ] No broken image icons or 404s in console

## Detailed Guidance

For step-by-step instructions with troubleshooting, see:
```
.planning/coa-34-get-involved-images/WINDOW_2_IMAGE_SOURCING_GUIDE.md
```

This document contains:
- Complete image inventory table
- Detailed download instructions
- Optimization tool options and commands
- Verification commands
- Troubleshooting guide

## After Window 2 is Complete

Once all images are optimized and placed:

1. Commit the changes:
   ```bash
   git add public/images/events/
   git commit -m "feat(coa-34): Window 2 complete - event images sourced and optimized"
   ```

2. Continue with Window 3 (Event Data):
   - Populate `src/data/events.md` with 14 real event entries
   - Each entry includes id, title, date, image path, alt text, and status

3. Then Window 4 (Integration Testing):
   - Visual rendering tests
   - Modal interaction
   - Accessibility verification
   - Performance validation

## Timeline

- **Window 1**: Complete ✓
- **Window 2**: Ready (manual step: ~30 minutes total)
- **Window 3**: Can start after T007 (image placement)
- **Window 4**: Final validation and merge

## Files Modified/Created

### This Session (Automated)
- `src/lib/events/types.ts` — Added `alt?: string` field
- `src/components/EventTile.astro` — Added alt prop handling
- `src/components/EventModal.astro` — Added alt text support
- `src/pages/get-involved.astro` — Parser passes alt field
- `.planning/coa-34-get-involved-images/STATE.md` — Updated progress
- `.planning/coa-34-get-involved-images/WINDOW_2_IMAGE_SOURCING_GUIDE.md` — New (complete guide)

### This Session (Awaiting Images)
- `public/images/events/` — 14 images (T007, manual)

### Next Session (Window 3)
- `src/data/events.md` — 14 real event entries

## Next Action

1. **Download** the 14 images from Linear (5-10 min)
2. **Optimize** them to meet budget (10-15 min)
3. **Place** them in `public/images/events/` (2-3 min)
4. **Commit** changes
5. **Notify** when ready for Window 3

See WINDOW_2_IMAGE_SOURCING_GUIDE.md for detailed commands and troubleshooting.
