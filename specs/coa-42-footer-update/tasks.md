# Tasks: COA-42 — Footer Update & Email Octopus Integration

**Input**: Spec from `/specs/coa-42-footer-update/spec.md` | Plan from `/specs/coa-42-footer-update/plan.md`

**Strategy**: Option C Execution Windows (GSD-aligned, 5 windows)

**Total Windows**: 5 | **Estimated Duration**: 8–10 hours | **Token Budget**: ~300k total

---

## Format Guide

- **[P]**: Tasks can run in parallel (different files, same window)
- **Window N**: Execution context boundary (fresh 200k context)
- **WINDOW_CHECKPOINT**: Validation gate before next window starts
- **Traceability**: Each task maps back to spec (FR-XXX, AC-XXX, US-X)
- **Dependency**: Which prior work must complete first

---

## Execution Window 1: Email Octopus Script Injection & Fallback Framework

**Purpose**: Establish Email Octopus form rendering infrastructure and fallback messaging framework. Foundation that BLOCKS form testing work.

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] Email Octopus script tag renders without JS errors
- [ ] Form container div present in footer HTML
- [ ] Fallback message structure in place (hidden by default)
- [ ] Browser console shows no script load errors
- [ ] Can proceed to Window 2

---

### T001 [P] Add Email Octopus script injection to Footer component

**Window**: 1 (Foundation)
**Phase**: Email Octopus Integration
**Traceability**: FR-001 (System MUST embed Email Octopus form script)
**Dependencies**: None
**Description**: Inject Email Octopus script tag into Footer.astro component with form ID `11c550ac-11dc-11f1-a2e0-ef681a07d4a5`

**What to create/modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Add `<script>` tag with URL: `https://eomail5.com/form/11c550ac-11dc-11f1-a2e0-ef681a07d4a5.js`
- Attributes: `async` and `data-form="11c550ac-11dc-11f1-a2e0-ef681a07d4a5"`
- Place script tag at end of footer component (before closing `</footer>`)
- Ensure no inline JavaScript conflcits

**Example**:
```astro
<script async src="https://eomail5.com/form/11c550ac-11dc-11f1-a2e0-ef681a07d4a5.js" data-form="11c550ac-11dc-11f1-a2e0-ef681a07d4a5"></script>
```

**Test**: Script loads without error
```bash
npm run dev
# Load page in browser
# Browser DevTools > Console: No 404, CORS, or syntax errors related to Email Octopus
# Network tab: Script status 200
```

**Done When**:
- Script tag present in Footer.astro
- No console errors related to script loading
- DevTools Network tab shows successful script load

---

### T002 [P] Create Email Octopus form container div with proper ID

**Window**: 1 (Foundation)
**Phase**: Email Octopus Integration
**Traceability**: FR-002 (System MUST display form in dedicated footer section)
**Dependencies**: None
**Description**: Add form container div that Email Octopus JavaScript will target and render form into

**What to create/modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Add div with id: `eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5` (required by Email Octopus)
- Place in newsletter/form section of footer (Column 3 per plan)
- Add wrapper div with semantic structure:
  ```astro
  <div class="footer-newsletter">
    <h3>Newsletter</h3>
    <div id="eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5"></div>
  </div>
  ```
- Use Tailwind classes for spacing and responsiveness

**Test**: Container renders
```bash
npm run dev
# Load page in browser
# DevTools > Inspector: Verify div#eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5 exists
# Email Octopus script should find and populate this div
```

**Done When**:
- Form container div present in Footer.astro
- Correct ID attribute set: `eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5`
- No console errors

---

### T003 [P] Implement fallback message div (hidden by default, shown if script fails)

**Window**: 1 (Foundation)
**Phase**: Email Octopus Integration
**Traceability**: FR-011 (System MUST display fallback if script fails)
**Dependencies**: T001, T002 (form structure in place)
**Description**: Create fallback div with mailto link; hidden by default but shown if Email Octopus fails to load

**What to create/modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Add fallback div with id: `eo-fallback` (example: `id="eo-fallback-newsletter"`)
- Structure:
  ```astro
  <div id="eo-fallback-newsletter" class="hidden">
    <p class="text-sm text-white">
      Form unavailable. <a href="mailto:hello@bendigophoenix.org.au" class="underline hover:no-underline">Email us to subscribe</a>
    </p>
  </div>
  ```
- Place directly after form container div
- Use Tailwind `hidden` class (display: none by default)
- Email address placeholder; update if different

**Test**: Fallback structure present
```bash
npm run dev
# DevTools > Inspector: Verify div#eo-fallback-newsletter exists and is hidden
# Verify mailto link is present
```

**Done When**:
- Fallback div present in Footer.astro with id
- Initially hidden (display: none)
- Mailto link works (can click and open email client in browser)
- No console errors

---

### T004 Add JavaScript fallback detection (show fallback if Email Octopus timeout)

**Window**: 1 (Foundation)
**Phase**: Email Octopus Integration
**Traceability**: FR-011 (User-visible error if script fails)
**Dependencies**: T001, T002, T003 (form and fallback structure in place)
**Description**: Implement client-side JavaScript that shows fallback message if Email Octopus fails to load within timeout (3–5 seconds)

**What to create/modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Add inline script (after Email Octopus script tag):
  ```astro
  <script is:inline>
    // Fallback detection: if Email Octopus fails to load, show fallback message
    (function() {
      const TIMEOUT_MS = 3000; // Wait 3 seconds for Email Octopus to render form
      const formContainer = document.getElementById('eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5');
      const fallbackDiv = document.getElementById('eo-fallback-newsletter');
      
      if (!formContainer || !fallbackDiv) return; // Elements not found
      
      setTimeout(() => {
        // Check if Email Octopus rendered form (form container would have children)
        if (formContainer.children.length === 0 && !window.EmailOctopusAPI) {
          // No form rendered and Email Octopus API not available; show fallback
          fallbackDiv.classList.remove('hidden');
          console.warn('Email Octopus form failed to load. Showing fallback.');
        }
      }, TIMEOUT_MS);
    })();
  </script>
  ```
- Use `is:inline` directive so script runs on every page load (not bundled)
- Graceful: if elements missing, script silently exits
- 3-second timeout balances user experience (don't wait too long) with form load time

**Test**: Fallback logic works
```bash
npm run dev
# Load page in browser
# Network tab: Simulate script load failure (throttle Email Octopus domain or disable)
# After 3 seconds: Fallback message should appear
# Otherwise: Form should render normally (no fallback shown)
```

**Done When**:
- Inline script present in Footer.astro
- Fallback detection logic works (shows fallback after 3s timeout if Email Octopus fails)
- Form renders normally if Email Octopus loads successfully
- No console errors

---

[WINDOW_CHECKPOINT_1]

**Before proceeding to Window 2**:
- [ ] T001: Email Octopus script tag renders; Network shows 200 status
- [ ] T002: Form container div present with correct ID
- [ ] T003: Fallback div present, hidden by default
- [ ] T004: Fallback detection script works (shows fallback on timeout)
- [ ] Browser console: No script load errors
- [ ] Foundation ready for form testing and content updates

If all checkpoints pass, proceed to Window 2.
If any checkpoint fails, debug and fix within Window 1 (do NOT proceed).

---

## Execution Window 2: Footer Content & Layout Redesign

**Purpose**: Update copyright/branding text, restructure footer layout to 4-column responsive grid, integrate form placement.

**Token Budget**: 70–90k

**Checkpoint Validation**:
- [ ] Copyright text: exact match "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
- [ ] Tagline: exact match "Where Community Meets Competition. Proudly serving basketball in Bendigo."
- [ ] Bendigo Basketball Association link present and clickable
- [ ] Footer layout: 4 columns on desktop, 2 on tablet, 1 on mobile
- [ ] No horizontal overflow at any breakpoint ≥ 320px
- [ ] Can proceed to Window 3

---

### T005 [P] Update copyright text in footer (exact spec match)

**Window**: 2 (Content & Layout)
**Phase**: Footer Content
**Traceability**: FR-004 (System MUST display updated copyright text), AC-006
**Dependencies**: Window 1 complete
**Description**: Replace existing copyright text with exact spec-required text

**What to modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Find existing copyright text (search for "©" or "Copyright")
- Replace with: `© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved`
- Ensure exact character match (no extra spaces, correct dash type, etc.)
- Keep existing styling and color

**Test**: Text matches spec
```bash
npm run dev
# Load page in browser
# Copy footer copyright text from page and compare to spec (character-by-character match)
```

**Done When**:
- Copyright text updated and visible in footer
- Matches spec exactly: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
- No extra spaces, punctuation, or formatting changes

---

### T006 [P] Update tagline text in footer (exact spec match)

**Window**: 2 (Content & Layout)
**Phase**: Footer Content
**Traceability**: FR-003 (System MUST display updated tagline), AC-007
**Dependencies**: Window 1 complete
**Description**: Replace tagline with spec-required text

**What to modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Find existing tagline or brand description text
- Replace with: `Where Community Meets Competition. Proudly serving basketball in Bendigo.`
- Keep existing styling and color

**Test**: Text matches spec
```bash
npm run dev
# Load page in browser
# Copy footer tagline from page and compare to spec (character-by-character match)
```

**Done When**:
- Tagline updated and visible in footer
- Matches spec exactly: "Where Community Meets Competition. Proudly serving basketball in Bendigo."

---

### T007 [P] Add Bendigo Basketball Association link with security attributes

**Window**: 2 (Content & Layout)
**Phase**: Footer Content
**Traceability**: FR-005 (clickable link), AC-008, AC-019, AC-020 (security attributes)
**Dependencies**: Window 1 complete
**Description**: Add or update link to Bendigo Basketball Association with proper target and rel attributes

**What to modify/create**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Create link element:
  ```astro
  <a 
    href="https://bendigobasketball.com.au/" 
    target="_blank" 
    rel="noopener noreferrer"
    class="text-brand-gold hover:underline"
  >
    compete in the Bendigo Basketball Association
  </a>
  ```
- Place in appropriate footer section (typically in tagline or navigation section)
- Link text MUST be: "compete in the Bendigo Basketball Association" (exact match)
- Attributes MUST be: `target="_blank"` and `rel="noopener noreferrer"` (security)

**Test**: Link works and security attributes present
```bash
npm run dev
# Load page in browser
# Click link; verify opens https://bendigobasketball.com.au/ in new tab
# DevTools > Inspector: Verify target="_blank" and rel="noopener noreferrer" present
```

**Done When**:
- Link present in footer with exact text
- href correct: "https://bendigobasketball.com.au/"
- Security attributes present: `target="_blank" rel="noopener noreferrer"`
- Link is clickable and opens in new tab

---

### T008 Restructure footer layout to 4-column responsive grid

**Window**: 2 (Content & Layout)
**Phase**: Footer Layout
**Traceability**: FR-008 (responsive layout), AC-015, AC-016, AC-017, AC-018
**Dependencies**: T005, T006, T007 (content updated)
**Description**: Redesign footer grid layout: 4 columns desktop, 2 columns tablet, 1 column mobile

**What to modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Update (or create) grid structure using Tailwind:
  ```astro
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    <!-- Column 1: Brand/Logo section -->
    <div>
      <h3 class="font-bold text-brand-gold uppercase tracking-wider mb-4">Phoenix United</h3>
      <p class="text-sm text-white">Where Community Meets Competition. Proudly serving basketball in Bendigo.</p>
    </div>
    
    <!-- Column 2: Quick Links -->
    <div>
      <h3 class="font-bold text-brand-gold uppercase tracking-wider mb-4">Quick Links</h3>
      {/* existing links */}
    </div>
    
    <!-- Column 3: Email Octopus Form -->
    <div>
      <h3 class="font-bold text-brand-gold uppercase tracking-wider mb-4">Newsletter</h3>
      <div id="eo-form-11c550ac-11dc-11f1-a2e0-ef681a07d4a5"></div>
      <div id="eo-fallback-newsletter" class="hidden">
        {/* fallback */}
      </div>
    </div>
    
    <!-- Column 4: Social/Contact -->
    <div>
      <h3 class="font-bold text-brand-gold uppercase tracking-wider mb-4">Contact</h3>
      {/* existing contact info, social links */}
    </div>
  </div>
  ```
- Use Tailwind responsive classes: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Preserve existing content (address, email, social links)
- Ensure form container and fallback in Column 3

**Test**: Layout responsive
```bash
npm run dev
# Load page in browser
# Desktop (1024px+): 4 columns visible
# DevTools mobile mode: 768px–1023px: 2 columns visible
# DevTools mobile mode: <768px: 1 column (stacked)
# No horizontal overflow at any width ≥ 320px
```

**Done When**:
- Grid layout responsive: 4 col → 2 col → 1 col at breakpoints
- No horizontal overflow
- Content displays correctly at all breakpoints
- Email form in Column 3, existing sections preserved

---

### T009 Test footer layout and content at all breakpoints

**Window**: 2 (Content & Layout)
**Phase**: Testing
**Traceability**: FR-008 (responsive), AC-015–018 (layout validation), NFR-004 (no overflow)
**Dependencies**: T008 (layout restructured)
**Description**: Verify footer renders correctly at critical breakpoints and content is visible/readable

**What to test**:
- Breakpoints: 320px (mobile), 480px (small mobile), 768px (tablet), 1024px+ (desktop)
- Manual browser testing:
  1. Load page in Chrome DevTools mobile emulator at each breakpoint
  2. Verify no horizontal overflow (scroll to edges, confirm page fits in viewport)
  3. Verify all 4 columns visible on desktop
  4. Verify 2 columns visible on tablet
  5. Verify 1 column stacked on mobile
  6. Verify text is readable (no tiny fonts, proper line height)
  7. Verify Email Octopus form container visible (div present, ready for form render)
  8. Verify copyright, tagline, and link text display correctly

**Test Coverage**:
```bash
npm run dev
# Test at 320px: Single column, no overflow
# Test at 768px: 2 columns, no overflow
# Test at 1024px: 4 columns, no overflow
# Scroll horizontally on each: Verify no hidden content off-screen
```

**Done When**:
- Layout tested at 320px, 768px, 1024px+ breakpoints
- No horizontal overflow at any breakpoint
- Content displays correctly (readable, visible)
- All sections present and in correct layout
- Copyright, tagline, link text match spec

---

[WINDOW_CHECKPOINT_2]

**Before proceeding to Window 3**:
- [ ] T005: Copyright text exact match "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
- [ ] T006: Tagline exact match "Where Community Meets Competition. Proudly serving basketball in Bendigo."
- [ ] T007: Bendigo Basketball Association link present, clickable, has security attributes
- [ ] T008: Footer layout responsive (4 col desktop, 2 col tablet, 1 col mobile)
- [ ] T009: No horizontal overflow at any breakpoint ≥ 320px
- [ ] Content & Layout complete, footer structure ready for logo integration

If all checkpoints pass, proceed to Window 3.
If any checkpoint fails, fix within Window 2 (do NOT proceed).

---

## Execution Window 3: Logo Integration (Footer & Header)

**Purpose**: Display Phoenix United logo in both footer and header, replace text "P" placeholders with image assets, implement image load fallback.

**Token Budget**: 60–80k

**Checkpoint Validation**:
- [ ] Logo displays in footer at correct size (60–80px height)
- [ ] Logo displays in header with same styling
- [ ] Logo scales responsively on all breakpoints
- [ ] Image load failure fallback works (shows text "Phoenix" or "PU")
- [ ] No broken image indicators in browser
- [ ] Can proceed to Window 4

---

### T010 [P] Add logo image to footer (with fallback)

**Window**: 3 (Logo Integration)
**Phase**: Footer Logo
**Traceability**: FR-006 (logo in footer), AC-009, AC-010, AC-013, AC-014
**Dependencies**: Window 2 complete
**Description**: Add Phoenix United logo image to footer Column 1 (Brand section) with text fallback for image load failure

**What to create/modify**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Footer.astro`
- Add image in footer Column 1 (Brand section):
  ```astro
  <img 
    src="/images/logos/phoenix-logo.png" 
    alt="Phoenix United Logo" 
    class="h-[60px] md:h-[70px] lg:h-[80px] w-auto"
    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
  />
  <span 
    class="hidden h-[60px] md:h-[70px] lg:h-[80px] flex items-center font-bold text-lg text-brand-gold"
    style="display: none;"
  >
    Phoenix
  </span>
  ```
- Image source: `/public/images/logos/phoenix-logo.png` (asset already exists, 166KB)
- Alt text: "Phoenix United Logo" (accessibility)
- Height: responsive (60px mobile, 70px tablet, 80px desktop)
- Width: auto (maintains aspect ratio)
- Fallback: Text "Phoenix" displays if image fails to load (via `onerror` handler)

**Test**: Logo renders
```bash
npm run dev
# Load page in browser
# Verify logo displays in footer
# DevTools > Inspector: Check img src, alt text, class values
# Mobile emulator: Verify logo scales to 60px height
# Tablet: Verify 70px height
# Desktop: Verify 80px height
# DevTools Network: Confirm image loads successfully (200 status)
# Simulate image load failure: Verify fallback text appears
```

**Done When**:
- Logo image present in footer Column 1
- Height responsive: 60px (mobile), 70px (tablet), 80px (desktop)
- Alt text present
- Fallback text "Phoenix" displays if image fails
- No broken image icon visible

---

### T011 [P] Add logo image to header/navigation (with fallback)

**Window**: 3 (Logo Integration)
**Phase**: Header Logo
**Traceability**: FR-007 (logo in header), AC-011, AC-012, AC-013 (header logo and navigation)
**Dependencies**: Window 2 complete (header not affected by Window 2, but grouped here for logo consistency)
**Description**: Add Phoenix United logo to header/navigation area, replace text "P" placeholder with image

**What to modify/create**:
- File: `/c/Users/camer/Documents/phoenix/src/components/Navbar.astro`
- Replace text "P" logo with image:
  ```astro
  <a href="/" class="flex items-center">
    <img 
      src="/images/logos/phoenix-logo.png" 
      alt="Phoenix United - Home" 
      class="h-[50px] md:h-[60px] w-auto"
      onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
    />
    <span 
      class="hidden h-[50px] md:h-[60px] flex items-center font-bold text-base text-brand-gold"
      style="display: none;"
    >
      PU
    </span>
  </a>
  ```
- Make logo a clickable link to home page (`href="/"`)
- Height: responsive (50px mobile, 60px tablet/desktop)
- Alt text: "Phoenix United - Home" (semantic, accessibility)
- Fallback: Text "PU" displays if image fails
- Same styling and consistency as footer logo

**Test**: Header logo renders
```bash
npm run dev
# Load page in browser
# Verify logo displays in header (top-left or logo position)
# Click logo; verify navigates to home page (/)
# Mobile emulator: Verify logo scales to 50px
# Tablet/desktop: Verify 60px
# DevTools > Inspector: Verify link href="/", alt text, classes
# Simulate image load failure: Verify fallback text "PU" appears
# All pages: Verify header logo appears consistently
```

**Done When**:
- Logo image present in header as clickable link
- Height responsive: 50px (mobile), 60px (tablet/desktop)
- Navigates to home page (/)
- Alt text: "Phoenix United - Home"
- Fallback text "PU" displays if image fails
- Logo visible on all pages

---

### T012 Test logo responsiveness and fallback at all breakpoints

**Window**: 3 (Logo Integration)
**Phase**: Testing
**Traceability**: AC-013 (responsive logo), AC-14 (image failure fallback), AC-004 (logo dimensions)
**Dependencies**: T010, T011 (logo images in place)
**Description**: Verify logo renders at correct size on all breakpoints and fallback works

**What to test**:
- Breakpoints: 320px (mobile), 768px (tablet), 1024px+ (desktop)
- Manual browser testing:
  1. Load page in Chrome DevTools mobile emulator at each breakpoint
  2. Verify logo height at each breakpoint (60px mobile, 70px tablet, 80px desktop in footer; 50px mobile, 60px tablet/desktop in header)
  3. Verify logo maintains aspect ratio (no distortion)
  4. Verify logo is fully visible (not cut off or overflowing)
  5. Verify no broken image indicators (✓ symbol or alt text fallback)
  6. Test image load failure: DevTools Network > Disable `/images/logos/` requests
     - Verify fallback text appears ("Phoenix" in footer, "PU" in header)
     - Verify fallback text has same styling as logo area
  7. Test on actual mobile device if available (iOS Safari, Android Chrome)

**Test Coverage**:
```bash
npm run dev
# Footer at 320px: Logo height 60px, fully visible, aspect ratio maintained
# Footer at 768px: Logo height 70px
# Footer at 1024px+: Logo height 80px
# Header at 320px: Logo height 50px
# Header at 768px+: Logo height 60px
# All breakpoints: No overflow, proper scaling
# Network > Disable image: Fallback text visible and styled correctly
```

**Done When**:
- Logo renders at correct height on all breakpoints
- Logo maintains aspect ratio (no distortion)
- Logo fully visible (no clipping or overflow)
- Fallback text appears if image fails to load
- Fallback text has consistent styling

---

[WINDOW_CHECKPOINT_3]

**Before proceeding to Window 4**:
- [ ] T010: Logo in footer, responsive (60px mobile, 70px tablet, 80px desktop)
- [ ] T011: Logo in header, responsive (50px mobile, 60px tablet/desktop), clickable link to home
- [ ] T012: Logo renders correctly on all breakpoints with no distortion
- [ ] Image load failure fallback works (text "Phoenix" in footer, "PU" in header)
- [ ] No broken image indicators
- [ ] Logo Integration complete

If all checkpoints pass, proceed to Window 4.
If any checkpoint fails, fix within Window 3 (do NOT proceed).

---

## Execution Window 4: Responsive Testing & Accessibility Validation

**Purpose**: Verify footer responsive layout, Email Octopus form submission, keyboard navigation, color contrast, and screen reader support.

**Token Budget**: 70–90k

**Checkpoint Validation**:
- [ ] Footer layout correct on all breakpoints (4 col, 2 col, 1 col)
- [ ] Email Octopus form renders and accepts input
- [ ] Form submission works (Email Octopus dashboard records signup)
- [ ] Keyboard navigation works (Tab through all elements)
- [ ] Screen reader announces form correctly
- [ ] Color contrast meets WCAG AA (4.5:1 body text, 3:1 large text)
- [ ] No horizontal overflow at any breakpoint ≥ 320px
- [ ] Can proceed to Window 5

---

### T013 [P] Test Email Octopus form submission end-to-end

**Window**: 4 (Testing & Validation)
**Phase**: Form Testing
**Traceability**: AC-001, AC-002, AC-003 (form display and submission)
**Dependencies**: Window 1 complete (form injection)
**Description**: Verify Email Octopus form renders, accepts input, and submits successfully

**What to test**:
- Form rendering:
  1. Load footer page in browser
  2. Verify Email Octopus form renders in footer (input field and SUBSCRIBE button visible)
  3. Verify no JavaScript errors in console related to Email Octopus
  4. Verify form is interactive (input accepts focus, button is clickable)

- Form submission (valid email):
  1. Enter valid email address (e.g., test@example.com)
  2. Click SUBSCRIBE button
  3. Verify submission completes (network request succeeds, form responds)
  4. Verify success message displays or form clears for new input
  5. Check Email Octopus dashboard (https://app.emailoctopus.com/): Confirm email received in subscriber list
  6. Verify no JavaScript errors in console

- Form submission (invalid email):
  1. Enter invalid email (e.g., "invalid" or blank field)
  2. Click SUBSCRIBE
  3. Verify Email Octopus validation error displays in form (e.g., "Please enter a valid email")
  4. Verify no silent failures (error must be user-visible)

- Form submission (duplicate email):
  1. Submit same email twice
  2. Verify Email Octopus handles deduplication gracefully (second submission should be accepted by form, Email Octopus backend decides on dedup)

**Test Coverage**:
```bash
npm run dev
# Load footer
# Verify form renders: <input> and <button> visible, no errors
# Submit valid email: Check dashboard for signup record
# Submit invalid email: Verify error message displays
# Submit duplicate: Verify form allows resubmission
```

**Done When**:
- Email Octopus form renders without errors
- Form accepts valid email and submits successfully
- Email Octopus dashboard confirms signup
- Form displays validation errors for invalid input
- No silent failures

---

### T014 [P] Test keyboard navigation and focus indicators

**Window**: 4 (Testing & Validation)
**Phase**: Accessibility Testing
**Traceability**: NFR-001 (keyboard accessible), AC-022 (keyboard navigation)
**Dependencies**: Window 1, 2, 3 complete (all components in place)
**Description**: Verify all interactive footer elements are keyboard accessible and have visible focus indicators

**What to test**:
- Keyboard navigation:
  1. Load footer page
  2. Press Tab repeatedly; verify focus cycles through:
     - Email form input field
     - SUBSCRIBE button
     - Bendigo Basketball Association link
     - Any other footer links (existing contact, social links)
     - Logo link (if header logo is interactive)
  3. Verify visible focus indicator on each element (outline, highlight, or color change)
  4. For form input: Verify Tab enters field, can type, Tab exits field
  5. For buttons/links: Verify Tab focuses, Enter activates (navigates or submits)
  6. Verify focus order is logical (left-to-right, top-to-bottom)
  7. Verify no elements are unreachable via keyboard

- Focus indicators:
  1. Tab to each interactive element
  2. Verify visible outline or color change (must be obvious; not subtle gray)
  3. Verify focus indicator meets color contrast standards (3:1+)

**Test Coverage**:
```bash
npm run dev
# Load footer page
# Tab through all interactive elements: form input, button, links, logo
# Verify visible focus indicator on each (outline, highlight, etc.)
# Tab order should be logical (no jumping around)
# Enter key should activate buttons/links
# No keyboard traps (can Tab forward and backward)
```

**Done When**:
- All interactive elements reachable via Tab key
- Visible focus indicator on each element
- Logical Tab order (left-to-right, top-to-bottom)
- Enter activates buttons and links
- No keyboard traps

---

### T015 [P] Test color contrast for WCAG AA compliance

**Window**: 4 (Testing & Validation)
**Phase**: Accessibility Testing
**Traceability**: NFR-002 (color contrast), AC-021 (contrast compliance)
**Dependencies**: Window 2 (layout and content)
**Description**: Verify footer text and links meet WCAG 2.1 AA color contrast standards (4.5:1 for body text, 3:1 for large text)

**What to test**:
- Color combinations to check:
  1. Body text (copyright, tagline, link text): Check contrast ratio
     - Purple (#573F93) on off-white (#F4F5F7): Should be 4.5:1+
     - White on purple: Should be 4.5:1+
  2. Links (Bendigo Basketball Association): Check contrast ratio
     - Gold (#8B7536) on purple: Should be 3:1+ (for large text)
  3. Fallback text (Email Octopus): Check contrast ratio
  4. Footer headings: Check contrast ratio

- Test tools:
  1. WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/): Manual input of colors
  2. Chrome DevTools: Inspect element, check contrast in Computed styles
  3. Lighthouse audit: DevTools > Lighthouse > Accessibility > Check color contrast

- Remediation:
  - If contrast fails, adjust text or background color
  - Ensure changes follow brand color system (#573F93, #8B7536, #111111, #F4F5F7, #FFFFFF)

**Test Coverage**:
```bash
npm run dev
# Use WebAIM Contrast Checker:
#   Purple (#573F93) on off-white (#F4F5F7): Enter both colors, verify ratio >= 4.5:1
#   Gold (#8B7536) on purple: Verify ratio >= 3:1
# Run Lighthouse audit: DevTools > Lighthouse > Accessibility
# Verify all contrast issues resolved
```

**Done When**:
- Body text contrast: 4.5:1+ (WCAG AA)
- Large text/links contrast: 3:1+ (WCAG AA)
- All footer text and links pass contrast check
- Lighthouse accessibility audit shows no contrast warnings

---

### T016 Test screen reader support for form and navigation

**Window**: 4 (Testing & Validation)
**Phase**: Accessibility Testing
**Traceability**: NFR-003 (screen reader support), AC-023 (screen reader accessibility)
**Dependencies**: Window 1, 2 (form and content in place)
**Description**: Verify form input has associated label and all elements are announced correctly by screen reader

**What to test**:
- Screen reader tools:
  - Windows: NVDA (free, https://www.nvaccess.org/download/)
  - Mac: VoiceOver (built-in; press Cmd+F5 to enable)
  - Browser extension: WAVE (Chrome/Firefox)

- Form input accessibility:
  1. Enable screen reader (NVDA on Windows or VoiceOver on Mac)
  2. Navigate to Email form
  3. Listen for announcement of input field
  4. Verify screen reader announces: "Email input field" or similar (must have associated label)
  5. If Email Octopus renders label automatically, verify it's announced
  6. If not, add visible or sr-only label: 
     ```astro
     <label for="email-input" class="sr-only">Email address</label>
     <input type="email" id="email-input" placeholder="Enter your email" />
     ```

- Button accessibility:
  1. Navigate to SUBSCRIBE button with screen reader
  2. Verify announced as "SUBSCRIBE button" or similar
  3. Verify button is clickable/activatable with screen reader

- Link accessibility:
  1. Navigate to Bendigo Basketball Association link
  2. Verify announced as "Bendigo Basketball Association, link" or similar (must have descriptive link text, not "click here")

- Overall navigation:
  1. Use screen reader to navigate footer
  2. Verify all sections are announced in logical order
  3. Verify no orphaned or unlabeled elements

**Test Coverage**:
```bash
# Windows: Download and install NVDA (free)
# Start NVDA
# Load footer page in browser
# Use NVDA keyboard navigation (arrow keys) to move through footer
# Listen for announcements of form input, button, links
# Verify labels are announced, not silent
# Verify link text is descriptive (not "click here")
# Verify no announcements are missing or confusing
```

**Done When**:
- Form input has associated label (announced by screen reader)
- SUBSCRIBE button announced correctly
- Links have descriptive text (not "click here")
- All footer elements navigable and announced by screen reader
- No unlabeled or silent elements

---

### T017 Final responsive layout test at critical breakpoints

**Window**: 4 (Testing & Validation)
**Phase**: Testing
**Traceability**: FR-008 (responsive layout), AC-015–018 (layout validation), NFR-004 (no overflow)
**Dependencies**: Window 2, 3 (layout and logo)
**Description**: Final comprehensive test of footer responsive layout at all critical breakpoints, verify no horizontal overflow

**What to test**:
- Breakpoints and layout:
  1. 320px (small mobile): 1 column, all sections stacked vertically
  2. 480px (small mobile): 1 column, verify text readable
  3. 768px (tablet): 2 columns, verify proper column arrangement
  4. 1024px+ (desktop): 4 columns, verify all visible
  5. 1440px+ (large desktop): 4 columns, verify no excessive spacing

- No horizontal overflow:
  1. At each breakpoint, open Chrome DevTools
  2. Measure viewport width (should equal breakpoint)
  3. Scroll horizontally; verify page content fits within viewport
  4. If overflow detected, scroll shows content off-screen (FAIL)
  5. Verify all elements fully visible without horizontal scrolling

- Element visibility and sizing:
  1. Verify all text readable (no tiny fonts)
  2. Verify buttons large enough to tap on mobile (min 44x44px touch target)
  3. Verify form input and SUBSCRIBE button stack vertically on mobile (not side-by-side)
  4. Verify logo scales appropriately at each breakpoint
  5. Verify spacing (gaps, padding) consistent and not excessive

- Test on actual devices:
  1. iOS Safari on iPhone (if available)
  2. Android Chrome (if available)
  3. Verify layout matches desktop emulation

**Test Coverage**:
```bash
npm run dev
# Chrome DevTools Mobile Emulator:
# - Set to 320px width: Verify 1 column, no horizontal scroll
# - Set to 768px width: Verify 2 columns, no horizontal scroll
# - Set to 1024px width: Verify 4 columns, no horizontal scroll
# - Set to 1440px width: Verify 4 columns, good spacing
# Manual scroll test: Scroll horizontally at each breakpoint; verify no off-screen content
# Visual inspection: Verify text readable, buttons large, layout sensible
```

**Done When**:
- Layout correct at all breakpoints (1 col, 2 col, 4 col)
- No horizontal overflow at any breakpoint ≥ 320px
- All elements visible and readable
- Form input and button usable on mobile
- Logo scales appropriately

---

[WINDOW_CHECKPOINT_4]

**Before proceeding to Window 5**:
- [ ] T013: Email Octopus form renders and submits successfully; dashboard confirms signup
- [ ] T014: Keyboard navigation works; all elements have visible focus indicators
- [ ] T015: Color contrast meets WCAG AA (4.5:1 body, 3:1 large text)
- [ ] T016: Screen reader support; form has label, buttons/links announced correctly
- [ ] T017: Responsive layout correct at all breakpoints; no horizontal overflow
- [ ] All accessibility and responsive requirements validated

If all checkpoints pass, proceed to Window 5.
If any checkpoint fails, fix within Window 4 (do NOT proceed).

---

## Execution Window 5: Performance Validation & Final Acceptance Testing

**Purpose**: Verify Email Octopus script does not degrade page load performance, run full acceptance criteria checklist, document test results.

**Token Budget**: 40–60k (lighter window, mostly testing and documentation)

**Checkpoint Validation**:
- [ ] Email Octopus script adds <100ms to page load time (NFR-005)
- [ ] All 23 acceptance criteria passing
- [ ] No warnings or errors in test suite
- [ ] Feature ready for merge

---

### T018 [P] Measure page load performance (Email Octopus impact)

**Window**: 5 (Performance & Final Testing)
**Phase**: Performance Testing
**Traceability**: NFR-005 (Email Octopus adds <100ms), SC-007
**Dependencies**: Window 1 complete (Email Octopus integrated)
**Description**: Measure page load time before and after Email Octopus script integration; verify added load time <100ms

**What to measure**:
- Metrics to track:
  1. Time to Interactive (TTI): Time until page is interactive (JavaScript loaded and run)
  2. Cumulative Layout Shift (CLS): Measure of visual stability during page load
  3. Email Octopus script load time: From request to form rendered

- Measurement tools:
  1. Chrome DevTools Performance tab:
     - Open DevTools > Performance
     - Click "Record" button
     - Reload page
     - Wait for page to fully load (until form renders)
     - Stop recording
     - Review timeline for script load time and TTI
     - Compare baseline (without Email Octopus) to current (with Email Octopus)
  
  2. Lighthouse audit:
     - DevTools > Lighthouse
     - Run "Performance" audit
     - Review metrics: Time to Interactive, First Contentful Paint, Largest Contentful Paint
     - Target performance score ≥90
  
  3. Chrome User Experience Report (optional):
     - Monitor real-user metrics after deployment
     - Check https://web.dev/measure/ for site performance data

- Performance baseline:
  1. Measure page load WITHOUT Email Octopus script (disable script tag temporarily or run on page without footer)
  2. Note TTI and total load time
  3. Re-enable Email Octopus script
  4. Measure page load WITH Email Octopus
  5. Calculate difference: (load time with - load time without) = added overhead
  6. Verify difference <100ms

- Optimization (if needed):
  1. If added load time exceeds 100ms, investigate:
     - Verify Email Octopus script is loading asynchronously (`async` attribute)
     - Check for render-blocking scripts
     - Optimize logo image size (should be <50KB)
     - Consider deferring Email Octopus script load (load after page interactive)

**Test Coverage**:
```bash
npm run dev
# Chrome DevTools Performance:
# - Record page load (footer visible)
# - Note TTI (Time to Interactive)
# - Note Email Octopus script load time (in timeline)
# - Verify added load time <100ms from baseline
# 
# Lighthouse:
# - Run performance audit
# - Target score ≥90
# - Review "Opportunities" section for optimization suggestions
```

**Done When**:
- Page load time measured with and without Email Octopus
- Added load time <100ms (verified by DevTools timeline)
- Lighthouse performance score ≥90
- No render-blocking scripts
- Logo image <50KB (already confirmed as 166KB; may need optimization)

---

### T019 [P] Run acceptance criteria checklist (all 23 ACs)

**Window**: 5 (Performance & Final Testing)
**Phase**: Acceptance Testing
**Traceability**: All AC-001 through AC-023 (full spec coverage)
**Dependencies**: Window 1–4 complete (all features implemented)
**Description**: Execute comprehensive acceptance testing; verify all 23 acceptance criteria from spec

**What to test**:
- Form Display & Submission (AC-001 through AC-005):
  - [ ] AC-001: Form displays with visible email input and SUBSCRIBE button
  - [ ] AC-002: Valid email submission succeeds without JavaScript errors
  - [ ] AC-003: Success message appears or form clears after submission
  - [ ] AC-004: Invalid email shows validation error
  - [ ] AC-005: Email Octopus script failure shows fallback message

- Copyright & Branding (AC-006 through AC-008):
  - [ ] AC-006: Copyright text exact: "© Phoenix United Basketball Development Club Inc. 2003 - 2026 All rights reserved"
  - [ ] AC-007: Tagline exact: "Where Community Meets Competition. Proudly serving basketball in Bendigo."
  - [ ] AC-008: "compete in the Bendigo Basketball Association" link present and clickable

- Logo Display (AC-009 through AC-014):
  - [ ] AC-009: Phoenix United logo displays (not text "P")
  - [ ] AC-010: Logo height 60–80px, aspect ratio maintained
  - [ ] AC-011: Logo displays in header
  - [ ] AC-012: Header logo navigates to home page (/)
  - [ ] AC-013: Logo scales responsively on mobile, tablet, desktop
  - [ ] AC-014: Text fallback displays if logo image fails to load

- Responsive Layout (AC-015 through AC-018):
  - [ ] AC-015: Desktop (1024px+): 4 columns with equal spacing
  - [ ] AC-016: Tablet (768px–1023px): 2 columns
  - [ ] AC-017: Mobile (<768px): Single column, no overflow
  - [ ] AC-018: Form input and button stack vertically on mobile

- Links & External Navigation (AC-019 through AC-020):
  - [ ] AC-019: Bendigo Basketball Association link opens in new tab
  - [ ] AC-020: External link includes `rel="noopener noreferrer"`

- Brand Colors & Accessibility (AC-021 through AC-023):
  - [ ] AC-021: Text colors meet WCAG AA contrast (4.5:1 body, 3:1 large text)
  - [ ] AC-022: All interactive elements keyboard accessible, visible focus indicators
  - [ ] AC-023: Form label and button announced by screen reader

**Test Coverage**:
- Manual browser testing for each AC
- Document results: Pass/Fail, notes, screenshots if needed
- Email Octopus dashboard verification for AC-002

**Test Record Template**:
```
AC-001: Form displays
  - [ ] PASS: Email input visible, SUBSCRIBE button visible
  - Notes: Form renders at footer bottom, form container populated by Email Octopus

AC-002: Valid email submission
  - [ ] PASS: Submission succeeds, no console errors
  - Email: test@example.com
  - Dashboard: [Screenshot of signup in Email Octopus dashboard]

[... continue for AC-003 through AC-023 ...]
```

**Done When**:
- All 23 acceptance criteria tested
- All tests PASS
- Test results documented (pass/fail per AC)
- Screenshots captured for visual verification (logo display, layout, etc.)
- Email Octopus dashboard confirms signups

---

### T020 Create acceptance testing report and deployment notes

**Window**: 5 (Performance & Final Testing)
**Phase**: Documentation
**Traceability**: All ACs (final verification)
**Dependencies**: T018, T019 (all testing complete)
**Description**: Document test results, deployment checklist, and any known issues

**What to create/document**:
- File: Add testing notes to `/specs/coa-42-footer-update/TESTING_NOTES.md` (optional, or summarize in PR)

**Content**:
```markdown
# COA-42 Testing Summary

## Performance Testing (T018)
- Page load time increase: [X ms] (target <100ms)
- Lighthouse score: [XX]/100 (target ≥90)
- Status: PASS / FAIL

## Acceptance Criteria Testing (T019)
- Total ACs: 23
- Passing: [XX]/23
- Failing: [X]/23

| AC | Criteria | Result | Notes |
|----|----------|--------|-------|
| AC-001 | Form displays | PASS | Email input and button visible |
| ... | ... | ... | ... |

## Browser Compatibility
- Chrome: PASS
- Firefox: PASS
- Safari: PASS (if tested)
- Edge: PASS (if tested)

## Device Testing
- Mobile (320px): PASS / FAIL
- Tablet (768px): PASS / FAIL
- Desktop (1024px+): PASS / FAIL
- iOS Safari (if available): PASS / FAIL
- Android Chrome (if available): PASS / FAIL

## Accessibility
- Keyboard navigation: PASS / FAIL
- Screen reader (NVDA): PASS / FAIL
- Color contrast (WCAG AA): PASS / FAIL

## Email Octopus Dashboard
- Form ID: 11c550ac-11dc-11f1-a2e0-ef681a07d4a5
- Test signup recorded: [Email address, timestamp]
- Status: PASS / FAIL

## Deployment Checklist
- [ ] All ACs passing
- [ ] Performance <100ms added load time
- [ ] Lighthouse score ≥90
- [ ] Keyboard navigation verified
- [ ] Screen reader support verified
- [ ] Responsive layout verified
- [ ] Email Octopus dashboard confirms test signup
- [ ] No console errors or warnings
- [ ] Git commit history clean
- [ ] Code review passed

## Known Issues / Deviations
(None, or list any issues and resolutions)

## Deployment Notes
- No database migrations
- No build configuration changes
- No new npm dependencies
- Email Octopus form ID pinned in Footer.astro
- Logo asset at `/public/images/logos/phoenix-logo.png`
- Merge to main branch and deploy
- Monitor Email Octopus dashboard post-deployment for signups
```

**Test Summary (quick format)**:
```
✅ All 23 acceptance criteria PASSING
✅ Performance: +42ms added load time (target <100ms)
✅ Lighthouse: 92/100 (target ≥90)
✅ Keyboard navigation: All interactive elements accessible
✅ Screen reader: Form and buttons announced correctly
✅ Responsive: 4-col (desktop), 2-col (tablet), 1-col (mobile)
✅ Email Octopus: Dashboard confirms test signup
✅ No console errors or warnings
✅ Ready for merge and deployment
```

**Done When**:
- Test results documented for all 23 ACs
- Performance measurements recorded
- Deployment checklist completed
- No blocking issues identified

---

[WINDOW_CHECKPOINT_5]

**Feature Complete & Ready for Merge**:
- [ ] T018: Performance validated (<100ms added load time, Lighthouse ≥90)
- [ ] T019: All 23 acceptance criteria tested and PASSING
- [ ] T020: Test results documented, deployment checklist completed
- [ ] All windows complete and checkpoints passed
- [ ] No console errors or warnings
- [ ] Email Octopus dashboard confirms test signup
- [ ] Code review ready

**Final Status**: ✅ **READY FOR MERGE**

---

## Summary

**Total Execution Windows**: 5
**Estimated Duration**: 8–10 hours (1.5–2 hours per window on average)

**Estimated Token Usage**:
- Window 1 (Email Octopus Foundation): 60–80k
- Window 2 (Footer Content & Layout): 70–90k
- Window 3 (Logo Integration): 60–80k
- Window 4 (Responsive & Accessibility): 70–90k
- Window 5 (Performance & Final Testing): 40–60k
- **Total**: 300–390k tokens

**Key Features Delivered**:
1. Email Octopus newsletter signup form integrated with fallback messaging
2. Updated copyright and tagline text (exact spec match)
3. External link to Bendigo Basketball Association (security attributes)
4. Phoenix United logo in footer and header (responsive, with image load fallback)
5. Responsive footer layout (4-col desktop, 2-col tablet, 1-col mobile)
6. Full keyboard navigation and screen reader support (WCAG AA)
7. Color contrast compliance (WCAG AA 4.5:1 body, 3:1 large text)
8. Performance validated (<100ms Email Octopus overhead)

**Window Progression**:
```
Window 1: Foundation ← NO dependencies, start immediately
   ↓ (Checkpoint: Form injection works)
Window 2: Content & Layout ← Depends on Window 1
   ↓ (Checkpoint: Content matches spec, layout responsive)
Window 3: Logo Integration ← Depends on Windows 1–2
   ↓ (Checkpoint: Logo displays correctly, fallback works)
Window 4: Testing & Accessibility ← Depends on Windows 1–3
   ↓ (Checkpoint: All ACs validated, accessibility verified)
Window 5: Performance & Final Testing ← Depends on Windows 1–4
   ↓ (Checkpoint: Performance validated, all ACs passing)
✅ READY FOR MERGE
```

---

## Next Steps

1. **Start Window 1**: Inject Email Octopus script tag, create form container, implement fallback detection
2. **After Window 1 Checkpoint**: Proceed to Window 2 (content updates)
3. **After Each Checkpoint**: Run checkpoint validation before proceeding to next window
4. **After Window 5 Complete**: Run final acceptance testing checklist and prepare for merge
5. **Merge & Deploy**: Push to main, monitor Email Octopus dashboard for live signups

