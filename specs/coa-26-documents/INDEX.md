# COA-26 Documents Feature — Complete Specification & Plan

**Branch**: cameronwalsh/coa-26-documents | **Date**: 2026-04-11 | **Status**: READY FOR IMPLEMENTATION

---

## Documentation Index

This folder contains the complete specification, technical plan, and implementation guidance for COA-26 (Documents: Club Policies & Team Manager Resources).

### 📋 Core Documents

1. **spec.md** — User requirements, acceptance criteria, and functional specifications
   - Three user stories (Club Policies, Team Manager Resources, Guides)
   - 19 functional requirements (FR-001 through FR-019)
   - 9 non-functional requirements (accessibility, performance, responsive design)
   - Constitutional compliance verification
   - Complete manual testing checklist (24 items)

2. **plan.md** — Technical architecture and phased implementation approach
   - Technical context (Astro, TypeScript, JSON data, static site)
   - Constitution compliance matrix
   - Project structure and file organization
   - Four-phase delivery plan
   - Key technical decisions with rationale
   - Testing strategy and success criteria

3. **data-model.md** — Data structures and schema documentation
   - ClubPolicy interface (About page policies)
   - Guide interface (instructional videos)
   - ResourceAudience type update
   - File organization and naming conventions
   - Data validation rules and constraints
   - Migration strategy for real data

4. **contracts.md** — Data contracts and interface specifications
   - JSON data structure contracts (guides.json, manager-resources.json)
   - Component prop contracts
   - Type definitions and updates
   - Error handling contracts
   - Data flow and invariants

5. **research.md** — Technology decisions and alternative approaches
   - PDF embedding: Native `<embed>` vs. PDF.js vs. alternatives
   - YouTube embedding: Native `<iframe>` approach
   - Data storage: Inline vs. JSON file
   - Filter bar suppression: Implementation strategy
   - Browser compatibility matrix
   - Future enhancement ideas

6. **quickstart.md** — Manual testing and verification guide
   - Step-by-step user scenario tests
   - Responsive and accessibility testing
   - Complete QA checklist (50+ items)
   - Troubleshooting guide
   - Browser compatibility verification

---

## Quick Navigation

### For Feature Overview
- Start with **spec.md** (read Summary and User Scenarios sections)

### For Implementation
- Read **plan.md** (Technical Context, Phased Delivery, Technical Decisions)
- Reference **data-model.md** (Data structures and file organization)
- Check **contracts.md** (Data shape and validation)

### For Technology Deep Dives
- See **research.md** (alternatives evaluated, design rationale)

### For Testing & Verification
- Follow **quickstart.md** (manual QA steps and checklist)

---

## Implementation Readiness Checklist

- [x] Feature spec complete and approved (spec.md)
- [x] Technical plan documented (plan.md)
- [x] Data model defined (data-model.md)
- [x] Data contracts specified (contracts.md)
- [x] Research & decisions documented (research.md)
- [x] Testing strategy and guide provided (quickstart.md)
- [x] Constitution compliance verified
- [x] No blocking technical questions

**Status**: ✅ READY FOR TASK PHASE

Next step: `tasks.md` will break this plan into atomic, testable implementation tasks.

---

## Key Facts at a Glance

| Aspect | Details |
|--------|---------|
| **Feature ID** | COA-26 |
| **Title** | Documents (Club Policies & Team Manager Resources) |
| **Branch** | `cameronwalsh/coa-26-documents` |
| **Platform** | Static Astro site (no backend changes) |
| **Scope** | 3 features: About page policies, Manager tab, Guides tab |
| **Data** | JSON files + static PDFs in `/public/` |
| **Type Update** | Add `'managers'` to `ResourceAudience` type |
| **Dependencies** | None (no new npm packages) |
| **Accessibility** | WCAG 2.1 AA required; keyboard accessible |
| **Responsive** | 375px, 768px, 1440px viewports |
| **Public Access** | Yes (no authentication required) |

---

## File Organization (After Implementation)

```
specs/coa-26-documents/
├── INDEX.md          (this file)
├── spec.md           (user requirements)
├── plan.md           (technical plan)
├── data-model.md     (data structures)
├── contracts.md      (interface specs)
├── research.md       (tech decisions)
├── quickstart.md     (testing guide)
└── tasks.md          (atomic tasks — to be created)

src/
├── pages/
│   ├── about.astro           (MOD: Club Policies)
│   └── resources/index.astro (MOD: Manager tab, Guides tab)
├── data/
│   ├── guides.json           (NEW)
│   └── manager-resources.json (MOD: update URLs)
└── lib/resources/types.ts    (MOD: ResourceAudience type)

public/resources/
├── club-policies/*.pdf   (NEW: PDF files)
└── team-manager/*.pdf    (NEW: PDF files)
```

---

## Constitutional Compliance Summary

All nine principles verified:

✅ **Principle I: User Outcomes First** — Measurable acceptance criteria for each user story
✅ **Principle II: Test-First Discipline** — Comprehensive manual testing checklist provided
✅ **Principle III: Backend Authority** — N/A (static site)
✅ **Principle IV: Error Semantics** — Error states documented (missing PDFs, etc.)
✅ **Principle V: AppShell Integrity** — All UI within BaseLayout; no custom nav
✅ **Principle VI: Accessibility First** — WCAG 2.1 AA, ARIA, keyboard navigation
✅ **Principle VII: Immutable Data Flow** — JSON → HTML at build time; local state only
✅ **Principle VIII: Dependency Hygiene** — No new dependencies; native embeds
✅ **Principle IX: Cross-Feature Consistency** — Existing patterns reused; Tailwind tokens

---

## Success Criteria (Verification Before Merge)

- [ ] All Club Policies visible on About page without 404 errors
- [ ] Team Manager tab visible; documents accessible
- [ ] Guides tab visible with working YouTube embeds
- [ ] Responsive at 375px, 768px, 1440px
- [ ] No JavaScript console errors
- [ ] Keyboard navigation functional
- [ ] No WCAG 2.1 AA violations (axe DevTools)
- [ ] PDF performance acceptable (≤3s on 3G)
- [ ] Manual QA checklist 100% complete

---

## Questions & Support

For clarification on any aspect of this plan:

1. **Functional requirements** — See spec.md
2. **Technical approach** — See plan.md
3. **Data structures** — See data-model.md
4. **Data contracts** — See contracts.md
5. **Tech decisions** — See research.md
6. **Testing procedures** — See quickstart.md

---

## Handoff Status

✅ Feature is **READY FOR TASK PHASE**

The implementation plan is complete, comprehensive, and ready for execution. All technical decisions are documented with rationale. All risks and edge cases have been considered. Testing strategy is clear. No blocking questions remain.

**Next Phase**: Create `tasks.md` with atomic, testable implementation tasks organized by phase.

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-11  
**Author**: Claude Code (Planning Agent)
