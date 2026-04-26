# Research & Technical Decisions: Position Responsibilities Carousel

**Feature**: COA-88 — Add Position Responsibilities Carousel  
**Date**: 2026-04-25

---

## Open Questions Resolved

### Q1: Should We Use 3D Coverflow or Simple Slide Transitions?

**Question**: The existing HeroCircularCarousel uses CSS 3D perspective for a coverflow effect. Should position carousel use the same approach?

**Research**:
- HeroCircularCarousel uses 3D transforms with individual perspective() in slide transform property (avoids preserve-3d flattening issues)
- Coverflow is impressive visually but adds complexity for marginal UX benefit
- Position images are educational cards, not hero showcase
- Mobile browsers may have performance variability with 3D transforms
- Simpler opacity-based transitions are easier to test and maintain

**Decision**: **Simple slide transitions (opacity + translate)**

**Rationale**:
- Consistent with ResourceCard and modal patterns (no 3D effects)
- Better performance on mobile (no 3D transform overhead)
- Easier to test (no complex animation states)
- Still visually smooth (0.3s fade + slide transition)
- Accessible: prefers-reduced-motion easily supported
- Can upgrade to 3D coverflow in future if needed

**Trade-off**: Less visually impressive than coverflow, but simpler and more reliable.

---

### Q2: What Should the Auto-Advance Interval Be?

**Question**: 8 seconds (per spec) or another value?

**Research**:
- Typical carousel dwell times: 3–5s (fast), 5–8s (standard), 8–10s (leisurely)
- HeroCircularCarousel uses 8s by default
- User expectation: enough time to read position label + responsibilities
- Too fast (< 5s): rushed, disorienting
- Too slow (> 10s): feels sluggish, users may abandon
- 8s aligns with HeroCircularCarousel precedent in codebase

**Decision**: **8 seconds (per spec)**

**Rationale**:
- Matches existing carousel pattern
- User-friendly dwell time
- Spec requirement confirmed this decision
- Easily adjustable if needed

**Future**: Could add user preference (settings) to control dwell time.

---

### Q3: Should the Modal Use Existing ResourceModal or Custom Modal?

**Question**: Reuse ResourceModal pattern or build bespoke modal wrapper?

**Research**:
- Existing ResourceModal in codebase already has:
  - Focus trap (Tab/Shift+Tab)
  - Close button + backdrop click + Escape handling
  - Focus return to trigger element
  - Accessibility attributes (role=dialog, aria-modal, aria-labelledby)
  - Smooth open/close animations
  - Mobile responsiveness
- Creating custom modal duplicates all this logic
- Pattern already tested and proven in production

**Decision**: **Reuse ResourceModal pattern**

**Rationale**:
- Principle IX: Cross-Feature Consistency
- Reduces code duplication
- Proven focus management and a11y
- Consistent UX with other resource features
- Faster implementation

**Note**: Will create lightweight PositionResponsibilitiesModal wrapper that delegates to ResourceModal logic.

---

### Q4: Should We Support Touch Swipe Gestures on Mobile?

**Question**: Add swipe left/right to advance carousel on mobile?

**Research**:
- Swipe is intuitive on mobile but non-standard in some contexts
- Spec lists as "nice-to-have" (not required)
- Implementation complexity: ~50 lines of touchstart/touchend listeners
- Risk: Accidental swipes triggering navigation
- Buttons + keyboard arrows are sufficient
- Can add in future release without breaking changes

**Decision**: **Defer to Phase 2 / future release**

**Rationale**:
- Not a P1 requirement
- Reduces MVP complexity
- Buttons are always visible and accessible
- Keyboard arrows work on mobile browsers (with software keyboard)
- Lower priority than core carousel functionality
- Implement if user feedback demands it

**Future**: Add touch gesture support post-launch if usage data shows demand.

---

### Q5: Should Carousel State Persist When Modal Closes and Reopens?

**Question**: When user closes modal and clicks card again, should carousel remember the last slide position or reset to first?

**Research**:
- Carousel is state-of-the-art in many UI libraries (Vue, React)
- Spec doesn't explicitly define behavior
- Common patterns:
  1. Reset to first slide on reopen (stateless)
  2. Remember last position (stateful)
- Stateless (reset) is simpler: user always sees first image
- Stateful (remember) could be confusing: user returns to mid-carousel

**Decision**: **Reset to first slide on reopen (stateless)**

**Rationale**:
- Simpler implementation
- Predictable UX: every open starts fresh
- Matches user expectation (like any other carousel reset)
- Less state to manage
- Aligns with modal closing = cleanup paradigm

**Implementation**: Carousel component resets index to 0 on mount, timer on unmount.

---

### Q6: How Should Image Load Failures Be Handled?

**Question**: If a position image fails to load, what fallback should show?

**Research**:
- Spec requires NFR-010: graceful fallback for missing images
- Options:
  1. Show error message + link to download image
  2. Show placeholder image with tooltip
  3. Hide slide entirely
  4. Display alt text only (no image)
- Approach 1 (error + link) is most user-friendly
- Approach 4 (alt text) is good a11y fallback

**Decision**: **Show error message + link + alt text, keep modal dismissible**

**Rationale**:
- User is informed (not silently failing)
- Can still navigate carousel (other images may load)
- Modal always closeable (focus on usability)
- Aligns with ResourceModal image error pattern

**Implementation**:
```
<div class="fallback-message">
  <p>Image could not be loaded</p>
  <p><strong>{alt}</strong></p>
  <a href={src} target="_blank">Open image directly</a>
</div>
```

---

### Q7: Should Carousel Support Infinite Loop or Stop at End?

**Question**: Should carousel wrap around (last → first) or stop?

**Research**:
- Spec explicitly requires wrapping: AC-6 & AC-7
- "Last → Next = First", "First → Prev = Last"
- Wrapping is expected behavior for carousels
- No infinite scroll needed (exactly 6 items)

**Decision**: **Wrap around (infinite loop)**

**Rationale**:
- Spec requirement (AC-6, AC-7)
- Standard carousel behavior
- Better UX than stopping at end

**Implementation**: Use modulo arithmetic:
```typescript
const nextIndex = (currentIndex + 1) % POSITION_IMAGES.length;
const prevIndex = (currentIndex - 1 + POSITION_IMAGES.length) % POSITION_IMAGES.length;
```

---

### Q8: Should Auto-Advance Continue if User Leaves Browser Tab?

**Question**: If user switches to another tab, should carousel timer keep running (burning CPU) or pause?

**Research**:
- Spec doesn't explicitly address this
- Best practice: pause on visibility change (Page Visibility API)
- Saves battery on mobile
- Prevents unnecessary CPU usage
- User won't see animation anyway

**Decision**: **Pause auto-advance when tab is hidden**

**Rationale**:
- Performance optimization
- Battery efficiency on mobile
- No UX impact (user doesn't see it)

**Implementation**:
```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAutoAdvance();
  } else if (autoAdvanceEnabled) {
    startAutoAdvance();
  }
});
```

---

### Q9: Should There Be Visual Indicators (Dots/Counter)?

**Question**: Show current slide position visually (dots, number counter)?

**Research**:
- Spec doesn't require indicators
- HeroCircularCarousel includes both dots and logo counter
- Options:
  1. No indicators (current)
  2. Dots below carousel (6 dots)
  3. Slide counter ("1 of 6")
  4. Both
- Indicators add visual complexity but aid navigation
- Buttons + auto-advance make indicators less critical

**Decision**: **No indicators in MVP (add if needed)**

**Rationale**:
- Spec doesn't require them
- Buttons are clear enough (3 buttons: prev, image, next)
- Auto-advance makes position obvious
- Can add dots in Phase 2 if UX testing shows demand

**Future**: Could add optional indicator dots (non-intrusive) post-launch.

---

### Q10: How Should Keyboard Focus Be Managed in Carousel?

**Question**: Where should focus trap be? Close button? Buttons? Image?

**Research**:
- Spec requires NFR-005: focus trap within modal
- Focusable elements: close button, prev button, next button
- Image should not be focusable (background content)
- Tab cycle should be: close → prev → next → close (or reverse with Shift+Tab)
- WCAG 2.1 requires focus trap in modal

**Decision**: **Focus trap includes close button + navigation buttons only**

**Rationale**:
- Image is not interactive (no focus needed)
- Buttons are only interactive elements
- Simpler focus order
- Clear focus path

**Implementation**:
```typescript
const FOCUSABLE = 'button[aria-label*="Close"], button[aria-label*="Next"], button[aria-label*="Prev"]';

function trapFocus(event) {
  if (event.key !== 'Tab' || modal.hidden) return;
  
  const nodes = Array.from(modal.querySelectorAll(FOCUSABLE));
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
```

---

## Alternative Approaches Considered

### Alternative 1: Server-Side Position Data

**Approach**: Store positions in database, fetch via API

**Pros**:
- Dynamic updates without redeployment
- Audit trail of changes
- Could support user roles/permissions

**Cons**:
- Added API latency
- Database schema complexity
- Overkill for static data
- Violates Principle III (backend authority) — positions are static, not inferred

**Decision**: **Rejected** — Static data in MVP is correct. Can migrate to API in future if needed.

---

### Alternative 2: Slider Library (Swiper, Splide, etc.)

**Approach**: Use third-party carousel library

**Pros**:
- Feature-complete (touch, drag, etc.)
- Battle-tested
- Accessibility built-in

**Cons**:
- Adds ~20–40 KB to bundle
- New dependency to maintain
- Learning curve
- Violates Principle VIII (dependency hygiene)
- Overkill for 6 simple slides

**Decision**: **Rejected** — Custom implementation keeps bundle lean. HeroCircularCarousel is good reference.

---

### Alternative 3: Auto-Advance Only (No Manual Navigation)

**Approach**: Remove prev/next buttons, let carousel auto-advance only

**Pros**:
- Simpler UI
- No user confusion
- Beautiful autopilot effect

**Cons**:
- Violates Principle I (user outcomes) — users may want to revisit specific position
- Missing AC-4, AC-5 (prev/next buttons)
- Less interactive
- Poor for accessibility (keyboard users can't navigate)

**Decision**: **Rejected** — Spec requires manual navigation.

---

### Alternative 4: Carousel in Page (No Modal)

**Approach**: Embed carousel directly on coaching resources page instead of modal

**Pros**:
- Always visible (no click needed)
- SEO-friendly
- No modal complexity

**Cons**:
- Takes up significant page real estate (6 large images)
- Page becomes cluttered
- Violates resource card design pattern
- Modal provides contained, focused experience

**Decision**: **Rejected** — Modal pattern is correct. Card + modal matches existing resource pattern.

---

## Technology Stack Validation

### Astro 5
- Latest stable version (project is using 5.x)
- Full TypeScript support
- Client-side component hydration when needed
- Good for static + interactive content

### Tailwind CSS
- Already in use (project standard)
- Responsive utilities (mobile-first)
- No additional dependencies needed
- Easy to extend for carousel styles

### Vitest
- Already in use (project standard)
- Good for component testing
- Fast iteration
- Good for timing tests (carousel auto-advance)

### No New Dependencies
- Zero additions to package.json
- Reduces security risk
- Smaller bundle
- Follows Principle VIII

---

## Performance Considerations

### Animation Performance
- Simple CSS transitions (opacity + translate)
- GPU-accelerated (will-change: transform)
- 60fps target achievable
- prefers-reduced-motion respected

### Image Optimization
- Lazy load non-active slides
- Responsive image srcset (if needed in future)
- PNG compression recommended
- Total payload: ~1.2 MB (6 images, ~200 KB each)

### JavaScript Footprint
- Minimal (auto-advance timer, click handlers)
- No heavy libraries
- Event delegation where possible
- Clean up timers on modal close (no memory leaks)

---

## Accessibility Deep Dive

### WCAG 2.1 AA Compliance

| Standard | Implementation | Status |
|----------|---|---|
| **1.1.1 Non-text Content** | Alt text on all images | ✅ In spec |
| **2.1.1 Keyboard** | All functionality keyboard-accessible (arrows, Tab, Escape) | ✅ In spec |
| **2.1.2 No Keyboard Trap** | Focus trap within modal only; can escape with Escape/click | ✅ In spec |
| **2.4.3 Focus Order** | Logical focus order (close → prev → next) | ✅ In spec |
| **2.4.7 Visible Focus** | All buttons have focus indicators | ✅ In spec |
| **3.2.1 On Focus** | No unexpected context switches on focus | ✅ By design |
| **4.1.2 Name, Role, Value** | aria-labels, role=dialog, aria-modal | ✅ In spec |
| **4.1.3 Status Messages** | Slide count can be announced (alt text) | ✅ In spec |

### Color Contrast
- Buttons should have 4.5:1 contrast with background (WCAG AA)
- Will verify in visual testing phase

### Focus Indicators
- Buttons: visible outline (focus:ring-2 focus:ring-brand-purple)
- 44×44px minimum tap targets (mobile)
- No invisible focus traps

---

## Future Extensibility

### Phase 2 Enhancements
1. **Touch swipe gestures** (left/right = prev/next)
2. **Indicator dots** (show current slide visually)
3. **Slide counter** ("2 of 6")
4. **Keyboard shortcuts** (Home = first slide, End = last slide)
5. **Analytics logging** (track navigation events)

### Phase 3+ Enhancements
1. **Server-side position data** (if needed)
2. **3D coverflow** (if performance improves)
3. **Carousel reuse** (apply to other carousels in app)
4. **Drag gestures** (mouse drag = slide)

---

## Testing Strategy Validation

### Why Test-First?
- Carousel timing is critical (8-second auto-advance)
- Modal focus trap is complex (user accessibility)
- Keyboard navigation edge cases (wrap-around)
- Mobile responsiveness across many devices

### Test Categories
1. **Unit**: Data structures, position wrapping logic
2. **Integration**: Modal lifecycle, carousel rendering, image loading
3. **Accessibility**: Focus management, keyboard navigation, ARIA attributes
4. **Visual/Responsive**: Manual testing on DevTools emulation (320px, 768px, 1440px)
5. **Performance**: Animation smoothness (60fps), no memory leaks

### Vitest Suitability
- Async/await support for timing tests
- Mock timers (`vi.useFakeTimers()`) for auto-advance testing
- Component mounting utilities
- Good for accessibility testing (DOM queries, ARIA)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|---|---|---|
| Image files not provided | Medium | High | Ask for assets early; provide fallback |
| Auto-advance timing feels off | Low | Medium | Test with users; easily adjustable |
| Modal focus trap broken on old browsers | Low | Medium | Test on IE 11, Safari 12+ |
| Touch gestures needed (deferred) | Medium | Low | Can add in Phase 2 |
| Performance issues on slow mobile | Low | Medium | Profile animations; simplify if needed |
| Keyboard focus lost during animation | Low | High | Thorough keyboard testing |

---

## Decision Log

| Decision | Date | Rationale | Owner |
|----------|------|-----------|-------|
| Simple slide transitions (no 3D) | 2026-04-25 | Simpler, better mobile performance | Plan Agent |
| 8-second auto-advance interval | 2026-04-25 | Matches spec & HeroCircularCarousel | Spec |
| Reuse ResourceModal pattern | 2026-04-25 | DRY, proven a11y | Plan Agent |
| No touch swipe gestures (MVP) | 2026-04-25 | Not required; can add later | Plan Agent |
| Reset carousel on reopen | 2026-04-25 | Simpler, more predictable | Plan Agent |
| Graceful image load fallback | 2026-04-25 | User-friendly, accessible | Plan Agent |
| No carousel indicators (MVP) | 2026-04-25 | Not required; add if needed | Plan Agent |
| Static TypeScript data | 2026-04-25 | Simpler, aligned with Principle III | Plan Agent |

---

## Conclusion

**No major technical blockers** identified. All key decisions support the spec requirements and constitution principles.

The MVP is achievable in 6–7 days (phased approach) with high quality and full accessibility compliance.

Future enhancements (swipe, indicators, server data) are straightforward additions that don't require architectural changes.

---

**Prepared by**: Claude Code Plan Agent  
**Date**: 2026-04-25
