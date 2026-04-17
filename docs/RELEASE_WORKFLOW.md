# Phoenix Release Workflow

This document explains how changes move from local development to the live site.

## What lives where

- **GitHub**: source of truth for code and content
- **GitHub Actions**: builds and deploys the site
- **VentraIP / cPanel**: production hosting
- **`public/live-data/`**: live JSON data used by the PlayHQ-driven pages

## Two deployment paths

### 1) Site deploy path
Use this when you change pages, components, styles, layouts, or images.

Flow:
1. Make changes on a feature branch.
2. Commit the work.
3. Push the branch to GitHub.
4. Open a PR or merge the branch into `main`.
5. GitHub Actions runs **Deploy Phoenix Site** on `main`.
6. The workflow builds Astro and uploads the production site to VentraIP.
7. Check the live site in production.

### 2) PlayHQ data refresh path
Use this when the site code is already live and only the scores/live game data needs updating.

Flow:
1. The scheduled workflow runs, or you trigger it manually.
2. PlayHQ data is refreshed.
3. Only `public/live-data/` is published.
4. The site polls the live JSON and updates without a full rebuild.

## Local development workflow

### A. Make changes
- Edit the page/component/image you need.
- If adding an image, put it in the correct `public/images/...` folder.
- Keep any new paths relative to `public/` when referenced from Astro.

### B. Commit on a branch
Example:
```bash
git checkout -b feature/my-change
# make edits
git add .
git commit -m "feat: update homepage hero"
```

### C. Push the branch
```bash
git push -u origin feature/my-change
```

### D. Merge to `main`
- Merge the branch into `main` when ready.
- `main` is what triggers the production deploy workflow.

### E. Check GitHub Actions
- Go to the repo’s **Actions** tab.
- Open **Deploy Phoenix Site**.
- Confirm the run is green.
- If the workflow fails, read the failing step and fix the issue before trying again.

### F. Check production
- Open `https://bendigophoenix.org.au`
- Confirm the new page or image is visible.
- Hard refresh if the browser is caching.

## Adding or replacing images

1. Save the image into the correct folder under `public/images/`.
   - Hero/home images → `public/images/hero/`
   - Team photos → `public/images/team/`
   - Season images → `public/images/seasons/`
   - Sponsor logos → `public/images/sponsors/`
   - About images → `public/images/about/`
2. Update the relevant Astro file to point at the new path.
3. Commit, push, and merge as above.
4. Check Actions and production.

## Adding or changing page content

1. Edit the relevant `.astro` page in `src/pages/`.
2. If the change uses shared UI, update the component in `src/components/`.
3. Commit, push, and merge to `main`.
4. Check the deploy workflow and the live page.

## What to watch in production

- New page content renders correctly
- Images load from the right path
- Old Joomla content is no longer being served
- Live PlayHQ sections continue to update from `/live-data/*`

## Common troubleshooting

- **Old Joomla still appears**: check the FTP remote directory is the document root, not a nested `public_html` folder.
- **Action is green but the site looks stale**: hard refresh and check the correct workflow ran.
- **Image missing**: confirm the file exists under `public/images/...` and the path in the page is correct.
- **Live scores not changing**: check the PlayHQ refresh workflow and the browser network panel for `/live-data/*.json`.
