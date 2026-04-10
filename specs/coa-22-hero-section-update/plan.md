# Implementation Plan: Hero Section Circular Card Carousel

**Branch**: `coa-22-hero-section-update` | **Date**: 2026-04-10 | **Spec**: [spec.md](spec.md)

---

## Summary

Replace the existing landscape flip-card carousel with a prominent **circular portrait-format carousel** featuring large infographics (40-50% of viewport width) that rotate 3D along the Y-axis. Add a subtle Bendigo Phoenix logo decal behind the rotating cards, implement touch/keyboard/reduced-motion support, and optimize images for web delivery.

**Technical Approach**:
- Build `HeroCircularCarousel.astro` component (replaces `HeroCarousel.astro`)
- CSS 3D transforms (`perspective: 1200px`, `rotateY()`, `opacity` fade)
- Native JavaScript for gesture handling (touch, keyboard, click queueing)
- Responsive portrait layout (320px–1920px breakpoints)
- WebP + PNG image format with lazy loading
- Full WCAG 2.1 AA accessibility (keyboard nav, reduced-motion fallback, ARIA labels)

---

## Technical Context

| Aspect | Details |
|--------|---------|
| **Language/Version** | Astro 6.1.1, HTML/CSS/TypeScript |
| **Primary Dependencies** | Astro (Tailwind CSS 4.2.2 for styling) |
| **Storage** | N/A (frontend-only, no backend mutations) |
| **Testing** | Vitest 4.1.2 (unit + integration tests) |
| **Target Platform** | Web (desktop, tablet, mobile) |
| **Performance Goals** | 60 FPS on desktop + mid-range mobile (iPhone 11+, Galaxy A50+); 500ms primary image load |
| **Scale/Scope** | Hero section; ~15KB JS+CSS minified+gzipped max; supports 2+ slides |

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. User Outcomes First** | ✅ PASS | 49 acceptance criteria; clear, measurable outcomes (carousel rotates, loops, responsive) |
| **II. Test-First Discipline** | ✅ PASS | Spec includes 49 test scenarios; plan phases include test-first approach per phase |
| **III. Backend Authority** | ✅ PASS | Frontend-only; no server mutations; carousel state is local (currentSlide index) |
| **IV. Error Semantics** | ✅ PASS | Graceful image load failures (fallback color); click queueing prevents state inconsistency |
| **V. AppShell Integrity** | ✅ PASS | Component replaces existing carousel; no custom nav shell; fits within AppShell layout |
| **VI. Accessibility First** | ✅ PASS | Keyboard nav, focus visible, reduced-motion fallback, ARIA labels; WCAG 2.1 AA |
| **VII. Immutable Data Flow** | ✅ PASS | Unidirectional state (currentSlide, isAnimating, queue); no client-side inference |
| **VIII. Dependency Hygiene** | ✅ PASS | No new npm packages; native CSS 3D + JS; existing Astro + Tailwind stack |
| **IX. Cross-Feature Consistency** | ✅ PASS | Follows Astro component patterns; Tailwind styling; brand colors (#573F93, #8B7536) |

**Overall**: ✅ **CONSTITUTIONAL COMPLIANCE: PASS** — No conflicts or violations.

---

## Project Structure

```
src/components/
├── HeroCircularCarousel.astro        (new component, replaces HeroCarousel.astro)
├── HeroCircularCarousel.test.ts      (Vitest unit + integration tests)
└── ...existing components...

specs/coa-22-hero-section-update/
├── spec.md                           (requirements)
├── plan.md                           (this file)
├── data-model.md                     (no backend schema changes)
├── contracts/api-contract.md         (N/A — no API changes)
├── research.md                       (3D animation libraries, image optimization)
├── quickstart.md                     (manual testing guide)
└── 00 Logos/                         (logo assets for carousel)
```

### Component Props Interface

```typescript
interface Slide {
  image: string              // Image URL (required; component uses Astro Image for optimization)
  alt: string                // Alt text for accessibility (required)
  bgColor?: string           // Fallback background color (optional)
}

interface Props {
  slides: Slide[]            // Array of slide objects (required, min 2 slides)
  autoAdvanceMs?: number     // Auto-advance interval in ms (optional, default: disabled)
  autoAdvanceEnabled?: boolean // Enable/disable auto-advance (optional, default: false)
}
```

### File Locations

- **Component**: `/src/components/HeroCircularCarousel.astro` (replaces `HeroCarousel.astro`)
- **Tests**: `/src/components/HeroCircularCarousel.test.ts`
- **Logo Asset**: Confirm location in `/specs/coa-22-hero-section-update/00 Logos/` or CDN
- **Images**: Use relative paths or CDN URLs for infographics

---

## Pre-Implementation Research Phase

**Required Before Window 1 Starts**:
- Confirm asset locations (logo, infographic files) in codebase or CDN
- Verify Astro Image component availability and integration pattern
- Document exact image file paths and formats available
- Confirm browser support assumptions for target devices

This research ensures Window 1 execution is not blocked by asset availability or integration questions.

---

## Phased Delivery

### Phase 1: Core Carousel Architecture (P1)
**Goal**: Establish component skeleton, state management, and basic routing logic

**Tasks**:
1. Create `HeroCircularCarousel.astro` component with props interface (including `autoAdvanceMs` and `autoAdvanceEnabled`)
2. Implement slide indexing (currentSlide, modulo arithmetic)
3. Set up animation state flag (`isAnimating`) and click queue (array of pending clicks)
4. Set up optional auto-advance state and interval (deferred to later phase, but initialize here)
5. Render slides as absolutely-positioned divs with initial opacity 0/1; do NOT render navigation buttons if fewer than 2 slides
6. Write unit tests for slide routing (next, prev, looping)

**Definition of Done**:
- Component renders with first slide visible, others hidden
- `next()` and `prev()` functions exist and update `currentSlide` correctly
- Looping works: last slide + next = slide 0; first slide + prev = last slide
- Click queue exists and can be populated (not yet processed)

---

### Phase 2: CSS 3D Transforms & Animation (P1)
**Goal**: Implement Y-axis rotation with smooth fade-in/fade-out transitions

**Tasks**:
1. Add `perspective: 1200px` to viewport container
2. Define `@keyframes rotateOutLeft`, `rotateOutRight`, `rotateInLeft`, `rotateInRight` animations
   - Exit: 350ms, `rotateY(0°) → ±90°`, `opacity: 1 → 0`, `ease-in`
   - Enter: 350ms, `rotateY(∓90° → 0°)`, `opacity: 0 → 1`, `ease-out`, 0ms delay overlap
3. Add `will-change: transform, opacity` to active slides for GPU acceleration
4. Style slides with `backface-visibility: hidden` to prevent reversal
5. Write tests for animation timing (350ms exit + enter, no jank, 60 FPS target)

**Definition of Done**:
- Slide rotates out to left/right with fade
- Next slide rotates in from opposite direction with fade
- Total duration 600-800ms feels smooth and natural
- 60 FPS on desktop (measured via DevTools)
- No visual glitches or flicker

---

### Phase 3: Navigation & Interaction (P1)
**Goal**: Connect next/prev buttons, implement click queueing, and add touch/keyboard support

**Tasks**:
1. Add next/prev buttons with `aria-label` attributes (render only if 2+ slides)
2. Implement click handler that:
   - Returns early if `isAnimating` is true (but keep button enabled and provide visual feedback on press)
   - Queues the click for later execution
   - Sets `isAnimating = true`
   - Triggers animation classes on exit slide and entry slide
   - After animation completes (600-800ms), sets `isAnimating = false`
   - Processes next queued click if any exist
3. Implement click queue: if user clicks during animation, push to queue; after animation, process next click in queue
4. Add touch swipe support (touchstart → touchend, 45px threshold, left = next, right = prev; note: 3D rotation may feel different from traditional swipe)
5. Add keyboard navigation (ArrowRight = next, ArrowLeft = prev)
6. Write tests for queueing, rapid clicks, touch threshold, keyboard nav

**Definition of Done**:
- Clicking next/prev rotates carousel and disables buttons during animation
- 5 rapid clicks execute in sequence without breaking carousel
- Touch swipe left rotates next; swipe right rotates prev
- Swipes under 45px don't trigger rotation
- Keyboard arrow keys navigate carousel
- No dropped clicks or simultaneous animations

---

### Phase 4: Logo Decal (P1)
**Goal**: Render Bendigo Phoenix logo as static background element behind rotating infographics

**Tasks**:
1. Locate logo asset (SVG preferred, PNG acceptable)
2. Add absolutely-positioned logo layer behind carousel with:
   - `position: absolute`, `z-index: 0` (lower than slides)
   - `opacity: 0.15` (default, 10-20% range)
   - Centered or scaled to fit container
   - `pointer-events: none` to prevent interaction
3. Ensure logo doesn't obscure infographics or reduce readability
4. Make logo responsive (scale on mobile, maintain visibility)
5. Write tests for logo visibility, opacity, z-index, no interaction

**Definition of Done**:
- Logo renders behind all slides
- Logo opacity is 10-20% (15% default)
- Logo doesn't move during animation
- Logo visible at all breakpoints (320px–1920px)
- Logo doesn't interfere with infographic content

---

### Phase 5: Responsive Layout (P1)
**Goal**: Implement portrait-format carousel that scales responsively across breakpoints

**Tasks**:
1. Define responsive sizing per breakpoint:
   - **Mobile (320–767px)**: ~90vw max-width, 16px padding L/R, portrait 3:4 aspect
   - **Tablet (768–1023px)**: ~80vw or 400px fixed, portrait 3:4 aspect
   - **Desktop (1024–1919px)**: ~450px fixed, portrait 3:4 aspect, centered
   - **Ultra-wide (1920px+)**: ~450px fixed, no scaling beyond desktop
2. Use Tailwind responsive utilities or CSS Grid + clamp() for sizing
3. Ensure images maintain `object-fit: contain` (no crop)
4. Test carousel at each breakpoint: sizing correct, animations smooth, readability good
5. Write tests for responsive breakpoints, viewport changes, device rotation

**Definition of Done**:
- Mobile 320px: ~90vw with padding, full portrait aspect visible
- Tablet 768px: ~80vw or 400px, readable and centered
- Desktop 1024px: ~450px, 40-50% of hero width
- Ultra-wide 1920px: ~450px, no oversizing
- Device rotation doesn't break carousel

---

### Phase 6: Accessibility (P1)
**Goal**: Ensure WCAG 2.1 AA compliance with keyboard nav, reduced-motion fallback, ARIA labels, and focus management

**Tasks**:
1. Add ARIA labels:
   - Container: `role="region"`, `aria-roledescription="carousel"`, `aria-label="Hero carousel"`
   - Next button: `aria-label="Next slide"` or `aria-label="Next infographic"`
   - Prev button: `aria-label="Previous slide"`
   - Slides (optional): `role="group"`, `aria-label="Slide N of M"`
2. Implement `prefers-reduced-motion` fallback:
   - Detect via CSS media query or `window.matchMedia()`
   - Replace `rotateY` transforms with fade-only `opacity` transitions
   - Reduce duration to 300ms (faster, simpler)
3. Add keyboard focus indicators:
   - `:focus-visible` on buttons with minimum 2px outline or equivalent
   - Focus contrast must meet WCAG AA (4.5:1 minimum)
   - Focus must NOT disappear during animation
4. Test with screen reader (NVDA, JAWS, or VoiceOver)
5. Test with reduced-motion enabled in OS settings
6. Write tests for keyboard nav, focus visibility, ARIA compliance, reduced-motion fallback

**Definition of Done**:
- Keyboard Tab navigates to next/prev buttons
- Buttons have visible focus indicator (minimum 2px outline, 4.5:1 contrast)
- Focus doesn't disappear during animation
- Screen reader announces carousel description and button labels
- Reduced-motion users see fade-only transitions (no 3D rotation)
- All WCAG 2.1 AA success criteria met

---

### Phase 7: Image Optimization (P1)
**Goal**: Implement WebP + PNG fallback, lazy loading, responsive sizing, and performance targets

**Tasks**:
1. Set up image serving strategy:
   - Use `<picture>` element or Astro Image component for format selection
   - Serve WebP to modern browsers, PNG fallback to older browsers
2. Implement lazy loading:
   - Primary card (index 0): `loading="eager"`, `decoding="auto"`
   - All other cards: `loading="lazy"`, `decoding="async"`
3. Create responsive srcset:
   - Define image sizes for breakpoints (360px, 450px, 600px)
   - Let browser select optimal size based on device width and DPR
4. Optimize file sizes:
   - Target ~150KB per WebP infographic
   - Target ~250KB per PNG fallback
   - Use imagemin, Sharp, or CDN optimization
5. Write tests for lazy loading, format detection, image performance

**Definition of Done**:
- Primary infographic loads within 500ms
- Primary card uses `loading="eager"`, others use `loading="lazy"`
- Images use WebP on modern browsers, PNG fallback on older
- Responsive srcset serves appropriate size per breakpoint
- File sizes meet targets (~150KB WebP, ~250KB PNG)
- Non-active cards load without blocking animation

---

### Phase 8: Testing & Refinement (P1)
**Goal**: Comprehensive testing, performance validation, and final polish

**Tasks**:
1. Write integration tests covering:
   - Happy path carousel interaction (SC-001 through SC-006)
   - Touch & mobile interaction (SC-007 through SC-010)
   - Keyboard navigation & focus (SC-011 through SC-015)
   - Animation timing & queueing (SC-016 through SC-019)
   - Responsive design (SC-020 through SC-025)
   - Logo decal & visual elements (SC-026 through SC-029)
   - Accessibility—reduced motion (SC-030 through SC-032)
   - Accessibility—ARIA (SC-033 through SC-037)
   - Image optimization (SC-038 through SC-042)
   - Error & edge cases (SC-043 through SC-048)
   - Component integration (SC-049)
2. Run performance tests (DevTools, Lighthouse)
3. Test on actual target devices (desktop, tablet, iPhone 11+, Galaxy A50+)
4. Validate 60 FPS during animation
5. Refine animation timing, easing, and spacing based on testing

**Definition of Done**:
- All 49 acceptance criteria pass
- 60 FPS on desktop and mid-range mobile
- Primary infographic loads within 500ms
- No performance regressions vs. old carousel
- Feature ready for production handoff

---

## Testing Strategy

### Test-First Approach
- Write tests BEFORE implementing each phase
- Tests validate acceptance criteria, not just code coverage
- Use Vitest for unit + integration testing

### Test Coverage by Category

| Category | Scenarios | Phases |
|----------|-----------|--------|
| **Core Carousel** | 6 scenarios (AC 1–6) | Phase 1–3 |
| **Touch & Mobile** | 4 scenarios (AC 7–10) | Phase 3 |
| **Keyboard & Focus** | 5 scenarios (AC 11–15) | Phase 3, 6 |
| **Animation Timing** | 4 scenarios (AC 16–19) | Phase 2–3 |
| **Responsive Design** | 6 scenarios (AC 20–25) | Phase 5 |
| **Logo Decal** | 4 scenarios (AC 26–29) | Phase 4 |
| **Reduced Motion** | 3 scenarios (AC 30–32) | Phase 6 |
| **ARIA & Screen Reader** | 5 scenarios (AC 33–37) | Phase 6 |
| **Image Optimization** | 5 scenarios (AC 38–42) | Phase 7 |
| **Error & Edge Cases** | 6 scenarios (AC 43–48) | Phase 8 |
| **Component Integration** | 3 scenarios (AC 49) | Phase 8 |

### Performance Testing

- **60 FPS Target**: Measure via DevTools Performance tab during animation
- **Load Time**: Primary infographic within 500ms
- **Paint Time**: Keep under 16ms per frame
- **Bundle Impact**: JS + CSS under 15KB minified + gzipped
- **Target Devices**: Desktop + iPhone 11+ and Galaxy A50+

### Manual Testing Checklist

- [ ] Load homepage; hero carousel renders with first slide visible
- [ ] Click next/prev buttons; carousel rotates smoothly with fade effect
- [ ] Rapidly click next 5 times; all clicks execute in sequence
- [ ] Swipe left/right on mobile; carousel responds correctly
- [ ] Tab to next/prev buttons; focus indicator visible
- [ ] Press ArrowRight/ArrowLeft; carousel rotates
- [ ] Enable OS reduced-motion setting; carousel uses fade-only transitions
- [ ] Test at 320px, 768px, 1024px, 1920px breakpoints; sizing correct
- [ ] View with DevTools; images load with WebP/PNG, lazy loading works
- [ ] Run Lighthouse; performance score good, accessibility score high

---

## Key Decisions & Rationale

### Decision 1: Replace Old Carousel vs. Coexist
**Chosen**: Replace (spec requirement)
**Rationale**: Spec explicitly states "complete replacement" of old carousel; new design fundamentally different (portrait vs. landscape, circular vs. flip)

### Decision 2: CSS 3D Transforms vs. Animation Libraries
**Chosen**: Native CSS 3D (no external libraries)
**Rationale**: Browser support strong (Chrome 26+, Firefox 16+, Safari 9+, Edge 12+); no dependency bloat; fine-grained control over animation timing

### Decision 3: Astro Component vs. React Component
**Chosen**: Astro component (no hydration overhead)
**Rationale**: Hero section is largely static; Astro renders pure HTML/CSS; minimal JS (event handlers); no client-side state mutation

### Decision 4: Click Queueing Mechanism
**Chosen**: Simple array-based queue + sequential processing
**Rationale**: Prevents simultaneous animations; clear semantics; easy to test; no race conditions

### Decision 5: Responsive Sizing Strategy
**Chosen**: CSS clamp() + Tailwind breakpoints
**Rationale**: Scales smoothly across breakpoints; no JavaScript-based calculations; maintains portrait aspect ratio naturally

### Decision 6: Image Lazy Loading
**Chosen**: Primary card eager, all others lazy
**Rationale**: Ensures hero is fast; defers non-critical images; improves initial load time without blocking animation

---

## Research & Unknowns

See [research.md](research.md) for:
- Logo asset location and format confirmation
- Image file specifications (sizes, formats, current storage)
- 3D animation library alternatives (if native CSS insufficient)
- Responsive scaling edge cases (very small/very large viewports)
- Performance profiling on actual target devices
- Browser compatibility testing scope

---

## Dependencies & Risks

### Dependencies
- **Astro 6.1.1**: Existing, no version change needed
- **Tailwind CSS 4.2.2**: Existing, no version change needed
- **Vitest 4.1.2**: Existing, for testing
- **No new npm packages**: Native CSS 3D + JS only

### Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Browser CSS 3D support** | Low | Modern browsers only; spec already assumes support; fallback via `prefers-reduced-motion` |
| **Animation performance on low-end mobile** | Medium | Lazy loading, GPU acceleration (`will-change`), reduced-motion fallback |
| **Logo decal visibility** | Low | Opacity capped at 20%; positioned behind slides; z-index managed |
| **Image load blocking animation** | Medium | Lazy loading for non-primary cards; primary card eager load; animation queues clicks |
| **Rapid clicks during animation** | Low | Click queue mechanism; `isAnimating` flag; disabled buttons during animation |
| **Responsive scaling inconsistencies** | Low | Test-first approach; responsive breakpoints defined clearly |
| **WCAG compliance** | Low | Spec includes accessibility requirements; keyboard nav, ARIA, reduced-motion built-in |
| **Logo asset not found** | Medium | Research phase to confirm asset location; use placeholder if unavailable |

---

## Success Metrics

### Measurable Outcomes (from Spec)

- **SC-001**: Hero section loads within 2 seconds (excluding image download)
- **SC-002**: Primary infographic occupies 40-50% viewport width (desktop), responsive (mobile)
- **SC-003**: Card rotation completes smoothly in 600-800ms
- **SC-004**: 100% of infographic content visible and unobstructed
- **SC-005**: Carousel loops correctly without glitches or flicker
- **SC-006**: Logo decal visible at all breakpoints, doesn't obscure infographics
- **SC-007**: 60 FPS on desktop; smooth on mid-range mobile
- **SC-008**: Primary infographic loads within 500ms
- **SC-009–SC-016**: All accessibility & component integration criteria pass

---

## Deliverables Summary

| Artifact | Location | Purpose |
|----------|----------|---------|
| **plan.md** | `specs/coa-22-hero-section-update/plan.md` | This document; implementation approach & phased delivery |
| **research.md** | `specs/coa-22-hero-section-update/research.md` | Research, unknowns, alternative approaches |
| **quickstart.md** | `specs/coa-22-hero-section-update/quickstart.md` | Manual testing guide; key user flows; troubleshooting |
| **HeroCircularCarousel.astro** | `src/components/HeroCircularCarousel.astro` | New carousel component (replaces old) |
| **HeroCircularCarousel.test.ts** | `src/components/HeroCircularCarousel.test.ts` | Vitest unit + integration tests |
| **tasks.md** | `specs/coa-22-hero-section-update/tasks.md` | Atomic, sequenced implementation tasks (generated next) |

---

## Next Steps

1. **Review & Clarify**: Confirm technical decisions and phased approach
2. **Research Phase**: Locate logo asset, finalize image specs (see research.md)
3. **Tasks Phase**: Run `/agent tasks` to generate atomic, sequenced tasks for implementation
4. **Implementation**: Follow task ledger; implement test-first per phase
5. **Handoff**: Document in CLAUDE.md; provide animation timing values and responsive sizing tables

---

## Checklist Before Tasks Phase

- [x] plan.md written and complete
- [x] Technical context clearly defined (Astro 6, no new deps, frontend-only)
- [x] Constitution compliance verified (all 9 principles pass)
- [x] Project structure documented (component location, props, tests)
- [x] Phased delivery clear and sequenced (8 phases, P1 + P2)
- [x] Testing strategy includes test-first approach (49 acceptance criteria mapped to phases)
- [x] Key decisions documented with rationale
- [x] Dependencies and risks identified
- [x] Success metrics aligned with spec
- [x] Research & unknowns noted (see research.md)
- [ ] Ready for tasks phase (`/agent tasks`)
