# Window 2: Image Sourcing & Optimization Guide

## Status
- Window 1: COMPLETE ✓
- Window 2: IN_PROGRESS (Image sourcing blocker)
- Blocker: Images must be downloaded from Linear before optimization can proceed

## Task Overview
- **T005**: Source and download all 14 event images from Linear COA-34 issue
- **T006**: Optimize images to meet budget (200KB each, 2MB total)
- **T007**: Place optimized images in `public/images/events/` with correct filenames

## T005: Download Images from Linear COA-34

### Image Inventory (14 files, case-sensitive filenames)

| # | Filename | Month | Alt Text |
|---|----------|-------|----------|
| 1 | PHOENIX_events_May25.png | May 2025 | Coming Up May 2025 poster with Fuel and Focus workshop, uniforms required, and winter season start dates. |
| 2 | PHOENIX_events_June25.png | June 2025 | Coming Up June 2025 poster with Good Sports Week and daytime ladies basketball events. |
| 3 | PHOENIX_events_July25.png | July 2025 | Coming Up July 2025 poster with player journal check-in, school holidays, winter skills clinic, and BBA games back on. |
| 4 | PHOENIX_events_August25.png | August 2025 | Coming Up August 2025 poster with summer season registrations, Braves tryouts, uniform update, and finals timing. |
| 5 | PHOENIX_events_September25.png | September 2025 | Coming Up September 2025 poster with registrations closed, grading day, finals rounds, and team announcements. |
| 6 | PHOENIX_events_October25.png | October 2025 | Coming Up October 2025 poster with club training, grading game round 1, team name rules, club coach course, and player journal goals. |
| 7 | PHOENIX_events_December25.png | December 2025 | Coming Up December 2025 poster with last club training, last BBA games, Phoenix vs Bullets, and Christmas Day messaging. |
| 8 | PHOENIX_events_January26.png | January 2026 | Coming Up January 2026 poster with Melbourne United in Bendigo and BBA games start dates. |
| 9 | Phoenix_events_Feb26.png | February 2026 | Coming Up February 2026 poster with club Sunday training, Bendigo Spirit final, club training survey, Good Sports votes, and winter registration opening soon. |
| 10 | PHOENIX_events_march26.png | March 2026 | Coming Up March 2026 poster with club Sunday training, finals started, player journal entries and winners, and welcome to club day. |
| 11 | PHOENIX_SkillsClinic_2025Winter_1.png | July 2025 | Winter skills clinic session 1 poster for junior players aged 5 to 17 at Red Energy Arena. |
| 12 | PHOENIX_SkillsClinic_2025Winter_2.png | July 2025 | Winter skills clinic session 2 poster for junior players aged 5 to 17 at Red Energy Arena. |
| 13 | PHOENIX_Social_NEWTrainingSession.jpg | May 2025 | New session training graphic for Wednesday 7pm open court with all players welcome and no coaches. |
| 14 | FuelAndFocus.png | May 2025 | Fuel and Focus program poster for men aged 16 plus with date, time, location, and registration call to action. |

### How to Download Images

**From Linear COA-34 Issue**:

1. Open Linear: https://linear.app/coachcw/issue/COA-34
2. Scroll to the bottom - you'll see 14 images embedded in the issue description
3. For each image:
   - **Right-click** on the image
   - **Select "Copy image link"** or **"Save image as..."**
   - If saving: Save to a temporary folder (e.g., `C:\temp\images` or `/tmp/images`)
   - **IMPORTANT**: Rename the file to match the filename from the inventory above (case-sensitive!)

**Alternative: Bulk Download via Linear's Download Function**:

If Linear provides a way to download all attachments at once, use that method. Otherwise, manual download via right-click is the standard approach.

### Verification Checklist for T005

Before proceeding to T006, verify:

- [ ] All 14 images downloaded
- [ ] Filenames match inventory exactly (case-sensitive):
  - `Phoenix_events_Feb26.png` NOT `phoenix_events_feb26.png`
  - `PHOENIX_events_march26.png` NOT `PHOENIX_events_March26.png`
- [ ] No duplicate filenames
- [ ] All images are valid (can open in image viewer)
- [ ] All images placed in a temporary staging folder (e.g., `C:\temp/images-staging/`)

**Once verified, proceed to T006**.

---

## T006: Optimize Images to Meet Budget

### Budget Constraints
- **Individual image limit**: 200KB each
- **Total payload limit**: 2MB for all 14 images
- **Average per image**: ~143KB (2MB ÷ 14)

### Optimization Tools

#### Option 1: Online Tools (Easiest)
- **TinyPNG** (https://tinypng.com)
  - Upload PNG files
  - Downloads compressed version automatically
  - Usually reduces 500KB → 80-150KB
  - Free tier: 20 images/month
  
- **ImageOptim** (macOS) or equivalent Windows tool

#### Option 2: Command-line Tools (Recommended)
Install on Windows via Chocolatey or direct download:

**For PNG files**:
```bash
# Install pngquant (via Chocolatey)
choco install pngquant

# Run on each PNG file
pngquant --quality=65-80 --strip input.png -o output.png

# Alternative: optipng (if available)
optipng -o3 input.png
```

**For JPEG file** (PHOENIX_Social_NEWTrainingSession.jpg):
```bash
# Install jpegoptim (via Chocolatey)
choco install jpegoptim

# Run on JPEG
jpegoptim --max=85 input.jpg -o output.jpg
```

#### Option 3: ImageMagick (convert command)
```bash
# Install ImageMagick
choco install imagemagick

# Convert PNG with quality reduction
magick convert input.png -quality 75 -colors 256 output.png

# Optimize JPEG
magick convert input.jpg -quality 85 output.jpg
```

### Optimization Process

1. **Batch process all PNG files**:
   ```bash
   # For each PNG in staging folder
   pngquant --quality=70-80 --strip filename.png -o filename_optimized.png
   ```

2. **Process the JPEG**:
   ```bash
   # PHOENIX_Social_NEWTrainingSession.jpg
   jpegoptim --max=85 PHOENIX_Social_NEWTrainingSession.jpg -o PHOENIX_Social_NEWTrainingSession_optimized.jpg
   ```

3. **Check file sizes**:
   ```bash
   # List all files with size
   ls -lh staging-folder/
   
   # Check if any exceed 200KB
   find . -name "*.png" -o -name "*.jpg" | while read f; do
     size=$(wc -c < "$f")
     if [ $size -gt 204800 ]; then
       echo "TOO LARGE: $f ($size bytes)"
     fi
   done
   
   # Total folder size
   du -sh staging-folder/
   ```

4. **If image still exceeds 200KB**:
   - Re-run with lower quality: `pngquant --quality=60-70`
   - For PNG: consider converting to WebP (but verify text readability)
   - For JPEG: reduce quality to 75-80%

### Verification Checklist for T006

Before proceeding to T007, verify:

- [ ] All 14 images optimized
- [ ] Each image < 200KB
- [ ] Total directory size < 2MB
- [ ] Filenames still match inventory (case-sensitive, unchanged)
- [ ] All images open correctly in image viewer (not corrupted)
- [ ] Text on posters remains readable (spot-check a few)

**Once verified, proceed to T007**.

---

## T007: Place Optimized Images in `public/images/events/`

### Directory Preparation

```bash
# Create directory if not already present
mkdir -p public/images/events/

# Clean out any old documentation files
rm -f public/images/events/*.md

# List current contents
ls -la public/images/events/
# Should show empty (or only .gitkeep if present)
```

### Copy Images

```bash
# Option 1: Copy all optimized images at once
cp /path/to/staging-folder/*.png public/images/events/
cp /path/to/staging-folder/*.jpg public/images/events/

# Option 2: Copy individually with verification
for file in PHOENIX_events_May25.png PHOENIX_events_June25.png ... FuelAndFocus.png; do
  cp "/path/to/staging/$file" "public/images/events/$file"
  echo "Copied: $file"
done

# Verify all files present
ls -la public/images/events/ | grep -E '\.(png|jpg)$'
```

### Verify Filenames Match Exactly

```bash
# Check that all 14 images are present
ls public/images/events/ | wc -l  # Should show 14

# Verify each filename matches inventory
ls public/images/events/ | sort | diff - <(cat << 'EOF'
FuelAndFocus.png
Phoenix_events_Feb26.png
PHOENIX_events_August25.png
PHOENIX_events_December25.png
PHOENIX_events_January26.png
PHOENIX_events_July25.png
PHOENIX_events_June25.png
PHOENIX_events_May25.png
PHOENIX_events_march26.png
PHOENIX_events_October25.png
PHOENIX_events_September25.png
PHOENIX_SkillsClinic_2025Winter_1.png
PHOENIX_SkillsClinic_2025Winter_2.png
PHOENIX_Social_NEWTrainingSession.jpg
EOF
)
# Should show no differences
```

### Verify File Sizes

```bash
# List all files with size
ls -lh public/images/events/

# Total size
du -sh public/images/events/
# Should show < 2MB

# Check individual files
for f in public/images/events/*; do
  size=$(wc -c < "$f")
  sizekb=$((size / 1024))
  if [ $size -gt 204800 ]; then
    echo "TOO LARGE: $(basename $f) (${sizekb}KB)"
  else
    echo "OK: $(basename $f) (${sizekb}KB)"
  fi
done
```

### Verification Checklist for T007

Before proceeding to checkpoint validation, verify:

- [ ] Directory `public/images/events/` exists
- [ ] All 14 image files present (can list them)
- [ ] Each file < 200KB
- [ ] Total directory size < 2MB
- [ ] All filenames match inventory exactly (case-sensitive)
- [ ] No stray files (only the 14 images, no .md files)

---

## Window 2 Checkpoint Validation

Once all three tasks (T005, T006, T007) are complete, run this validation:

### Build Test
```bash
npm run build
# Should complete without errors
# Check console for any warnings about missing images
```

### Manual Verification
```bash
# Verify all files still present
ls -la public/images/events/ | wc -l  # Should be 14

# Verify directory size
du -sh public/images/events/
# Should be under 2MB

# Verify individual file sizes
ls -lh public/images/events/
# All should show < 200KB
```

### Dev Server Check
```bash
npm run dev
# Open http://localhost:4321/get-involved
# Should see events gallery (currently empty in data, but images in place)
# No broken image icons or 404 errors in console
```

---

## Checkpoint Gates

**CHECKPOINT 2 VALIDATION**:

Before proceeding to Window 3 (Event Data), confirm:

- [ ] All 14 images downloaded from Linear (T005)
- [ ] All 14 images optimized to budget (T006)
- [ ] All 14 images placed in `public/images/events/` (T007)
- [ ] Each file < 200KB
- [ ] Total payload < 2MB
- [ ] Filenames match inventory exactly (case-sensitive)
- [ ] Build runs without errors
- [ ] No console warnings about missing images

**If all items are checked**, Window 2 is complete and ready to proceed to Window 3 (Event Data Replacement).

**If any item is unchecked**, return to the relevant task (T005, T006, or T007) and fix before validating checkpoint.

---

## Troubleshooting

### "Image file is too large (X KB > 200KB)"
- Re-run optimization with lower quality setting
- For PNG: `pngquant --quality=60-70 --strip input.png -o output.png`
- For JPEG: `jpegoptim --max=80 input.jpg` (or lower quality)
- If text becomes illegible, try WebP conversion as last resort

### "Filename doesn't match (case sensitivity)"
- Windows file system is case-insensitive for storage, but case-sensitive for git
- Ensure filenames match inventory exactly when copying
- Example: `Phoenix_events_Feb26.png` (capital P) NOT `phoenix_events_feb26.png`

### "Build fails with 'Cannot find module' or YAML errors"
- Likely Window 3 issue (events.md data), not Window 2
- Window 2 only places static image files
- If build fails due to missing images, check `public/images/events/` directory exists and has files

### "Images look pixelated or distorted"
- Text may be illegible after aggressive compression
- Try lower quality reduction (e.g., 75-80% instead of 60-70%)
- Verify images open correctly in image viewer before committing

---

## Next Steps

1. Download all 14 images from Linear COA-34 (T005)
2. Optimize images to meet budget (T006)
3. Place in `public/images/events/` with correct filenames (T007)
4. Validate Window 2 checkpoint
5. Commit work: `git add . && git commit -m "feat(coa-34): Window 2 complete - event images sourced and optimized"`
6. `/clear` context and proceed to Window 3 (Event Data Replacement)
