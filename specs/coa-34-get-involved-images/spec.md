# Feature Specification: Get Involved Page - Images & Real Data

**Feature Branch**: `COA-34-get-involved-images`
**Created**: 2026-04-08
**Status**: Spec Draft

## User Scenarios & Testing

### User Story 1 - Restore Get Involved page with legacy assets (Priority: P1)

Coach/admin collects images from the old Joomla site, attaches them to the issue with an inventory document. Claude Code reviews the spec and image assets, then integrates them into the Astro "Get Involved" page component with proper layout, responsiveness, and alt text.

**Why this priority**: The Get Involved page is a critical public-facing resource for the community. Restoring it with real assets moves it from incomplete to live and functional.

**Independent Test**: Can be fully tested by loading the Get Involved page in a browser and verifying all images display correctly, are responsive, load within acceptable time, and have proper alt text.

**Acceptance Scenarios**:

1. **Given** the old Joomla site images and March image are collected, **When** Claude Code processes the spec, **Then** all images are correctly placed in the Astro component
2. **Given** images are integrated, **When** page is viewed on desktop, **Then** layout is visually correct and images are properly sized
3. **Given** page is loaded on mobile, **When** user views the page, **Then** images are responsive and maintain aspect ratio
4. **Given** images are loaded, **When** page performance is measured, **Then** all images load within 2 seconds

## Requirements

### Functional Requirements

* **FR-001**: System MUST display all legacy images from the old Joomla site in the correct locations
* **FR-002**: System MUST include the March image in the designated section
* **FR-003**: Images MUST be responsive and scale appropriately for mobile, tablet, and desktop viewports
* **FR-004**: Each image MUST have descriptive alt text for accessibility
* **FR-005**: System MUST optimize images for web (appropriate formats, sizes, compression)
* **FR-006**: Images MUST load and be visible within 2 seconds on standard broadband

### Key Data

* Image inventory (filename, dimensions, current location in old site, placement in new page, alt text, notes)
* Page layout structure defining image placement zones
* March image (special seasonal asset - location and context TBD)

### Image Inventory

All 14 event images belong in the **Events Gallery** section of the **Get Involved** page. There is no April 2026 image yet.

| Image Name | Type | Month/Year | Alt Text | Location in Page |
| -- | -- | -- | -- | -- |
| PHOENIX_events_May25.png | Monthly poster | May 2025 | Coming Up May 2025 poster with Fuel & Focus workshop, uniforms required, and winter season start dates. | Events Gallery section of the Get Involved page |
| PHOENIX_events_June25.png | Monthly poster | June 2025 | Coming Up June 2025 poster with Good Sports Week and daytime ladies basketball events. | Events Gallery section of the Get Involved page |
| PHOENIX_events_July25.png | Monthly poster | July 2025 | Coming Up July 2025 poster with player journal check-in, school holidays, winter skills clinic, and BBA games back on. | Events Gallery section of the Get Involved page |
| PHOENIX_events_August25.png | Monthly poster | August 2025 | Coming Up August 2025 poster with summer season registrations, Braves tryouts, uniform update, and finals timing. | Events Gallery section of the Get Involved page |
| PHOENIX_events_September25.png | Monthly poster | September 2025 | Coming Up September 2025 poster with registrations closed, grading day, finals rounds, and team announcements. | Events Gallery section of the Get Involved page |
| PHOENIX_events_October25.png | Monthly poster | October 2025 | Coming Up October 2025 poster with club training, grading game round 1, team name rules, club coach course, and player journal goals. | Events Gallery section of the Get Involved page |
| PHOENIX_events_December25.png | Monthly poster | December 2025 | Coming Up December 2025 poster with last club training, last BBA games, Phoenix vs Bullets, and Christmas Day messaging. | Events Gallery section of the Get Involved page |
| PHOENIX_events_January26.png | Monthly poster | January 2026 | Coming Up January 2026 poster with Melbourne United in Bendigo and BBA games start dates. | Events Gallery section of the Get Involved page |
| Phoenix_events_Feb26.png | Monthly poster | February 2026 | Coming Up February 2026 poster with club Sunday training, Bendigo Spirit final, club training survey, Good Sports votes, and winter registration opening soon. | Events Gallery section of the Get Involved page |
| PHOENIX_events_march26.png | Monthly poster | March 2026 | Coming Up March 2026 poster with club Sunday training, finals started, player journal entries and winners, and welcome to club day. | Events Gallery section of the Get Involved page |
| PHOENIX_SkillsClinic_2025Winter_1.png | Winter skills clinic | July 2025 | Winter skills clinic session 1 poster for junior players aged 5 to 17 at Red Energy Arena. | Events Gallery section of the Get Involved page |
| PHOENIX_SkillsClinic_2025Winter_2.png | Winter skills clinic | July 2025 | Winter skills clinic session 2 poster for junior players aged 5 to 17 at Red Energy Arena. | Events Gallery section of the Get Involved page |
| PHOENIX_Social_NEWTrainingSession.jpg | Training session | 2025 | New session training graphic for Wednesday 7pm open court with all players welcome and no coaches. | Events Gallery section of the Get Involved page |
| FuelAndFocus.png | Program | May 2025 | Fuel & Focus program poster for men aged 16 plus with date, time, location, and registration call to action. | Events Gallery section of the Get Involved page |

## Success Criteria

### Measurable Outcomes

* **SC-001**: All images from old site are successfully migrated and display correctly
* **SC-002**: Get Involved page passes WebPageTest with images loading in under 2 seconds
* **SC-003**: Page is fully responsive and tested on mobile (375px), tablet (768px), desktop (1920px)
* **SC-004**: 100% of images have descriptive alt text that meets WCAG 2.1 standards
* **SC-005**: Visual comparison with old site confirms layout and styling match community expectations

## Next Steps

1. Download all images from old bendigophoenix.org.au Get Involved page
2. Create image inventory document (CSV or markdown table with: filename, dimensions, old location, new placement, alt text, notes)
3. Attach inventory and images to this issue
4. Claude Code will integrate assets into Astro component based on this spec
