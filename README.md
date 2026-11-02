# Bendigo Phoenix — evergreen club website

A static Astro website for Bendigo Phoenix Basketball Club. The site deliberately avoids routine seasonal publishing and competition-data maintenance.

## Run and verify

Requires Node.js **22.12.0 or newer**.

```bash
npm ci
npm run dev
npm test
npm run build
npm run check:evergreen
npm run preview
```

`check:evergreen` checks the **built** HTML, links and legacy redirects; run it after building. No PlayHQ credentials or network access are needed to build the website.

## Site structure and content ownership

| Area | Purpose |
| --- | --- |
| Home | Permanent club welcome and navigation. Uses a branded logo until a suitable evergreen photo is selected. |
| Play Basketball | General joining guidance, uniforms, training communication, financial assistance and links to current information. |
| Get Involved | Sponsorship and volunteering. No event listings. |
| Resources | Existing coaching/player learning materials, tools, guides, forms and policies. |
| About | Club history, values and Slam Dunk Bridging Fund. |
| Contact | General enquiries via `hello@bendigophoenix.org.au`. No committee directory. |

**Changing information belongs elsewhere:**

- Facebook: https://facebook.com/phoenixunitedbasketball — announcements, season updates and events.
- PlayHQ: the club-level directory configured in `src/config/club-profile.ts` — visitors select a season/team for fixtures, results and ladders. Do not replace it with a season-specific URL.
- Club/team communications: registration steps, current fees, available team places and training arrangements. Email remains an alternative for people without Facebook.

No on-site scores, team rosters, season calendars, PlayHQ scraping or overnight updates are required. There is no embedded Facebook/PlayHQ feed. Do not add an embed unless it is supported and does not require seasonal reconfiguration.

“No maintenance” means **no routine or seasonal maintenance**, not a guarantee that contacts, sponsors, policies, dependencies or external links will never change.

## Occasional editing map

| Area | Location |
| --- | --- |
| Club identity, general contact and social/PlayHQ links | `src/config/club-profile.ts` |
| Homepage and eventual permanent photo | `src/pages/index.astro` |
| Joining guidance | `src/pages/play-basketball.astro` |
| About / financial assistance | `src/pages/about.astro`, `content/about/` |
| Sponsorship / volunteering | `src/pages/get-involved.astro` |
| Sponsor logos and links | `src/data/sponsors.json`, `public/images/sponsors/` |
| Resources | `src/pages/resources/`, `src/data/*-resources.json`, `src/data/{guides,forms,policies}.json` |
| Public documents and images | `public/resources/`, `public/images/`, `public/uploads/` |
| Shared navigation / footer | `src/components/Navbar.astro`, `src/components/Footer.astro` |

Existing resource content, About and financial-assistance content are intentionally unchanged by the evergreen redesign. The existing newsletter signup and sponsor strip are retained.

## Legacy links

Astro emits static redirects for `/seasons`, `/teams`, `/team`, `/scores`, `/scores/game` and known old team URLs. These lead to `/play-basketball` and include a fallback link without JavaScript.

`src/data/legacy-team-slugs.json` is a one-time migration list, **not** a current team list. It never needs a season refresh. `public/.htaccess` also redirects arbitrary old team/game URLs on Apache/cPanel, including URLs not in that list, and preserves useful old resource/volunteer links. Apache rewrite rules must be checked on hosting; Astro preview does not execute `.htaccess`.

## Deployment

`.github/workflows/deploy.yml` builds and deploys static `dist/` to VentraIP/cPanel using FTPS when `main` changes or via manual dispatch. This is **deployment only**, not recurring data automation.

Required GitHub secrets: `FTP_HOST`, `FTP_PORT`, `FTP_USER`, `FTP_PASS`; optional `FTP_REMOTE_DIR` (defaults to `.`). The remote directory must be the intended document root, not a nested `public_html` folder.

The mirror deletes obsolete remote output, including retired live-data files. PlayHQ sync and nightly team-detail workflows have been removed. They stop on GitHub after this branch is merged into the default branch; cancel any already-running old sync job before deployment. No production deployment is performed by local verification.

Historical PlayHQ scripts/helpers and feature components remain in the repository for reference, but are not used by active pages or deployment. Their optional developer commands are not required for operating this site. Older documents under `docs/` and `specs/` may describe the retired system; this README describes the current operating model.

## Pre-redesign backup

- Git restore tag: `backup-before-evergreen-20261025-093802`
- Full local ZIP: `C:\Users\camer\Documents\phoenix-backups\phoenix-before-evergreen-20261025-093802.zip`
- Redesign branch: `redesign/evergreen-20261025`

The verified ZIP includes source, public assets, Git history and private local configuration. It excludes regenerable `node_modules`, `dist` and `.astro`. Keep it private. It is not a backup of files stored only on the hosting server.

To inspect the old version without resetting current work:

```bash
git switch -c restore/pre-evergreen backup-before-evergreen-20261025-093802
npm ci
npm run build
```

Ensure your working tree is clean before switching. Do not restore old automation to production without explicitly deciding to resume it.
