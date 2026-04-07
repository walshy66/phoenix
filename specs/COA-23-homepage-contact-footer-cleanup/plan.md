# Implementation Plan: COA-23 — Homepage, Contact & Footer Cleanup

## Scope — Three Files Only

| File | Change |
|---|---|
| `src/pages/index.astro` | Remove Welcome section (lines 126–144) |
| `src/pages/contact.astro` | Remove Find Us section (lines 97–117); update Email card (lines 40–55) |
| `src/components/Footer.astro` | Restructure 3-column grid to 4-column; split Quick Links out of Follow Us column |

No shared components, data files, or layout abstractions require changes.

---

## Change 1 — Homepage: Remove Welcome Section (`src/pages/index.astro`)

**What to remove:** Lines 126–144 — the entire `<section class="py-20 px-4 sm:px-6 lg:px-8 bg-white">` block containing the "WELCOME TO THE PHOENIX FAMILY" headings, gold divider, and two paragraphs.

**Orphan risk assessment:**
- The section has no shared wrapper or spacer above/below it — it is a direct sibling of the hero `<section>` and the Latest Results `<section>`.
- The hero section supplies its own bottom padding via its CSS class — that survives removal cleanly.
- The Latest Results section (`bg-brand-black`) opens with `py-8` — it supplies its own top padding and will render correctly immediately after the hero.
- The `stagger-1` through `stagger-5` classes on welcome section elements are never defined in any stylesheet or script in the project — safe to remove.
- **Conclusion:** A clean cut of lines 126–144 leaves no orphaned DOM, no double-spacing, and no missing padding. No CSS adjustments needed.

---

## Change 2 — Contact Page (`src/pages/contact.astro`)

### 2a — Remove Find Us Section

Remove lines 97–117 — the entire `<section class="py-8 px-4 sm:px-6 lg:px-8 bg-brand-offwhite pb-16">` block containing the "Find Us" heading, map placeholder div, and Google Maps link.

- The section sits at the end of the page body immediately before `</BaseLayout>`.
- The Contact Cards section (the last remaining section) uses `py-16` which includes `pb-16` of its own — page bottom will be clean.
- **Conclusion:** Clean removal with no orphaned containers.

### 2b — Update Email Card (lines 40–55)

Replace the single email link with three labelled entries. Remove the existing descriptive paragraph — superseded by the labelled list.

Replacement inner `<div>`:

```html
<div>
  <h3 class="font-bold text-brand-black text-base mb-3">Email Us</h3>
  <div class="space-y-3">
    <div>
      <p class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">General Enquiries</p>
      <a href="mailto:hello@bendigophoenix.org.au"
         class="text-brand-purple font-semibold text-sm hover:text-brand-gold transition-colors">
        hello@bendigophoenix.org.au
      </a>
    </div>
    <div>
      <p class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">President</p>
      <a href="mailto:president@bendigophoenix.org.au"
         class="text-brand-purple font-semibold text-sm hover:text-brand-gold transition-colors">
        president@bendigophoenix.org.au
      </a>
    </div>
    <div>
      <p class="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Treasurer</p>
      <a href="mailto:treasurer@bendigophoenix.org.au"
         class="text-brand-purple font-semibold text-sm hover:text-brand-gold transition-colors">
        treasurer@bendigophoenix.org.au
      </a>
    </div>
  </div>
</div>
```

The card's outer structure (icon div, `card-hover` wrapper) is unchanged. The Contact Cards grid remains `lg:grid-cols-3` — three cards, unchanged.

---

## Change 3 — Footer: 3 Columns to 4 Columns (`src/components/Footer.astro`)

### Current structure
- Column 1: Brand/logo + tagline
- Column 2: Contact Us (address + email)
- Column 3: Follow Us (social links) + Quick Links as a secondary sub-section (`mt-6`)

### Target structure
- Column 1: Brand/logo + tagline (unchanged)
- Column 2: Contact Us (unchanged)
- Column 3: Follow Us only (social links, no sub-section)
- Column 4: Quick Links (standalone, same links, same order)

### Exact changes

1. Change grid class on the column wrapper from `md:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-4`
   - `md:grid-cols-2` at tablet (768px–1023px): two rows of two — avoids four very narrow columns at mid-size viewports
   - `lg:grid-cols-4` at desktop (1024px+): four horizontal columns

2. Remove the Quick Links sub-section (`<div class="mt-6 space-y-1">` and its `<h3>`) from inside the Follow Us column.

3. Add a new fourth `<div>` column after Follow Us:

```html
<!-- Quick Links -->
<div>
  <h3 class="text-brand-gold font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
  <div class="space-y-1">
    <a href="/seasons" class="block text-sm text-purple-200 hover:text-brand-gold transition-colors">Seasons</a>
    <a href="/get-involved" class="block text-sm text-purple-200 hover:text-brand-gold transition-colors">Get Involved</a>
    <a href="/coaching-resources" class="block text-sm text-purple-200 hover:text-brand-gold transition-colors">Coaching Resources</a>
    <a href="/contact" class="block text-sm text-purple-200 hover:text-brand-gold transition-colors">Contact</a>
  </div>
</div>
```

All four Quick Links items preserved exactly, in original order, with identical classes.

### Responsive behaviour
- Mobile (< 768px): `grid-cols-1` — all four columns stack vertically
- Tablet (768px–1023px): `md:grid-cols-2` — Brand + Contact / Follow Us + Quick Links in two rows
- Desktop (1024px+): `lg:grid-cols-4` — four horizontal columns

---

## Change Order

No cross-file dependencies. Recommended order for review hygiene:

1. `src/components/Footer.astro` — affects every page; validate first
2. `src/pages/index.astro` — homepage welcome section removal
3. `src/pages/contact.astro` — Find Us removal + email card update

---

## Risks and Gotchas

1. **`stagger-1` through `stagger-5` classes** on welcome section elements — grep confirms they are never defined in any stylesheet. Safe to remove.

2. **Footer `md:grid-cols-2` vs `md:grid-cols-4`** — if the design requires four columns starting at 768px, switch to `md:grid-cols-4`. At 768px the Contact column (multi-line address) may feel cramped at four columns. Verify visually.

3. **Contact page bottom spacing** — the removed Find Us section had `pb-16` as an override. After removal the page ends with the Contact Cards section (`py-16`). Visually acceptable but check the transition to the footer doesn't feel abrupt. If needed, add extra bottom padding to the Contact Cards section.

4. **Email card height** — three labelled email entries will make the Email card taller than sibling cards in the 3-column grid. Cards use `flex flex-col` — they will not auto-stretch to equal height. If visual mismatch is undesirable, add `items-stretch` to the grid and `h-full` to each card. Polish call, not a functional requirement.
