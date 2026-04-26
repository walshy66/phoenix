# Quickstart — COA-87 Home Page Score

## Verify the default-off homepage
1. Run the app locally.
2. Open `/` in a browser.
3. Confirm the homepage shows the hero carousel, quick links, and sponsor strip.
4. Confirm the `Latest Results` heading, score cards, and carousel controls are not present.
5. Confirm there is no blank gap where the score carousel used to appear.

## Verify the feature can be re-enabled
1. Set `HOME_SCORES_ENABLED` to `true` in `src/lib/home-scores/feature-flags.ts`.
2. Reload `/`.
3. Confirm the `Latest Results` section and score carousel reappear.
4. Confirm the rest of the homepage sections stay in the same order.

## Regression checks
1. Open `/scores` and confirm the scores page still works normally.
2. Open a `/scores/{gameId}` page and confirm game details still render.
3. Check `/` at mobile, tablet, and desktop widths to confirm spacing remains intact with the carousel hidden.
