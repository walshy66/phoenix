# Feature Specification: Resources Menu & Pages

**Feature Branch**: `cameronwalsh/coa-33-resources-menu`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "Resources menu needs to provide options to Coaching Resources and Player Resources pages. Each section needs different content tailored to its audience."

---

## Overview

The Resources section is a top-level navigation entry that splits into two distinct audience lanes:
1. **Coaching Resources** — for coaches and volunteers
2. **Player Resources** — for players and families

This feature requires creating foundational pages and wiring the navigation menu to route between them. **The work can be split into 3 independent parts** that different agents can handle in parallel.

---

## Architecture & Design Context

- **Website**: Bendigo Phoenix basketball club (bendigophoenix.org.au)
- **Stack**: Astro + Tailwind CSS v4
- **Brand Colors**: 
  - Primary Purple: `#573F93`
  - Vegas Gold: `#8B7536`
  - Black: `#111111`
  - Off-White: `#F4F5F7`
- **Deployment**: VentraIP (SFTP from local builds)
- **Content Pattern**: Static pages with client-side interactivity (no backend, no auth for MVP)

---

## User Scenarios & Testing

### User Story 1 – Coach Discovers Coaching Resources (Priority: P1)

A coach or volunteer lands on the website, clicks "Resources" in the main navigation menu, and sees two clear options: Coaching Resources and Player Resources. They click Coaching Resources and are taken to a dedicated page that explains what resources are available for coaches (e.g., training guides, playbooks, schedule management tools).

**Why this priority**: Navigation and discovery are table-stakes for any new section. Without this, the entire Resources feature is inaccessible.

**Independent Test**: Can be tested by simply clicking the menu item and verifying navigation works. Delivers immediate navigation value.

**Acceptance Scenarios**:
1. **Given** user is on any page of the website, **When** they click "Resources" in the main navigation, **Then** they see two clear options/buttons: "Coaching Resources" and "Player Resources"
2. **Given** user has selected the "Resources" menu, **When** they click "Coaching Resources", **Then** they are navigated to `/resources/coaching` (or equivalent route)
3. **Given** user is on the Coaching Resources page, **When** they look at the page header/title, **Then** they see "Coaching Resources" prominently displayed
4. **Given** user is on the Coaching Resources page, **When** they use browser back button or click "Resources" again, **Then** they return to the Resources menu/parent

### User Story 2 – Player Discovers Player Resources (Priority: P1)

A player or family member lands on the website, navigates to Resources, and sees two clear options. They click Player Resources and are taken to a dedicated page that explains what resources are available for players (e.g., training tips, team schedules, registration info).

**Why this priority**: Same as Story 1 — equal importance for the second audience segment. Ensures both paths are discoverable and working.

**Independent Test**: Can be tested independently by verifying the Player Resources route and page structure without relying on coaching content.

**Acceptance Scenarios**:
1. **Given** user clicks "Resources" in navigation, **When** they click "Player Resources", **Then** they are navigated to `/resources/players` (or equivalent route)
2. **Given** user is on the Player Resources page, **When** they look at the page header/title, **Then** they see "Player Resources" prominently displayed
3. **Given** user is on either Resources page, **When** they look at the page, **Then** they see a clear way to navigate back to the Resources menu or home

### User Story 3 – Resources Menu Visual Consistency (Priority: P2)

The Resources menu item is styled consistently with other main navigation items and uses brand colors appropriately. It's clear this is a navigation entry point, and the visual hierarchy matches the rest of the site.

**Why this priority**: Design consistency ensures a professional, cohesive experience. Not blocking functionality but important for UX polish.

**Independent Test**: Can be tested by visual inspection and QA of the menu rendering across desktop, tablet, and mobile.

**Acceptance Scenarios**:
1. **Given** user views the main navigation, **When** they look at "Resources", **Then** it is styled with brand colors and matches the visual weight of other top-level menu items
2. **Given** "Resources" is hovered or focused, **When** a submenu or dropdown appears, **Then** the submenu clearly shows the two options (Coaching/Player) with consistent styling
3. **Given** user is on a mobile device, **When** they view the navigation, **Then** the Resources menu and its options are accessible and readable

---

## Work Breakdown: 3 Independent Parts

The feature can be delivered as **3 independent parallel streams**. Each part is fully testable and deployable on its own.

### **Part A: Resources Menu Routing & Navigation** (COA-33a)

**What**: Wire up the Resources menu item in the main navigation and create a gateway/router page (or landing page) that displays two clear options: Coaching Resources and Player Resources. Handle menu state and routing logic.

**Deliverables**:
- Update main navigation component to include a "Resources" entry
- Create a Resources index/landing page (`/resources` or equivalent) that presents two clearly clickable options
- Implement routing to `/resources/coaching` and `/resources/players` paths
- Ensure Resources menu item is visually distinct and brand-compliant
- Add breadcrumb or back-navigation support

**Dependencies**: None. Can be completed independently.

**Acceptance**:
- Menu item appears in navigation across all pages
- Clicking "Resources" navigates to a landing/index page
- Landing page displays two buttons/links: "Coaching Resources" and "Player Resources"
- Clicking each option navigates to the correct route
- Menu item styling matches brand guidelines

**Testing**: Visual QA + link testing. No content dependencies.

---

### **Part B: Coaching Resources Page** (COA-33b)

**What**: Create a dedicated Coaching Resources page (`/resources/coaching`) with structure, layout, and placeholder content zones ready to be filled by coaches. This page is the home for coaching-focused materials (e.g., training guides, playbooks, tools like the court time calculator).

**Deliverables**:
- Create `/resources/coaching` page component
- Define page layout/sections (e.g., hero, introduction, resources grid/list, call-to-action)
- Add page title and meta tags
- Include navigation back to Resources menu or home
- Set up content zones or sections (marked as placeholders for future content)
- Apply brand colors and Tailwind styling

**Dependencies**: Part A must be complete (routing), but the page itself is self-contained.

**Acceptance**:
- Page renders at correct route
- Page title clearly identifies it as "Coaching Resources"
- Layout is responsive (mobile, tablet, desktop)
- Sections are labeled and styled (placeholders for content are acceptable)
- Navigation back to parent/home works

**Testing**: Page rendering + responsive design QA. No content review required.

---

### **Part C: Player Resources Page** (COA-33c)

**What**: Create a dedicated Player Resources page (`/resources/players`) with structure, layout, and placeholder content zones ready to be filled by club staff. This page is the home for player-focused materials (e.g., team schedules, training tips, registration info).

**Deliverables**:
- Create `/resources/players` page component
- Define page layout/sections (e.g., hero, introduction, resources grid/list, call-to-action)
- Add page title and meta tags
- Include navigation back to Resources menu or home
- Set up content zones or sections (marked as placeholders for future content)
- Apply brand colors and Tailwind styling

**Dependencies**: Part A must be complete (routing), but the page itself is self-contained.

**Acceptance**:
- Page renders at correct route
- Page title clearly identifies it as "Player Resources"
- Layout is responsive (mobile, tablet, desktop)
- Sections are labeled and styled (placeholders for content are acceptable)
- Navigation back to parent/home works

**Testing**: Page rendering + responsive design QA. No content review required.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST render a "Resources" menu item in the main navigation on all pages
- **FR-002**: System MUST route `/resources` to a gateway page or index that lists two options: Coaching Resources and Player Resources
- **FR-003**: System MUST route `/resources/coaching` to a dedicated Coaching Resources page
- **FR-004**: System MUST route `/resources/players` to a dedicated Player Resources page
- **FR-005**: Clicking a Resources option MUST navigate to the correct route without page reload errors
- **FR-006**: Users MUST be able to navigate back to the Resources menu or home from either sub-page
- **FR-007**: All Resources pages MUST be responsive and render correctly on mobile (320px+), tablet (768px+), and desktop (1024px+)
- **FR-008**: Resources menu item styling MUST use brand colors (primary purple `#573F93`, accent gold `#8B7536`) and match the visual hierarchy of other main nav items

### Key Entities

- **Resources Menu Item**: A navigation entry that triggers discovery of coaching/player resources
- **Resources Landing Page**: A gateway/index page that presents the two audience paths
- **Coaching Resources Page**: A dedicated page for coaching-focused content and tools
- **Player Resources Page**: A dedicated page for player-focused content and schedules

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All three parts (menu, coaching page, player page) render without console errors or broken links
- **SC-002**: Users can reach Coaching Resources and Player Resources pages from the main navigation in fewer than 3 clicks
- **SC-003**: Both Resources sub-pages load in under 2 seconds on a 3G connection (simulated)
- **SC-004**: All pages pass responsive design testing across common breakpoints (mobile 320px, tablet 768px, desktop 1024px)
- **SC-005**: Coaching and Player Resources pages have distinct visual treatment (color accents, layout) so users understand they are different audience sections
- **SC-006**: Back navigation and breadcrumbs work reliably, reducing user confusion about page hierarchy

---

## Edge Cases & Notes

- **Nested routing**: Ensure the Resources menu doesn't interfere with other top-level navigation items
- **Mobile UX**: Verify that submenu/options appear clearly on mobile (no hidden dropdowns that aren't tappable)
- **Content placeholders**: Both sub-pages should have clear placeholder areas so it's obvious where future content (blog posts, tools, schedules) will live
- **Future expansion**: Architecture should allow for easy addition of more sub-sections under Resources later (e.g., `/resources/administrators`)
- **SEO metadata**: Each page should have appropriate title and meta tags for search engines

---

## Implementation Notes

- Use Astro's file-based routing for `/resources`, `/resources/coaching`, and `/resources/players`
- Leverage Tailwind CSS v4 for responsive styling and brand color variables
- Keep pages static for MVP (no database, no authentication)
- Follow existing site patterns for layout, navigation, and component reuse
- Consider a shared `ResourcesLayout` component for consistent header/footer/nav across sub-pages

---

## Deployment & Handover

- Each part can be deployed independently via SFTP to VentraIP
- All code should follow existing project conventions (documented in project `.claude/` folder)
- Specs and decisions should be consolidated into reusable patterns for future similar features
