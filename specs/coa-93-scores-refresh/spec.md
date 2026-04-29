# Spec: COA-93 — Scores Refresh

**Status**: DRAFT
**Feature Branch**: `cameronwalsh/coa-93-scores-refresh`
**Source**: https://linear.app/coachcw/issue/COA-93/scores-refresh
**Priority**: Medium
**Project**: Phoenix

---

## Summary

Implement a scheduled scores refresh that runs every hour during the evening game window, starting at 4:30pm and ending at 11:30pm local time. The goal is to keep scores current during active game periods without refreshing all day.

---

## User Scenarios & Testing

### User Story 1 — Scores stay current during the evening window

As a visitor checking scores during game time, I want the latest results to refresh automatically so I’m not looking at stale data.

**Independent Test**: Simulate the scheduled refresh window and confirm scores update on each run.

**Acceptance Scenarios**:

1. Given it is within the refresh window, when the scheduled job runs, then scores are refreshed successfully.
2. Given multiple refresh runs occur during the window, when a new run completes, then the latest data is available to the site.
3. Given a game score changes between runs, when the next refresh completes, then the updated score is reflected.

---

### User Story 2 — Refresh only happens in the defined window

As a site owner, I want refreshes to happen only during the supported time window so background work stays limited and predictable.

**Independent Test**: Trigger the scheduler outside the window and verify it does not refresh.

**Acceptance Scenarios**:

1. Given the current time is before 4:30pm local time, when the scheduler evaluates, then no refresh runs.
2. Given the current time is after 11:30pm local time, when the scheduler evaluates, then no refresh runs.
3. Given the current time is 4:30pm, 5:30pm, 6:30pm, 7:30pm, 8:30pm, 9:30pm, 10:30pm, or 11:30pm local time, when the scheduler fires, then a refresh runs.

---

### User Story 3 — Failed refreshes are safe and observable

As a maintainer, I want refresh failures to be visible without breaking the existing scores experience.

**Independent Test**: Force a refresh failure and confirm the previous good data remains available.

**Acceptance Scenarios**:

1. Given the refresh source is unavailable, when a scheduled refresh fails, then the last successful data remains intact.
2. Given a refresh fails, when logs are reviewed, then the failure is recorded with enough context to diagnose it.
3. Given a refresh overlaps with another in-flight refresh, when the scheduler runs, then duplicate concurrent work is prevented.

---

## Edge Cases

- Local timezone / DST boundary causes the 4:30pm–11:30pm window to shift relative to UTC.
- A refresh starts near the end of the window and finishes after 11:30pm.
- A scheduled run fires but there is no score change.
- The upstream scores source is temporarily unavailable.
- Two scheduled triggers overlap because a previous refresh is still running.

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST run score refreshes every hour during the evening window, at 30 minutes past the hour from 4:30pm through 11:30pm local time.
- **FR-002**: The system MUST NOT run the refresh job outside the defined window.
- **FR-003**: The system MUST use the current local site timezone for scheduling unless a different timezone is explicitly confirmed.
- **FR-004**: Each refresh MUST fetch the latest score data from the authoritative source used by the app.
- **FR-005**: A failed refresh MUST NOT overwrite the last known good score data.
- **FR-006**: The system MUST log each scheduled refresh attempt with timestamp, outcome, and failure details if applicable.
- **FR-007**: The system MUST prevent overlapping refresh executions from running concurrently.
- **FR-008**: The scores page MUST continue to render using the most recent successful data if a scheduled refresh fails.

### Non-Functional Requirements

- **NFR-001 (Reliability)**: Refresh failures MUST be recoverable without user-facing breakage.
- **NFR-002 (Observability)**: Refresh attempts and failures MUST be traceable in logs.
- **NFR-003 (Time correctness)**: Scheduling MUST handle timezone and DST behavior deterministically.
- **NFR-004 (Safety)**: New refresh data MUST only replace existing data after a successful fetch/transform cycle.

---

## Acceptance Criteria (System-Level)

1. Given the system time is 4:30pm local time, when the scheduler fires, then a refresh run occurs.
2. Given the system time is 11:30pm local time, when the scheduler fires, then a refresh run occurs.
3. Given the system time is 12:00pm local time, when the scheduler evaluates, then no refresh run occurs.
4. Given a refresh succeeds, when the site reads score data, then the newest scores are available.
5. Given a refresh fails, when the site reads score data, then the last successful scores remain available.
6. Given two refresh triggers overlap, when the second trigger arrives, then the system does not run both concurrently.

---

## Open Questions

- What timezone should “local time” use for scheduling and cron conversion?
- Is the refresh intended to run exactly at 4:30pm/5:30pm/etc., or on a different cadence within that window?
- Should successful refreshes update any cache/file timestamp visible to users or only the underlying data source?

---

## Notes

- This spec is intentionally focused on scheduling and safety around score freshness.
- It does not define a new UI surface.
- It should be read alongside the existing scores data flow work, especially COA-71 if the refresh feeds that pipeline.