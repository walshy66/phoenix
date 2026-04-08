# Spec: COA-21 Committee Office Bearers

**Status**: IN_IMPLEMENTATION
**Priority**: P2 (Feature Enhancement)
**Branch**: COA-21-committee-office-bearers
**Type**: Frontend Feature — Static Content Addition
**Scope**: Add office bearer images and information to contact page

---

## Summary

Add a new section to the contact page displaying three committee office bearers (President: Cam, Secretary: Kylie, Treasurer: Ainsley) with their photos, names, and titles in a responsive grid. Section appears after existing contact cards (Address, Email, Social). Uses responsive 3-column grid (desktop), 2-column (tablet), 1-column (mobile) with circular photo display and existing `.card-hover` styling for visual consistency.

---

## User Scenarios & Testing

### User Story 1 — Member Discovers Club Leadership (Priority: P1)

**Description**: A club member visits the contact page and can immediately see who holds the three key leadership positions, including their photos and names, creating a sense of personal connection to the club's governance.

**Why this priority**: Identifying leadership is a fundamental task for club members seeking governance clarity and personal connection. This is independently shippable and delivers immediate value without depending on other features.

**Independent Test**: Render contact page → scroll to office bearers section → verify three office bearer cards are visible with photos, names, and titles → test responsive behavior on mobile (1 column), tablet (2 columns), desktop (3 columns).

**Acceptance Scenarios**:
1. Given a user visits the contact page, When the page loads, Then the office bearers section appears after the contact cards with three visible office bearers (Cam, Kylie, Ainsley)
2. Given a user is on desktop view, When viewing the office bearers section, Then three cards display in a single row (3-column grid)
3. Given a user is on tablet view, When viewing the office bearers section, Then cards display in two rows with two cards in the first row and one in the second (responsive grid)
4. Given a user is on mobile view, When viewing the office bearers section, Then each card stacks vertically in a single column
5. Given each office bearer card is visible, When the user inspects the card, Then the card displays the office bearer's circular photo, full name, and official title

### User Story 2 — Admin Updates Office Bearer Information (Priority: P2)

**Description**: A club administrator can update office bearer information (names, titles, photos) through a centralized JSON data file without touching component code, enabling quick leadership changes.

**Why this priority**: Admin maintainability is important but not essential for MVP launch. Once P1 is shipped with static data, admins can update via the data file.

**Independent Test**: Load the office-bearers.json data file → verify all three office bearers have name, title, and image path fields → modify data → verify page reflects changes on rebuild.

**Acceptance Scenarios**:
1. Given the office-bearers.json data file exists, When an admin modifies an office bearer's name, Then the change appears on the contact page after rebuild
2. Given the data file contains image paths, When an image file is added to the public directory, Then the office bearer card displays the updated photo

### User Story 3 — Visitor Recognizes Leadership Visual Hierarchy (Priority: P3)

**Description**: Visitors to the contact page can intuitively understand that the office bearers section represents a distinct group of leadership information, separate from general contact methods, through consistent visual styling and positioning.

**Why this priority**: Visual hierarchy and styling consistency enhance UX but are refinement concerns after core functionality is verified.

**Independent Test**: Verify office bearers section uses consistent `.card-hover` styling with existing contact cards → test hover interactions (card lift) → verify gold accent bar appears consistently → test accessibility (keyboard navigation, focus states).

**Acceptance Scenarios**:
1. Given the office bearers cards are rendered, When the user hovers over a card, Then the card lifts with a shadow effect (consistent with `.card-hover` behavior)
2. Given the page is loaded, When comparing office bearer cards to contact cards visually, Then both use matching rounded corners, borders, and spacing
3. Given a user navigates via keyboard, When using Tab to reach an office bearer card, Then the card receives visible focus state

### Edge Cases

**Empty/Missing Data**:
- If office-bearers.json is missing or data is empty → section should not render or show graceful error message
- If an individual office bearer record lacks name, title, or image path → card should display with fallback empty state

**Image Loading**:
- If an office bearer image fails to load → placeholder or fallback image should display
- If image is missing from public directory → alt text remains visible; card layout does not break

**Responsive Breakpoints**:
- Breakpoint transitions (mobile ↔ tablet ↔ desktop) should reflow grid smoothly without content shifting
- On very small screens (< 320px) → verify layout remains usable

**Accessibility**:
- Screen readers must properly announce office bearer information in logical order
- Alt text for images must be descriptive
- Circular cropping of images must not cause any images to load incorrectly

---

## Requirements

### Functional Requirements

**FR-001**: System MUST render an "Office Bearers" section on the contact page positioned after the existing contact cards (Address, Email, Social).

**FR-002**: System MUST display three office bearer cards (President, Secretary, Treasurer) each with:
- Circular profile photo (150px diameter)
- Office bearer's full name
- Official title (e.g., "President", "Secretary", "Treasurer")

**FR-003**: System MUST load office bearer data from a JSON data file (`src/data/office-bearers.json`) with the following structure:
```json
{
  "officeBearers": [
    {
      "id": "president",
      "name": "Cam",
      "title": "President",
      "image": "/images/office-bearers/cam.jpg"
    },
    {
      "id": "secretary",
      "name": "Kylie",
      "title": "Secretary",
      "image": "/images/office-bearers/kylie.jpg"
    },
    {
      "id": "treasurer",
      "name": "Ainsley",
      "title": "Treasurer",
      "image": "/images/office-bearers/ainsley.jpg"
    }
  ]
}
```

**FR-004**: System MUST apply responsive grid layout:
- Desktop (≥ 1024px): 3-column grid displaying all three office bearers in a single row
- Tablet (768px – 1023px): 2-column grid (2 cards, then 1)
- Mobile (< 768px): 1-column grid with cards stacking vertically

**FR-005**: System MUST reuse the `.card-hover` CSS class to ensure consistent interactive behavior (lift on hover, shadow effect).

**FR-006**: System MUST NOT create a new page or break out of the BaseLayout component; the section must integrate seamlessly within the existing contact.astro page.

**FR-007**: System MUST NOT use component imports for office bearer cards; cards may be rendered inline with Astro's templating or as a simple, reusable partial component (optional).

---

### Non-Functional Requirements

**NFR-001 — Accessibility (WCAG 2.1 AA)**:
- Office bearer card images MUST have descriptive alt text in the format: "{Name}, {Title}"
- Office bearer cards MUST be focusable via keyboard Tab navigation
- Focus indicators MUST be visible and meet WCAG contrast requirements
- Screen readers MUST announce the section heading and each office bearer's role and name in a logical sequence
- Circular image cropping MUST NOT prevent the alt text from being read or the image from loading

**NFR-002 — Responsive Layout**:
- Layout MUST adapt smoothly across all viewport sizes without horizontal scrolling
- Cards MUST maintain consistent spacing and padding across all breakpoints
- Text (name, title) MUST remain readable on all screen sizes (minimum font size 14px for body text)

**NFR-003 — Error Handling & Fallback**:
- If office-bearers.json is missing or malformed → section MAY be skipped silently or display a minimal fallback
- If an office bearer image fails to load → a neutral placeholder image or icon MAY be displayed; card layout MUST NOT break
- If office bearer data is incomplete (missing name or title) → card SHOULD display gracefully with empty fields or placeholder text

**NFR-004 — Performance**:
- Office bearer images SHOULD be optimized for web (compressed, appropriately sized)
- Section SHOULD lazy-load images below the fold if performance metrics indicate a need
- JSON data file parsing SHOULD complete within page build/render time (no client-side async loading for initial render)

**NFR-005 — Visual Consistency**:
- Office bearer cards MUST match the visual style of existing contact cards:
  - White background (`bg-white`)
  - Rounded corners (12px – `rounded-xl`)
  - Border (`border border-gray-100`)
  - Subtle shadow on hover (via `.card-hover`)
  - Gold accent bar or divider MAY be added for visual distinction (optional)

---

### Key Entities

**Office Bearer**:
- `id` (string): Unique identifier for the office bearer role (e.g., "president", "secretary", "treasurer")
- `name` (string): Full name of the office bearer (e.g., "Cam", "Kylie", "Ainsley")
- `title` (string): Official title/role (e.g., "President", "Secretary", "Treasurer")
- `image` (string): Relative path to the office bearer's photograph (e.g., "/images/office-bearers/cam.jpg")

**Image Requirements**:
- Format: JPG or PNG
- Minimum size: 300px × 300px (to support 150px × 150px display at 2x DPI)
- Aspect ratio: Square (1:1)
- Location: `/public/images/office-bearers/`
- File naming: Lowercase, dash-separated (e.g., `cam.jpg`, `kylie.jpg`, `ainsley.jpg`)

---

## Success Criteria

**SC-001**: Office bearers section is rendered on the contact page and is visually distinct from other content sections.

**SC-002**: All three office bearers (President, Secretary, Treasurer) display with correct photos, names, and titles.

**SC-003**: Responsive grid adapts correctly across desktop, tablet, and mobile viewports without breaking layout.

**SC-004**: Office bearer card hovers lift with shadow effect (via `.card-hover` class).

**SC-005**: Office bearer photos load and display within circular crop without distortion or accessibility impact.

**SC-006**: Admin can update office bearer information by editing `src/data/office-bearers.json` without touching component code.

**SC-007**: Page accessibility score remains at WCAG 2.1 AA or better (no regression in audit).

**SC-008**: Office bearers section appears after contact cards (Address, Email, Social) and before footer.

---

## Acceptance Criteria

**Desktop Layout**:
1. Given the contact page loads on desktop (≥ 1024px), When the user scrolls to the office bearers section, Then three cards display horizontally in a single row with equal spacing
2. Given a user hovers over an office bearer card, When the mouse is over the card, Then the card lifts up 4px and a shadow appears

**Tablet Layout**:
1. Given the contact page loads on tablet (768px – 1023px), When the user views the office bearers section, Then two cards display in the first row and one card in the second row

**Mobile Layout**:
1. Given the contact page loads on mobile (< 768px), When the user views the office bearers section, Then all three cards stack vertically in a single column

**Image Display**:
1. Given an office bearer card is rendered, When the image loads, Then the photo displays within a 150px circular crop centered in the card
2. Given an image fails to load, When the page is viewed, Then a placeholder or fallback is shown and the card layout remains intact

**Accessibility**:
1. Given a user navigates via keyboard Tab, When they reach an office bearer card, Then a visible focus ring appears around the card
2. Given a screen reader is active, When the user reads the office bearers section, Then the section heading, each office bearer's name and title are announced clearly

**Data Integration**:
1. Given office-bearers.json exists with valid data, When the page builds, Then the section renders with data from the file
2. Given an admin updates a name in office-bearers.json, When the page rebuilds, Then the updated name displays on the contact page

**Semantic HTML**:
1. Given the office bearers section exists, When the page is inspected, Then the section uses semantic HTML:
   - `<section>` wrapper for the office bearers area
   - `<article>` or `<div>` for each card (with appropriate aria labels if needed)
   - `<img>` tags with descriptive alt text

**Content Integration**:
1. Given the contact page renders, When comparing sections vertically, Then office bearers section appears after contact cards and maintains consistent spacing from other elements

---

## Visual Design Specifications

### Card Layout

**Card Dimensions**:
- Width: Responsive (flex grid, equal distribution)
- Padding: 24px (6 units)
- Border radius: 12px (`rounded-xl`)
- Border: 1px solid #E5E7EB (`border border-gray-100`)
- Background: #FFFFFF (`bg-white`)
- Shadow (default): subtle (1px offset, 0.1 opacity)
- Shadow (hover): 0 12px 30px rgba(87, 63, 147, 0.2) (via `.card-hover:hover`)

**Photo Container**:
- Shape: Circle (border-radius 50%)
- Size: 150px × 150px
- Display: Centered horizontally in card
- Object-fit: cover (to maintain square aspect ratio)
- Border: Optional 2px border in brand gold or subtle shadow for definition

**Typography**:
- Name (heading):
  - Font size: 18px–20px
  - Font weight: bold (700)
  - Color: #111111 (`text-brand-black`)
  - Margin: 12px top, 4px bottom
  
- Title (subtitle):
  - Font size: 14px
  - Font weight: medium (500)
  - Color: #6B7280 (`text-gray-500`)
  - Margin: 0

**Spacing Within Card**:
- Photo to name: 16px
- Name to title: 4px
- Sides: 24px padding

### Grid Layout

**Desktop (≥ 1024px)**:
- Columns: 3
- Gap: 24px
- Max width: 1344px (matching existing `.max-w-7xl`)

**Tablet (768px – 1023px)**:
- Columns: 2
- Gap: 20px
- Last card may wrap to new row

**Mobile (< 768px)**:
- Columns: 1
- Gap: 16px
- Full width with 16px–24px padding

### Color Palette

- Background: #FFFFFF (`bg-white`)
- Border: #E5E7EB (`border-gray-100`)
- Text (name): #111111 (`text-brand-black`)
- Text (title): #6B7280 (`text-gray-500`)
- Hover shadow: rgba(87, 63, 147, 0.2) (brand purple with transparency)
- Accent (optional): #8B7536 (`brand-gold`)

---

## Data Structure

### `src/data/office-bearers.json`

```json
{
  "officeBearers": [
    {
      "id": "president",
      "name": "Cam",
      "title": "President",
      "image": "/images/office-bearers/cam.jpg"
    },
    {
      "id": "secretary",
      "name": "Kylie",
      "title": "Secretary",
      "image": "/images/office-bearers/kylie.jpg"
    },
    {
      "id": "treasurer",
      "name": "Ainsley",
      "title": "Treasurer",
      "image": "/images/office-bearers/ainsley.jpg"
    }
  ]
}
```

**Field Descriptions**:
- `id`: Machine-readable role identifier; used for potential styling or data filtering
- `name`: Human-readable name of the office bearer
- `title`: Official title (should match legal/club records)
- `image`: Relative path to image file in `/public/` directory

---

## Implementation Approach

### File Organization

```
src/
  pages/
    contact.astro                    (modified to import data and render section)
  data/
    office-bearers.json             (new data file)
public/
  images/
    office-bearers/
      cam.jpg                        (new image)
      kylie.jpg                      (new image)
      ainsley.jpg                    (new image)
```

### Implementation Steps

1. **Create data file**: Add `src/data/office-bearers.json` with office bearer records.

2. **Add images**: Store high-quality square images (300px × 300px minimum) in `/public/images/office-bearers/`.

3. **Modify contact.astro**:
   - Import office bearer data
   - Add new `<section>` after existing contact cards
   - Use Astro's templating to render a grid of office bearer cards
   - Apply Tailwind classes for responsive grid and styling

4. **CSS & Styling**:
   - Reuse `.card-hover` for consistency
   - Add circular image crop via CSS (`rounded-full`, `object-cover`)
   - Use Tailwind breakpoints (`sm:`, `lg:`) for responsive grid
   - No new CSS files required; all styling via Tailwind classes

5. **Component Pattern** (optional):
   - Create a reusable `OfficeBearerCard.astro` component if inline rendering becomes too verbose
   - Component signature: `{ id, name, title, image }`
   - Import and loop in contact.astro

### Code Structure Example

```astro
---
// contact.astro (updated)
import BaseLayout from '../layouts/BaseLayout.astro';
import officeBearersData from '../data/office-bearers.json';

const officeBearers = officeBearersData.officeBearers;
---

<BaseLayout>
  <!-- Existing contact cards -->
  <!-- ... -->

  <!-- Office Bearers Section (NEW) -->
  <section class="py-16 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {officeBearers.map(bearer => (
          <article class="card-hover bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-center gap-4">
            <img
              src={bearer.image}
              alt={`${bearer.name}, ${bearer.title}`}
              class="w-[150px] h-[150px] rounded-full object-cover"
            />
            <div class="text-center">
              <h3 class="font-bold text-brand-black text-lg">{bearer.name}</h3>
              <p class="text-gray-500 text-sm">{bearer.title}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
</BaseLayout>
```

---

## Testing Strategy

### Unit Testing (Data)

**Test**: office-bearers.json structure is valid
- Load JSON file
- Verify all three office bearers present
- Verify each has `id`, `name`, `title`, `image` fields

### Visual Regression Testing

**Test**: Office bearer cards render correctly
- Screenshot desktop layout (3-column grid)
- Screenshot tablet layout (2-column grid)
- Screenshot mobile layout (1-column stack)
- Compare against baseline

### Integration Testing

**Test**: Contact page includes office bearers section
- Render contact.astro
- Query for office bearers section
- Verify section contains three cards
- Verify each card displays name, title, and image

### Accessibility Testing

**Test**: Keyboard navigation
- Tab through office bearer cards
- Verify focus ring visible
- Verify reading order logical (name → title)

**Test**: Screen reader
- Run axe or WAVE
- Verify alt text is announced
- Verify section heading is announced

### Responsive Testing

**Test**: Breakpoint transitions
- Resize viewport from desktop → tablet → mobile
- Verify grid columns transition without layout shift
- Verify images crop correctly at all sizes
- Verify text remains readable

### Image Loading Testing

**Test**: Image display
- Verify images load without errors
- Verify circular crop displays correctly
- Test with placeholder/missing image file
- Verify alt text still visible if image fails

---

## Constitutional Compliance

**Principle I — Explicit User Outcomes**:
✅ PASS — User Story 1 has clear measurable outcome: member can identify leadership with photos and names. Success Criteria SC-002 verifies the display of office bearer information.

**Principle II — Test-First & Observable Behavior**:
✅ PASS — All acceptance criteria are testable and observable. Testing strategy covers unit, integration, accessibility, responsive, and image loading scenarios.

**Principle VI — Backend Authority & Invariants**:
✅ PASS — No backend changes required. Data is static (JSON file). No server state inference on client. If future versions add admin editing, backend would be authoritative.

**Principle VII — Lifecycle & Fastify Rules**:
✅ PASS — No Fastify routes or backend lifecycle changes involved. Static site generation (Astro) handles data at build time.

**AppShell Composition**:
✅ PASS — Feature integrates within existing `contact.astro` page, which renders within BaseLayout. No custom navigation or shell. Consistent with existing contact page structure.

**Identity Boundary**:
✅ PASS — No user identity or authentication involved. Office bearer information is public. No userId or athleteId in data structure.

**Accessibility (WCAG 2.1 AA)**:
✅ PASS — NFR-001 and testing strategy explicitly cover keyboard navigation, focus states, alt text, and screen reader compliance. Circular image crop is handled via CSS and does not impact accessibility.

**Responsive Design**:
✅ PASS — FR-004 and visual design specifications address desktop, tablet, and mobile breakpoints. Acceptance criteria SC-003 verifies responsive grid adaptation.

**Data Immutability**:
✅ PASS — No mutation of existing data structures. Office bearers data is read-only JSON file. Feature does not modify planSnapshot, session records, or other immutable entities.

**Semantic HTML**:
✅ PASS — Implementation approach uses semantic `<section>`, `<article>`, and `<img>` tags with alt text.

---

## Dependencies & Assumptions

**Dependencies**:
- Astro framework (already in project)
- Tailwind CSS (already configured)
- `.card-hover` CSS class (already defined in global.css)
- `/public/images/office-bearers/` directory structure

**Assumptions**:
- Office bearer images are provided as 300px × 300px square JPG or PNG files
- Office bearer names and titles match official club records (no validation needed at this layer)
- JSON file path and structure remain stable (no schema versioning required)
- No external APIs required for office bearer data

**Out of Scope**:
- Admin UI for updating office bearer information (handled via JSON editing for now)
- Photo upload functionality
- Role-based access control for updates
- Integration with CMS or database (data stays as JSON)
- Internationalization (names and titles remain English)

---

## Open Questions & Clarifications

**Q1**: Should the office bearers section have a heading (e.g., "Our Leadership" or "Committee")? 
**Answer** (provisional): Heading is optional but recommended for clarity. Can be added as `<h2>` with gold underline to match existing section patterns.

**Q2**: Should there be a gold accent bar (top border or divider) on office bearer cards for visual distinction?
**Answer** (provisional): Optional enhancement. Existing contact cards use `.card-hover` without accent bar. Can be added for consistency or left minimal.

**Q3**: Can office bearer images be different aspect ratios or circular crops only?
**Answer** (provisional): Circular crops only (via `border-radius: 50%` and `object-fit: cover`). Source images should be square (1:1) to avoid distortion.

**Q4**: Should office bearer cards be clickable/interactive (e.g., linking to email or social profile)?
**Answer** (provisional): No interaction required for P1. Email links already exist in contact card section. Cards are presentational.

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Design Agent | Initial spec written |

---

## Sign-Off

**Status**: Ready for review by Design Reviewer agent.

**Next Steps**:
1. Design Reviewer reviews spec for completeness and constitutional compliance
2. Implementation agent creates tasks and begins build
3. Development follows test-first approach per Principle II
4. Visual regression and accessibility testing run before merge
