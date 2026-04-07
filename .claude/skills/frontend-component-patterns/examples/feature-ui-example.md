# Example: Exercise History Feature UI

A complete example of a compliant CoachCW feature UI implementation.

## Folder Structure

```
app/src/features/exercise-history/
├── ExerciseHistoryPage.tsx
├── ExerciseHistoryPanel.tsx
├── components/
│   └── ExerciseHistoryEntry.tsx
├── hooks/
│   └── useExerciseHistory.ts
└── exercise-history.test.tsx
```

---

## ExerciseHistoryPage.tsx

```typescript
// Thin page — composes panels, no logic
import { PageHeader } from '@/components/layout/PageHeader';
import { PageBody } from '@/components/layout/PageBody';
import { ExerciseHistoryPanel } from './ExerciseHistoryPanel';

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

**What makes this compliant:**
- No custom navigation shell
- Uses PageHeader and PageBody primitives
- Page is thin — logic lives in the panel

---

## ExerciseHistoryPanel.tsx

```typescript
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useExerciseHistory } from './hooks/useExerciseHistory';
import { ExerciseHistoryEntry } from './components/ExerciseHistoryEntry';

export function ExerciseHistoryPanel() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useExerciseHistory(selectedExerciseId);

  return (
    <div className="space-y-4">
      {/* Exercise selector */}
      <ExerciseSelector
        onSelect={setSelectedExerciseId}
        selectedId={selectedExerciseId}
      />

      {/* History content — all four states handled */}
      {isLoading && <ExerciseHistorySkeleton />}

      {error && (
        <ErrorState
          message={error.message}
          onRetry={refetch}
        />
      )}

      {!isLoading && !error && (!data || data.entries.length === 0) && (
        <EmptyState
          message="No history yet for this exercise."
          hint="Complete a session with this exercise to see your history here."
        />
      )}

      {!isLoading && !error && data && data.entries.length > 0 && (
        <div className="space-y-3">
          {/* Personal best summary — derived from server */}
          {data.personalBest && (
            <Card className="p-4 bg-slate-700">
              <p className="text-sm text-slate-400">Personal Best</p>
              <p className="text-xl font-semibold text-slate-100">
                {data.personalBest.weight}kg × {data.personalBest.reps} reps
              </p>
            </Card>
          )}

          {/* History entries */}
          {data.entries.map(entry => (
            <ExerciseHistoryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## hooks/useExerciseHistory.ts

```typescript
import { useState, useEffect, useCallback } from 'react';

interface ExerciseHistoryEntry {
  id: string;
  sessionDate: string;
  sets: Array<{ weight: number; reps: number }>;
}

interface ExerciseHistoryResponse {
  entries: ExerciseHistoryEntry[];
  personalBest: { weight: number; reps: number } | null;
}

interface ApiError {
  message: string;
  code: string;
}

export function useExerciseHistory(exerciseId: string | null) {
  const [data, setData] = useState<ExerciseHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetch = useCallback(async () => {
    if (!exerciseId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await window.fetch(`/api/v1/exercise-history/${exerciseId}`);

      if (!response.ok) {
        const err = await response.json();
        setError({ message: err.message, code: err.error });
        return;
      }

      const result = await response.json();
      setData(result); // Server is source of truth — no client transformation
    } catch (err) {
      setError({ message: 'Failed to load exercise history.', code: 'NETWORK_ERROR' });
    } finally {
      setIsLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, isLoading, error, refetch: fetch };
}
```

---

## components/ExerciseHistoryEntry.tsx

```typescript
// Feature-local sub-component — not a shared primitive
interface Props {
  entry: {
    id: string;
    sessionDate: string;
    sets: Array<{ weight: number; reps: number }>;
  };
}

export function ExerciseHistoryEntry({ entry }: Props) {
  return (
    // Uses shared Card primitive — not re-implemented
    <Card className="p-4">
      <p className="text-sm text-slate-400">
        {new Date(entry.sessionDate).toLocaleDateString()}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {entry.sets.map((set, i) => (
          <span key={i} className="text-sm text-slate-100">
            {set.weight}kg × {set.reps}
          </span>
        ))}
      </div>
    </Card>
  );
}
```

---

## navigation.config.ts entry

```typescript
// Add to existing navigation items array
{
  id: 'exercise-history',
  label: 'Exercise History',
  icon: ChartBarIcon,
  route: '/exercise-history',
  // visibility: authenticated only (handled by AppShell auth guard)
}
```

---

## exercise-history.test.tsx

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { ExerciseHistoryPanel } from './ExerciseHistoryPanel';

// Mock the hook — component tests don't hit the network
vi.mock('./hooks/useExerciseHistory');

describe('ExerciseHistoryPanel', () => {
  test('shows loading skeleton while fetching', () => {
    vi.mocked(useExerciseHistory).mockReturnValue({
      data: null, isLoading: true, error: null, refetch: vi.fn()
    });

    render(<ExerciseHistoryPanel />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  test('shows error state with retry on fetch failure', async () => {
    const mockRefetch = vi.fn();
    vi.mocked(useExerciseHistory).mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to load', code: 'NETWORK_ERROR' },
      refetch: mockRefetch
    });

    render(<ExerciseHistoryPanel />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();

    screen.getByRole('button', { name: /retry/i }).click();
    expect(mockRefetch).toHaveBeenCalled();
  });

  test('shows empty state when no history exists', () => {
    vi.mocked(useExerciseHistory).mockReturnValue({
      data: { entries: [], personalBest: null },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<ExerciseHistoryPanel />);
    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
  });

  test('renders history entries when data exists', () => {
    vi.mocked(useExerciseHistory).mockReturnValue({
      data: {
        entries: [
          { id: '1', sessionDate: '2026-03-01', sets: [{ weight: 100, reps: 5 }] }
        ],
        personalBest: { weight: 100, reps: 5 }
      },
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    render(<ExerciseHistoryPanel />);
    expect(screen.getByText('100kg × 5 reps')).toBeInTheDocument();
    expect(screen.getByText('Personal Best')).toBeInTheDocument();
  });
});
```
