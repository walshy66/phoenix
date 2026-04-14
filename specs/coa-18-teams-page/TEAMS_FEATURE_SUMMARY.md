# Bendigo Phoenix Teams Feature - Complete Implementation

## ✅ What's Implemented

### 1. **Court Data Integration**
- ✅ Integrated `surfaceName` from PlayHQ API (e.g., "Court 7")
- ✅ Displays court name in schedule list for each game
- ✅ Shows court in game details modal
- ✅ Captures court info from venue object in game data

### 2. **Game Schedule Display**
Each game in the schedule shows:
- Date & Time (formatted for Australian locale)
- Venue Name
- **Court Number** (NEW)
- Opponent Team
- Final score (if completed)

### 3. **Live/In-Progress Games Support**
The system is ready for live games:
- ✅ Captures game `status` from PlayHQ API
- ✅ Status values supported: UPCOMING, IN_PROGRESS, LIVE, COMPLETED
- ✅ Live games show animated "● LIVE" badge in red
- ✅ Live games have highlighted background color
- ✅ Modal displays LIVE status for active games
- ✅ Clicking live games shows score (if available) + LIVE indicator

### 4. **Game Details Modal**
Click any game in the schedule to see:
- Home Team vs Away Team
- Current/Final Score (with LIVE indicator if in progress)
- Date, Time, and Venue
- **Court Name** (NEW)
- Close via: button, Escape key, or background click

## 📊 Data Structure

### Game Object (from teams-details.json)
```json
{
  "id": "game-uuid",
  "date": "2026-04-24",
  "time": "17:15:00",
  "venue": "Red Energy Arena (Bendigo Stadium)",
  "court": "Court 7",
  "address": "91 Inglis Street",
  "homeTeam": "Team Name",
  "awayTeam": "Team Name",
  "homeScore": null,
  "awayScore": null,
  "status": "UPCOMING",
  "round": "Round 1"
}
```

## 🔄 How to Update Data

Run these commands whenever PlayHQ data needs refreshing:

```bash
# Fetch all Phoenix teams
node scripts/scrape-playhq-teams.js

# Fetch schedule & ladder for each team
node scripts/scrape-playhq-teams-details.js

# Rebuild the site with updated data
npm run build
```

## 🎬 Enhancing Live Game Experience (Future Enhancements)

### Option 1: Real-Time Updates via Socket.IO (Recommended)
```javascript
// In the modal, subscribe to live game updates
socket.on(`game:${gameId}`, (data) => {
  // Update scores in real-time
  updateScoreDisplay(data.homeScore, data.awayScore);
  updateGameQuarter(data.quarter, data.timeRemaining);
});
```

### Option 2: Fetch Game Summary from PlayHQ
```bash
GET /v1/games/{gameId}/summary
```

This endpoint returns detailed live stats:
- Quarter/Period information
- Player statistics
- Play-by-play events
- Real-time scores

### Option 3: Link to PlayHQ Live Game Center
```javascript
// Add button in modal for games in progress
const playhqUrl = `https://www.playhq.com/basketball-victoria/.../game-centre/${gameId}`;
// Open in new window for live scoreboard
```

## 🎨 Design Features

### Schedule List
- Responsive layout (stacks on mobile)
- Hover states with background color change
- Live games highlighted in red with animation
- Clear typography hierarchy
- Touch-friendly buttons (44px+ minimum)

### Modal
- Full-screen on mobile, centered on desktop
- Smooth open/close animations
- Clear information hierarchy
- Status indicators (LIVE badge, final scores)
- Keyboard navigation (Escape to close)

### Color Scheme
- **Brand Purple**: #573F93 (primary)
- **Brand Gold**: #8B7536 (accents)
- **Live Red**: #EF4444 (in-progress games)

## 📱 Responsive Behavior

### Desktop (>1024px)
- 2-column layout (Schedule left, Ladder right)
- Sticky ladder (stays visible while scrolling)
- Modal centered with max-width

### Tablet (640px-1024px)
- 2-column layout maintained
- Modal adjusted for smaller screens

### Mobile (<640px)
- Single column (Schedule stacks above Ladder)
- Full-width modal with bottom-to-top slide animation
- Touch-optimized spacing

## 🔧 Technical Implementation

### Files Modified/Created
```
scripts/
  ├── scrape-playhq-teams.js (extracts teams from PlayHQ)
  ├── scrape-playhq-teams-details.js (extracts schedules & ladders)
  
src/pages/teams/
  ├── [slug].astro (team detail page with schedule/ladder)
  
src/pages/
  ├── teams.astro (teams listing with filters)
  
src/components/
  └── Navbar.astro (updated to show "Teams" instead of "Team")
  
scripts/
  ├── teams-data.json (all Phoenix teams)
  └── teams-details.json (schedule & ladder per team)
```

### API Integration
- PlayHQ API Key: Embedded in scraper scripts
- Season ID: Currently Winter 2026 (b3efb4fc-f645-4b5a-a777-50cc99464849)
- Endpoints used:
  - `/v1/seasons/{seasonId}/teams` → all teams
  - `/v1/seasons/{seasonId}/grades` → grades/divisions
  - `/v1/grades/{gradeId}/games` → schedule
  - `/v1/grades/{gradeId}/ladder` → ladder standings
  - `/v1/games/{gameId}/summary` → live game details (optional)

## ✨ Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance
- Pre-rendered static pages (fast)
- Schedule/Ladder loaded at build time
- Modal uses vanilla JS (no dependencies)
- Images lazy-loaded
- CSS optimized with Tailwind

## 📋 Checklist

- [x] Court data from PlayHQ integrated into display
- [x] Court shown in schedule list
- [x] Court shown in modal
- [x] Game status tracking (UPCOMING, LIVE, COMPLETED)
- [x] LIVE badge for in-progress games
- [x] Live game animations (pulsing badge)
- [x] Click games to see details modal
- [x] All 21 Phoenix teams included
- [x] Responsive design (mobile-first)
- [x] Accessibility (keyboard, screen readers)
- [x] Phoenix color theme applied
- [x] Data refresh via scripts

## 🎯 Usage

1. **View Teams**: Navigate to `/teams`
2. **Filter Teams**: Use dropdown filters
3. **View Team Details**: Click any team
4. **See Schedule**: Left column shows all games with dates, times, venues, courts
5. **Check Ladder**: Right column shows team standings
6. **Game Details**: Click any game to see modal with full details
7. **Live Games**: When season starts, LIVE badge appears on active games

---

**Last Updated**: 2026-04-12
**PlayHQ Data**: Synced at build time
**Next Refresh**: Run `node scripts/scrape-playhq-teams.js` before rebuilding
