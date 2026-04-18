# Research & Spike Items: Sponsors Carousel

**Feature**: COA-58 Sponsors Carousel | **Date**: 2026-04-18

---

## Executive Summary

This document captures research questions, alternatives considered, technology decisions, and open questions for the Sponsors Carousel feature. All items have been evaluated and most are resolved; remaining open questions are deferred to implementation phases.

---

## Key Questions Answered

### Q1: Carousel Type — Scroll vs. 3D Rotation?

**Question**: Should the sponsors carousel use horizontal scroll (like native carousel) or 3D rotation (like COA-22 hero carousel)?

**Alternatives Considered**:

1. **Option A: Horizontal Scroll (CHOSEN)**
   - User scrolls left/right to reveal sponsors
   - Cards maintain fixed width; scroll is native browser scroll
   - Simpler implementation; better touch support
   - Pros: Intuitive, accessible, native scroll, mobile-friendly
   - Cons: Requires scroll affordance (fade edges, scrollbar)

2. **Option B: 3D Rotation (COA-22 Pattern)**
   - Cards rotate 3D along Y-axis; navigate via arrow buttons
   - More visually striking; controls available on all breakpoints
   - Cons: Adds complexity; animation could be distracting; less native-feeling

3. **Option C: Auto-Scrolling Marquee**
   - Sponsors scroll continuously without user interaction
   - Pros: Eye-catching; no interaction needed
   - Cons: Accessibility concerns (WCAG); distracting; no pause control; can't read brand names

**Decision**: **Option A (Horizontal Scroll)** best matches spec requirements.
- Spec calls for fixed-width card layout (like COA-22) but with manual scroll
- Horizontal scroll is more accessible (native browser behavior)
- Simpler implementation allows focus on image optimization and accessibility
- Reusable pattern for future similar features

---

### Q2: Image Optimization — WebP or PNG Only?

**Question**: How should sponsor logos be optimized and served across browsers?

**Alternatives Considered**:

1. **Option A: PNG Only**
   - Simple; single format for all browsers
   - Pros: Easy to implement; broad browser support
   - Cons: Larger file sizes (~150KB per logo); slower load; not optimal

2. **Option B: WebP Only (Modern Browsers)**
   - Smaller files (~100KB per logo); better compression
   - Pros: 20-30% smaller than PNG; faster load
   - Cons: Older browsers (IE, Safari <14) can't display; need fallback strategy

3. **Option C: WebP + PNG Fallback (CHOSEN)**
   - Serve WebP to modern browsers; PNG to older ones
   - Pros: Optimal for all browsers; smallest total download
   - Cons: Requires two image files per logo; build pipeline complexity

**Decision**: **Option C (WebP + PNG Fallback)**.
- Astro Image component supports automatic format optimization
- Browsers modern enough to support Phoenix website will support WebP
- PNG fallback ensures backward compatibility
- Achieves target: ~100KB per WebP, ~150KB per PNG

**Implementation**: 
- Use Astro Image component with built-in WebP optimization
- Provide PNG fallback via `<picture>` element
- Target browsers: Chrome 23+, Firefox 25+, Safari 16+, Edge 18+
- PNG fallback for IE 11, older Safari versions

---

### Q3: Image Loading Strategy — Eager or Lazy?

**Question**: How should sponsor images be loaded relative to page load?

**Alternatives Considered**:

1. **Option A: All Eager**
   - Load all sponsor images immediately on page load
   - Pros: All logos visible without delay
   - Cons: Slow page load; unnecessary bandwidth for below-fold sponsors

2. **Option B: All Lazy**
   - Load sponsor images only when visible via Intersection Observer
   - Pros: Fast initial page load; bandwidth savings
   - Cons: Visible blank spaces until images load; poor UX for first sponsor

3. **Option C: Eager for First, Lazy for Rest (CHOSEN)**
   - First sponsor loads eagerly; others load lazily
   - Pros: Fast initial paint (first sponsor visible immediately); bandwidth savings for others
   - Cons: Slightly more complex logic

**Decision**: **Option C (Eager first, lazy rest)**.
- First sponsor is primary content; should load immediately
- Remaining sponsors can defer load until needed
- Native `loading="eager"` and `loading="lazy"` attributes on `<img>` elements
- Astro Image component supports this pattern

---

### Q4: Sponsor Data Source — JSON or API/CMS?

**Question**: Where should sponsor data come from (configuration, API, or CMS)?

**Alternatives Considered**:

1. **Option A: JSON File (CHOSEN for MVP)**
   - Store sponsors in `/src/data/sponsors.json`
   - Edited manually; changes require rebuild
   - Pros: Simple; static site generator-friendly; no API complexity
   - Cons: Requires rebuild for changes; no dynamic updates

2. **Option B: Headless CMS (Future)**
   - Store sponsors in Contentful, Sanity, or similar
   - Fetched at build time or runtime
   - Pros: Non-technical users can manage sponsors; dynamic updates
   - Cons: Adds complexity; dependency on external service; slower build

3. **Option C: Admin API Endpoint**
   - Backend API manages sponsors; fetched at build time
   - Pros: Centralized data; can update without rebuild
   - Cons: Backend complexity; requires API infrastructure

**Decision**: **Option A (JSON) for MVP; roadmap to Option B later**.
- Start simple with JSON file in git
- Design data schema to be CMS-compatible later
- Future phase can migrate to headless CMS without refactor
- Current approach: `/src/data/sponsors.json` with TypeScript validation

---

### Q5: Scroll Affordance — How Do Users Know to Scroll?

**Question**: How should the carousel indicate to users that they can scroll (especially on desktop where scrollbar might be hidden)?

**Alternatives Considered**:

1. **Option A: No Affordance (Not Chosen)**
   - Let native scrollbar handle affordance
   - Cons: Scrollbar might be hidden on some devices; users might miss scrollable content

2. **Option B: Fade Gradient Edges (CHOSEN)**
   - Add semi-transparent gradient fade on left/right edges
   - Indicates more content is available beyond edges
   - Pros: Subtle; doesn't block content; proven pattern (Apple, Figma)
   - Cons: Requires CSS overlay; doesn't work on mobile (where scroll is obvious)

3. **Option C: Arrow Buttons + Scroll (Not Chosen)**
   - Add visible arrow buttons to navigate
   - Cons: Takes up space; less intuitive than native scroll; adds complexity

4. **Option D: Visible Scrollbar + Fade**
   - Show native scrollbar + gradient fade for maximum clarity
   - Pros: Clear affordance on all devices
   - Cons: Scrollbar takes space; might look cluttered

**Decision**: **Option B (Fade Edges on Desktop, Scrollbar on Mobile)**.
- Desktop: Fade gradient left/right edges (no scrollbar visible)
- Mobile: Show native scrollbar (obvious to users familiar with scroll)
- Spec mentions "fade edges" explicitly; proven effective

---

### Q6: CTA Card Styling — How to Distinguish from Sponsor Cards?

**Question**: How should the "Become a Sponsor" CTA card look different from sponsor cards?

**Alternatives Considered**:

1. **Option A: Different Background Color (CHOSEN)**
   - CTA card uses distinct color (e.g., light gold, brand primary)
   - Sponsor cards use neutral/white background
   - Pros: Immediately obvious; signals action
   - Cons: Color clash risk with logos

2. **Option B: Icon Indicator**
   - Add icon (e.g., "+" or "🤝") to CTA card
   - Pros: Visual indicator of action
   - Cons: Still needs color distinction; adds visual weight

3. **Option C: Text Label "+ Add Sponsor"**
   - Text-only CTA, no logo area
   - Pros: Clear intent
   - Cons: Breaks consistency with card layout

**Decision**: **Option A (Different Background Color)** with optional icon.
- CTA card background: light gold or brand purple (TBD with design)
- Sponsor cards background: white/light gray
- Optional: Add subtle icon (e.g., "🤝" or "+") for extra clarity
- Focus on accessibility: aria-label should make intent clear ("Become a Sponsor")

---

### Q7: Sponsor Link Behavior — New Tab or Same Tab?

**Question**: Should clicking a sponsor logo open the link in a new tab or same tab?

**Alternatives Considered**:

1. **Option A: Same Tab (Not Chosen)**
   - Click sponsor logo → navigate away from Phoenix site
   - Cons: User loses context; must use back button to return
   - Violates UX principle: "external links open in new tab"

2. **Option B: New Tab (CHOSEN)**
   - Click sponsor logo → link opens in new tab; Phoenix site remains in background
   - Pros: User can explore sponsor without losing Phoenix context
   - Cons: Requires `target="_blank"` which could be misused

3. **Option C: Modal Preview**
   - Show sponsor info in modal instead of navigating
   - Pros: Keeps user on Phoenix
   - Cons: Adds complexity; reduces sponsor link clicks

**Decision**: **Option B (New Tab)** with security protection.
- Use `target="_blank"` to open in new tab
- Use `rel="noopener noreferrer"` to prevent reverse tabnabbing
- Clear aria-label: "Visit [Sponsor] (opens in new tab)"
- Per spec requirement FR-005

---

### Q8: Missing Sponsor Links — Should Logo Be Clickable?

**Question**: If a sponsor doesn't provide a link, should the logo be clickable?

**Alternatives Considered**:

1. **Option A: Clickable But No Navigation**
   - Wrap in `<a>` but no href; show tooltip "No link available"
   - Cons: Confusing UX; cursor shows pointer but nothing happens
   - Violates accessibility: link without href is not a link

2. **Option B: Non-Clickable (CHOSEN)**
   - No anchor tag; render as static image only
   - Show cursor: default (not pointer)
   - Pros: Honest UX; no broken affordances
   - Cons: Sponsor loses link opportunity

**Decision**: **Option B (Non-Clickable)**.
- Per spec requirement AC-16: "Logo is displayed as static image (not wrapped in anchor tag)"
- If sponsor wants link visibility, they must provide URL
- Component gracefully handles null/empty link field

---

### Q9: Broken Images — Show Placeholder or Skip Card?

**Question**: If a sponsor logo image fails to load (404, network error), what should happen?

**Alternatives Considered**:

1. **Option A: Skip Card Entirely**
   - Don't render card if image fails
   - Cons: Loses sponsor from carousel; might seem like sponsor removed
   - Defeats purpose of showing sponsor

2. **Option B: Show Placeholder (CHOSEN)**
   - Show gray background with sponsor name as text fallback
   - Pros: Keeps sponsor visible; graceful degradation; responsive to network issues
   - Cons: Placeholder less visually appealing than logo

3. **Option C: Show Broken Image Icon**
   - Show standard "broken image" icon
   - Cons: Confusing; suggests technical error to user

**Decision**: **Option B (Placeholder with Text Fallback)**.
- Gray background (`bg-gray-200`)
- Display sponsor name as text in center of card
- Per spec AC-13: "Fallback placeholder or gray background displays; card does not break layout"
- Responsive to slow networks; no JavaScript needed

---

## Technology Decisions

### T1: Component Architecture

**Decision**: Build with **Astro components**, not React or Vue.

**Rationale**:
- Codebase uses Astro throughout (existing pattern)
- No runtime interactivity needed (just scroll, which is native)
- Smaller bundle; zero JavaScript overhead
- Follows Principle IX (Cross-Feature Consistency)

**Implementation**: 
- `SponsorCarousel.astro` — main carousel container
- `SponsorCard.astro` — individual sponsor card
- `SponsorCTACard.astro` — "Become a Sponsor" CTA card
- All Astro components; minimal JavaScript

---

### T2: Styling Framework

**Decision**: Use **Tailwind CSS 4.2.2** (existing stack).

**Rationale**:
- Already in project; no new dependencies
- Responsive utilities (`sm:`, `lg:`) for breakpoints
- No custom CSS needed; utility-first approach
- Consistent with existing components

**Key Classes**:
- `overflow-x-auto overflow-y-hidden` — horizontal scroll container
- `flex-shrink-0` — prevent card compression
- `w-[200px] sm:w-[220px] lg:w-[250px]` — responsive card width
- `object-contain object-center` — logo sizing
- Focus styles: `focus:outline-2 focus:outline-brand-purple`

---

### T3: Image Optimization

**Decision**: Use **Astro Image component** with WebP + PNG fallback.

**Rationale**:
- Astro has built-in Image component for automatic optimization
- Automatic WebP generation; PNG fallback via `<picture>`
- Supports `loading="eager"` and `loading="lazy"` attributes
- No new dependencies; already in stack

**Implementation**:
```astro
<picture>
  <source srcset={sponsor.logo.replace('.png', '.webp')} type="image/webp" />
  <img
    src={sponsor.logo}
    alt={`${sponsor.name} logo`}
    loading={isPrimary ? 'eager' : 'lazy'}
    decoding={isPrimary ? 'auto' : 'async'}
    class="w-full h-full object-contain object-center"
  />
</picture>
```

---

### T4: Testing Framework

**Decision**: Use **Vitest 4.1.2** (existing stack).

**Rationale**:
- Already in project; no version bump needed
- Fast unit + integration testing
- Works with Astro components
- Good coverage reporting

**Test Structure**:
- `SponsorCarousel.component.test.ts` — component rendering
- `SponsorCarousel.image-loading.test.ts` — image optimization
- `SponsorCarousel.accessibility.test.ts` — WCAG compliance
- `SponsorCarousel.responsive.test.ts` — breakpoint behavior

---

### T5: Scroll Behavior

**Decision**: Use **native browser scroll**, not JavaScript-driven.

**Rationale**:
- Simplest implementation; no JavaScript needed
- Better touch support (native scroll gestures)
- Better accessibility (users familiar with native scroll)
- Better performance (no custom scroll logic)
- Per spec: "carousel MUST be responsive; cards maintain fixed width with horizontal scroll"

**Implementation**:
- Container: `overflow-x-auto overflow-y-hidden`
- Scrollbar: native browser scrollbar (visible on mobile, hidden on desktop via CSS)
- Fade edges: CSS gradient overlays (optional, improves affordance)

---

### T6: Data Validation

**Decision**: Validate sponsor data on load; gracefully degrade on error.

**Rationale**:
- Prevent silent failures; warn of invalid data
- Fallback gracefully (skip invalid sponsors, show CTA card only)
- Don't break page if data is malformed

**Implementation**:
```typescript
function validateSponsor(sponsor: unknown): sponsor is Sponsor {
  // Type checks; return false if invalid
  // Component logs warning but continues
}

const validSponsors = sponsors.filter(validateSponsor);
if (validSponsors.length === 0 && sponsors.length > 0) {
  console.warn('No valid sponsors found; showing CTA card only');
}
```

---

## Open Questions

### O1: Sponsor Button Placement (Deferred to Phase 7)

**Question**: When 6+ sponsors are onboarded, where should the static "Become a Sponsor" button appear?

**Options**:
- A: Below the carousel
- B: In the footer
- C: In a sidebar (if responsive design allows)
- D: In the "Get Involved" section

**Deferred To**: Phase 7 (home page integration) after design review

---

### O2: Sponsor Image Dimensions (Deferred to Phase 1)

**Question**: What are the exact pixel dimensions for sponsor logo images?

**Spec Guidance**: "Width: 100% of available card space, scaled responsively with the card container"

**Deferred To**: Phase 1; will be determined by card width (200-250px) and aspect ratio

---

### O3: Scrollbar Styling (Deferred to Phase 2)

**Question**: Should scrollbar be styled (color, width) or use native browser default?

**Options**:
- A: Native browser scrollbar (default)
- B: Custom styled scrollbar via CSS (`::-webkit-scrollbar`)
- C: Hide scrollbar, show affordance via fade edges only

**Deferred To**: Phase 2 (layout); defer to design/UX review

---

### O4: Sponsor Sorting Strategy (Deferred to Future Phase)

**Question**: Should sponsors be sorted by join date, alphabetically, or custom order?

**Current Default**: Order as listed in `sponsors.json`

**Future Phase**: Could add `sortBy: 'joinedDate' | 'name' | 'custom'` to config

**Deferred To**: Post-MVP; current implementation uses config order as-is

---

### O5: CDN for Sponsor Images (Deferred to Phase 3)

**Question**: Should sponsor images be hosted on CDN or stored locally in `/public/images/sponsors/`?

**Alternatives**:
- A: Store locally in repo; build pipeline handles optimization
- B: Host on CDN (Cloudflare, AWS S3); reference via URL
- C: Hybrid: store locally, CDN caches on first serve

**Deferred To**: Phase 3 (image optimization) with DevOps team

---

## Considered But Not Chosen

### Carousel Library (e.g., Splide, Embla)

**Considered**: Using a third-party carousel library for features like touch support, swipe detection, etc.

**Why Not Chosen**:
- Spec calls for "horizontal scroll behavior as the existing COA-22 carousel"
- COA-22 uses native scroll, not a library
- Native scroll is simpler, more accessible, smaller bundle
- No additional features needed beyond scroll

---

### Auto-Scroll / Auto-Advance

**Considered**: Auto-scrolling sponsors carousel like marquee or auto-rotating slides.

**Why Not Chosen**:
- Spec: "Carousel auto-scroll behavior (if any) should be disabled for sponsors section (unlike hero carousel)"
- Auto-scroll is distracting; reduces readability
- Manual scroll is more accessible (no forced motion)
- User-controlled interaction is better UX

---

### Client-Side Image Lazy Loading Library

**Considered**: Using libraries like `lazysizes` or `lozad` for advanced image loading.

**Why Not Chosen**:
- Native `loading="lazy"` attribute is sufficient (all modern browsers support)
- Astro Image component handles format optimization
- No additional library needed; keeps dependencies clean

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Carousel Type** | Horizontal Scroll | Native, accessible, simpler than 3D rotation |
| **Image Format** | WebP + PNG Fallback | Optimal size + backward compatibility |
| **Image Loading** | Eager (first), Lazy (rest) | Fast initial paint + bandwidth savings |
| **Data Source** | JSON file | Simple, static-friendly; extensible to CMS later |
| **Link Behavior** | New Tab | Standard UX for external links |
| **Missing Links** | Non-clickable | Honest UX; no broken affordances |
| **Broken Images** | Placeholder + Text | Graceful degradation; keeps sponsor visible |
| **Component Framework** | Astro | Follows existing patterns; no JS overhead |
| **Styling** | Tailwind CSS 4.2.2 | Existing stack; responsive utilities |
| **Testing** | Vitest 4.1.2 | Existing stack; comprehensive coverage |
| **Scroll Method** | Native Browser | Simple, accessible, performant |
| **Data Validation** | Runtime + Graceful Fallback | Prevent silent failures; robust error handling |

---

## Recommendations for Implementation

1. **Start Simple**: Use native scroll; don't over-engineer scroll behavior
2. **Accessibility First**: Build alt text, aria-labels, focus management from Phase 1
3. **Image Optimization**: Invest time in WebP + PNG setup; payoff in load time
4. **Data Validation**: Validate on load; log warnings but don't break page
5. **Test Coverage**: Comprehensive tests covering all 21 acceptance criteria
6. **Future-Proof Schema**: Design sponsor data schema to be CMS-compatible later

---

**Research Complete**: Ready for implementation

Status: ✅ All key decisions made; remaining open questions deferred to appropriate phases
