# Quickstart: Sponsors Feature

**Feature**: COA-58 Sponsors | **Date**: 2026-04-18

---

## Overview

This guide covers the current sponsor implementation:

- Home page sponsor strip marquee with a centred `OUR PROUD SPONSORS` heading
- Get Involved sponsor grid with the MB Automation Victoria logo in slot 1
- Placeholder sponsor cards that say `your logo here`
- Shared logo asset copied from `upload/sponsor_mbauto.png` into `public/images/sponsors/sponsor_mbauto.png`

---

## Prerequisites

- Node.js 22.12.0+
- Dependencies installed via `npm install`
- Familiarity with the home page and `/get-involved` page

---

## Key Files

- `src/components/SponsorStrip.astro`
- `src/components/SponsorCard.astro`
- `src/pages/index.astro`
- `src/pages/get-involved.astro`
- `src/data/sponsors.json`
- `public/images/sponsors/sponsor_mbauto.png`

---

## Manual Test Checklist

### Home Page

1. Open `/`
2. Confirm the sponsor section heading reads `OUR PROUD SPONSORS`
3. Confirm the heading is centred and uses the existing styling
4. Confirm the sponsor strip scrolls horizontally
5. Confirm the first sponsor card shows the MB Automation Victoria logo
6. Confirm the remaining cards show `Become a Sponsor`
7. Confirm sponsor cards are larger and the logo fills the card better
8. Confirm sponsor links open in a new tab

### Get Involved Page

1. Open `/get-involved`
2. Scroll to the sponsor section
3. Confirm the heading reads `OUR PROUD SPONSORS`
4. Confirm slot 1 shows the MB Automation Victoria logo
5. Confirm the empty cards show `your logo here`
6. Confirm the sponsor logo card is larger and better fills the cell
7. Confirm the sponsor logo opens the Facebook link in a new tab
8. Confirm the section keeps its six-slot grid layout

### Accessibility Checks

- Sponsor logo has descriptive alt text
- External sponsor link includes `rel="noopener noreferrer"`
- Sponsor logo and CTA cards remain keyboard accessible
- Tap targets remain comfortable on mobile

---

## Troubleshooting

### Sponsor logo looks too small

- The source image includes transparent padding around the artwork
- The image has been trimmed in `public/images/sponsors/sponsor_mbauto.png`
- If it still looks small, check the card height and padding in:
  - `src/components/SponsorStrip.astro`
  - `src/components/SponsorCard.astro`

### Empty cards show the wrong text

- The placeholder text should be `your logo here`
- Update `src/pages/get-involved.astro` if the wording changes

### Sponsor image missing

- Confirm `public/images/sponsors/sponsor_mbauto.png` exists
- Confirm the source file in `upload/sponsor_mbauto.png` is available if you need to re-copy it

---

## Validation

Run the standard checks:

```bash
npm test
npm run build
```

Both should complete successfully.
