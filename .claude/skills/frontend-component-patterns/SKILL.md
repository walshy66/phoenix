---
name: frontend-component-patterns
description: Enforce CoachCW UI architecture rules for React 19 components including AppShell composition, responsive layout modes, shared primitive usage, accessibility standards, and state derivation from server responses. Use when building any new page, feature panel, or UI component. Prevents navigation shell violations, hardcoded breakpoints, re-implemented primitives, and client-side state inference.
compatibility: Requires React 19, Tailwind CSS, Vite 7
---

# Frontend Component Patterns

Build CoachCW UI components that comply with the constitution's layout, accessibility, and state authority rules.

## When to Use This Skill

- Building a new page or route
- Implementing a new feature panel or section
- Adding navigation entries
- Writing a component with responsive layout requirements
- Handling loading, error, or empty states
- Building any interactive element (button, form, link)

## Core Principles

1. **AppShell is non-negotiable**: Every routed page renders inside AppShell. No page implements its own nav shell.
2. **Two layouts, not three**: Handheld (phone + tablet) and Desktop. No tablet-specific layout variants.
3. **Server is the source of truth**: Frontend derives all domain state from server responses. No client-side inference.
4. **Shared primitives, not re-implementations**: Use existing Card, Button, PageHeader etc. from the common UI layer.
5. **Accessibility is a hard requirement**: Keyboard navigation, visible focus states, and 44×44px tap targets — not optional.

---

## File Structure

Feature UI code lives in:

```
app/src/features/{feature-slug}/
├── {FeatureName}Page.tsx        (routed page — thin, composes panels)
├── {FeatureName}Panel.tsx       (main feature panel)
├── components/                  (feature-local sub-components)
│   └── {ComponentName}.tsx
├── hooks/
│   └── use{FeatureName}.ts      (data fetching hook)
└── {feature-name}.test.tsx      (component tests)
```

Shared primitives live in:
```
app/src/components/ui/           (Card, Button, Badge, etc.)
app/src/components/layout/       (AppShell, PageHeader, PageBody)
```

**Never** place routed pages in `app/src/pages/` — that is a thin routing layer only. Feature code belongs in `app/src/features/`.

---

## AppShell Rules

### What AppShell Provides

- Desktop: persistent left sidebar navigation
- Handheld: bottom navigation bar
- Global header area (title, context, actions)
- Single routed content region via `<Outlet />`

### What Pages Must NOT Do

```typescript
// ❌ WRONG: Page implements its own navigation
export function ExerciseHistoryPage() {
  return (
    <div>
      <nav>  {/* Custom nav shell — FORBIDDEN */}
        <a href="/overview">Overview</a>
        <a href="/history">History</a>
      </nav>
      <main>...</main>
    </div>
  );
}

// ✅ CORRECT: Page is content only, AppShell wraps it
export function ExerciseHistoryPage() {
  return (
    <>
      <PageHeader title="Exercise History" />
      <PageBody>
        <ExerciseHistoryPanel />
      </PageBody>
    </>
  );
}
```

### What Pages MAY Do

Pages may render feature-level sub-navigation inside the content region:

```typescript
// ✅ ALLOWED: Sub-nav inside content area
export function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" />
      <PageBody>
        <Tabs>
          <TabsList>
            <TabsTrigger value="consistency">Consistency</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="consistency">...</TabsContent>
          <TabsContent value="history">...</TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
```

---

## Navigation Rules

Adding a new primary section to navigation:

```typescript
// ✅ CORRECT: Contribute to navigation.config.ts only
// app/src/navigation.config.ts
export const navigationItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: HomeIcon, route: '/overview' },
  { id: 'history', label: 'History', icon: ClockIcon, route: '/history' },
  // Add new entries here — nowhere else
];
```

**Never** add nav items directly inside a component or page file.

---

## Responsive Layout

### Two Modes — No Exceptions

```typescript
// ✅ CORRECT: Use shared breakpoints, not local media queries
// Tailwind's md: breakpoint = desktop threshold (defined centrally)

export function SessionSummary() {
  return (
    <div className="flex flex-col md:flex-row md:gap-6">
      {/* Handheld: stacked, Desktop: side by side */}
      <div className="w-full md:w-2/3">
        <SessionDetails />
      </div>
      <div className="hidden md:block md:w-1/3">
        {/* Desktop only — hidden on handheld */}
        <SessionMetrics />
      </div>
    </div>
  );
}

// ❌ WRONG: Feature-local breakpoints
export function SessionSummary() {
  return (
    <div style={{ display: 'flex', flexDirection: window.innerWidth > 900 ? 'row' : 'column' }}>
      {/* Runtime breakpoint check — FORBIDDEN */}
    </div>
  );
}
```

### Handheld Rules

- Single-column stacked content
- Touch-first: no hover-only interactions
- Bottom navigation for primary sections (provided by AppShell)
- Hide dense planning views and data tables: `hidden md:block`
- Horizontal carousels for multi-item browsing where applicable
- CTA-only navigation in cards (no card-body click targets)

### Desktop Rules

- Left sidebar (provided by AppShell)
- Multi-column layouts permitted with `md:grid-cols-2` etc.
- Hover affordances allowed — but never the only way to trigger an action
- RightRail optional: `hidden md:block` column for contextual info

---

## Page Composition Pattern

Every page follows this structure:

```typescript
import { PageHeader } from '@/components/layout/PageHeader';
import { PageBody } from '@/components/layout/PageBody';

export function ExerciseHistoryPage() {
  return (
    <>
      <PageHeader
        title="Exercise History"
        // Optional: context subtitle, primary action button
      />
      <PageBody>
        <ExerciseHistoryPanel />
      </PageBody>
    </>
  );
}
```

RightRail (desktop only):

```typescript
export function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview" />
      <PageBody>
        <div className="flex gap-6">
          <div className="flex-1">
            <SessionCard />
          </div>
          <div className="hidden md:block w-80">
            {/* RightRail — desktop only */}
            <ConsistencyPanel />
          </div>
        </div>
      </PageBody>
    </>
  );
}
```

---

## State Management Pattern

### Server Is Source of Truth

```typescript
// ✅ CORRECT: Derive all state from server response
export function SessionCard() {
  const { data, isLoading, error, refetch } = useOverview();

  if (isLoading) return <SessionCardSkeleton />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!data) return <EmptyState />;

  // Derive eligibility from server — not client logic
  const canStartSession = data.activeSession === null;
  const canResumeSession = data.activeSession !== null;

  return (
    <Card>
      {canResumeSession && (
        <Button onClick={handleResume}>Resume Session</Button>
      )}
      {canStartSession && (
        <Button onClick={handleStart}>Start Session</Button>
      )}
    </Card>
  );
}

// ❌ WRONG: Client infers domain state
export function SessionCard() {
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    // Client checking local storage or guessing — FORBIDDEN
    const stored = localStorage.getItem('activeSession');
    setHasActiveSession(!!stored);
  }, []);
  // ...
}
```

### Data Fetching Hook Pattern

```typescript
// app/src/features/exercise-history/hooks/useExerciseHistory.ts
export function useExerciseHistory(exerciseId: string) {
  const [data, setData] = useState<ExerciseHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/exercise-history/${exerciseId}`);
      setData(response.data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
```

---

## Required States

Every data-fetching component MUST handle all four states:

```typescript
export function ExerciseHistoryPanel({ exerciseId }: Props) {
  const { data, isLoading, error, refetch } = useExerciseHistory(exerciseId);

  // 1. Loading
  if (isLoading) {
    return <ExerciseHistorySkeleton />;
  }

  // 2. Error — recoverable, show retry
  if (error) {
    return (
      <ErrorState
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  // 3. Empty — valid state, give guidance
  if (!data || data.entries.length === 0) {
    return (
      <EmptyState
        message="No history yet for this exercise."
        hint="Complete a session with this exercise to see your history."
      />
    );
  }

  // 4. Data
  return (
    <div className="space-y-4">
      {data.entries.map(entry => (
        <ExerciseHistoryEntry key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

---

## Accessibility Requirements

### Tap Targets

All interactive elements must be at least 44×44px on handheld:

```typescript
// ✅ CORRECT: Adequate tap target
<button className="min-h-[44px] min-w-[44px] px-4 py-3">
  Start Session
</button>

// ❌ WRONG: Too small for touch
<button className="p-1 text-xs">
  Start
</button>
```

### Keyboard Navigation

```typescript
// ✅ CORRECT: Keyboard accessible custom interactive element
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Click me
</div>

// ❌ WRONG: Click-only, not keyboard accessible
<div onClick={handleClick}>
  Click me
</div>
```

### Focus States

Never suppress focus rings globally:

```typescript
// ❌ WRONG: Suppresses all focus indicators
// In global CSS:
// * { outline: none; }

// ✅ CORRECT: Custom focus style that's still visible
className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
```

### Active Route Indication

Navigation MUST visually indicate the active route:

```typescript
// navigation.config.ts drives this — AppShell applies active styles
// Feature code does not need to handle this directly
```

---

## Shared Primitives

Use the primitives in `@/components/ui/` and `@/components/layout/` — do not re-implement them in feature folders. Full list in `references/component-rules.json`.

If a primitive doesn't exist for your use case, add it to the shared layer — do not implement it inside your feature folder.

---

## Styling Rules

```typescript
// ✅ CORRECT: Tailwind utilities only
<div className="flex flex-col gap-4 p-4 rounded-lg bg-slate-800">

// ❌ WRONG: Arbitrary values, inline styles, or feature-local CSS files
<div className="p-[13px] bg-[#1a2b3c]">
```

Colour conventions and full styling reference: see `references/component-rules.json`.

---

## Retry & Resubmission Rules

```typescript
// ✅ CORRECT: At most one automatic retry, further retries need user intent
const MAX_AUTO_RETRIES = 1;

async function submitWithRetry(data: FormData, attempt = 0) {
  try {
    return await api.post('/sessions', data);
  } catch (err) {
    if (attempt < MAX_AUTO_RETRIES) {
      return submitWithRetry(data, attempt + 1);
    }
    // Surface to user — require explicit retry
    setError({ message: 'Failed to save. Please try again.', retryFn: () => submitWithRetry(data) });
  }
}

// ✅ CORRECT: Retries must not create duplicate entities
// Backend must be idempotent for retried requests (idempotency key or check-then-create)
```

---

## Pre-Merge Component Checklist

- [ ] Page renders inside AppShell — no custom nav shell
- [ ] Navigation entry added to `navigation.config.ts` only
- [ ] Feature code in `app/src/features/{slug}/` not `app/src/pages/`
- [ ] Shared primitives used — none re-implemented
- [ ] Tailwind utilities only — no arbitrary values, no inline styles
- [ ] Handheld layout: single column, no desktop-only patterns
- [ ] Desktop layout: uses `md:` breakpoints from Tailwind config
- [ ] No feature-local media queries
- [ ] All interactive elements keyboard accessible
- [ ] Focus states visible on all interactive elements
- [ ] Touch targets minimum 44×44px
- [ ] Loading, error, and empty states all implemented
- [ ] All domain state derived from server response
- [ ] No client-side inference of server state
- [ ] Retry logic respects one-auto-retry maximum

---

## Related Skills

- `code-review-checklist` — Section 7 validates all of the above before merge
- `error-semantics-enforcer` — error response handling that feeds into ErrorState
- `feature-development` — the implementation workflow this skill supports

## Related Principles

- **Constitution UI Architecture** — AppShell, responsive modes, page composition
- **Constitution IX** (Cross-Feature Consistency) — folder structure, naming, shared primitives
- **Constitution VI** (Backend Authority) — server is source of truth for domain state
