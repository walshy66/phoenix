# Bendigo Phoenix Website — Maintainer Guide

A plain-English guide for updating and managing the Bendigo Phoenix website using Claude Code.
You don't need to be a developer — Claude Code can make most changes just by describing what you want.

---

## 1. Opening the Project in Claude Code

1. Open **Claude Code** on your computer
2. Navigate to (or open) the folder: `C:\Users\camer\Documents\phoenix`
3. You're ready to go. You can type instructions in plain English.

---

## 2. How to Swap or Add Images

The site uses CSS gradient boxes as image placeholders. To replace them with real images:

1. Save your image into the relevant folder:
   - Hero/home images → `/images/home/`
   - Team photos → `/images/team/`
   - Season images → `/images/seasons/`
   - Sponsor logos → `/images/sponsors/`
   - About images → `/images/about/`

2. Then tell Claude Code what you want, for example:

   > "Replace the purple placeholder on the hero section of the home page with the image at images/home/hero.jpg"

   > "Add a photo for player John Smith — the photo is at images/team/john-smith.jpg"

---

## 3. How to Add a Coaching or Player Resource Card

To add a new resource to the coaching or player resources pages, tell Claude Code:

**Example prompt:**
> "Add a new coaching resource called 'U16 Shooting Drills' in the Drills category for U16 age group. It's a PDF and the URL is https://example.com/drills.pdf. The description is: A set of progressive shooting drills for under-16 players."

Claude will add the card to `/src/pages/coaching-resources.astro` or `/src/pages/player-resources.astro`.

---

## 4. How to Update Season Information

Season content lives in `/content/seasons/current.md`.

Open that file and update the placeholder text under:
- `## Costs` — replace with actual registration fees
- `## Key Dates` — replace with season dates
- `## Grading` — add grading session details

You can also ask Claude Code:
> "Update the seasons page: registration fee for juniors is $150, seniors is $200. Season starts 1 March 2025."

The season page is at `/src/pages/seasons.astro` — Claude can update the data table directly.

---

## 5. How to Refresh Scores Data (Scores Page + Home Carousel)

The website now uses two score artifacts:
- `/scripts/scores-data.json` → full Scores page
- `/scripts/home-games-data.json` → Home page 7-day carousel

### Step A — Refresh source scores from PlayHQ
```bash
npm run scores:refresh
```

### Step B — Validate scores artifact shape
```bash
npm run scores:check
```

### Step C — Build home carousel artifact from latest scores
```bash
npm run home-scores:refresh
```

### Step D — Validate home carousel artifact shape
```bash
npm run home-scores:check
```

If validation fails, commands show a clear error (invalid JSON/shape/status).

Finally rebuild the site:
```bash
npm run build
```

---

## 6. How to Deploy the Site

**Prerequisites (one-time setup):**
- Install `lftp` on your machine (Mac: `brew install lftp`)
- Get your VentraIP FTPS credentials from your hosting account
- Set the environment variables (or edit deploy.sh directly):

```bash
export SFTP_HOST="your-host.ventraip.com.au"
export SFTP_USER="yourusername"
export SFTP_PASS="yourpassword"
export SFTP_DIR="."
```

> Important: `SFTP_DIR` / `FTP_REMOTE_DIR` should point to the actual website document root. For this hosting account, that is the root of `public_html` — **not** `public_html/public_html`.


**To deploy:**
```bash
bash deploy.sh
```

This will:
1. Build the site (creates the `/dist` folder)
2. Upload everything to your VentraIP hosting

The live site will be at: https://bendigophoenix.org.au

---

## 7. Common Tasks — Example Claude Prompts

Copy and paste these into Claude Code as a starting point:

### Updating text
> "Update the welcome message on the home page — change the subtitle to 'Central Victoria's Premier Basketball Club'"

### Adding a team member
> "Add a new player to the team page: Name is Sarah Jones, role is Point Guard, jersey number 4. Use a placeholder photo for now."

### Adding a sponsor
> "Add a new sponsor to the Get Involved page: Company name is 'Bendigo Hardware Co', tier is Gold Sponsor"

### Creating an event
> "Add a new event to the Get Involved page: Title is 'End of Season Presentation Night', date is 20 September 2025, category is Club Event, description is: Join us to celebrate the 2025 season."

### Fixing something
> "The footer email address is wrong — change it to info@bendigophoenix.org.au"

### Checking the site builds
> "Run npm run build and tell me if there are any errors"

### Adding a new page
> "Create a new page called 'Gallery' that shows a grid of photos. For now use placeholder boxes."

---

## File Structure Overview

```
phoenix/
├── src/
│   ├── pages/          ← Website pages (one .astro file per page)
│   ├── components/     ← Reusable parts (Navbar, Footer, cards, etc.)
│   ├── layouts/        ← Page shell (BaseLayout.astro)
│   └── styles/         ← Global CSS
├── content/            ← Editable content in markdown
├── images/             ← Your images go here
├── scripts/            ← Scores scraper + data
├── public/             ← Static files (favicon, fonts, icons)
├── deploy.sh           ← Deploy script
└── HOWTO.md            ← This file
```

---

## Getting Help

If something's not working, just describe the problem to Claude Code:
> "The navigation menu isn't showing on mobile. Can you fix it?"
> "The build is failing with this error: [paste the error]"
> "The sponsor strip isn't scrolling. What's wrong?"

Claude Code can read the files, diagnose issues and fix them directly.
