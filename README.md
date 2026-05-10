# Phoenix operator and template guide

Phoenix is an Astro-based basketball club website for Bendigo Phoenix. This repository is also the working template for future club sites, so keep club-specific details in the configuration and content files called out below rather than hard-coding them into components.

## Clean checkout setup

1. Install Node.js **22.12.0 or newer**.
2. Clone the repository and enter the project directory.
3. Install dependencies with `npm ci`.
4. Create `.env.local` for local-only PlayHQ values if you need to refresh data locally. Do not commit `.env.local` or secret values.
5. Run the relevant verification command before opening a PR.

```bash
npm ci
npm run dev
```

## Local run, test, and build commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Astro dev server, usually at `http://localhost:4321`. |
| `npm run test` | Run the Vitest test suite. |
| `npm run build` | Build the production site into `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run playhq:refresh:local` | Refresh PlayHQ-derived local JSON artifacts and copy them into `public/live-data/`. |
| `npm run scores:refresh` | Refresh raw PlayHQ scores into `scripts/scores-data.json`. |
| `npm run scores:check` | Validate `scripts/scores-data.json`. |
| `npm run home-scores:refresh` | Refresh home page game data into `scripts/home-games-data.json`. |
| `npm run home-scores:check` | Validate `scripts/home-games-data.json`. |
| `npm run rounds:check` | Validate generated round files. |

## Content editing map

Use these locations for routine club/operator edits:

| Area | Edit here |
| --- | --- |
| Home page welcome copy | `content/home/welcome.md` |
| About page copy | `content/about/about.md` and `content/about/slam-dunk.md` |
| Season overview content | `content/seasons/current.md` |
| Page routes | `src/pages/` |
| Shared page sections/cards | `src/components/` |
| Events | `src/data/events.md` |
| Forms and guides | `src/data/forms.json`, `src/data/guides.json` |
| Coaching/player/manager resources | `src/data/*-resources.json` |
| Team lists and staff | `src/data/teams/teams.json`, `src/data/teams/staff.json` |
| Static images | `public/images/` |
| Live PlayHQ JSON served by the site | `public/live-data/` |

### Hero section images

Hero carousel slides are stored in `public/images/hero/` and configured in `src/pages/index.astro` in the `heroSlides` array.

Image requirements:

- JPEG or WebP.
- 16:9 landscape.
- Recommended size: 1400×788px minimum, 1920×1080px for high-DPI screens.
- Keep key content centred because narrow screens crop edges.
- Provide meaningful `alt` text for every slide.

## Club profile and template configuration

The central club profile is `src/config/club-profile.ts`. Update this file when cloning for another club or changing Phoenix-level details:

- club name, legal name, short name, team prefix, and tagline
- city/region/state
- contact email addresses and postal address
- social profile labels, URLs, and handles
- default site metadata and canonical site URL
- home venue identity

Prefer importing `clubProfile` from this module rather than duplicating club details in pages/components.

## Sponsors, venues, and training data

| Data | Edit here | Notes |
| --- | --- | --- |
| Sponsors | `src/data/sponsors.json` | Add sponsor `id`, display `name`, logo path, link, and joined date. Place logos under `public/images/sponsors/`. |
| Sponsor CTA | `src/data/sponsors.json` | Update `ctaLink` if sponsorship enquiries move to another email or form. |
| Venues | `src/data/venues.ts` | Update venue names, addresses, map links/embeds, labels, and per-venue training schedules used by the site. |
| Simple training fallback | `src/data/teams/training.json` | Keep aligned with the current club training message where this data source is used. |
| Team/staff data | `src/data/teams/*.json` | Update team and staff records when club structure changes. |

## PlayHQ sync configuration and operation

PlayHQ configuration is centralised in `scripts/lib/playhq-config.js` and consumed by the PlayHQ refresh scripts. Keep club-specific PlayHQ values in environment variables or `.env.local`; do not hard-code them into scripts.

Local refresh flow:

```bash
npm run playhq:refresh:local
npm run build
```

`npm run playhq:refresh:local` runs the score, weekly game, and home score refresh/check sequence, then copies the generated artifacts into `public/live-data/scores.json` and `public/live-data/home-games.json` for local preview/builds.

Lower-level commands are available when debugging a specific artifact:

```bash
npm run scores:refresh
npm run scores:check
node scripts/scrape-weekly-games.js
node scripts/check-weekly-games-data.js
npm run home-scores:refresh
npm run home-scores:check
```

Production live data mapping:

- `public/live-data/scores.json` powers `/scores` and `/scores/[gameId]`.
- `public/live-data/home-games.json` powers the home page scores carousel.

## Required environment variables and secrets

Never commit secret values. Document the variable names and purpose only.

### PlayHQ data refresh

| Name | Required for | Purpose |
| --- | --- | --- |
| `PLAYHQ_API_KEY` | PlayHQ refresh scripts | API key sent as the `x-api-key` header. |
| `PLAYHQ_TENANT` | PlayHQ refresh scripts | PlayHQ tenant sent as the `x-phq-tenant` header. |
| `PLAYHQ_CLUB_NAME` | PlayHQ refresh scripts | Club name used to identify Phoenix records. |
| `PLAYHQ_CLUB_MATCH` | Optional PlayHQ matching override | Alternate match string when PlayHQ naming differs from the display club name. |
| `PLAYHQ_SEASON_IDS` | PlayHQ refresh scripts | Comma-separated season IDs to include in sync output. |
| `PLAYHQ_API_BASE` | Optional PlayHQ API override | Defaults to `https://api.playhq.com`; override only for testing/non-standard API targets. |

### Production deployment

These GitHub Actions secrets are used by `.github/workflows/deploy.yml` to publish `dist/` to VentraIP/cPanel via FTPS.

| Name | Required | Purpose |
| --- | --- | --- |
| `FTP_HOST` | Yes | FTPS host. |
| `FTP_PORT` | Yes | FTPS port. |
| `FTP_USER` | Yes | FTPS username. |
| `FTP_PASS` | Yes | FTPS password. |
| `FTP_REMOTE_DIR` | Optional | Remote document root. Defaults to `.`. Must not point to a nested `public_html` directory. |

## Deployment workflow

The main site deployment is defined in `.github/workflows/deploy.yml` as **Deploy Phoenix Site**.

1. Work on a feature branch.
2. Run relevant checks locally, at minimum `npm run test` and `npm run build` for site/content changes.
3. Commit and push the branch.
4. Open a PR or merge the branch into `main` when approved.
5. A push to `main` runs the GitHub Actions workflow.
6. The workflow installs dependencies with `npm ci`, builds with `npm run build`, installs `lftp`, and mirrors `dist/` to the configured FTPS destination.
7. Check the live site at `https://bendigophoenix.org.au` after the workflow is green.

For more release detail and troubleshooting, see `docs/RELEASE_WORKFLOW.md`.

## Clone this template for a new club

When using Phoenix as the starting point for another club:

1. Create a new repository from this codebase.
2. Update package/repository metadata if the new club needs distinct naming.
3. Replace the central club details in `src/config/club-profile.ts`.
4. Replace PlayHQ environment values: `PLAYHQ_CLUB_NAME`, `PLAYHQ_CLUB_MATCH` if needed, and `PLAYHQ_SEASON_IDS`.
5. Update content under `content/` for the new club voice, history, and calls to action.
6. Replace sponsors in `src/data/sponsors.json` and sponsor logos under `public/images/sponsors/`.
7. Replace venues/training in `src/data/venues.ts` and `src/data/teams/training.json`.
8. Replace teams/staff/resources in `src/data/teams/` and `src/data/*-resources.json`.
9. Replace images under `public/images/`, especially hero, team, season, sponsor, and about images.
10. Update deployment secrets for the new hosting account.
11. Run `npm run playhq:refresh:local`, `npm run test`, and `npm run build` before first deploy.
12. Confirm no Bendigo Phoenix-specific names, URLs, emails, or assets remain except in intentional migration notes.

## Template-readiness checklist

Before declaring this repository ready to seed or operate another club site, confirm:

- [ ] `README.md` reflects operator/template workflow, not starter-project instructions.
- [ ] `src/config/club-profile.ts` is the source of truth for club identity and contact details.
- [ ] Content files under `content/` are current for the target club.
- [ ] Sponsors, venues, training, teams, staff, and resources are updated in `src/data/`.
- [ ] PlayHQ variables are configured by name only in docs/scripts and secret values remain outside git.
- [ ] `.env.local` is ignored and contains only local developer values.
- [ ] `npm run playhq:refresh:local` succeeds for the target club when PlayHQ credentials are available.
- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] Deployment secrets exist in GitHub Actions for the target hosting account.
- [ ] The production deployment workflow has been checked after merge to `main`.
- [ ] Browser verification covers home, scores, seasons, teams, about/contact, resources, sponsor displays, and image loading.
