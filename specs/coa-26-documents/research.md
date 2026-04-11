# Research: Documents Feature (COA-26)

**Date**: 2026-04-11 | **Branch**: cameronwalsh/coa-26-documents

---

## Technology Decisions & Rationale

### PDF Embedding: Native `<embed>` vs. Alternatives

#### Decision: Native `<embed>` Tag

**Selected Approach**:
- Use browser-native `<embed>` tag with fallback `<a>` download link
- No third-party PDF rendering library

**Alternatives Considered**:

1. **PDF.js (Mozilla's PDF rendering library)**
   - Pros: Full control over rendering, consistent appearance across browsers
   - Cons: Large bundle size (~8MB uncompressed), requires bundling and setup, NFR-009 explicitly prohibits this
   - Decision: Rejected per architectural constraint

2. **`<object>` Tag (Alternative native approach)**
   - Pros: Similar to `<embed>`, good browser support
   - Cons: Slightly older pattern; `<embed>` is more modern
   - Decision: `<embed>` preferred; `<object>` available as secondary fallback

3. **Server-Side PDF Conversion to HTML/Canvas**
   - Pros: Full control, consistent rendering
   - Cons: Expensive, overkill for static site, requires build-time processing
   - Decision: Not considered for MVP

4. **Google Docs Viewer**
   - Pros: Hosted solution, no client-side rendering
   - Cons: Dependency on external service, potential privacy concerns (Google tracks views), no offline capability
   - Decision: Not considered

**Final Rationale**:
- Aligns with Principle VIII (Dependency Hygiene) — no new dependencies
- Simplest implementation; most supported in modern browsers
- Users can download PDF if native rendering fails
- Accept that appearance varies by browser — acceptable for MVP

---

### YouTube Embed: `<iframe>` vs. Alternatives

#### Decision: Native `<iframe>` with YouTube's Standard Player

**Selected Approach**:
- Embed YouTube videos via standard YouTube `<iframe>` embed code
- Generate embed URLs at render time from various YouTube link formats
- No custom player or third-party video library

**Why This Approach**:
- Native, lightweight, no dependencies
- Full feature set: standard controls, fullscreen, accessibility features built-in
- Easy for users to share and update guide links
- Responsive aspect ratio achievable with CSS (16:9)

**URL Transformation Logic**:
- Accept flexible input formats: `https://youtu.be/{VIDEO_ID}`, `https://www.youtube.com/watch?v={VIDEO_ID}`, with query params
- Transform to standard embed URL: `https://www.youtube.com/embed/{VIDEO_ID}`
- Allows non-technical users to copy-paste YouTube links from browser address bar

---

### Club Policies Data Storage: Inline vs. JSON File

#### Decision: Inline in `about.astro` (Initial) → JSON File (Future)

**Selected Approach for MVP**:
- Define `clubPolicies` array directly in `about.astro` frontmatter
- Easier to reason about; no new file infrastructure
- Can be migrated to a separate JSON file in future (refactoring is low-risk)

**Alternative**: Store in `src/data/club-policies.json`
- Pros: Consistent with resource data pattern, easier for non-developers to edit, better separation of concerns
- Cons: Adds one more file, marginally more complexity
- Decision: May adopt in Phase 2 if club staff need to update policies frequently; inline is fine for launch

**Migration Path**:
If club policies become frequently updated or need a management UI, migrate to JSON:
```typescript
import clubPolicies from '../../data/club-policies.json';
```

---

### Filter Bar Suppression: Remove or Hide?

#### Decision: Keep `#filters-managers` in DOM; Explicitly Never Toggle

**Rationale**:
- Safer: Doesn't remove DOM elements (less fragile if JavaScript is refactored)
- Clear intent: Explicit `hidden` class with code comment documents that this is intentional
- Consistent: Maintains existing filter infrastructure for other tabs
- Maintainable: Future changes to filter logic won't accidentally expose manager filters

**Alternative**: Remove `#filters-managers` and related filter infrastructure
- Pros: Cleaner DOM, no unnecessary elements
- Cons: More refactoring, removes scaffolding that was intentionally left in place
- Decision: Keep for now; can clean up later if needed

---

## Open Questions Resolved

### Q1: Should guide videos be categorized strictly, or can guides span multiple categories?
**Answer**: Single category per guide (in data model). If a video is relevant to multiple categories, create duplicate entries with different IDs. This keeps data simple and allows flexible sorting/grouping in future UI iterations.

### Q2: Should the Club Policies section be interactive (expand/collapse accordion) or just a list of links?
**Answer**: Accordion with inline PDF embed for PDFs; simple external links for external policies. Accordion prevents page bloat with 6+ PDFs all rendering at once.

### Q3: How should the filter bar behave when switching from a filtered tab to the Manager tab?
**Answer**: Explicitly hide the filter bar when Manager tab is active. The `switchTab()` function must check the target tab and suppress filter rendering for `managers`.

### Q4: Can Manager resources have filters (age group, category) in a future version?
**Answer**: Current spec requires no filters (FR-010). The infrastructure exists in the DOM (`#filters-managers`), so adding filters later is straightforward: just remove the `hidden` class and update `switchTab()` to show filters. For now, keep permanently hidden.

### Q5: What's the preferred format for YouTube URLs in the data file?
**Answer**: Accept any standard YouTube URL format; transform at render time. This is user-friendly and flexible. Common formats:
- `https://www.youtube.com/watch?v=OdTboL_uYqk`
- `https://youtu.be/OdTboL_uYqk`
- With timestamps: `https://youtu.be/OdTboL_uYqk?t=120` (will still work)

---

## Alternative Approaches Evaluated

### Alternative 1: Dynamic PDF Loading via API

**Approach**: Store PDFs in a backend storage system (S3, Cloudinary); fetch and display via API at runtime.

**Pros**:
- PDFs stored outside the repository (smaller bundle)
- Easy to update PDFs without re-deploying
- Centralized access logging

**Cons**:
- Adds backend infrastructure (not warranted for static site)
- Adds latency (must fetch at runtime)
- Complexity for minimal benefit on MVP

**Why Rejected**: Astro is a static site generator. PDFs in `/public/` are served as static assets, which is appropriate for this use case. API approach is overkill.

---

### Alternative 2: Lazy-Load PDFs and Videos

**Approach**: Use `loading="lazy"` on embeds; defer rendering until user scrolls to the section.

**Pros**:
- Faster initial page load
- Lighter memory footprint

**Cons**:
- Added complexity (Intersection Observer or `loading` attribute)
- Minimal performance gain for a single page load (About page PDFs are below the fold anyway)
- NFR-006 does not require lazy-loading

**Why Rejected**: Not needed for MVP. Can be added later if performance becomes an issue.

---

### Alternative 3: Pre-generate PDF Thumbnails

**Approach**: Create small thumbnail images for each PDF for display in the policy list.

**Pros**:
- Visual preview before expanding
- Better UX discovery

**Cons**:
- Requires off-line PDF processing tooling
- Adds image assets to repository
- Out of scope for MVP

**Why Rejected**: Nice-to-have; spec does not require. Can be added in a follow-up feature.

---

### Alternative 4: Versioned Guides (with Changelog)

**Approach**: Track guide update history; allow users to see when guides were last updated.

**Pros**:
- Users know content is current
- Audit trail for changes

**Cons**:
- Added complexity to data model
- Spec only requires `dateAdded`, not version history
- Out of scope

**Why Rejected**: Not in spec. Implement only if explicitly requested in future.

---

## Browser Compatibility Verification

### PDF Embedding (`<embed>` tag)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Native PDF reader built-in |
| Firefox | ✅ Full | Native PDF reader (pdf.js) |
| Safari | ✅ Full | Native PDF support |
| Edge | ✅ Full | Native PDF reader (Chromium-based) |
| IE 11 | ⚠️ Partial | May require fallback link; not actively supported |

**Fallback Strategy**: Provide `<a>` download link alongside `<embed>` for browsers without native support.

---

### YouTube `<iframe>` Embedding

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Standard support |
| Firefox | ✅ Full | Standard support |
| Safari | ✅ Full | Standard support |
| Edge | ✅ Full | Standard support |
| IE 11 | ⚠️ Partial | Limited modern features; not actively supported |

**No fallback needed**: YouTube's iframe is industry standard. If a browser doesn't support it, the user is already using very old software.

---

### Tab Navigation (`role="tab"`)

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | ARIA roles fully supported |
| Firefox | ✅ Full | ARIA roles fully supported |
| Safari | ✅ Full | ARIA roles fully supported |
| Edge | ✅ Full | ARIA roles fully supported |
| Screen Readers | ✅ Full | NVDA, JAWS, VoiceOver all support standard ARIA |

---

## Implementation Notes for Developers

### PDF File Organization

```
/public/resources/
├── club-policies/
│   ├── code-of-conduct.pdf
│   ├── privacy-policy.pdf
│   ├── registration-and-eligibility.pdf
│   └── [more policies].pdf
└── team-manager/
    ├── annual-budget-template.pdf
    ├── club-constitution-bylaws.pdf
    ├── incident-report-form.pdf
    └── [more documents].pdf
```

**Naming Convention**: Lowercase kebab-case (e.g., `code-of-conduct.pdf`, `working-with-children-check-guide.pdf`)

**Compression**: Before committing PDFs, compress using:
- macOS: `quartz filter` (built-in Preview app)
- Windows: Use Free PDF Compressor or similar tool
- Command-line: `ghostscript` (if available)

Target: <5MB per file without explicit justification.

---

### Accessibility Testing Checklist

**Before Merge**:
1. [ ] Run axe DevTools on About page (look for WCAG 2.1 AA violations)
2. [ ] Run axe DevTools on Resources page with Guides tab active
3. [ ] Test keyboard navigation:
   - Tab through all interactive elements
   - Enter/Space on accordion buttons
   - Arrow keys on tab bar
4. [ ] Test with screen reader (NVDA on Windows or VoiceOver on macOS):
   - Verify external links announce "(opens in new tab)"
   - Verify PDF embeds have descriptive title
   - Verify YouTube embeds have descriptive title
5. [ ] Verify color contrast with WebAIM contrast checker (target: WCAG AA)

---

### Performance Verification

**3G Throttle Test** (Chrome DevTools):
1. Open About page
2. Open DevTools → Network tab
3. Set throttling to "Slow 3G"
4. Reload page and expand a PDF policy
5. Verify PDF loads within 3 seconds (waterfall chart should show completion within 3000ms)

**If PDF loads slowly**:
- Check file size (should be <5MB)
- Consider re-compressing the PDF
- Document in QA notes if file size justifies slow load

---

## Future Enhancements (Out of Scope for MVP)

1. **PDF Search**: Add a search index for PDF contents
2. **Guides Categories Filter**: Add a category filter to the Guides tab
3. **Dynamic Guide Management**: CMS interface for adding guides without editing JSON
4. **Policy Version History**: Track and display policy update history
5. **PDF Thumbnails**: Show preview thumbnails in the policy list
6. **Guides Video Transcripts**: Display transcripts for accessibility
7. **Policy Comparison**: Highlight changes between policy versions
8. **Manager Filter Toggle**: Allow filtering manager resources by age group/category in future

---

## Known Limitations & Assumptions

1. **PDF Quality**: We assume club staff will provide PDFs that are readable and properly formatted. No validation of PDF integrity at build time.

2. **YouTube Link Stability**: We assume YouTube links will remain valid and accessible. If YouTube links break, they will fail silently (blank video player). No health check for links.

3. **Static Site Constraints**: This is a static Astro site. All data is baked in at build time. Real-time updates require re-deployment.

4. **No Usage Analytics**: The implementation does not track PDF downloads or guide views. If analytics are needed, a future feature can add this (may require backend).

5. **No Access Control**: All documents are publicly accessible. If role-based access control is needed in future (e.g., some guides only for managers), a new feature will be required.

---

## Testing Approach & Tools

### Manual QA
- **Browser testing**: Chrome, Firefox, Safari, Edge (latest versions)
- **Responsive testing**: Chrome DevTools device emulation at 375px, 768px, 1440px
- **Throttling**: Chrome DevTools Slow 3G for PDF load time
- **Accessibility**: axe DevTools browser extension

### Automated Testing
- **Component tests** (Vitest): If component-testable logic exists
- **HTML validation**: W3C HTML validator for generated pages
- **Link validation**: Check for broken links in data files

### User Testing
- Manual checklist from spec (24 items) verified before merge
- Spot-check accessibility with screen reader (NVDA/VoiceOver)

---

## References & Resources

- [MDN: HTML embed Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/embed)
- [MDN: YouTube Embedded Players](https://developers.google.com/youtube/iframe_api_reference)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Astro Static Site Generation](https://docs.astro.build)
