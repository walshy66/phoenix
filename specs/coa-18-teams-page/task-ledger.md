# Task Ledger: coa-18-teams-page

## Window 1: Foundation & Listing Page Structure
- [x] T1.1: Create Teams listing page shell (`src/pages/teams.astro`) with basic structure
- [x] T1.2: Implement age group section headers in correct order (u10s, u12s, u14s, u16s, u18s)
- [x] T1.3: Create static placeholder data file (`src/data/teams/teams.json`) with sample teams
- [x] T1.4: Implement team tile component with three information pills (Division, Game night, Boys/Girls)
- [x] T1.5: Display teams organized by age group with alphabetical sorting within each group
- [x] T1.6: Implement pill "TBC" display for missing values
- [x] T1.7: Apply basic styling consistent with SeasonTile.astro and ScoreCard.astro patterns
- [x] T1.8: Ensure keyboard accessibility for team tiles (Tab focus, Enter activation)

## Window 2: Filtering Functionality
- [x] T2.1: Create sticky filter bar component with options: All, Boys, Girls, Age group, Game Day, Grade
- [x] T2.2: Implement filter state management using sessionStorage with key `teams-filter`
- [x] T2.3: Implement client-side filtering logic to show/hide teams based on active filter
- [x] T2.4: Implement sub-selection dialogs for Age group, Game Day, and Grade filters
- [x] T2.5: Show "No teams match this filter" message with Clear filter action when results are zero
- [x] T2.6: Hide age group headers when no matching teams in that group (no orphan headers)
- [x] T2.7: Ensure filter bar is horizontally scrollable on mobile if options overflow
- [x] T2.8: Implement keyboard accessibility for filter buttons (Tab focus, Enter/Space activation)
- [x] T2.9: Communicate active filter state via aria-pressed (not color alone)
- [x] T2.10: Preserve filter state when navigating back from detail page

## Window 3: Navigation & Detail Page Shell
- [x] T3.1: Implement team tile click navigation to `/teams/[team-slug]`
- [x] T3.2: Create team detail page shell (`src/pages/teams/[slug].astro`)
- [x] T3.3: Implement BaseLayout wrapper for both listing and detail pages
- [x] T3.4: Create dynamic route parameter handling for team slug
- [x] T3.5: Display team name on detail page matching clicked tile
- [x] T3.6: Implement basic styling for detail page sections
- [x] T3.7: Ensure navigation preserves filter state via sessionStorage
- [x] T3.8: Implement browser back button functionality to return to listing with filter intact

## Window 4: Detail Page Content - Fixture & Ladder
- [x] T4.1: Create fixture data structure and placeholder data for team detail page
- [x] T4.2: Implement fixture section with game rows (date, time, opponent, venue, home/away, result)
- [x] T4.3: Display completed games with score format "Home Score – Away Score"
- [x] T4.4: Show "No games scheduled" placeholder when fixture data is empty
- [x] T4.5: Create ladder data structure and placeholder data for team detail page
- [x] T4.6: Implement ladder table with columns: position, wins, losses, draws, points
- [x] T4.7: Show "Ladder not yet available" placeholder when ladder data is empty
- [x] T4.8: Source fixture/ladder data from PlayHQ-generated JSON files (following scores.astro pattern)
- [x] T4.9: Implement graceful degradation when PlayHQ data files are missing/stale
- [x] T4.10: Log structured messages to browser console for data loading failures

## Window 5: Detail Page Content - Staff & Training
- [x] T5.1: Create static staff data file for coach and manager information
- [x] T5.2: Implement staff section displaying "Coach: [Name]" and "Manager: [Name]"
- [x] T5.3: Ensure no contact details (email, phone) are displayed in staff section
- [x] T5.4: Omit staff section entirely when no coach/manager data exists
- [x] T5.5: Create static training schedule data file
- [x] T5.6: Implement training section displaying "Training: [Venue] · [Day] @ [Time]"
- [x] T5.7: Show "No training scheduled" when no training data exists
- [x] T5.8: Source staff and training data from manually maintained static JSON files
- [x] T5.9: Implement graceful degradation when staff/training data files are missing
- [x] T5.10: Log structured messages to browser console for staff/training data loading failures

## Window 6: Responsive Design & Accessibility
- [x] T6.1: Implement responsive grid layout for teams listing (1-col <640px, 2-col 640px-1024px, 3-4-col >1024px)
- [x] T6.2: Ensure team detail page stacks sections vertically on mobile
- [x] T6.3: Permit two-column layout on desktop for fixture + ladder side by side
- [x] T6.4: Apply consistent tile styling with SeasonTile.astro and ScoreCard.astro patterns
- [x] T6.5: Ensure all interactive elements meet 44x44px minimum tap target size
- [x] T6.6: Implement proper heading hierarchy (h1 for page title, h2 for age group sections)
- [x] T6.7: Ensure color contrast for pill text and backgrounds meets WCAG AA (4.5:1)
- [x] T6.8: Implement focus indicators for keyboard navigation
- [x] T6.9: Test responsive breakpoints at 320px, 640px, 1024px, and 1440px viewports
- [x] T6.10: Conduct keyboard-only navigation test for all interactive elements

## Window 7: Game Detail Modal (P3)
- [x] T7.1: Create game detail modal component
- [x] T7.2: Implement modal opening on fixture game row click
- [x] T7.3: Populate modal with game details (opponent, time, venue, home/away, final score)
- [x] T7.4: Implement modal closing via Escape key and outside click
- [x] T7.5: Trap focus within modal when open
- [x] T7.6: Return focus to triggering game row when modal closes
- [x] T7.7: Ensure modal occupies full viewport height on mobile and is scrollable
- [x] T7.8: Pre-populate modal data from fixture file (no runtime API call)
- [x] T7.9: Implement smooth modal open/close animations (within 200ms)
- [x] T7.10: Ensure modal does not interfere with underlying page state

## Window 8: Performance Optimization & Final Testing
- [x] T8.1: Optimize Teams listing page initial render to complete within 2 seconds
- [x] T8.2: Ensure filter interactions produce visible feedback within 100ms
- [x] T8.3: Implement lazy loading for any team tile images (if added)
- [x] T8.4: Validate all success criteria are met
- [x] T8.5: Run full test suite and fix any failing tests
- [x] T8.6: Conduct WCAG 2.1 AA accessibility audit
- [x] T8.7: Test cross-browser compatibility
- [x] T8.8: Verify no raw error messages are shown to users when data files are missing
- [x] T8.9: Create implementation summary documentation
- [x] T8.10: Final code review and cleanup
- [x] T8.11: Prepare for Linear issue transition to Review status
