# Research: Resource Filters Mobile UX (COA-74)

---

## Overview

This document captures research, technology decisions, and open design questions for COA-74 Resource Filters Mobile UX feature. All decisions are referenced in the main implementation plan.

---

## Key Technology Decisions

### 1. Carousel Implementation: Native HTML Scroll vs. JavaScript Library

**Question**: How should the resource tabs carousel be implemented?

**Options Considered**:

| Option | Pros | Cons | Recommendation |
|--------|------|------|-----------------|
| **Native HTML scroll** (div + overflow-x-auto) | Zero JS overhead, no dependencies, best performance on mobile, momentum scroll automatic on iOS | Less feature control, browser quirks on Android, visual indicators need CSS trick | ✅ CHOSEN |
| **JavaScript carousel library** (Swiper, Embla) | More features, consistent cross-browser, better affordances | Extra dependency, larger bundle, more complex, JS-based scroll janky on some devices | ❌ Too heavy for mobile |
| **React component** (react-carousel) | Familiar patterns in React | Overkill, adds build complexity, no React in Astro static pages | ❌ Not applicable |

**Decision**: Use native HTML `overflow-x-auto` with CSS `scroll-behavior: smooth` and `-webkit-overflow-scrolling: touch` for iOS momentum scroll.

**Rationale**:
- Astro is static-first; minimal JavaScript is preferred per Constitution Principle VIII (Dependency Hygiene)
- Existing carousel patterns in codebase (HeroCarousel, HeroCircularCarousel) use vanilla JS + CSS, not external libraries
- Performance is critical on mobile; native scroll is fastest
- Momentum scroll is automatic on iOS and Android (no custom handler needed)
- Scroll indicators can be added with CSS gradients (no JS)

**Implementation Reference**: `src/components/HeroCarousel.astro` uses similar scroll mechanics.

---

### 2. Filter State Persistence: sessionStorage vs. Component State vs. URL Params

**Question**: How should filter state survive page navigation (e.g., Coaching Resources → Player Resources → back to Coaching Resources)?

**Options Considered**:

| Option | Scope | Survives | Complexity | Recommendation |
|--------|-------|----------|-----------|-----------------|
| **Component instance state** | Page-level only | Page reload: No. Nav: No. | Low | ❌ Won't meet requirement |
| **sessionStorage** | Tab/session-level | Page reload: Yes. Nav: Yes. Session close: No. | Medium | ✅ CHOSEN |
| **localStorage** | Browser-wide | Page reload: Yes. Nav: Yes. Session close: Yes. | Medium | ⚠️ Persists too long |
| **URL query params** | URL-based | Page reload: Yes. Nav: Yes. Sharing: Yes. | High | ❌ Visible in URL, complexity |

**Decision**: Use `sessionStorage` with component state fallback.

**Rationale**:
- User Story 1, Scenario 6 requires: "navigate to Player Resources, return to Coaching Resources, filters still applied"
- sessionStorage survives page reload and navigation within the same tab
- Resets automatically when tab closes (no persistent data storage)
- Simpler than URL params; not visible to user
- Fallback to component state if sessionStorage unavailable (privacy browsing mode)

**Implementation**:
```typescript
// src/lib/resources/state.ts
const KEY_PREFIX = 'filters:';

export function getActiveFilters(section: ResourceSection): ActiveFilters {
  try {
    const stored = sessionStorage.getItem(`${KEY_PREFIX}${section}`);
    return stored ? JSON.parse(stored) : { age: [], category: [], skill: [] };
  } catch {
    // Fallback if sessionStorage unavailable
    return { age: [], category: [], skill: [] };
  }
}

export function setActiveFilters(section: ResourceSection, filters: ActiveFilters): void {
  try {
    sessionStorage.setItem(`${KEY_PREFIX}${section}`, JSON.stringify(filters));
  } catch {
    // Silent fail in private browsing; component state handles it
  }
}
```

---

### 3. Mobile Filter Panel Display: Modal Overlay vs. Collapsible Inline

**Question**: On mobile, should the filter panel be a modal overlay, collapsible inline section, or slide-in panel?

**Options Considered**:

| Option | Layout | Mobile UX | Implementation |
|--------|--------|-----------|-----------------|
| **Modal overlay** | Full-screen or partial overlay covering content | Explicit, focus trap, can feel jarring | z-index stacking, overlay backdrop |
| **Collapsible inline** | Inline section that expands/collapses within page flow | Pushes content down, less disruptive | CSS collapse animation, straightforward |
| **Slide-in panel** | Slides in from side or bottom, floats over content | Feels native, doesn't push content | transform + transition, smooth |

**Decision**: Collapsible inline section with smooth height transition.

**Rationale**:
- Simpler implementation (no z-index complexity, no backdrop)
- Matches spec wording: "slides/fades into view"
- Less disruptive to content (doesn't cover resources)
- Consistent with existing Astro component patterns
- Easier to test (no modal/backdrop logic)

**Implementation**:
```astro
<!-- On mobile: hidden initially, show with CSS class -->
<div id={`filter-panel-${section}`} 
     class="hidden md:flex transition-all duration-300 data-open:flex"
     data-filter-panel>
  <!-- Filter controls -->
</div>

<!-- Toggle button shows/hides panel -->
<button data-mobile-filter-toggle onclick="togglePanel()">Show filters</button>

<script is:inline>
  function togglePanel() {
    const panel = document.querySelector('[data-filter-panel]');
    panel?.classList.toggle('hidden');
  }
</script>
```

---

### 4. Touch Scroll Behavior: Smooth vs. Auto

**Question**: Should carousel scroll be smooth (`scroll-behavior: smooth`) or instant?

**Decision**: Use `scroll-behavior: smooth` with `-webkit-overflow-scrolling: touch` for iOS momentum scroll.

**Rationale**:
- Spec requires: "scroll momentum preserved on touch devices" (Acceptance Scenario 2)
- iOS: `-webkit-overflow-scrolling: touch` provides native momentum scroll
- Android Chrome: `scroll-behavior: smooth` provides smooth scrolling
- Fallback: iOS Safari 13+ supports `scroll-behavior: smooth` natively
- Performance: CSS-only, no JavaScript scroll handler

**Implementation**:
```css
.carousel-scroll-container {
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* iOS momentum scroll */
}
```

---

### 5. Scroll Indicators: CSS Gradient vs. JavaScript

**Question**: How should scroll position affordances (left/right edge indicators) be implemented?

**Options Considered**:

| Option | Visual | Implementation | Cross-browser |
|--------|--------|-----------------|----------------|
| **CSS gradient fade** | Smooth fade on edges | Linear gradients, ::before/::after pseudo-elements | Great (CSS gradients widely supported) |
| **Arrow icons** | Explicit arrows on edges, show/hide with JS | JavaScript + SVG or Unicode arrows | Good, requires JS |
| **Scroll shadows** | Shadow appears on scrollable edges | CSS box-shadow + scroll listener | Good, requires JS for show/hide |

**Decision**: CSS gradient fade on left/right edges.

**Rationale**:
- Zero JavaScript overhead (CSS-only)
- Smooth, modern appearance matching Tailwind aesthetic
- Spec requirement: "scroll indicators (e.g., gradient fade or arrow hints)" — gradient mentioned first
- Automatic (no JS to toggle visibility)
- Works on all browsers with CSS gradient support

**Implementation**:
```css
.carousel-scroll-container::before {
  content: '';
  position: sticky;
  left: 0;
  width: 24px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent);
  pointer-events: none;
  z-index: 10;
}

.carousel-scroll-container::after {
  content: '';
  position: sticky;
  right: 0;
  width: 24px;
  background: linear-gradient(to left, rgba(255, 255, 255, 0.8), transparent);
  pointer-events: none;
  z-index: 10;
}
```

---

### 6. Auto-Collapse Scroll Threshold: 100px

**Question**: At what scroll distance should the filter panel auto-collapse?

**Options Considered**:

| Threshold | Rationale | Tradeoff |
|-----------|-----------|----------|
| 50px | Aggressive, collapses quickly | May feel too sensitive, collapse during normal reading |
| **100px** | Balances discoverability vs. intent | Good threshold, prevents accidental collapse |
| 150px | Conservative, requires deliberate scroll | May leave panel open too long |
| Dynamic (25% viewport height) | Adaptive to screen size | More complex logic, harder to reason about |

**Decision**: 100px threshold.

**Rationale**:
- Spec explicitly states: "scroll down more than 100px" (Acceptance Scenario 2)
- Balances user intent: intentional scrolling, not just incidental finger movement
- Threshold is testable and reproducible across devices
- Not too aggressive (50px) or conservative (150px)

**Implementation**:
```javascript
const AUTO_COLLAPSE_THRESHOLD = 100; // pixels

resourceList.addEventListener('scroll', () => {
  const delta = resourceList.scrollTop - lastScrollY;
  if (delta > AUTO_COLLAPSE_THRESHOLD && panelIsOpen) {
    autoCollapsePanel();
  }
  lastScrollY = resourceList.scrollTop;
});
```

---

### 7. Auto-Collapse Animation Duration: 300ms

**Question**: How long should the auto-collapse animation take?

**Options Considered**:

| Duration | Feel | Performance | Recommendation |
|----------|------|-------------|-----------------|
| 150ms | Snappy, quick dismissal | Fast | Too abrupt |
| **300ms** | Smooth, noticeable but not slow | Smooth 60 FPS | ✅ CHOSEN |
| 500ms | Glacial, feels sluggish | Good but slow | Too slow for mobile |

**Decision**: 300ms.

**Rationale**:
- Spec explicitly requires: "300ms" (Functional Requirement FR-006)
- 300ms matches iOS standard animation durations (spring animations ~300ms)
- Achieves smooth 60 FPS on most devices (16.67ms × 18 frames)
- Feels natural and responsive on mobile

**Implementation**:
```css
[data-filter-panel] {
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  /* cubic-bezier matches Tailwind's default easing */
}
```

---

## Open Design Questions

### Question 1: P3 Scroll Re-Expansion Behavior

**Spec Status**: Acceptance Scenario 13 marked "TBD by Walshy"

**Problem**: When filter panel auto-collapses due to scroll, what happens when user scrolls back to top?

**Options**:

**Option A: Remain Collapsed Until User Taps Toggle** (RECOMMENDED)
- Panel stays closed after auto-collapse
- User must explicitly tap toggle to re-open
- Pros: Clear, predictable, user has explicit control
- Cons: Requires extra tap to check filters
```
User scrolls down → panel collapses
User scrolls back to top → panel stays collapsed
User taps "Show filters" → panel opens
```

**Option B: Auto-Expand When Scroll Back to Top**
- Panel auto-expands when scroll returns to top (within 100px)
- Pros: Convenient for quick filter adjustments
- Cons: May re-expand unintentionally during normal scrolling
```
User scrolls down → panel collapses
User scrolls back to top → panel auto-expands
```

**Option C: Hybrid - Expand Only on Upward Scroll Beyond Threshold**
- Panel expands if user scrolls UP significantly from collapse point
- Pros: More intentional than Option B
- Cons: Additional complexity
```
User scrolls down 200px → panel collapses
User scrolls up 200px → panel auto-expands
```

**Recommendation**: **Option A — Remain Collapsed Until User Taps Toggle**

**Rationale**:
- Simpler implementation (no scroll-up listener needed)
- More predictable UX (user has explicit control)
- Complies with WCAG guidance (don't auto-trigger without user intent)
- Easier to test and document
- Prevents accidental re-expansion during normal content browsing

**Action Required**: Confirm this decision with stakeholders before Phase 3 implementation. Document chosen behavior and rationale in PR.

---

### Question 2: Scroll Indicator Styling

**Problem**: Spec mentions "scroll indicators (gradient fade or arrow hints)" but doesn't prescribe exact design.

**Options**:

**Option A: Gradient Fade** (RECOMMENDED)
- Subtle linear gradients on left/right edges
- Fades from white to transparent
- Matches modern design patterns
- CSS-only implementation
- Example: ![gradient-fade](not-applicable)
```css
background: linear-gradient(to right, rgba(255,255,255,0.8), transparent);
```

**Option B: Arrow Hints**
- Small chevron or arrow icons on edges
- More explicit affordance
- Requires JavaScript to toggle visibility
- May look dated on modern mobile apps

**Option C: Scroll Shadows**
- Shadow appears on scrollable edges
- Indicates scrollable content
- Requires JavaScript scroll listener
- Browser support varies

**Recommendation**: **Option A — Gradient Fade**

**Rationale**:
- Matches design system (Tailwind aesthetic)
- Zero JavaScript overhead
- Modern, subtle affordance
- Consistent with existing Phoenix design language

**Action Required**: Confirm with design team that gradient fade matches brand aesthetic. If not, choose from Options B/C.

---

### Question 3: Filter State Validation

**Problem**: Should we validate filter values when loading from sessionStorage?

**Scenario**: User applies filter "U12", then browser tab remains open while resources are updated and "U12" is removed. User returns to the page; should "U12" remain in active filters?

**Options**:

**Option A: Keep Invalid Filters (Simpler)**
- Load filters from sessionStorage without validation
- Invalid filters are silently ignored (no matching resources)
- Pros: Simple, fast, handles data changes gracefully
- Cons: User sees "U12 active" but no matching resources
```typescript
// Just load and trust the data
const filters = getActiveFilters(section);
const results = filterResources(allResources, filters, '', section);
// If "U12" no longer exists, results will be empty
```

**Option B: Validate Against Available Filters (Safer)**
- Load filters from sessionStorage
- Validate each filter value against current available options
- Remove invalid filters
- Pros: Cleaner state, prevents confusion
- Cons: Requires additional logic, may surprise user
```typescript
const filters = getActiveFilters(section);
const available = getAvailableAgeGroups(section);
filters.age = filters.age.filter(age => available.includes(age));
```

**Recommendation**: **Option A — Keep Invalid Filters (Simpler)**

**Rationale**:
- Simpler implementation, fewer edge cases
- Invalid filters are naturally ignored (empty results state)
- If resources change, user can see "no results" and clear filters
- Spec doesn't mention validation requirement
- Aligns with immutable data flow (no inference of what's valid)

**Note**: Can be enhanced in future if needed; for MVP, simpler is better.

---

## Testing Strategy Decisions

### Unit vs. Integration vs. Manual Testing

**Decision**: Three-layer testing approach

| Layer | Tool | Coverage | When |
|-------|------|----------|------|
| **Unit** | Vitest | Filter state functions, component logic | During implementation |
| **Integration** | Vitest + real DOM | Filter state across navigation, filter grid updates | After each phase |
| **Manual** | Real devices (iOS/Android) | Touch gestures, scroll momentum, animations | Before each phase merge |

**Rationale**:
- Unit tests catch logic bugs early
- Integration tests verify wiring between components
- Manual tests on real devices catch mobile-specific issues (scroll performance, gesture recognition)

---

### Mobile Device Test Matrix

**Recommended Test Devices**:

| Device | Screen Size | OS | Rationale |
|--------|-------------|----|-----------| 
| iPhone SE | 375px × 667px | iOS 16+ | Small screen, common budget device |
| iPhone 13 | 390px × 844px | iOS 16+ | Standard size, majority of users |
| Samsung Galaxy A50 | 720px × 1560px | Android 12+ | Medium Android device, popular |
| Chrome DevTools | 375px, 768px | N/A | Desktop testing, breakpoint validation |

**Why These**:
- iPhone SE: Smallest common iPhone, tests edge cases
- iPhone 13: Most common size, representative
- Samsung Galaxy A50: Popular Android device, tests Android-specific scroll behavior
- Chrome DevTools: Quick testing of breakpoints and responsive behavior

---

## Performance Targets & Monitoring

### Performance Goals (from Spec)

| Metric | Target | Component | How to Measure |
|--------|--------|-----------|-----------------|
| Filter toggle response | < 100ms | FilterBar script | Time from click to visible panel movement |
| Carousel swipe response | < 50ms | Native scroll | Time from swipe to scroll movement |
| Auto-collapse animation | 300ms | CSS transition | Duration of slide-up animation |
| Filter grid update | < 100ms | filterResources() | Time from filter click to grid re-render |

### How to Monitor

- **Chrome DevTools**: Performance tab, record and measure timing
- **Manual Stopwatch**: Frame-by-frame slowmo video on iPhone/Android
- **Vitest Benchmarks**: (Optional) Add performance tests for filterResources()

---

## Browser Compatibility

### Targeted Browsers

| Browser | Min Version | Notes |
|---------|-------------|-------|
| iOS Safari | 13+ | CSS scroll-behavior, overflow-scrolling |
| Chrome Android | 60+ | CSS scroll-behavior, smooth scrolling |
| Firefox Mobile | 68+ | CSS scroll-behavior |
| Samsung Internet | 14+ | CSS scroll-behavior |

### Feature Fallbacks

- **CSS scroll-behavior**: Falls back to instant scroll on older browsers (graceful degradation)
- **sessionStorage**: Falls back to component state on private browsing (graceful degradation)
- **CSS gradients**: Supported on all modern browsers; no fallback needed

---

## Accessibility Testing Strategy

### WCAG 2.1 AA Compliance Checklist

| Criterion | How to Test | Tools |
|-----------|-------------|-------|
| Touch target size (44px) | Measure buttons in DevTools | Safari DevTools, Chrome DevTools |
| Focus indicators (3:1 contrast) | Tab through UI, check outline | WebAIM Contrast Checker |
| aria-expanded/aria-pressed | Inspect HTML, verify updates | Browser DevTools |
| Keyboard navigation | Tab, Arrow keys, Enter, Space | Manual testing |
| Screen reader | Test with VoiceOver (iOS), TalkBack (Android) | VoiceOver, TalkBack |
| Color contrast | Use WebAIM Contrast Checker | WebAIM, Axe DevTools |

---

## Known Limitations & Future Enhancements

### Out of Scope (As Per Spec)

- Server-side filter persistence (session-only per spec)
- Advanced filter operators (AND/OR, ranges)
- Filter history or recents
- Search autocomplete
- ML-based recommendations
- Filter analytics dashboard
- Bulk filter presets
- Nested/hierarchical filters

### Future Enhancements (Not in MVP)

1. **Filter Presets**: Save/load common filter combinations
2. **Filter History**: Quick-access to recently used filters
3. **Search Autocomplete**: Type-ahead suggestions for keywords
4. **Advanced Filters**: AND/OR logic, range queries
5. **Analytics**: Track which filters are most used
6. **Server Persistence**: Save filters to user account

---

## References & Existing Patterns

### Codebase Patterns to Follow

1. **Carousel**: Reference `src/components/HeroCarousel.astro` for scroll mechanics
2. **Component Testing**: Reference `src/components/__tests__/HeroCircularCarousel.*.test.ts`
3. **Filter Logic**: Reference `src/lib/resources/__tests__/filters.test.ts`
4. **Astro Patterns**: Check `src/pages/coaching-resources.astro` for page structure

### External Resources

- [WCAG 2.1 AA Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [CSS scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)
- [iOS -webkit-overflow-scrolling](https://webkit.org/blog/1847/webkit-touch-events/)
- [Astro Best Practices](https://docs.astro.build/en/getting-started/)

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Carousel Library | Native HTML scroll | Zero dependencies, best performance |
| State Persistence | sessionStorage | Survives nav within session, resets on close |
| Panel Display | Collapsible inline | Simpler, non-disruptive |
| Scroll Behavior | smooth + momentum | Native feel, spec requirement |
| Scroll Indicators | CSS gradient fade | Zero JS, modern aesthetic |
| Auto-Collapse Threshold | 100px | Spec requirement |
| Animation Duration | 300ms | Spec requirement |
| **P3 Re-expansion** | **Remain collapsed (TBD)** | **Simpler, more predictable — needs confirmation** |

---

**Document Date**: 2026-04-22  
**Status**: RESEARCH COMPLETE  
**Pending Decision**: P3 scroll re-expansion behavior (confirm before Phase 3)
