# Evergreen redesign — implementation and verification

## Agreed scope

- Permanent homepage welcome with Play Basketball / Get Involved calls to action; branded logo fallback until a club photo is selected.
- Seasons and Teams replaced by Play Basketball, with general joining guidance, uniforms/training communication and financial-assistance signposting.
- Facebook owns announcements; PlayHQ owns competition data; general email remains an accessible alternative.
- Contact reduced to general enquiries, without committee profiles or role inboxes.
- Get Involved retains sponsorship and volunteering, without event listings.
- On-site scores and scheduled PlayHQ/team refresh workflows removed.
- Resources, About, financial-assistance and sponsor data intentionally unchanged.
- Existing newsletter and sponsor strip retained.

## Implementation decisions

The club-level PlayHQ page was found via public search and returned HTTP 200:

https://www.playhq.com/basketball-victoria/org/phoenix-united-basketball-development-club-bendigo/90c7fb8e

This is not tied to a season/team. No supported, season-independent embed was confirmed, so the approved link-out fallback is used. No API credentials are required.

Astro generates static redirects for old top-level pages and 31 previously known team slugs. Apache rules cover arbitrary old team/game URLs, discard obsolete query parameters, and preserve specific old resource/volunteer links. The known-slug list is a frozen migration artifact, not a roster to maintain.

Removed tests described retired pages, their source structure and removed recurring workflows. Replacement coverage tests built HTML, actual browser behavior, the current navigation, and the absence of scheduled data dependencies. Unit tests for retained helpers/components remain.

Small shared-shell accessibility improvements: skip-to-content link; closed mobile menu links are hidden from keyboard navigation and accessibility tools.

## Verification

- `npm run build`: PASS.
- `npm run check:evergreen`: PASS. Checks homepage, joining guidance, general enquiries, sponsorship/volunteering, legacy redirects, shared navigation, one H1 per main page, skip link and absence of published live snapshots.
- `npx vitest run --exclude src/lib/events/parser.test.ts --exclude src/data/__tests__/guides.test.ts`: 61 files / 569 tests PASS.
- Full `npm test`: 582 PASS, 5 FAIL. All remaining failures were present before implementation: four date-sensitive event-filter tests in `src/lib/events/parser.test.ts` and one guide-list count/order test in `src/data/__tests__/guides.test.ts`. Resources and event helpers were left unchanged rather than expanding scope.
- Baseline before implementation: 619 PASS / 11 FAIL across 75 files. Other original failures concerned retired sync behavior and a club-profile assertion resolved by the new pages.
- Browser verification using Playwright CLI against the production preview at widths 390px and 1440px: home, Play Basketball, Get Involved, Contact, About, Resources and court-time calculator all render without horizontal overflow or broken nonempty image sources. Mobile navigation, player/policy tabs and six legacy redirects PASS. No page JavaScript errors or live-data/API requests detected.
- Existing third-party console warnings appeared from retained embedded content (iframe allow/fullscreen and Google's report-only framing policy). These are not new application exceptions.
- Visual inspection of the desktop homepage screenshot completed. Browser evidence is local under `.playwright-cli/` (gitignored).
- `git diff` confirms no changes to About/financial-assistance, resource pages/data, or sponsor data.

## Release limitations

Not pushed, merged or deployed. Scheduled jobs on the current GitHub default branch are unaffected until merge. Cancel any in-flight old data-sync workflow before publishing. Deployment remains a GitHub Action; only recurring data automation is removed.

The production deployment now removes obsolete live-data output rather than preserving it. Apache-specific redirects require post-deploy verification on cPanel; local Astro preview verifies static redirect files but does not run Apache rules. Check the live PlayHQ/Facebook links and sponsor prospectus after deployment.

The pre-redesign ZIP and Git tag are documented in `README.md`.
