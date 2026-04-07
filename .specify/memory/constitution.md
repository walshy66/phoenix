# CoachCW Constitution

## Principles

### Principle I: User Outcomes First
- Every feature must deliver clear, measurable user value
- User stories must have testable acceptance criteria
- Success is defined by user behavior change, not code shipped

### Principle II: Test-First Discipline
- Write failing tests before implementation
- Tests must validate user outcomes, not just code coverage
- No behavior implementation without corresponding test

### Principle III: Backend Authority & Invariants
- All data mutations must be server-side enforced
- Client-side code must never bypass validation
- Invariants must be protected at the boundary

### Principle IV: Error Semantics & Observability
- All errors must be structured and actionable
- Distinguish recoverable errors from invariant failures
- Implement clear logging and audit trails

### Principle V: AppShell Integrity
- Maintain consistent navigation and layout structures
- No custom navigation shells that break the AppShell
- Responsive design must work at all breakpoints

### Principle VI: Accessibility First
- All interactive elements must be keyboard accessible
- Follow WCAG 2.1 AA standards
- ARIA labels and semantic HTML required

### Principle VII: Immutable Data Flow
- Data flows must be unidirectional where possible
- State mutations must be explicit and traceable
- Avoid client-side data inference or calculation

### Principle VIII: Dependency Hygiene
- Minimize third-party dependencies
- Pin exact versions in lockfiles
- Regularly audit for security vulnerabilities

### Principle IX: Cross-Feature Consistency
- Follow established patterns and conventions
- No framework versions or patterns that create fragmentation
- Component libraries must be shared and consistent

## Frontend-Specific Rules

### Astro/Tailwind Requirements
- Use Astro components for UI encapsulation
- Tailwind utility classes must follow established naming conventions
- Responsive design: mobile-first breakpoints
- All images must be optimized and use proper loading attributes

### Accessibility Requirements
- All form inputs must have associated labels
- Color contrast must meet WCAG AA standards
- Focus indicators must be visible and usable
- Skip navigation links must be present

### Performance Requirements
- Bundle size must be analyzed for new dependencies
- Images must be properly sized and compressed
- Critical CSS must be identified and inlined when beneficial