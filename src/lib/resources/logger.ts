import type { FilterEvent, BrokenLinkEvent } from './types';

const SESSION_KEY = 'phoenix_session_id';

export function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = generateSessionId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function logFilterEvent(event: FilterEvent): void {
  const payload = { ...event, session_id: event.session_id ?? getSessionId() };
  // TODO: Replace console logging with telemetry service (e.g. Google Analytics gtag, Segment, or custom endpoint)
  console.log('[Filter Event]', payload);
}

export function logBrokenLink(event: BrokenLinkEvent): void {
  const payload = { ...event, session_id: event.session_id ?? getSessionId() };
  // TODO: Replace console logging with error tracking service (e.g. Sentry, Rollbar, or custom endpoint)
  console.error('[Broken Link Detected]', payload);
}
