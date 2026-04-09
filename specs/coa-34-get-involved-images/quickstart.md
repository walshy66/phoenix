# Quickstart: Verify COA-34 Get Involved Images

## Prerequisites
- Node.js installed
- All 14 images placed in `public/images/events/`
- `src/data/events.md` populated with real event entries

## Setup
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open `http://localhost:4321/get-involved`

## Verification Checklist

### Visual (Desktop >1024px)
- [ ] "No upcoming events scheduled. Check back soon!" message appears in Upcoming section
- [ ] Past Events section shows 14 tiles in a 4-column grid
- [ ] First tile is March 2026, last tile is May 2025 (descending date order)
- [ ] No broken image icons anywhere
- [ ] All poster images are visible and not distorted

### Visual (Mobile <640px)
- [ ] Resize browser to 375px width
- [ ] Tiles stack in single column
- [ ] No horizontal overflow or scrollbar
- [ ] Images maintain aspect ratio

### Interactions
- [ ] Click any event tile -- modal opens with correct title, date, and full image
- [ ] Press Escape -- modal closes
- [ ] Click backdrop -- modal closes
- [ ] Tab through tiles -- focus indicators visible

### Accessibility
- [ ] Right-click an image, Inspect Element -- alt text is descriptive (not just title + date)
- [ ] Example: May 2025 tile should have alt containing "Fuel and Focus workshop"

### Performance
- [ ] Open DevTools Network tab, reload page
- [ ] Check total image transfer size is under 2MB
- [ ] Check no individual image exceeds 200KB
- [ ] Run Lighthouse on the page -- LCP under 3 seconds

### Build
- [ ] Run `npm run build` -- zero warnings about events
- [ ] Check build output for 14 event entries parsed

### Console
- [ ] Open DevTools Console, reload page
- [ ] Zero 404 errors for image files
- [ ] Zero console errors related to events

## Troubleshooting

**Broken images**: Check that filenames in events.md EXACTLY match files in `public/images/events/` (case-sensitive). Common issue: `Phoenix_events_Feb26.png` vs `PHOENIX_events_Feb26.png`.

**Events not showing**: Ensure all required fields are present in each events.md entry: id, title, date, image, status. Missing any one will cause the parser to skip the entry silently.

**Wrong sort order**: The filter functions sort by date, not by position in events.md. Verify dates are in YYYY-MM-DD format.

**Images too large**: Re-run optimisation. Target: `pngquant --quality=65-85 --strip input.png -o output.png`
