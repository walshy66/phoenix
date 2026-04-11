# Research: Seasons Page (COA-24)

**Date**: 2026-04-11  
**Status**: OPEN QUESTIONS IDENTIFIED

---

## Open Questions

### 1. PlayHQ API Contract & Availability
**Status**: ❓ Pending API key and documentation  
**Impact**: Blocks live data integration (Phase 8+)

#### Questions
- What endpoints are available? (e.g., GET `/seasons`, GET `/seasons/{id}`)
- What data fields does PlayHQ return for Season, Team, Registration?
- Are registration costs available via API or require separate endpoint?
- What are rate limits and retry behavior?
- Does PlayHQ return `role` (current/next/previous) or must backend calculate?

#### Proposed Approach
- Obtain PlayHQ API documentation and sandbox credentials
- Document endpoint contracts in `contracts/api.md`
- Test API with mock/stub data before live integration
- Plan error handling for API timeouts and 5xx responses

#### Dependencies
- PlayHQ API key (external dependency)
- Backend API wrapper (if not already built)

---

### 2. Backend Service for Season Role Determination
**Status**: ❓ Needs clarification with backend team  
**Impact**: Client implementation depends on backend contract

#### Questions
- Which backend service provides season data? (existing? new?)
- How is season role determined? (server-side only per spec)
- What is the exact date boundary logic?
  - If today == season start date, is season `current` or previous season still `current`?
  - Recommendation: season is `current` if `today >= startDate AND today <= endDate`
- Is role recalculated daily, or cached with TTL?
- How does archive logic work? (count distinct years, or specific year cutoff?)

#### Proposed Approach
- Meet with backend team to define Season data contract
- Create endpoint specification: `GET /api/seasons` → `Season[]` with pre-assigned `role`
- Document exact date boundary conditions in `data-model.md`
- Plan timezone handling (server in UTC? client in local?)

#### Dependencies
- Backend API design (in progress or required)
- Database schema for seasons (Prisma or other ORM)

---

### 3. Data Polling Strategy for Next Season Placeholder
**Status**: ❓ Deferred to Phase 8 (MVP uses page refresh)  
**Impact**: UX when Next Season data arrives mid-session

#### Questions
- Should client poll for Next Season data? (e.g., every 30 seconds)
- How do we update UI without page refresh? (optimistic update?)
- Should we use WebSocket for real-time updates instead?
- What's the business cadence? (when are teams typically created?)
- Should polling be opt-in or default? (performance impact?)

#### Alternatives Considered

**Option A: Page Refresh Only (MVP)**
- Pros: Simple, no polling code, users refresh to see new data
- Cons: Not seamless, requires user action, poor UX for long sessions
- Status: ✅ Chosen for MVP

**Option B: Client Polling (every 30 seconds)**
- Pros: Automatic updates, users see new data appear
- Cons: Network overhead, complexity, may show stale data
- Status: 🔄 Consider for Phase 8+

**Option C: Server-Sent Events (SSE)**
- Pros: Server pushes updates, no polling overhead, real-time
- Cons: Higher complexity, requires server implementation
- Status: 🔄 Consider for Phase 8+ if polling too noisy

**Option D: WebSocket**
- Pros: True real-time, bidirectional, elegant
- Cons: Complex infrastructure, overkill for one feature
- Status: ❌ Rejected as over-engineered

#### Proposed Approach
1. MVP: Document that users can refresh page to see Next Season data
2. Phase 8: Implement polling (30-second interval) with optimistic UI update
3. Future: Consider WebSocket if other features need real-time updates

#### Dependencies
- Backend endpoint to check if Next Season data ready
- Frontend state management for optimistic updates

---

### 4. Archive Display Logic & Year Grouping
**Status**: ❓ Deferred to Phase 8 (hidden in MVP)  
**Impact**: Future feature enhancement (P3 user story)

#### Questions
- What is the maximum number of archive seasons to support? (5? 20? unlimited?)
- How should years be grouped? (separate cards per year? dropdown? scrollable list?)
- Should archive be in single detail view or separate page?
- Should users be able to sort archive? (chronological default, or reverse?)
- Are there performance implications with 10+ seasons?

#### Proposed Archive Display Formats

**Option A: Chronological List (Newest First) — Spec Current**
```
Archive View
├── 2025 Season (newest archive)
├── 2024 Season
├── 2023 Season (oldest archive)
```
Pros: Simple, follows spec, no UI complexity  
Cons: May feel list-like for many seasons

**Option B: Year Grouped**
```
Archive View
├── 2025 Seasons
│  ├── Spring 2025
│  ├── Summer 2025
├── 2024 Seasons
│  ├── Spring 2024
```
Pros: Organized by year, scannable  
Cons: More complex UI, more code

**Option C: Scrollable Card Grid**
```
Archive View (scrollable horizontal list)
[2025] [2024] [2023] →
```
Pros: Visual, mobile-friendly  
Cons: May not scale to 10+ seasons

#### Proposed Approach
1. MVP: Archive hidden (< 2 years data)
2. Phase 8: Implement Option A (chronological list in detail view)
3. Future: Gather user feedback, consider Option B if needed

#### Dependencies
- Backend logic to identify distinct years
- Backend logic to exclude current/next/previous from archive

---

### 5. Registration Costs Data Structure
**Status**: ❓ Awaiting PlayHQ API contract  
**Impact**: How to display and organize registration pricing

#### Questions
- Does PlayHQ provide cost breakdowns by age group? (U8, U10, U12, etc.)
- Are there multiple tiers? (e.g., early bird, regular, late registration?)
- Do costs vary by season? (Winter vs. Summer different prices?)
- Are discounts/concessions available? (e.g., financial assistance, sibling discounts?)
- What format is cost? (string like "$150.00" or numeric like 150.00?)
- How should "late registration" vs. "early registration" be displayed?

#### Proposed Approach
- Obtain actual PlayHQ cost structure from API
- Document field mapping in `contracts/api.md`
- Design table layout to accommodate cost tiers (without over-complicating)
- Plan responsive behavior on mobile (horizontal scroll or collapse?)

#### Dependencies
- PlayHQ API cost endpoint contract

---

### 6. Key Dates Granularity & User Needs
**Status**: ❓ Validate with coaches/parents  
**Impact**: Which dates to prominently display

#### Questions
- Are the 4 key dates (Registration Opens, Grading, Season Starts, Finals) sufficient?
- Should we include: grading locations? team announcement date? team list link?
- Do coaches need intra-season dates? (e.g., "Round 5 starts", mid-season tournament)
- Should key dates be editable by admin? (depends on backend)
- How far in advance should future dates be announced? (1 month? 3 months?)

#### Proposed Approach
1. MVP: Use 4 key dates per spec (covers main use cases)
2. Gather feedback from coaches during user testing
3. Future: Add more granular dates if needed (e.g., grading locations)

#### Dependencies
- User feedback from coaches/parents
- Backend admin interface to manage key dates

---

## Technology Decisions

### Decision 1: Astro Components Only (No Frontend Framework)
**Choice**: ✅ Use Astro + vanilla JavaScript (no React, Vue, Svelte)  
**Rationale**:
- Project already uses Astro; consistent approach
- MVP interactivity simple enough for vanilla JS (click, keyboard, modal)
- Reduces JavaScript bundle size
- Aligns with spec (uses existing `src/pages/seasons.astro`)

**Alternatives**:
- ❌ React: Adds 40KB+ to bundle, overkill for modal state
- ❌ Vue: Not in project stack; adds complexity
- ❌ Alpine.js: Lightweight but unfamiliar to team

---

### Decision 2: Tailwind CSS for Styling (No Custom CSS)
**Choice**: ✅ Use Tailwind utility classes (existing in project)  
**Rationale**:
- Project already uses Tailwind 4.2.2
- Consistent with existing components (EventCard, EventModal)
- No extra CSS files to maintain
- Responsive design via Tailwind breakpoints (sm:, md:, lg:)

**Alternatives**:
- ❌ CSS Modules: Adds build complexity, inconsistent with project
- ❌ Styled Components: No CSS-in-JS in project
- ❌ PostCSS plugins: Unnecessary for Tailwind approach

---

### Decision 3: Fixed Modal Positioning (No Portal/Teleport)
**Choice**: ✅ Use `position: fixed` for modal overlay  
**Rationale**:
- Astro components don't support React portals/Vue teleport
- Fixed positioning simpler in Astro
- Avoids z-index stacking issues with DOM hierarchy
- Standard pattern for Astro modals

**Alternatives**:
- ❌ Portal/Teleport: Not available in Astro (framework-specific)
- ❌ Inline expand: Causes layout shift (violates NFR-019)
- ❌ New page: Overcomplicates routing

---

### Decision 4: Vitest for Unit/Integration Tests
**Choice**: ✅ Use Vitest (already in project)  
**Rationale**:
- Project already has Vitest setup
- Fast test runner (Vite-based)
- Good Astro component testing support
- Already in `package.json`

**Alternatives**:
- ❌ Jest: Slower, more config overhead
- ❌ Playwright: Good for E2E, not ideal for unit tests
- ❌ Cypress: Heavy, not in project setup

---

### Decision 5: No New Dependencies
**Choice**: ✅ Use only existing dependencies  
**Rationale**:
- Astro, Tailwind, Vitest already in project
- Feature doesn't require new libraries (modal, date formatting, state)
- Minimizes bundle size and security risk
- Aligns with Principle VIII (Dependency Hygiene)

**Considered but Rejected**:
- ❌ date-fns: Not needed (simple ISO formatting sufficient)
- ❌ clsx/classnames: Tailwind class concatenation works without lib
- ❌ zustand/recoil: Over-engineered for simple modal state

---

## Assumptions & Constraints

### Assumptions
1. **Backend Season Role Calculation**: Assume backend provides `role` field; client does NOT calculate
2. **Hardcoded Data for MVP**: Assume PlayHQ API unavailable at start; use placeholder data
3. **Mobile-First Approach**: Design assumes mobile layout is primary; scale up for tablet/desktop
4. **No Custom Authentication**: Feature assumes public pages (no login required for /seasons)
5. **UTC Server Time**: All dates assumed UTC; timezone conversion deferred to future phase

### Constraints
1. **No New Dependencies**: Cannot add npm packages without team approval
2. **Astro 6.1.1**: Cannot upgrade/downgrade framework version without separate approval
3. **WCAG 2.1 AA Non-Negotiable**: All accessibility violations are blockers
4. **No Custom Navigation**: Cannot override AppShell navigation pattern
5. **60KB Bundle Size Target**: Total CSS+JS for feature should not exceed 60KB (estimate)

---

## Performance Considerations

### Initial Load
- Hero section renders from static HTML (no API call)
- Season tiles render from hardcoded data (instant)
- Key Dates section renders from hardcoded data (instant)
- **First Contentful Paint (FCP)**: < 1 second expected

### Detail View Open
- Modal slides in via CSS transition (300ms)
- Registration Costs and Key Dates already loaded (from hardcoded data)
- **Time to Interactive**: < 100ms

### Future: PlayHQ API Integration
- API fetch deferred to after page render (background)
- Skeleton loader shown while fetching (optional)
- Estimated API response time: 200-500ms
- **Plan**: Do not block FCP with API calls

---

## Security & Data Considerations

### Client-Side Validation Only (MVP)
- Registration costs are read-only (not edited by user)
- No sensitive user data displayed (public information only)
- No client-side encryption needed

### Future: PlayHQ API Data Handling
- Assume API credentials managed by backend (not exposed to client)
- Validate all API responses (null checks, type guards)
- Log errors but do not expose internal details to user

---

## Next Steps

1. **Immediate**: Clarify modal implementation approach with design team
2. **This Week**: Meet with backend team to define season role endpoint
3. **Week 2**: Investigate PlayHQ API contract (if key available)
4. **Week 3**: Draft data polling strategy for Next Season
5. **Post-MVP**: Validate archive display UX with users

---

## Appendix: Links & References

- **Spec**: `specs/coa-24-seasons-page/spec.md`
- **Plan**: `specs/coa-24-seasons-page/plan.md`
- **Data Model**: `specs/coa-24-seasons-page/data-model.md` (to be created)
- **API Contracts**: `specs/coa-24-seasons-page/contracts/api.md` (to be created)
- **Existing Seasons Page**: `src/pages/seasons.astro`
- **Existing Modal Pattern**: `src/components/EventModal.astro`
- **BaseLayout**: `src/layouts/BaseLayout.astro`
- **Constitution**: `.specify/memory/constitution.md`
