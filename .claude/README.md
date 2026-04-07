# .claude/ Folder

This folder is used by **Claude Code** for project-specific configuration, skills and agent files.

## What Goes Here

- **Skills** — Custom slash commands or workflows specific to this project (e.g. `/deploy`, `/update-scores`)
- **Agent files** — Instructions or context files that help Claude Code understand this project
- **Project settings** — Any Claude Code project-level configuration

## About This Project

This is the **Bendigo Phoenix Basketball Club** website, built with [Astro](https://astro.build) and Tailwind CSS.

Key details Claude Code should know:
- Brand colors: Purple `#573F93`, Gold `#8B7536`, Black `#111111`, Off-white `#F4F5F7`
- Do NOT use orange anywhere — only the four brand colors above plus white
- All placeholder images use CSS gradient boxes, never broken `<img>` tags
- The site must build with `npm run build` before deploying
- Scores data is fetched via `node scripts/scrape-playhq.js`
- Deploy is done via `bash deploy.sh` using SFTP to VentraIP

## Project Structure

```
src/pages/         - Astro page files (one per route)
src/components/    - Reusable Astro components
src/layouts/       - BaseLayout.astro (page shell)
src/styles/        - global.css with CSS vars + Tailwind
content/           - Markdown content files
scripts/           - PlayHQ scraper + scores JSON
images/            - Image assets
public/            - Static assets (favicon, fonts, icons)
```

## Maintenance Notes

See `/HOWTO.md` for the full non-technical maintainer guide.
