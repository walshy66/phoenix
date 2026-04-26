# Implementation Plan: Add Position Responsibilities Carousel

**Branch**: `cameronwalsh/coa-88-add-coaching-resources`  
**Date**: 2026-04-25  
**Spec**: `/specs/coa-88-add-coaching-resources/spec.md`  
**Priority**: P1

---

## Summary

Add a "Position Responsibilities" resource card to the coaching resources page that launches a carousel modal displaying 6 position responsibility images. The carousel auto-rotates every 8 seconds with manual navigation via prev/next buttons, keyboard arrows, and mouse drag (nice-to-have). This feature requires no server-side code and leverages existing Astro component patterns (ResourceCard, ResourceModal, and carousel lifecycle).

---

## Technical Context

- **Language/Framework**: Astro 5.x (frontend framework) with TypeScript
- **UI Toolkit**: Tailwind CSS (utility-first styling)
- **Component Model**: Astro components with embedded client-side scripts
- **Node Version**: 22.12.0+
- **Storage**: Static assets only (no database changes required)
- **Testing Framework**: Vitest (component tests in `__tests__/` directories)
- **Target Platform**: Web (responsive: 320px mobile to 1440px+ desktop)
- **Performance Goals**: 60fps carousel animations, <200ms modal open/close transitions
- **Scale**: Single feature module, zero API calls or server mutations

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I: User Outcomes First** | ✅ PASS | Clear measurable outcomes: modal opens, carousel rotates, navigation works. Success = users see position images and can navigate them. |
| **II: Test-First Discipline** | ✅ PASS | All 15 acceptance criteria are testable and observable. Tests will validate user interactions (clicks, keyboard, timer-driven auto-advance), not just code coverage. |
| **III: Backend Authority & Invariants** | ✅ PASS | Position data is static frontend JSON; no server-side mutations or inference. Client-side carousel state (index, timer) is ephemeral and non-critical. |
| **IV: Error Semantics & Observability** | ✅ PASS | Spec includes fallback UI for missing/broken images (NFR-010). No structured errors needed as this is a pure UI feature with graceful degradation. |
| **V: AppShell Integrity** | ✅ PASS | Modal uses existing ResourceModal pattern. Navigation remains unchanged. Overlay respects z-index and focus management. |
| **VI: Accessibility First** | ✅ PASS | Comprehensive accessibility built-in: keyboard navigation (arrows, Tab, Escape), ARIA labels, focus traps, 44×44px tap targets, alt text. |
| **VII: Immutable Data Flow** | ✅ PASS | Carousel state (current index, timer) is unidirectional: props → state → view. No mutations of position data. |
| **VIII: Dependency Hygiene** | ✅ PASS | Zero new dependencies. Reuses existing Astro, Tailwind, and component patterns. No third-party carousel library. |
| **IX: Cross-Feature Consistency** | ✅ PASS | Follows established patterns: ResourceCard trigger pattern, ResourceModal wrapper, carousel timing similar to HeroCircularCarousel. |

**No constitutional violations detected.** Feature aligns with all principles.

---

## Project Structure

```
src/
├── components/
│   ├── PositionResponsibilitiesCarousel.astro    (NEW — carousel component)
│   ├── PositionResponsibilitiesModal.astro       (NEW — modal wrapper)
│   ├── __tests__/
│   │   ├── PositionResponsibilitiesCarousel.test.ts         (carousel logic)
│   │   ├── PositionResponsibilitiesCarousel.accessibility.test.ts (a11y)
│   │   ├── PositionResponsibilitiesCarousel.animation.test.ts    (timing)
│   │   ├── PositionResponsibilitiesCarousel.keyboard.test.ts (arrows, Escape)
│   │   ├── PositionResponsibilitiesCarousel.responsive.test.ts   (mobile/desktop)
│   │   └── PositionResponsibilitiesModal.test.ts            (modal lifecycle)
│
├── pages/
│   └── coaching-resources.astro                  (MODIFIED — add Position card)
│
├── lib/
│   └── position-data.ts                          (NEW — position image data)
│
public/images/
└── positions/                                    (NEW directory)
    ├── roles-point-guard.png
    ├── roles-shooting-guard.png
    ├── roles-small-forward.png
    ├── roles-power-forward.png
    ├── roles-center.png
    └── roles-coach.png

specs/coa-88-add-coaching-resources/
├── spec.md        (requirements)
├── plan.md        (this file)
├── data-model.md  (position data structure)
└── research.md    (alternative approaches, decisions)
```

---

## Data Model

### Position Responsibilities Data

No database changes required. Static position data will be defined as a TypeScript constant:

```typescript
// src/lib/position-data.ts
export interface PositionImage {
  id: string;              // e.g., "point-guard"
  label: string;           // e.g., "Point Guard"
  alt: string;             // Full descriptive text for screen readers
  src: string;             // e.g., "/images/positions/roles-point-guard.png"
}

export const POSITION_IMAGES: PositionImage[] = [
  {
    id: 'point-guard',
    label: 'Point Guard',
    alt: 'Point Guard: Controls the game, initiates offense, excellent ball-handling and court vision, primary playmaker.',
    src: '/images/positions/roles-point-guard.png',
  },
  {
    id: 'shooting-guard',
    label: 'Shooting Guard',
    alt: 'Shooting Guard: Reliable shooter, strong off-ball movement, excellent 3-point range, defensive versatility.',
    src: '/images/positions/roles-shooting-guard.png',
  },
  {
    id: 'small-forward',
    label: 'Small Forward',
    alt: 'Small Forward: Versatile player, strong on both ends, can shoot mid-range and 3-pointers, athletic defender.',
    src: '/images/positions/roles-small-forward.png',
  },
  {
    id: 'power-forward',
    label: 'Power Forward',
    alt: 'Power Forward: Paint presence, strong rebounder, low-post scorer, physical defender, pick-and-pop game.',
    src: '/images/positions/roles-power-forward.png',
  },
  {
    id: 'center',
    label: 'Center',
    alt: 'Center: Dominant in the paint, shot-blocker, rebounder, sets screens, protects rim on defense.',
    src: '/images/positions/roles-center.png',
  },
  {
    id: 'coach',
    label: 'Coach',
    alt: 'Coach: Game strategy, player development, team leadership, training fundamentals, tactical adjustments.',
    src: '/images/positions/roles-coach.png',
  },
];
```

### Data Flow

1. Static data imported into carousel component
2. Component maps position images to carousel slides (no mutations)
3. User interactions (clicks, keyboard) update client-side state (index, timer)
4. State changes trigger view updates (Astro reactivity)
5. Modal closes → state discarded, carousel stops

---

## Component Architecture

### PositionResponsibilitiesCarousel.astro

**Responsibility**: Carousel slide management, auto-advance timer, navigation logic

**Props**:
- `autoAdvanceMs?: number` — interval between slides (default: 8000ms)
- `autoAdvanceEnabled?: boolean` — start carousel in auto-play mode (default: true)

**State (client-side)**:
- `currentIndex: number` — active slide (0–5)
- `autoAdvanceTimer: NodeJS.Timeout | null` — reference to setTimeout
- `isAnimating: boolean` — debounce rapid clicks

**Methods**:
- `advance(index: number)` — move to specific slide, reset timer
- `next()` / `prev()` — navigate with wrapping
- `startAutoAdvance()` — begin 8-second interval
- `stopAutoAdvance()` — clear timer (called on modal close)

**HTML Structure**:
```
carousel-container
├── carousel-slide (data-index=0, data-slot=0) [ACTIVE]
│   └── img (role-image alt text, loading=lazy)
├── carousel-slide (data-index=1, data-slot=1)
│   └── img
├── ... (slides 2–5)
├── button.carousel-prev (aria-label="Previous position")
├── button.carousel-next (aria-label="Next position")
└── div.carousel-indicators (optional: dots or counter)
```

**CSS Approach**:
- No CSS 3D transforms (avoid preserve-3d flattening issues per HeroCircularCarousel pattern)
- Simple opacity + translate for slide transitions
- Mobile-first responsive: smaller images on 320px, larger on 768px+
- Animation: `transition: opacity 0.3s, transform 0.3s` (smooth 60fps)
- `prefers-reduced-motion: reduce` respected

### PositionResponsibilitiesModal.astro

**Responsibility**: Modal wrapper, lifecycle (open/close), focus management, backdrop

**Reuses existing pattern** from ResourceModal.astro:
- Fixed overlay (z-50+) with dark backdrop (bg-black/60)
- Close button (top-right, 44×44px minimum)
- Escape key closes modal
- Backdrop click closes modal
- Focus trap keeps Tab within modal (close button, nav buttons)
- Focus returns to trigger card on close

**HTML Structure**:
```
modal (role=dialog, aria-modal=true, aria-labelledby=modal-title)
├── backdrop (click to close)
└── modal-content
    ├── header
    │   ├── h2 (id=modal-title) "Position Responsibilities"
    │   └── button.close-btn (aria-label="Close modal")
    └── carousel (PositionResponsibilitiesCarousel)
```

---

## Component Integration

### Modified: src/pages/coaching-resources.astro

**Change**: Add "Position Responsibilities" card to resources array

```typescript
const resources = [
  {
    title: 'U12 Defensive Fundamentals',
    // ... existing
  },
  // ... other resources
  {
    title: 'Position Responsibilities',
    description: 'Visual guide to the key responsibilities and skills needed for each court position and coaching role.',
    category: 'Fundamentals',
    ageGroup: 'All Ages',
    type: 'image' as const,
    url: '#',  // Trigger for modal instead of link
    thumbnail: '/images/positions/roles-point-guard.png',  // Preview image
    isModal: true,  // New flag to indicate modal trigger
  },
];
```

**Change**: Add event listener to launch modal:

```typescript
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const positionCard = document.querySelector('[data-modal-trigger="position-responsibilities"]');
    if (positionCard) {
      positionCard.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('position-modal');
        if (modal?.openModal) {
          modal.openModal(triggerEl);
        }
      });
    }
  });
</script>
```

---

## Testing Strategy

### Test Coverage Map

| Feature | Test Type | File |
|---------|-----------|------|
| **Auto-Advance Timing** | Integration | `PositionResponsibilitiesCarousel.animation-timing.test.ts` |
| **Next/Prev Navigation** | Unit | `PositionResponsibilitiesCarousel.test.ts` |
| **Wrapping (wrap-around)** | Unit | `PositionResponsibilitiesCarousel.test.ts` |
| **Keyboard Arrows** | Integration | `PositionResponsibilitiesCarousel.keyboard.test.ts` |
| **Keyboard Escape** | Integration | `PositionResponsibilitiesModal.test.ts` |
| **Focus Management** | Accessibility | `PositionResponsibilitiesCarousel.accessibility.test.ts` |
| **Focus Trap (Tab)** | Accessibility | `PositionResponsibilitiesModal.test.ts` |
| **Image Loading & Fallback** | Integration | `PositionResponsibilitiesCarousel.test.ts` |
| **Responsive Layout (mobile)** | Visual/Integration | `PositionResponsibilitiesCarousel.responsive.test.ts` |
| **Responsive Layout (desktop)** | Visual/Integration | `PositionResponsibilitiesCarousel.responsive.test.ts` |
| **Modal Open/Close** | Integration | `PositionResponsibilitiesModal.test.ts` |
| **Backdrop Click Closes Modal** | Integration | `PositionResponsibilitiesModal.test.ts` |
| **ARIA Labels** | Accessibility | `PositionResponsibilitiesCarousel.accessibility.test.ts` |
| **Tap Targets (44×44px)** | Accessibility | `PositionResponsibilitiesCarousel.responsive.test.ts` |

### Test-First Approach

1. **Write failing tests** for each acceptance criterion
2. **Implement component** to pass tests
3. **Verify animations** with visual inspection in browser
4. **Check accessibility** with axe-core and keyboard navigation
5. **Test on mobile** (DevTools device emulation 320px–480px)
6. **Test on desktop** (768px and 1440px viewports)

### Key Test Scenarios

#### Carousel Auto-Advance
```typescript
test('carousel auto-advances every 8 seconds', async () => {
  // Mount carousel with 6 slides
  // Wait 8s
  // Assert slide index incremented
  // Assert timer running
});

test('auto-advance timer resets on manual navigation', async () => {
  // Mount carousel
  // Click next button at 5s
  // Assert index advanced immediately
  // Assert timer reset (not firing at 8s from start)
});
```

#### Modal Lifecycle
```typescript
test('modal opens and closes cleanly', async () => {
  // Click Position Responsibilities card
  // Assert modal visible
  // Assert carousel rendered
  // Click close button
  // Assert modal hidden
  // Assert carousel timer stopped
});

test('focus returns to card after modal closes', async () => {
  // Click card → modal opens
  // Click close
  // Assert focus === card element
});
```

#### Keyboard Navigation
```typescript
test('arrow keys navigate carousel', async () => {
  // Modal open, carousel focused
  // Press right arrow
  // Assert slide advances
  // Press left arrow
  // Assert slide goes back
});

test('Escape key closes modal', async () => {
  // Modal open
  // Press Escape
  // Assert modal hidden
  // Assert focus returned
});
```

#### Accessibility
```typescript
test('all buttons have aria-labels', async () => {
  // Assert prev button has aria-label
  // Assert next button has aria-label
  // Assert close button has aria-label
});

test('focus trap keeps Tab within modal', async () => {
  // Modal open, focus on close button
  // Press Tab
  // Assert focus moves to next button or prev button (not body)
  // Press Shift+Tab
  // Assert focus cycles back
});
```

---

## Phased Delivery

### Phase 1: Foundation & Data Setup
**Goal**: Static position data and component scaffolding  
**Duration**: 1 day

- Create `/src/lib/position-data.ts` with POSITION_IMAGES array
- Create image asset directory: `/public/images/positions/`
- Create empty component stubs:
  - `PositionResponsibilitiesCarousel.astro`
  - `PositionResponsibilitiesModal.astro`
- Create test file stubs (failing tests)

**Deliverables**:
- Position data constant defined
- Test files stubbed with failing assertions
- Asset directory ready for image files

---

### Phase 2: Modal & Lifecycle
**Goal**: Modal wrapper with open/close/focus management  
**Duration**: 1 day

- Implement `PositionResponsibilitiesModal.astro`
  - Markup: dialog role, header, close button
  - Close button click handler
  - Backdrop click handler
  - Escape key listener
  - Focus trap implementation (Tab/Shift+Tab)
  - Focus return on close
- Write tests for modal lifecycle and accessibility
- Add modal trigger to `coaching-resources.astro`

**Deliverables**:
- Modal opens/closes via button, backdrop, Escape
- Focus management working
- Integration tests passing

---

### Phase 3: Carousel Logic
**Goal**: Slide navigation, auto-advance timer, state management  
**Duration**: 1.5 days

- Implement `PositionResponsibilitiesCarousel.astro`
  - Render carousel slides from position data
  - Next/Prev button handlers
  - Wrapping logic (last → first, first → last)
  - Auto-advance timer (8-second interval)
  - Timer reset on manual navigation
  - Timer stop on modal close
- Write tests for auto-advance, navigation, wrapping
- Manual testing: verify smooth 60fps animations

**Deliverables**:
- Carousel navigates correctly
- Auto-advance works (8-second interval)
- Tests for auto-advance timing and navigation passing
- Animations smooth in browser

---

### Phase 4: Keyboard Navigation & Accessibility
**Goal**: Arrow keys, Tab, and ARIA compliance  
**Duration**: 1 day

- Add keyboard listeners (arrows, Escape)
  - Right arrow → next slide
  - Left arrow → prev slide
  - Escape → close modal
- Add ARIA attributes:
  - Button aria-labels
  - Modal aria-labelledby
  - Carousel aria-roledescription
  - Image alt text
- Add focus indicators (visible on buttons)
- Write accessibility tests

**Deliverables**:
- Keyboard navigation working
- ARIA labels in place
- Accessibility tests passing
- Focus indicators visible

---

### Phase 5: Responsive Design & Mobile
**Goal**: Mobile (320px) and desktop (768px+) layouts  
**Duration**: 1.5 days

- Style carousel for mobile:
  - Smaller image size
  - Larger button tap targets (44×44px minimum)
  - Stack buttons below image on ultra-small screens
  - Responsive font sizes
- Style carousel for desktop:
  - Larger image display
  - Side-by-side buttons
  - Proportional spacing
- Test on DevTools emulation:
  - iPhone 12 (390px)
  - iPad (768px)
  - Desktop (1440px)
- Write responsive tests

**Deliverables**:
- Mobile and desktop layouts tested
- Tap targets meet 44×44px minimum
- Responsive tests passing
- Visual inspection on multiple devices

---

### Phase 6: Error Handling & Fallbacks
**Goal**: Graceful degradation for missing/broken images  
**Duration**: 0.75 days

- Image load error handler:
  - Detect failed image load
  - Display fallback message (e.g., "Image unavailable")
  - Prevent carousel crash
  - Allow modal to close normally
- Test image load failures

**Deliverables**:
- Fallback UI working
- Error handling tests passing
- Modal remains dismissible even if image fails

---

### Phase 7: Polish & Documentation
**Goal**: Final testing, documentation, code review  
**Duration**: 1 day

- Browser testing across devices
- Accessibility audit (axe-core)
- Performance profiling (animations, modal render)
- Code review checklist
- Create API documentation (component props)
- Update spec.md if needed

**Deliverables**:
- All acceptance criteria passing
- No accessibility violations
- Performance meets goals (60fps, <200ms transitions)
- Documentation complete

---

## Testing Checklist

### Acceptance Criteria (15 items from spec)

- [ ] **AC-1**: Card displays on coaching resources page
- [ ] **AC-2**: Click card opens modal (no layout shift)
- [ ] **AC-3**: Auto-advance after 8 seconds
- [ ] **AC-4**: Click Next advances + resets timer
- [ ] **AC-5**: Click Prev advances + resets timer
- [ ] **AC-6**: Next from last wraps to first
- [ ] **AC-7**: Prev from first wraps to last
- [ ] **AC-8**: Right arrow key navigates next
- [ ] **AC-9**: Left arrow key navigates prev
- [ ] **AC-10**: Escape key closes modal
- [ ] **AC-11**: Close button closes modal
- [ ] **AC-12**: Backdrop click closes modal
- [ ] **AC-13**: Tab focus trap (mobile & desktop)
- [ ] **AC-14**: Mobile responsive (320–480px)
- [ ] **AC-15**: Desktop responsive (768px+)

### Edge Cases

- [ ] Rapid next/prev clicks (debounced or queued)
- [ ] Modal close while carousel animating (timers cleaned up)
- [ ] Keyboard focus lost mid-interaction (arrows/Escape still work)
- [ ] Image load failure (fallback displays, modal dismissible)
- [ ] Browser prefers-reduced-motion (animations disabled)

### Accessibility

- [ ] All buttons have descriptive aria-labels
- [ ] Modal has role="dialog" and aria-modal="true"
- [ ] Modal title linked via aria-labelledby
- [ ] Images have appropriate alt text
- [ ] Focus visible on all interactive elements
- [ ] Tab focus trapped in modal
- [ ] Escape key closes modal
- [ ] Buttons are 44×44px minimum (mobile)
- [ ] Color contrast meets WCAG AA

### Performance

- [ ] Carousel animations smooth (60fps, no jank)
- [ ] Modal open/close <200ms
- [ ] No memory leaks (timers cleaned up on close)
- [ ] Images lazy-loaded (non-active slides)

---

## Alternative Approaches Considered

See `research.md` for detailed exploration of:
1. **3D Coverflow vs. Simple Slide**: Why simple opacity-based transitions chosen (simpler, more compatible)
2. **Auto-Advance Timing**: Why 8 seconds chosen (user-friendly dwell time)
3. **Modal Integration**: Why ResourceModal pattern reused (consistency)
4. **Touch Gestures**: Why deferred to nice-to-have (complexity vs. value)

---

## Open Questions / Future Work

1. **Touch Swipe Gestures** (nice-to-have): Add swipe left/right on mobile to advance carousel
2. **Analytics Logging** (optional): Track carousel navigation events for usage insights
3. **Position Data Source**: If positions need server-side updates, move data to API endpoint
4. **Carousel Indicator Dots**: Optional visual indicator showing current slide count
5. **Keyboard Shortcuts**: Document in help or accessibility statement

---

## Deployment Notes

### Asset Requirements

Position responsibility images must be provided in:
```
/public/images/positions/
├── roles-point-guard.png          (600×800px recommended)
├── roles-shooting-guard.png
├── roles-small-forward.png
├── roles-power-forward.png
├── roles-center.png
└── roles-coach.png
```

**Image Requirements**:
- Format: PNG (transparent background preferred)
- Minimum size: 400×500px (scalable to 600×800px on desktop)
- Aspect ratio: ~3:4 portrait
- Compression: Optimized (use ImageOptim or similar)
- Accessibility: Each image must have clear, descriptive visual content

### Rollback Plan

If issues arise:
1. Remove Position Responsibilities card from `coaching-resources.astro`
2. Hide modal component with CSS (`display: none`)
3. No database rollback needed (no server-side changes)
4. Component code remains in repo for debugging

---

## Summary of Technical Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|-----------|
| **Static Position Data** | No server calls needed; positions are fixed. | If positions change, must deploy new version. |
| **Simple Slide Transitions** | Better compatibility; avoids CSS 3D flattening bugs. | Less visually impressive than coverflow. |
| **ResourceModal Pattern Reuse** | Consistent with existing modals; proven focus management. | Slightly less customized than bespoke modal. |
| **8-Second Auto-Advance** | User-friendly dwell time; matches HeroCircularCarousel pattern. | Some users may find too fast/slow; can be adjusted. |
| **No Swipe Gestures (MVP)** | Reduces complexity; keyboard + buttons sufficient. | Less intuitive on mobile; can add in future. |
| **TypeScript Position Data** | Type-safe, IDE autocomplete, easier refactoring. | Requires build step (already present). |
| **Vitest Unit + Integration Tests** | Already used in project; good coverage. | No E2E tests (can add later). |

---

## File Checklist

**Files to Create**:
- [ ] `src/components/PositionResponsibilitiesCarousel.astro`
- [ ] `src/components/PositionResponsibilitiesModal.astro`
- [ ] `src/lib/position-data.ts`
- [ ] `src/components/__tests__/PositionResponsibilitiesCarousel.test.ts`
- [ ] `src/components/__tests__/PositionResponsibilitiesCarousel.animation-timing.test.ts`
- [ ] `src/components/__tests__/PositionResponsibilitiesCarousel.accessibility.test.ts`
- [ ] `src/components/__tests__/PositionResponsibilitiesCarousel.keyboard.test.ts`
- [ ] `src/components/__tests__/PositionResponsibilitiesCarousel.responsive.test.ts`
- [ ] `src/components/__tests__/PositionResponsibilitiesModal.test.ts`
- [ ] `/public/images/positions/` (directory + 6 PNG files)

**Files to Modify**:
- [ ] `src/pages/coaching-resources.astro` (add card + event listener)

**Documentation**:
- [ ] `specs/coa-88-add-coaching-resources/plan.md` (this file)
- [ ] `specs/coa-88-add-coaching-resources/research.md`
- [ ] `specs/coa-88-add-coaching-resources/data-model.md`

---

## Next Steps

1. **Approve Plan**: Review technical decisions and phased delivery
2. **Prepare Assets**: Position responsibility images to `/public/images/positions/`
3. **Create Tasks**: Run tasks agent to generate atomic task list (task.md)
4. **Begin Implementation**: Start Phase 1 (data setup) with feature-development agent

---

## Key Dependencies

- **No new npm packages required**
- Existing: Astro 5, Tailwind CSS, Vitest, TypeScript

---

## Success Definition

This feature is complete when:
1. All 15 acceptance criteria pass in manual + automated testing
2. All 9 edge cases handled gracefully
3. WCAG 2.1 AA accessibility compliance verified
4. 60fps carousel animations confirmed in browser
5. Mobile (320px) and desktop (1440px) layouts responsive
6. Code follows established component patterns
7. Test coverage ≥ 90% on new components
8. Documentation complete and reviewed

---

**Prepared by**: Claude Code Plan Agent  
**Date**: 2026-04-25  
**Branch**: `cameronwalsh/coa-88-add-coaching-resources`
