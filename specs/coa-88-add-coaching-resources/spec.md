# Feature Specification: Position Responsibilities Carousel

**Feature Branch**: `cameronwalsh/coa-88-add-coaching-resources`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: Add Facebook reel + 6 position responsibility images to resources page with carousel modal

---

## User Scenarios & Testing

### User Story 1 – View Position Carousel (Priority: P1)

A user clicks a "Position Responsibilities" card on the resources page. A modal opens displaying the 6 position images in a carousel. Images auto-rotate every 8 seconds. User can manually navigate with prev/next buttons or arrows.

**Why this priority**: Core functionality. Displays the position images and enables navigation.

**Independent Test**: Click card → modal opens → carousel rotates automatically → prev/next buttons work → modal closes on close button or outside click.

**Acceptance Scenarios**:

1. **Given** the resources page loads, **When** user clicks the "Position Responsibilities" card, **Then** a modal opens with the first image displayed
2. **Given** the modal is open, **When** 8 seconds pass, **Then** the carousel automatically advances to the next image
3. **Given** the carousel is displaying an image, **When** user clicks the "Next" button, **Then** the next image displays immediately (and timer resets)
4. **Given** the carousel is displaying an image, **When** user clicks the "Prev" button, **Then** the previous image displays immediately (and timer resets)
5. **Given** the carousel is on the last image, **When** user clicks "Next", **Then** it wraps to the first image
6. **Given** the carousel is on the first image, **When** user clicks "Prev", **Then** it wraps to the last image
7. **Given** the modal is open, **When** user clicks outside the modal or the close button, **Then** the modal closes and the carousel stops

---

## Requirements

### Functional Requirements

- **FR-001**: Resources page MUST include a clickable "Position Responsibilities" card
- **FR-002**: Clicking the card MUST open a modal displaying the carousel
- **FR-003**: Carousel MUST display 6 position images in sequence
- **FR-004**: Images MUST auto-rotate every 8 seconds
- **FR-005**: Carousel MUST have prev/next arrow buttons
- **FR-006**: Navigation buttons MUST wrap (last → first, first → last)
- **FR-007**: Clicking a button or arrow MUST reset the 8-second timer
- **FR-008**: Modal MUST close on close button or outside click
- **FR-009**: Modal MUST be styled to match Phoenix design (brand colors, responsive)

### Key Entities

- **Position Image**: One of 6 images representing court positions
  - `id`: Position slug (e.g., `point-guard`, `center`)
  - `src`: File path to image (e.g., `/images/positions/point-guard.png`)
  - `alt`: Accessibility text (e.g., "Point Guard responsibilities")

---

## Success Criteria

- Carousel auto-rotates smoothly every 8 seconds
- Manual navigation (prev/next) is responsive and immediate
- Modal is dismissible and doesn't break on rapid button clicks
- All 6 images display correctly on mobile and desktop
- Carousel component is reusable (can be applied to other carousels later)

---

## Implementation Notes

**File Structure**:
```
src/
  data/
    positions.json          # Array of 6 position objects
  components/
    ResourceCarousel.astro  # Reusable carousel component
    ResourceModal.astro     # Modal wrapper
  pages/
    resources.astro         # Add card + modal trigger
```

**Data Example** (`src/data/positions.json`):
```json
[
  {
    "id": "point-guard",
    "src": "/images/positions/roles-point-guard.png",
    "alt": "Point Guard - responsibilities and key skills"
  },
  {
    "id": "shooting-guard",
    "src": "/images/positions/roles-shooting-guard.png",
    "alt": "Shooting Guard - responsibilities and key skills"
  },
  {
    "id": "small-forward",
    "src": "/images/positions/roles-small-forward.png",
    "alt": "Small Forward - responsibilities and key skills"
  },
  {
    "id": "power-forward",
    "src": "/images/positions/roles-power-forward.png",
    "alt": "Power Forward - responsibilities and key skills"
  },
  {
    "id": "center",
    "src": "/images/positions/roles-center.png",
    "alt": "Center - responsibilities and key skills"
  },
  {
    "id": "coach",
    "src": "/images/positions/roles-coach.png",
    "alt": "Coach - role and responsibilities"
  }
]
```

**Carousel Logic**:
- Start on image 0
- Auto-advance every 8 seconds using `setInterval`
- Clear interval on user interaction (prev/next click)
- Reset interval after interaction
- On close, clear the interval

**Resources Page Integration**:
Add a new card to the resources grid:
```html
<ResourceCard>
  <h3>Position Responsibilities</h3>
  <p>Learn the responsibilities of each court position</p>
  <button onclick="openPositionModal()">View Carousel</button>
</ResourceCard>
```
