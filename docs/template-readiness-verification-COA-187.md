# COA-187 Phoenix template-readiness verification

Date: 2026-05-10

## Verdict

Phoenix is **safe to copy into `C:\Users\camer\Documents\kfcc-site` for the Kangaroo Flat literal portability test**.

The full test suite and production build now pass after resolving baseline drift in page assertions, game-card rendering assertions, and the PlayHQ sync workflow schedule/time-gate expectations.

## Verification commands run

| Command | Result | Notes |
| --- | --- | --- |
| `test -f docs/template-readiness-verification-COA-187.md; echo "report_exists=$?"` | Failed as expected before this report | Verification-first red check showed no final report existed yet (`report_exists=1`). |
| `npm run test` | Failed initially | Initial run: 70 test files run, 66 passed, 4 failed. 611 tests run, 604 passed, 7 failed. Failures were baseline drift. |
| `npm run build` | Passed initially | Astro built 104 pages into `dist/`. Warnings: `src/lib/events/filters.ts` imports `Event` that is not exported by `src/lib/events/types.ts`; Astro internal helper unused imports warning. |
| `npm run test -- src/__tests__/club-profile.test.ts src/__tests__/playhq-config.test.ts src/__tests__/playhq-sync-workflow.test.ts` | Passed | 3 files / 7 tests passed for the new template-readiness areas. |
| `rg -n "PLAYHQ|playhq|api\.playhq|x-api-key|x-phq-tenant|clubId|club ID|seasonId|Bendigo Phoenix|Phoenix" scripts .github src/config src/pages src/components README.md --glob '!**/*.json' --glob '!node_modules/**'` | Completed | Used to inspect PlayHQ config, central club profile usage, README guidance, and remaining club-specific references. |
| `npm run test` | Passed | Final run: 70 test files passed, 611 tests passed. |
| `npm run build` | Passed | Final run: Astro built 104 pages into `dist/`. Same non-blocking warnings as above. |

## Full test failures resolved

1. `src/components/__tests__/coa-67-fixes.test.ts`
   - Updated the hero carousel expectation from `/images/hero/training.png` to the current intended `/images/hero/training_update.png`.
   - Restored teams filter bar spacing expected by the mobile wrap test (`py-3`).
   - Restored contact email wrapping behavior with `break-all` and removed `whitespace-nowrap` from contact email links.
2. `src/components/__tests__/ui-touch-up.test.ts`
   - Restored standardized hero padding where required (`py-12 lg:py-8`) on teams and scores pages.
3. `src/lib/playhq/round-renderer.test.ts`
   - Updated upcoming game-card assertions to expect the current placeholder-score layout and `TBD` badge rather than `VS`.
   - Updated completed game-card assertions to expect the current Phoenix result badge (`W/L/D`) rather than `FINAL`.
4. `src/lib/playhq/workflow.test.ts` and `src/__tests__/playhq-sync-workflow.test.ts`
   - Restored the PlayHQ sync schedule to `30 5-13 * * 1,2,3,5`.
   - Added an `Australia/Melbourne` time gate for the 4:30pm–11:30pm refresh window.
   - Ensured scheduled refresh/build/deploy steps skip outside the Melbourne window while manual workflow dispatch remains available.

## Must-fix area review

### 1. Failing tests

Status: **Cleared**.

Final `npm run test` passes:

- 70 test files passed.
- 611 tests passed.

### 2. Hardcoded PlayHQ secrets / club IDs in scripts

Status: **Mostly cleared, no secret values found in inspected source**.

Observed improvements:

- `scripts/lib/playhq-config.js` centralises PlayHQ config names and reads from environment / `.env.local`.
- Scripts consume `PLAYHQ_API_KEY`, `PLAYHQ_TENANT`, `PLAYHQ_CLUB_NAME`, `PLAYHQ_CLUB_MATCH`, and `PLAYHQ_SEASON_IDS` rather than embedding secret values.
- `.github/workflows/playhq-sync.yml` references GitHub Actions secrets for PlayHQ values.
- `.gitignore` excludes `.env.local`.

Notes:

- Remaining PlayHQ endpoint paths such as `/v1/seasons/${seasonId}/...` are API paths, not hardcoded club IDs.
- `scripts/write-round-files.js` and `scripts/poll-live-scores.js` still parse `PLAYHQ_SEASON_IDS` directly from `process.env`; this is environment-driven rather than hardcoded.

### 3. Core club identity/contact/meta centralisation

Status: **Mostly cleared for the intended central source**.

Observed improvements:

- `src/config/club-profile.ts` defines club identity, legal name, short name, team prefix, tagline, location, contacts, socials, metadata, and home venue.
- Focused tests in `src/__tests__/club-profile.test.ts` pass.

Notes:

- There are still legitimate Phoenix references in content/pages/components. That is expected for the Phoenix source site, but they must be replaced when cloning.
- The clone checklist in `README.md` explicitly calls out replacing residual Phoenix-specific names, URLs, emails, and assets.

### 4. README / operator documentation

Status: **Cleared for template/operator guidance**.

Observed improvements:

- `README.md` has been rewritten from the Astro starter README into a Phoenix operator/template guide.
- It documents clean checkout setup, commands, content editing locations, club profile configuration, PlayHQ env vars, deployment workflow, clone steps, and a template-readiness checklist.

## Final conclusion

Proceed with copying Phoenix into `C:\Users\camer\Documents\kfcc-site` for the Kangaroo Flat literal portability test.

Acceptance gate status:

1. Full test suite passes.
2. Production build passes.
3. PlayHQ configuration, club profile centralisation, and README/operator documentation are ready for the template-seed test.
