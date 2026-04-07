# FEATURE: COA-29 — Hide Shop Functionality

**Linear Issue**: COA-29
**URL**: https://linear.app/coachcw/issue/COA-29/hide-shop-functionality
**Priority**: Medium
**Status**: Spec Draft
**Project**: Phoenix (Astro website)
**Section**: Navigation/UI

---

## Intent

Temporarily hide/remove the shop functionality from the website since the shop doesn't exist yet. This feature will hide the shop page and any references to shop/merchandise until the actual shop functionality is implemented.

The goal is to prevent users from encountering broken links, 404 errors, or confusing navigation items related to a non-existent shop feature, while maintaining the ability to easily restore shop functionality when it's ready to be implemented.

---

## User's Core Action

As a user navigating the website, I should not see any shop/merchandise links, pages, or references that lead to non-existent functionality. When I encounter areas where shop functionality would normally appear, they should be hidden or removed entirely, ensuring a clean and consistent user experience without dead ends.

As an administrator or developer, I should be able to easily restore the shop functionality when it's implemented, without having to recreate removed code or undo complex changes.

---

## What This Is NOT

- Permanent removal of shop code or functionality
- Changes to the underlying shop implementation (since it doesn't exist yet)
- Removal of other navigation or UI elements unrelated to shop
- Changes that affect the core coaching resource functionality
- Implementation of actual shop features (product listings, cart, checkout, etc.)

---

## Inputs

- Current website navigation structure (to identify shop-related links)
- Current page structure (to identify potential shop page routes)
- Current component usage (to identify shop-related UI elements)

---

## Outputs

- Modified navigation/menu with shop references hidden/removed
- Hidden or removed shop page route (if it exists as a placeholder)
- Hidden or removed shop-related content/components
- Preserved ability to restore shop functionality via simple reversion of changes

---

## Design Constraints

- Must maintain existing UI/UX patterns and styling
- Changes should be easily reversible
- Should not break existing functionality or layout
- Must follow existing code patterns and conventions in the Astro/Tailwind codebase
- Should preserve responsive design and accessibility characteristics

---

## Codebase Context

- **Framework**: Astro (static site generation)
- **Styling**: Tailwind CSS
- **Navigation**: Likely in `src/components/Navbar.astro` or similar
- **Layout**: Uses `src/layouts/BaseLayout.astro`
- **Styling**: Tailwind CSS with custom brand colors
- **No backend**: All functionality is frontend/static
- **Existing pages**: Standard Astro pages in `src/pages/`

---

## Known Concerns / Edge Cases

- Accidentally hiding non-shop elements with similar naming
- Breaking layout when removing navigation items
- Missing shop references that are dynamically generated
- Difficulty restoring functionality if changes are too aggressive
- Ensuring hidden elements don't cause accessibility issues (screen readers, etc.)
- Potential SEO impact of removing links (though shop doesn't exist yet)

---