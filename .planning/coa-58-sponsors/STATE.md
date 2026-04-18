# STATE — COA-58 Sponsors

## Feature Metadata
- Branch: `cameronwalsh/coa-58-sponsors`
- Scope: Home page sponsor carousel + Get Involved sponsor slot 1
- Status: Implementation in progress

## Current Implementation Notes
- Sponsor data source created at `src/data/sponsors.json`
- Shared sponsor component created at `src/components/SponsorCard.astro`
- Sponsor CTA card created at `src/components/SponsorCTACard.astro`
- Carousel created at `src/components/SponsorCarousel.astro`
- Home page now renders `SponsorStrip` with the restored scrolling sponsor marquee and larger sponsor cards
- Get Involved sponsor section uses larger cards and `your logo here` placeholders
- Get Involved page now renders sponsor slot 1 from shared data

## Validation
- Tests passed via `npm test`
- Build passed via `npm run build`
