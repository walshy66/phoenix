# Implementation Log: COA-58 Sponsors

## 2026-04-18
- Added `src/data/sponsors.json`
- Added `SponsorCard.astro` and briefly prototyped carousel components during implementation
- Removed the unused carousel prototype files after restoring the sponsor strip
- Restored the homepage sponsor strip so the scrolling marquee remains in place
- Updated the Get Involved sponsor grid so slot 1 renders the sponsor logo
- Synced and trimmed the sponsor logo asset from `upload/sponsor_mbauto.png` into `public/images/sponsors/sponsor_mbauto.png`
- Increased sponsor card sizing on the home strip and get-involved sponsor section
- Updated empty sponsor cards to read `your logo here`
- Added lightweight contract tests for data, components, and page integration
