# Quickstart: Manual Testing Guide

**Feature**: COA-22 Hero Section Circular Card Carousel | **Created**: 2026-04-10

---

## Overview

This guide walks through manual testing of the circular card carousel after implementation. Use this to validate the carousel works correctly and meets acceptance criteria.

---

## Setup

### Prerequisites
- Node 20+ installed
- Astro project running locally (`npm run dev`)
- Browser DevTools available (Chrome, Firefox, Safari, or Edge)
- Optional: Mobile device or browser device emulation

### Start the Dev Server
```bash
cd /c/Users/camer/Documents/phoenix
npm run dev
# Visit http://localhost:3000 (or configured port)
```

### Verify Carousel Renders
1. Navigate to the homepage (where hero carousel is displayed)
2. Confirm first infographic is visible and centered
3. Confirm next/prev buttons are present (left and right sides)
4. No console errors; carousel fully interactive

---

## Test Plan

### Phase 1: Core Carousel Interaction

#### Test 1.1: Carousel Initial State
- [ ] Page loads with first infographic visible
- [ ] Infographic is centered and prominent (40-50% viewport width on desktop)
- [ ] Next/prev buttons are visible
- [ ] No animation is running (static initial state)
- **Expected**: First slide displayed, buttons ready for interaction

#### Test 1.2: Click Next Button
- [ ] Click next button
- [ ] Current infographic rotates out to the right and fades
- [ ] Next infographic rotates in from the left and fades in
- [ ] Animation feels smooth and natural (no jank or flicker)
- [ ] Animation takes 600–800ms total
- [ ] After animation, carousel is ready for next interaction
- **Expected**: Smooth Y-axis rotation with synchronized fade

#### Test 1.3: Click Previous Button
- [ ] From current slide, click prev button
- [ ] Current infographic rotates out to the left and fades
- [ ] Previous infographic rotates in from the right and fades in
- [ ] Direction is opposite to next (left vs. right)
- **Expected**: Smooth rotation, opposite direction to next

#### Test 1.4: Looping (Last → First)
- [ ] Rapidly click next until reaching last infographic
- [ ] Click next one more time
- [ ] Carousel loops back to first infographic with same rotation effect
- [ ] No jump, flash, or visual glitch
- **Expected**: Seamless loop to first slide

#### Test 1.5: Looping (First → Last)
- [ ] Start at first infographic
- [ ] Click prev button
- [ ] Carousel rotates to last infographic (previous from first)
- [ ] No jump or visual glitch
- **Expected**: Seamless rotation to last slide

#### Test 1.6: All Slides Display Correctly
- [ ] Cycle through all slides using next/prev
- [ ] Confirm each slide displays in expected order
- [ ] No slides skipped or duplicated
- [ ] Images are visible and readable
- **Expected**: All slides cycle correctly

---

### Phase 2: Touch & Mobile Interaction

#### Test 2.1: Swipe Left (Mobile)
- [ ] On mobile device or emulated (320–768px width), swipe left on the infographic (at least 45px distance)
- [ ] Carousel rotates to next slide
- [ ] Animation plays with same smooth effect as button click
- **Expected**: Left swipe triggers next slide

#### Test 2.2: Swipe Right (Mobile)
- [ ] On mobile, swipe right on the infographic (at least 45px distance)
- [ ] Carousel rotates to previous slide
- [ ] Animation plays smoothly
- **Expected**: Right swipe triggers previous slide

#### Test 2.3: Swipe Threshold (No Accidental Trigger)
- [ ] On mobile, make a small horizontal drag (< 45px) on the infographic
- [ ] Release
- [ ] Carousel does NOT rotate
- [ ] No animation triggered
- **Expected**: Small swipes don't trigger rotation

#### Test 2.4: Mobile Button Tap
- [ ] On mobile (< 768px), confirm next/prev buttons have adequate tap targets (44px+ recommended)
- [ ] Tap buttons multiple times; carousel rotates correctly
- [ ] Buttons remain accessible during animation
- **Expected**: Touch targets are appropriately sized

---

### Phase 3: Keyboard Navigation & Focus

#### Test 3.1: Tab to Buttons
- [ ] Press Tab key repeatedly to navigate the page
- [ ] Tab into the carousel region
- [ ] Confirm you can focus on next button (visible focus indicator)
- [ ] Confirm you can focus on prev button (visible focus indicator)
- [ ] Focus indicator is at least 2px outline and meets contrast (4.5:1 minimum)
- **Expected**: Buttons are keyboard focusable with visible indicators

#### Test 3.2: Enter/Space Key
- [ ] Focus on next button (Tab until focused)
- [ ] Press Enter key
- [ ] Carousel rotates to next slide
- [ ] Press Space key
- [ ] Carousel rotates to next slide again
- **Expected**: Enter and Space both trigger rotation

#### Test 3.3: Arrow Keys
- [ ] Focus on carousel region (or buttons)
- [ ] Press ArrowRight key
- [ ] Carousel rotates to next slide
- [ ] Press ArrowLeft key
- [ ] Carousel rotates to previous slide
- **Expected**: Arrow keys navigate carousel (if implemented)

#### Test 3.4: Focus During Animation
- [ ] Start carousel animation by clicking next
- [ ] During animation, press Tab to focus next/prev button
- [ ] Focus indicator remains visible (doesn't disappear)
- [ ] After animation completes, buttons are interactive again
- **Expected**: Focus doesn't disappear; buttons are still accessible

#### Test 3.5: Focus Persistence
- [ ] Focus on next button
- [ ] Click it (carousel rotates)
- [ ] After animation completes, focus remains on or near the same button
- [ ] Can press Enter to trigger next animation without re-tabbing
- **Expected**: Focus is retained and usable for rapid navigation

---

### Phase 4: Animation Timing & Queueing

#### Test 4.1: Rapid Clicks (5x)
- [ ] Click next button rapidly 5 times in quick succession
- [ ] Carousel smoothly cycles through 5 slides
- [ ] Each animation plays in sequence (no simultaneous animations)
- [ ] No dropped clicks
- [ ] All 5 clicks are processed in order
- **Expected**: Queue handles rapid clicks; all animations play sequentially

#### Test 4.2: Click During Animation
- [ ] Click next button to start carousel animation
- [ ] While animation is running, click next button again
- [ ] Second click is queued (button appears disabled or interaction is ignored)
- [ ] After first animation completes, second animation plays
- [ ] No simultaneous animations (no 3D rendering glitches)
- **Expected**: Second click queues and executes after first animation

#### Test 4.3: Mixed Rapid Clicks
- [ ] Click next, next, prev, next in rapid succession during animations
- [ ] All clicks execute in order (queue is FIFO)
- [ ] Carousel displays correct slide after all animations complete
- **Expected**: Mixed click directions are queued correctly

#### Test 4.4: Button Disabled State During Animation
- [ ] Click next button
- [ ] Observe button state during animation (should be disabled or visually disabled)
- [ ] Try clicking again; nothing happens (animation is queued)
- [ ] After animation completes, button is enabled again
- **Expected**: Buttons are disabled during animation to prevent accidental clicks

#### Test 4.5: Animation Duration Consistent
- [ ] Open DevTools Performance tab
- [ ] Click next button and observe animation
- [ ] Check timeline; animation duration is 600–800ms (spec says 350ms exit + 350ms enter)
- [ ] Repeat several times; timing is consistent
- **Expected**: Animation timing is consistent and within spec range

---

### Phase 5: Responsive Design & Scaling

#### Test 5.1: Mobile (320px) Layout
- [ ] Resize browser to 320px width (or use device emulation)
- [ ] Carousel infographic occupies ~90vw max-width with padding
- [ ] Infographic is readable and prominent
- [ ] Aspect ratio maintained (portrait 3:4)
- [ ] Next/prev buttons are visible and accessible
- **Expected**: Carousel scales to mobile size; content readable

#### Test 5.2: Mobile (375px) Layout
- [ ] Resize to 375px width
- [ ] Infographic is slightly larger; still fits screen
- [ ] All content remains visible without excessive scrolling
- **Expected**: Mobile scaling works at common mobile widths

#### Test 5.3: Tablet (768px) Layout
- [ ] Resize to 768px width
- [ ] Infographic occupies ~80vw or ~400px fixed
- [ ] Centered with white space on sides
- [ ] Responsive appearance (larger than mobile, smaller than desktop)
- **Expected**: Tablet layout is balanced and centered

#### Test 5.4: Tablet (1023px) Layout
- [ ] Resize to 1023px width
- [ ] Infographic still uses tablet sizing (not yet desktop)
- [ ] Responsive transition feels smooth
- **Expected**: Breakpoint transition at 1024px is respected

#### Test 5.5: Desktop (1024px+) Layout
- [ ] Resize to 1024px width
- [ ] Infographic occupies ~450px fixed width
- [ ] Centered horizontally on the page
- [ ] Accounts for ~40-50% of hero container width
- [ ] Professional, spacious appearance
- **Expected**: Desktop layout is fixed and centered

#### Test 5.6: Ultra-Wide (1920px+) Layout
- [ ] Resize to 1920px or larger
- [ ] Infographic remains ~450px fixed (does NOT scale beyond desktop)
- [ ] Doesn't look stretched or oversized
- [ ] Maintains visual balance
- **Expected**: Infographic doesn't scale beyond 450px

#### Test 5.7: Device Rotation
- [ ] On mobile device, rotate from portrait to landscape
- [ ] Carousel re-renders with landscape-appropriate sizing
- [ ] Animations continue smoothly during and after rotation
- [ ] No layout glitches or animation stutter
- [ ] Rotate back to portrait; sizing adjusts again
- **Expected**: Device rotation is handled smoothly

---

### Phase 6: Logo Decal & Visual Elements

#### Test 6.1: Logo Visibility
- [ ] View the carousel at desktop size (1024px+)
- [ ] Observe the background behind the infographic
- [ ] Bendigo Phoenix logo is visible as a faded decal behind the rotating cards
- [ ] Logo is subtle (not overpowering the infographics)
- **Expected**: Logo is visible and subtle

#### Test 6.2: Logo Opacity
- [ ] Inspect the logo element with DevTools (right-click → Inspect Element)
- [ ] Check computed style for `opacity` value
- [ ] Opacity is between 0.1 and 0.2 (10-20%)
- [ ] Recommended 0.15 (15%)
- **Expected**: Logo opacity is within spec range

#### Test 6.3: Logo Doesn't Obstruct Infographics
- [ ] View carousel with logo visible
- [ ] Confirm infographic text and visuals are fully readable
- [ ] Logo doesn't blur or obscure critical content
- [ ] Logo serves as background design element only
- **Expected**: Infographics remain primary focal point

#### Test 6.4: Logo Static During Animation
- [ ] Watch the carousel rotate to next slide
- [ ] Observe the logo background
- [ ] Logo does NOT move, fade, or transform during animation
- [ ] Only the infographic rotates; logo stays in place
- **Expected**: Logo is static; only infographics animate

#### Test 6.5: Logo Visibility Across Breakpoints
- [ ] Test logo visibility at 320px, 768px, 1024px, 1920px breakpoints
- [ ] Logo remains visible and properly positioned at all breakpoints
- [ ] Logo size/scale is responsive if needed
- [ ] Logo doesn't create layout shifts
- **Expected**: Logo is consistently positioned across breakpoints

---

### Phase 7: Accessibility — Reduced Motion

#### Test 7.1: Reduced Motion Setting Detected
- [ ] On your OS (Windows/Mac/Linux), enable "Reduce Motion" setting:
  - **macOS**: System Preferences → Accessibility → Display → Reduce Motion
  - **Windows**: Settings → Ease of Access → Display → Show animations
  - **Linux**: Varies by DE; typically in Accessibility settings
- [ ] Reload the carousel page in browser
- [ ] Observe carousel behavior

#### Test 7.2: Reduced Motion—Fade Only (No 3D Rotation)
- [ ] With Reduce Motion enabled, click next button
- [ ] Infographic transitions via opacity fade ONLY (no `rotateY` 3D effect)
- [ ] Infographic fades out, next fades in (simple crossfade)
- [ ] No 3D rotation, perspective, or Y-axis tipping
- **Expected**: Fade-only transition; 3D transforms disabled

#### Test 7.3: Reduced Motion—Faster Duration
- [ ] With Reduce Motion enabled, time the animation
- [ ] Animation duration is 300ms (faster than standard 600-800ms)
- [ ] Animation is simpler and faster for accessibility-conscious users
- **Expected**: Animation duration is reduced to 300ms

#### Test 7.4: Reduced Motion—Functionality Intact
- [ ] With Reduce Motion enabled, verify all carousel features work:
  - [ ] Next/prev buttons rotate carousel
  - [ ] Touch swipe works (if mobile)
  - [ ] Keyboard nav works (arrow keys)
  - [ ] Carousel loops correctly
  - [ ] No functionality lost due to reduced motion
- **Expected**: All carousel features remain functional

#### Test 7.5: Disable Reduced Motion and Verify 3D Returns
- [ ] Disable Reduce Motion in OS settings
- [ ] Reload carousel page
- [ ] Click next button
- [ ] 3D rotation effect returns (`rotateY` animation plays)
- [ ] Duration is back to 600-800ms
- **Expected**: 3D animations re-enabled when reduced motion is off

---

### Phase 8: Accessibility — ARIA & Screen Readers

#### Test 8.1: ARIA Labels (Inspector)
- [ ] Open DevTools → Elements/Inspector tab
- [ ] Right-click on carousel container
- [ ] Inspect element
- [ ] Verify ARIA attributes:
  - [ ] `role="region"`
  - [ ] `aria-roledescription="carousel"`
  - [ ] `aria-label="Hero carousel"` (or similar)
- **Expected**: Carousel container has proper ARIA attributes

#### Test 8.2: Button ARIA Labels
- [ ] Inspect next button in DevTools
- [ ] Verify `aria-label="Next slide"` or `aria-label="Next infographic"`
- [ ] Inspect prev button
- [ ] Verify `aria-label="Previous slide"` or similar
- **Expected**: Buttons have descriptive ARIA labels

#### Test 8.3: Slide ARIA Labels
- [ ] Inspect individual slide elements
- [ ] Verify `role="group"` and `aria-label="Slide N of M"` (optional but recommended)
- **Expected**: Slides have ARIA labels

#### Test 8.4: Screen Reader Testing (Optional—VoiceOver/NVDA/JAWS)
- [ ] On Mac, enable VoiceOver:
  - [ ] Cmd+F5 to toggle VoiceOver
  - [ ] Tab to carousel region
  - [ ] VoiceOver announces "Hero carousel region" or similar
  - [ ] Tab to next button
  - [ ] VoiceOver announces "Next slide button"
  - [ ] Press Enter to activate next slide
  - [ ] VoiceOver remains active and accessible
- [ ] On Windows with NVDA:
  - [ ] Open NVDA
  - [ ] Tab to carousel region
  - [ ] NVDA announces "carousel region"
  - [ ] Navigate to buttons and press Enter
  - [ ] Carousel responds; NVDA announces result
- **Expected**: Screen reader user can understand carousel and navigate it

#### Test 8.5: Focus Order
- [ ] Tab through the carousel area
- [ ] Confirm focus order is logical:
  - [ ] Enter carousel region
  - [ ] Focus on next button OR prev button
  - [ ] Can Tab to other button
  - [ ] Tab away from carousel to next page section
- [ ] Focus order is not jumbled or unexpected
- **Expected**: Focus order is logical and predictable

---

### Phase 9: Image Optimization & Performance

#### Test 9.1: Image Format Detection
- [ ] Open DevTools → Network tab
- [ ] Reload carousel page
- [ ] Look at image requests
- [ ] On modern browsers, images should be WebP format (check Content-Type header)
- [ ] On older browsers or if WebP not supported, images should be PNG
- **Expected**: Appropriate image format served

#### Test 9.2: Primary Image Eager Load
- [ ] Open DevTools → Network tab
- [ ] Filter for images
- [ ] First infographic image should load immediately with `loading="eager"`
- [ ] Check Network tab; it's among the first requests
- [ ] Primary image loads within 500ms (excluding network latency)
- **Expected**: Primary image loads eagerly and quickly

#### Test 9.3: Lazy Loading Non-Primary Images
- [ ] Open DevTools → Network tab
- [ ] Reload page
- [ ] Observe that non-active infographics are NOT loaded immediately
- [ ] Click next button to rotate to a non-active slide
- [ ] That image should load just-in-time (or be already cached)
- [ ] Image appears in Network tab only after becoming visible
- **Expected**: Non-primary images lazy-load

#### Test 9.4: Responsive Image Sizing
- [ ] Open DevTools → Network tab
- [ ] Reload page at mobile width (320px)
- [ ] Check image `srcset` or requests
- [ ] Image size appropriate for 320px viewport (e.g., 360px variant)
- [ ] Reload at desktop width (1024px)
- [ ] Image size matches desktop variant (e.g., 600px)
- **Expected**: Browser selects appropriately-sized image per viewport

#### Test 9.5: Performance Metrics
- [ ] Open DevTools → Lighthouse tab
- [ ] Run Lighthouse audit for Performance
- [ ] Check Core Web Vitals:
  - [ ] **LCP (Largest Contentful Paint)**: < 2.5s
  - [ ] **FID (First Input Delay)**: < 100ms
  - [ ] **CLS (Cumulative Layout Shift)**: < 0.1
- [ ] Performance score should be 80+
- **Expected**: Carousel doesn't negatively impact page performance

#### Test 9.6: Animation Frame Rate
- [ ] Open DevTools → Performance tab
- [ ] Click the record button
- [ ] Click next button to start carousel animation
- [ ] Let animation complete
- [ ] Stop recording
- [ ] Look at frame rate graph
- [ ] Confirm 60+ FPS during animation
- [ ] No long tasks or blocked main thread
- **Expected**: Animation maintains 60 FPS; no jank

---

### Phase 10: Error Handling & Edge Cases

#### Test 10.1: Missing Image (Graceful Fallback)
- [ ] Edit the slides prop to include a broken image URL
- [ ] Carousel should display fallback color or placeholder
- [ ] Carousel continues to function (can still rotate to other slides)
- [ ] No console errors or crashes
- **Expected**: Failed image loads are handled gracefully

#### Test 10.2: Minimum Slides (2 Slides)
- [ ] Configure carousel with exactly 2 slides
- [ ] Next and prev buttons should function (loop between 2 slides)
- [ ] Click next: slide 1 → 2
- [ ] Click next again: slide 2 → 1 (loop)
- **Expected**: Carousel works with minimum 2 slides

#### Test 10.3: Many Slides (10+)
- [ ] Configure carousel with 10+ slides
- [ ] Cycle through all slides
- [ ] Confirm all slides display correctly
- [ ] No performance degradation
- [ ] Memory usage doesn't spike
- **Expected**: Carousel handles many slides efficiently

#### Test 10.4: Viewport Resize During Animation
- [ ] Start carousel animation (click next)
- [ ] While animation is running, resize browser window
- [ ] Animation should continue smoothly
- [ ] After animation completes, carousel re-renders at new size
- [ ] No layout shift or glitch
- **Expected**: Viewport changes don't interrupt animation

#### Test 10.5: Multiple Carousels on Same Page
- [ ] Add 2+ carousels to the same page
- [ ] Each carousel should maintain independent state
- [ ] Clicking one carousel doesn't affect another
- [ ] Click next on both simultaneously; both animate independently (or queue)
- [ ] No state collision or shared variables
- **Expected**: Multiple carousels work independently

---

### Phase 11: Component Integration

#### Test 11.1: AppShell Layout
- [ ] View homepage where carousel is displayed
- [ ] Confirm carousel is within AppShell layout
- [ ] Navbar is visible and functional
- [ ] Footer is visible and functional
- [ ] Carousel doesn't break or overflow layout
- **Expected**: Carousel integrates cleanly with AppShell

#### Test 11.2: No Import Errors
- [ ] Check browser console (F12)
- [ ] No JavaScript errors related to carousel component
- [ ] No 404 errors for missing assets
- [ ] No warnings about missing props or type mismatches
- **Expected**: No console errors; component imports successfully

#### Test 11.3: Hydration (If Using Astro Hydration)
- [ ] If carousel uses hydration, verify smooth client-side initialization
- [ ] Carousel is immediately interactive after page load
- [ ] No "flash" of unstyled content or disabled buttons
- **Expected**: Hydration is smooth and invisible to user

#### Test 11.4: Page Navigation
- [ ] Interact with carousel (rotate slides, etc.)
- [ ] Navigate away from homepage (to another page or section)
- [ ] Navigate back to homepage
- [ ] Carousel resets to first slide and functions correctly
- [ ] No state persists (carousel state is local)
- **Expected**: Carousel resets cleanly on page reload

---

## Browser Testing Checklist

Test carousel in the following browsers:

- [ ] **Chrome** (latest)
- [ ] **Firefox** (latest)
- [ ] **Safari** (latest, macOS)
- [ ] **Edge** (latest)
- [ ] **Chrome Mobile** (Android emulation or real device)
- [ ] **Safari Mobile** (iOS device or emulation)

For each browser, verify:
- [ ] Carousel renders and is interactive
- [ ] 3D rotation animation plays smoothly
- [ ] Touch swipe works (mobile browsers)
- [ ] Keyboard navigation works
- [ ] Images load with correct format (WebP or PNG)

---

## Performance Baseline

Record these metrics for reference:

| Metric | Target | Measured |
|--------|--------|----------|
| **Primary Image Load Time** | < 500ms | ___ms |
| **Animation Frame Rate** | 60+ FPS | ___fps |
| **Paint Time** | < 16ms | ___ms |
| **Lighthouse Performance** | 80+ | ___ |
| **Bundle Size (JS+CSS)** | < 15KB | ___KB |
| **Mobile (iPhone 11) FPS** | 60+ FPS | ___fps |

---

## Common Issues & Troubleshooting

### Issue: Carousel Doesn't Rotate
- [ ] Check browser console for errors
- [ ] Verify carousel component is mounted (check DevTools Elements tab)
- [ ] Confirm buttons have click event listeners
- [ ] Test with different browsers to isolate issue

### Issue: Animation is Janky or Drops Frames
- [ ] Open DevTools Performance tab
- [ ] Record animation and check frame rate
- [ ] Look for long tasks (> 50ms) blocking main thread
- [ ] Check if images are large or not optimized
- [ ] Verify GPU acceleration is enabled (`will-change` property)

### Issue: Logo Obscures Infographics
- [ ] Check logo opacity in DevTools (should be 0.1–0.2)
- [ ] Verify logo z-index is lower than slides
- [ ] If logo is too opaque, reduce opacity to 0.1 (10%)

### Issue: Responsive Sizing Looks Wrong
- [ ] Check browser DevTools Responsive Design Mode
- [ ] Verify correct breakpoint is active (mobile 320–767px, tablet 768–1023px, desktop 1024px+)
- [ ] Check Tailwind config for correct breakpoint definitions
- [ ] Use browser zoom (not window resize) to test different sizes

### Issue: Touch Swipe Doesn't Work
- [ ] Verify `touchstart` and `touchend` event listeners are attached
- [ ] Check that swipe distance is >= 45px threshold
- [ ] Test on actual mobile device (not just emulation)
- [ ] Check browser console for touch event errors

### Issue: Keyboard Navigation Doesn't Work
- [ ] Verify buttons are focusable (tabindex attribute or default)
- [ ] Check for event listeners on Enter, Space, ArrowRight, ArrowLeft keys
- [ ] Confirm focus indicator is visible (`:focus-visible` styles)
- [ ] Test with different keyboard layouts (US, etc.)

### Issue: Reduced Motion Fallback Doesn't Work
- [ ] Enable OS-level reduced motion setting
- [ ] Reload page after enabling
- [ ] Check that CSS media query `@media (prefers-reduced-motion: reduce)` is applied
- [ ] Verify JavaScript detection of `window.matchMedia('(prefers-reduced-motion: reduce)')` works

### Issue: Screen Reader Doesn't Announce Carousel
- [ ] Verify ARIA labels are present on buttons and container
- [ ] Check that slide role and aria-label are correct
- [ ] Test with different screen readers (NVDA, JAWS, VoiceOver)
- [ ] Ensure carousel is inside main landmark (`<main>` or `role="main"`)

---

## Sign-Off Criteria

Feature is ready for production if:

- [ ] All 49 acceptance criteria pass
- [ ] No console errors or warnings
- [ ] 60+ FPS on desktop and mid-range mobile
- [ ] Primary image loads within 500ms
- [ ] WCAG 2.1 AA accessibility compliant
- [ ] Tested in Chrome, Firefox, Safari, Edge
- [ ] Responsive layout verified at all breakpoints
- [ ] Screen reader testing passed
- [ ] Reduced motion fallback verified
- [ ] Performance baseline meets targets
- [ ] Code review passed
- [ ] Lighthouse audit: Performance 80+, Accessibility 90+

---

## Post-Launch Monitoring

After deployment:

1. **Monitor Core Web Vitals**: Track LCP, FID, CLS in production
2. **Monitor Image Loading**: Ensure WebP/PNG delivery is correct
3. **Monitor Analytics**: Track carousel interaction rates (if analytics event is added)
4. **Monitor Error Logs**: Watch for image load failures, animation glitches
5. **Collect User Feedback**: Confirm animation feels natural and responsive

---

## Questions or Issues?

Refer to:
- **spec.md**: Full requirements and acceptance criteria
- **plan.md**: Technical approach and phased delivery
- **research.md**: Unknowns and alternative approaches
- **DevTools**: Inspect element, Network, Performance, Accessibility tabs
