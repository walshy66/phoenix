# Research: Hero Section Circular Card Carousel

**Feature**: COA-22 | **Created**: 2026-04-10 | **Status**: RESEARCH PHASE

---

## Unknowns & Questions

### 1. Logo Asset Management
**Status**: BLOCKING — Need to confirm before Phase 4

- **Question**: Where is the Bendigo Phoenix logo currently stored?
  - Is it in `/public/assets/logo.svg`?
  - Is it on a CDN?
  - What format is it (SVG, PNG, WebP)?
  - What are the dimensions?
  - Is it a single-color logo or full-color?
  - Are there multiple versions (light/dark)?

- **Impact**: Logo decal positioning, sizing, and opacity handling depend on knowing the exact asset
- **Action**: 
  - Search repo for existing logo references in `Navbar.astro`, `Footer.astro`, or other components
  - Check `/public/` directory structure
  - Confirm asset format and size
  - Test logo visibility with various opacity levels (10-20%) against purple background

---

### 2. Infographic Image Specifications
**Status**: MEDIUM PRIORITY — Need specs before Phase 7

- **Questions**:
  - What are the actual infographic images for the hero carousel?
  - Current dimensions (pixels)?
  - Current format (PNG, JPG, SVG)?
  - Current file sizes?
  - Are they already optimized or raw?
  - Where are they stored (repo, CDN, asset management system)?
  - Do they exist yet or need to be created?

- **Impact**: Image optimization strategy, lazy loading decisions, responsive srcset setup
- **Action**:
  - Locate infographic files or design specs
  - Get dimensions and current file sizes
  - Assess compression opportunities (WebP conversion, etc.)
  - Determine CDN vs. static asset strategy

---

### 3. Responsive Scaling Edge Cases
**Status**: LOW PRIORITY — Plan to test during Phase 5

- **Questions**:
  - How should the carousel behave on very small viewports (< 320px)?
  - How should ultra-wide screens (> 1920px) scale the carousel?
  - Does the carousel need to maintain 3:4 portrait aspect ratio strictly, or can it vary slightly at extreme breakpoints?
  - Should the hero container height be fixed or fluid?
  - How much vertical space is available for the hero section on mobile?

- **Impact**: Responsive Tailwind classes, clamp() sizing calculations
- **Action**:
  - Test on actual devices/viewports
  - Document any constraints from AppShell layout
  - Finalize sizing formulas (clamp, vw units, fixed px)

---

### 4. Performance Profiling on Target Devices
**Status**: LOW PRIORITY — Test during Phase 8

- **Questions**:
  - What 60 FPS target do iPhone 11+ and Galaxy A50+ actually achieve?
  - Are there specific performance bottlenecks on these devices?
  - Is GPU acceleration (`will-change: transform, opacity`) sufficient?
  - Do animations need further optimization (reduce animations, use `transform` vs. `opacity` only)?

- **Impact**: Animation optimization, possible fallbacks for low-end devices
- **Action**:
  - Test animation on target devices using DevTools remote debugging
  - Measure frame rates, paint times, composite times
  - Profile JS execution during animation
  - Identify any jank and optimize

---

### 5. Browser Compatibility Testing Scope
**Status**: LOW PRIORITY — Test during Phase 8

- **Questions**:
  - Which browsers need to be tested? (spec assumes modern browsers)
  - Should we support IE 11 or older Edge versions?
  - Are there any Safari-specific 3D transform quirks?
  - Do we need vendor prefixes for CSS transforms?
  - What's the minimum iOS Safari version to support?

- **Impact**: CSS prefixing, fallback strategies
- **Action**:
  - Confirm minimum browser versions with stakeholders
  - Test in Chrome, Firefox, Safari, Edge (latest versions)
  - Use autoprefixer in build process if needed

---

### 6. Animation Library Comparison (If Native CSS Insufficient)
**Status**: LOW PRIORITY — Only if native CSS doesn't meet requirements

- **Alternative Approaches**:
  1. **Native CSS 3D** (chosen): Pros—lightweight, no deps, simple; Cons—limited tweaking
  2. **Framer Motion**: Pros—fine-grained control, spring physics; Cons—adds 20KB+, overkill for simple carousel
  3. **GSAP (GreenSock)**: Pros—enterprise-grade, smooth; Cons—commercial license, 20KB+
  4. **Three.js**: Pros—full 3D control; Cons—massive overhead, overkill
  5. **Transition Group + CSS**: Pros—React-friendly; Cons—not needed for Astro static component

- **Decision**: Start with native CSS; only adopt library if animation quality issues arise
- **Action**: Profile animation smoothness during Phase 8; escalate if < 60 FPS

---

### 7. Click Queue Implementation Details
**Status**: MEDIUM PRIORITY — Design before Phase 3

- **Questions**:
  - Should the queue process clicks immediately after animation completes?
  - If user queues 5 clicks, should they all execute or should we debounce?
  - Should there be a timeout for queued clicks (e.g., 5 seconds)?
  - Should buttons show visual feedback during queueing (disabled state)?

- **Current Answer** (from spec): Spec says clicks are "queued and executed sequentially after animation completes" (AC-17). Simple FIFO queue with no debounce.

- **Action**: Implement simple array-based queue; test with rapid clicks (5+ per second)

---

### 8. Accessibility—Screen Reader Announcements
**Status**: MEDIUM PRIORITY — Clarify before Phase 6

- **Questions**:
  - Should `aria-live="polite"` announce when carousel rotates to a new slide?
  - Should we announce "Slide 3 of 5" every time, or only on manual interaction?
  - Should we use `aria-current="true"` to indicate the active slide?
  - Are there ARIA patterns for carousels we should follow (ARIA Authoring Practices Guide)?

- **Spec Answer**: ARIA labels for container, buttons, and slides are required (AC-33 through AC-37). No mention of `aria-live` for announcements (noted as "optional post-MVP").

- **Action**: 
  - Follow WAI-ARIA carousel pattern (https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
  - Implement required labels; defer `aria-live` announcements to post-MVP
  - Test with screen reader (VoiceOver, NVDA, JAWS)

---

## Alternatives Considered

### Approach 1: CSS 3D Transforms (CHOSEN)
**Description**: Native CSS `perspective`, `rotateY()`, and `opacity` for carousel rotation

**Pros**:
- No external dependencies
- Lightweight (< 15KB bundle impact)
- Native browser optimization for GPU acceleration
- Full browser support (modern browsers)
- Fine-grained control via CSS keyframes

**Cons**:
- Limited animation tweaking without JavaScript
- No spring physics or advanced easing
- Requires careful timing for fade synchronization
- Must test on actual devices for frame rate

**Recommendation**: ✅ **CHOSEN** — Meets all requirements; simplest implementation

---

### Approach 2: JavaScript-Based Animation (View.Transition API)
**Description**: Use CSS Transitions or View Transitions API to animate carousel

**Pros**:
- Flexible JavaScript control over animation state
- Can implement complex timing and queueing logic
- Better debugging visibility (console logs, debugger)

**Cons**:
- More verbose JavaScript code
- Potential for race conditions or dropped frames
- Requires careful state management
- View Transitions API not universally supported yet

**Recommendation**: ❌ **NOT CHOSEN** — Adds complexity without clear benefit; CSS 3D is simpler

---

### Approach 3: Framer Motion Library
**Description**: Use Framer Motion for declarative animation control (if component were React)

**Pros**:
- Declarative, intuitive API
- Built-in gesture support (swipe detection)
- Spring physics and advanced easing

**Cons**:
- 20KB+ bundle size (violates 15KB limit)
- Overkill for simple carousel
- Would require migrating Astro component to React
- Adds unnecessary dependency

**Recommendation**: ❌ **NOT CHOSEN** — Violates bundle size limits; Astro is better fit

---

### Approach 4: GSAP (GreenSock Animation Platform)
**Description**: Enterprise-grade animation library (commercial license)

**Pros**:
- Highly optimized, smooth animations
- Fine-grained control
- Cross-browser compatibility ensured

**Cons**:
- Commercial license (cost consideration)
- 20KB+ bundle size
- Overkill for carousel
- Adds unnecessary complexity

**Recommendation**: ❌ **NOT CHOSEN** — Cost + bundle size + overkill

---

### Logo Positioning Approach: Fixed vs. Relative
**Chosen**: Fixed absolute positioning behind carousel

**Alternative 1: Parallax Scroll**
- Pros: Adds depth visual effect
- Cons: Spec says logo should be "static" (not move during animation)
- Not chosen: Violates requirement

**Alternative 2: SVG Filter / Mask**
- Pros: Precise control over logo visibility
- Cons: More complex CSS; may impact performance
- Not chosen: Simple opacity + z-index sufficient

**Chosen Approach**: 
- Absolute positioning in hero container
- Static (no animation, no scroll parallax)
- Opacity 10-20%
- Z-index lower than slides
- Responsive scaling via percentage or clamp()

---

### Responsive Sizing Approach: Fixed vs. Fluid
**Chosen**: Hybrid (fixed on desktop, fluid on mobile)

**Breakdown**:
| Breakpoint | Sizing | Rationale |
|-----------|--------|-----------|
| Mobile (320–767px) | ~90vw max | Flexible, scales with viewport |
| Tablet (768–1023px) | ~80vw or 400px | Flexible or bounded |
| Desktop (1024–1919px) | ~450px fixed | Consistent, professional appearance |
| Ultra-wide (1920px+) | ~450px fixed | No oversizing |

**Alternatives Considered**:
1. **100% fluid**: Scales infinitely; looks weird on ultra-wide screens
2. **100% fixed**: Not responsive; looks cramped on mobile
3. **Aspect ratio container**: Works well; easier than managing aspect ratio in CSS

**Chosen Approach**: CSS `clamp()` for smooth scaling between breakpoints
```css
width: clamp(320px, 90vw, 450px);
```

---

## Technology Decisions & Rationale

### 1. Why Astro Component (Not React)?
- **Decision**: Build as `.astro` component (static HTML/CSS/JS)
- **Rationale**:
  - Hero carousel is primarily visual; minimal client-side state
  - Astro renders pure HTML with scoped CSS + inline script
  - No hydration overhead or JavaScript framework boilerplate
  - Matches existing CoachCW architecture (other components are .astro)
  - Reduces bundle size vs. React component

### 2. Why CSS 3D (Not Canvas/WebGL)?
- **Decision**: Use CSS 3D transforms
- **Rationale**:
  - Canvas/WebGL overkill for 2D carousel
  - CSS 3D is browser-native, GPU-accelerated
  - Simpler to implement and maintain
  - Accessible fallback via `prefers-reduced-motion`
  - No dependency bloat

### 3. Why Native JavaScript (Not jQuery/Vanilla Abstraction)?
- **Decision**: Vanilla JavaScript in `<script>` tag
- **Rationale**:
  - Astro component already scoped to single file
  - No jQuery dependency needed for modern browsers
  - Simple event listeners (click, touch, keyboard)
  - Clearer control flow for animation state

### 4. Why WebP + PNG (Not AVIF)?
- **Decision**: WebP primary, PNG fallback (AVIF optional future)
- **Rationale**:
  - WebP widely supported (modern browsers, mobile)
  - PNG universal fallback (all browsers)
  - AVIF newer, not universally supported yet
  - WebP compression sufficient for spec (~150KB target)
  - Can upgrade to AVIF in future if needed

### 5. Why Lazy Loading Primary Card?
- **Decision**: Primary (index 0) eager, all others lazy
- **Rationale**:
  - Primary image critical for hero section visibility
  - Eager load ensures fast initial page impression
  - Non-active images can load asynchronously
  - Improves Core Web Vitals (LCP, FID)
  - Supports fast animation (images pre-loaded when needed)

---

## Open Questions for Stakeholders

1. **Logo Asset Location**: Where is the Bendigo Phoenix logo stored? Format? Size?
2. **Infographic Files**: What images will populate the carousel? Where are they? Current sizes?
3. **Hero Container Height**: Does the AppShell constrain hero section height? Fixed vs. fluid?
4. **Auto-Advance Behavior**: Should carousel auto-rotate? If yes, what interval? (Spec defaults to disabled)
5. **Browser Minimum Support**: What's the oldest browser version that needs to work? (Spec assumes modern)
6. **Performance Budget**: Is 15KB JS+CSS acceptable? Should we tighten or relax?
7. **Accessibility Testing**: Will QA use screen readers? If yes, which ones (NVDA, JAWS, VoiceOver)?
8. **Image Optimization**: Who optimizes infographics? Developer or designer workflow?

---

## Risk Assessment & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Logo asset not found | Medium | Phase 4 blocked | Research Phase 1; use placeholder if unavailable |
| Image files not ready | Medium | Phase 7 blocked | Coordinate with design team; use placeholder images |
| Responsive scaling issues | Low | Phase 5 needs rework | Test-first approach; validate at each breakpoint |
| Animation performance < 60 FPS | Low | Phase 8 rework | GPU acceleration; lazy loading; profile on target devices |
| WCAG compliance gaps | Low | Accessibility audit failure | Implement accessibility spec requirements in Phase 6 |
| Browser compatibility | Low | Fallback needed | Use vendor prefixes; test in target browsers |

---

## Dependencies & Assumptions

### Assumed Current State
- Astro 6 project is set up and running
- Tailwind CSS 4 is configured
- Vitest is configured for testing
- `/public/` directory exists for static assets
- No new npm packages should be added (follow Constitution VIII)

### Assumed Scope
- No backend changes (frontend-only carousel)
- Carousel is the hero section; doesn't replace other page sections
- Infographic images exist or will be provided by design team
- Logo asset exists somewhere (to be confirmed)

### Assumed Browser Support
- Modern browsers (Chrome 26+, Firefox 16+, Safari 9+, Edge 12+)
- No IE 11 support (spec assumes modern browsers)
- Mobile: Safari 9+, Chrome Android

---

## Action Items

### Before Implementation
- [ ] Confirm logo asset location, format, and size
- [ ] Finalize infographic image specifications
- [ ] Confirm responsive layout constraints from AppShell
- [ ] Verify browser support requirements
- [ ] Clarify auto-advance behavior preference

### During Phase 5 (Responsive Layout)
- [ ] Test carousel at 320px, 375px, 768px, 1024px, 1280px, 1920px+ viewports
- [ ] Verify responsive sizing matches spec (90vw mobile, 450px desktop)
- [ ] Test device rotation (portrait ↔ landscape)

### During Phase 8 (Testing & Refinement)
- [ ] Profile animation on iPhone 11+, Galaxy A50+ (target devices)
- [ ] Measure frame rates (aim for 60+ FPS)
- [ ] Test in Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Accessibility audit with screen reader
- [ ] Run Lighthouse for performance/accessibility/SEO scores

---

## References

- [WAI-ARIA Carousel Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)
- [WCAG 2.1 Success Criteria](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: CSS 3D Transforms](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotateY)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [Astro Documentation](https://docs.astro.build)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)

---

## Next Steps

1. **Clarify Unknowns**: Get answers to questions above from stakeholders
2. **Confirm Logo Asset**: Locate Bendigo Phoenix logo in repo or CDN
3. **Finalize Image Specs**: Get dimensions, formats, and file sizes for infographics
4. **Design Phase 3 Details**: Finalize click queue implementation specifics
5. **Plan Testing Infrastructure**: Ensure Vitest is properly configured for carousel tests
