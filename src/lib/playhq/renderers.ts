import type { HomeGameItem } from '../home-scores/transforms';
import type { WeeklyArtifact } from '../scores/rendering';
import { escapeHtml } from './strings';

export interface GameDetailViewModel {
  fixtureId?: string;
  gameId?: string;
  date?: string | null;
  time?: string | null;
  kickoffAt?: string | null;
  kickoffDisplay?: string | null;
  competition?: string | null;
  grade?: string | null;
  venue?: string | null;
  court?: string | null;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status?: string;
  squads?: Array<{ teamName: string; players: Array<{ name: string }> }>;
}

export function formatGameDate(date: string | null): string {
  if (!date || Number.isNaN(new Date(date).valueOf())) return 'Date TBA';
  return new Date(date).toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatGameTime(time: string | null | undefined): string {
  return time && /^\d{2}:\d{2}(:\d{2})?$/.test(time) ? time.slice(0, 5) : 'TBA';
}

export function formatHomeCardHeaderDate(date: string | null, time: string | null | undefined): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return `Date TBA · ${formatGameTime(time)}`;

  const [year, , dayRaw] = date.split('-');
  const day = Number(dayRaw);
  const month = new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', { month: 'short' });
  const suffix = day % 10 === 1 && day % 100 !== 11
    ? 'st'
    : day % 10 === 2 && day % 100 !== 12
      ? 'nd'
      : day % 10 === 3 && day % 100 !== 13
        ? 'rd'
        : 'th';

  return `${day}${suffix} ${month} ${year} · ${formatGameTime(time)}`;
}

export function renderHomeGameCard(game: HomeGameItem): string {
  const isPhoenixHome = game.homeTeam.toLowerCase().includes('phoenix');
  const phoenixScore = isPhoenixHome ? game.homeScore : game.awayScore;
  const opponentScore = isPhoenixHome ? game.awayScore : game.homeScore;
  const isLive = game.status === 'live';
  const isCompleted = game.status === 'completed' && phoenixScore !== null && opponentScore !== null;

  const result: 'win' | 'loss' | 'draw' | 'pending' = !isCompleted
    ? 'pending'
    : phoenixScore > opponentScore
      ? 'win'
      : phoenixScore < opponentScore
        ? 'loss'
        : 'draw';

  const resultStyles = {
    win: 'bg-green-500 text-white',
    loss: 'bg-red-500 text-white',
    draw: 'bg-gray-400 text-white',
    pending: 'bg-gray-200 text-gray-600',
    live: 'bg-red-600 text-white',
  } as const;

  const resultLabels = {
    win: 'W',
    loss: 'L',
    draw: 'D',
    pending: 'TBD',
    live: 'LIVE',
  } as const;

  const venueLabel = game.venue ?? 'Venue TBA';
  const venueCourtLabel = game.court ? `${venueLabel} · ${game.court}` : venueLabel;
  const headerDate = formatHomeCardHeaderDate(game.kickoffDate, game.kickoffTime);
  const statusBadge = isLive ? resultLabels.live : resultLabels[result];
  const statusStyle = isLive ? resultStyles.live : resultStyles[result];

  return `
    <div class="card-hover bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 ${result === 'win' ? 'win-indicator' : ''} flex h-full min-h-[142px] flex-col">
      <div class="bg-brand-black px-3 py-2 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <span class="text-gray-400 text-[10px] font-medium uppercase tracking-wide truncate" title="${escapeHtml(game.competition ?? 'Latest Results')}">${escapeHtml(game.competition ?? 'Latest Results')}</span>
        <span class="text-gray-300 text-[10px] font-semibold whitespace-nowrap">${escapeHtml(headerDate)}</span>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle}">${statusBadge}</span>
      </div>

      <div class="px-4 py-3 flex-1 space-y-2">
        <div class="flex items-center justify-between gap-3">
          <p class="home-team-name text-sm font-semibold leading-tight ${isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}" title="${escapeHtml(game.homeTeam)}">${escapeHtml(game.homeTeam)}</p>
          <p class="shrink-0 text-2xl font-black ${isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}">${game.homeScore !== null ? game.homeScore : '-'}</p>
        </div>

        <div class="flex items-center justify-between gap-3">
          <p class="home-team-name text-sm font-semibold leading-tight ${!isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}" title="${escapeHtml(game.awayTeam)}">${escapeHtml(game.awayTeam)}</p>
          <p class="shrink-0 text-2xl font-black ${!isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}">${game.awayScore !== null ? game.awayScore : '-'}</p>
        </div>
      </div>

      <div class="px-4 pb-3">
        <p class="text-gray-500 text-[11px] leading-tight truncate" title="${escapeHtml(venueCourtLabel)}">${escapeHtml(venueCourtLabel)}</p>
      </div>
    </div>
  `;
}

export function renderHomeGamesStateHtml(artifact: { status: 'success' | 'stale' | 'error'; staleBanner?: string | null; error?: { message?: string } | null; games: HomeGameItem[] }): string {
  if (artifact.status === 'error') {
    return `
      <div class="max-w-7xl mx-auto px-4">
        <div class="rounded-xl border border-red-400/40 bg-red-900/20 text-red-100 p-4 text-sm" role="status">
          ${escapeHtml(artifact.error?.message ?? 'Scores are temporarily unavailable. Please try again later.')}
        </div>
      </div>
    `;
  }

  if (!artifact.games.length) {
    return `
      <div class="max-w-7xl mx-auto px-4">
        <div class="rounded-xl border border-gray-600 bg-gray-900 text-gray-200 p-4 text-sm" role="status">
          No games found in the latest 7-day window.
        </div>
      </div>
    `;
  }

  return `
    <div class="home-scores-carousel max-w-7xl mx-auto px-4" data-count="${artifact.games.length}" aria-roledescription="carousel" aria-label="Latest games">
      <div class="relative overflow-hidden">
        <div class="home-scores-track flex transition-transform duration-1000 ease-in-out" aria-live="polite">
          ${artifact.games.map((game, idx) => `
            <div class="home-slide w-full sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0 px-2" data-index="${idx}" data-kickoff-date="${escapeHtml(game.kickoffDate ?? '')}" data-status="${escapeHtml(game.status ?? 'unknown')}">
              <a href="/scores/${escapeHtml(game.gameId)}" class="block h-full w-full focus-visible:outline-2 focus-visible:outline-brand-gold rounded-xl" aria-label="Open details for ${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}">
                ${renderHomeGameCard(game)}
              </a>
            </div>
          `).join('')}
        </div>
      </div>

      ${artifact.games.length > 1 ? `
        <div class="mt-4 flex items-center justify-center gap-3" data-home-scores-controls>
          <button type="button" class="hs-nav hs-prev inline-flex min-w-[120px] items-center justify-center rounded-full border border-brand-gold bg-brand-gold px-4 py-2 text-sm font-bold tracking-wide text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Previous games">
            <span aria-hidden="true">←</span>
            <span class="ml-2">Previous</span>
          </button>
          <button type="button" class="hs-nav hs-next inline-flex min-w-[120px] items-center justify-center rounded-full border border-brand-gold bg-brand-gold px-4 py-2 text-sm font-bold tracking-wide text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50" aria-label="Next games">
            <span class="mr-2">Next</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderScoresPageStateHtml(artifact: WeeklyArtifact): string {
  if (artifact.status === 'error') {
    return `
      <div class="text-center py-12 bg-white rounded-xl border border-dashed border-brand-purple" role="status">
        <span class="text-5xl mb-4 block">🏀</span>
        <p class="text-gray-500">${escapeHtml(artifact.error?.message ?? 'Scores are temporarily unavailable. Please try again later.')}</p>
      </div>
    `;
  }

  const dayColumns = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'friday', label: 'Friday' },
  ] as const;

  const hasAny = dayColumns.some((day) => (artifact.days as any)[day.key]?.length > 0);

  if (!hasAny) {
    return `
      ${artifact.status === 'stale' ? `<p class="mb-3 text-xs text-amber-700" role="status">${escapeHtml(artifact.staleBanner ?? 'Showing last known weekly data. Live refresh is temporarily unavailable.')}</p>` : ''}
      <div class="text-center py-12 bg-white rounded-xl border border-dashed border-brand-purple" role="status">
        <span class="text-5xl mb-4 block">🏀</span>
        <p class="text-gray-500">No games are scheduled for this week yet. Check back soon.</p>
      </div>
    `;
  }

  return `
    ${artifact.status === 'stale' ? `<p class="mb-3 text-xs text-amber-700" role="status">${escapeHtml(artifact.staleBanner ?? 'Showing last known weekly data. Live refresh is temporarily unavailable.')}</p>` : ''}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${dayColumns.map((day) => {
        const fixtures = (artifact.days as any)[day.key] ?? [];
        return `
          <section class="bg-gray-100 rounded-xl border border-gray-200 p-4" aria-labelledby="day-heading-${day.key}">
            <h3 id="day-heading-${day.key}" class="text-lg font-bold text-brand-black mb-4">${day.label}</h3>
            ${fixtures.length > 0 ? `
              <div class="space-y-4">
                ${fixtures.map((fixture: any) => `
                  <a href="/scores/${escapeHtml(fixture.fixtureId)}" class="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-purple hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple" aria-label="Open game details for ${escapeHtml(fixture.homeTeam)} vs ${escapeHtml(fixture.awayTeam)}">
                    <p class="text-xs font-semibold uppercase tracking-wide text-brand-purple">${escapeHtml(fixture.grade ?? 'Game')}</p>
                    <h4 class="mt-1 text-sm font-bold text-brand-black">${escapeHtml(fixture.homeTeam)} vs ${escapeHtml(fixture.awayTeam)}</h4>
                    <p class="mt-2 text-sm text-gray-700">${escapeHtml(fixture.kickoffDisplay ?? 'TBA')}</p>
                    ${fixture.venue ? `<p class="mt-1 text-xs text-gray-500">${escapeHtml(fixture.venue)}</p>` : ''}
                    ${fixture.court ? `<p class="mt-1 text-xs text-gray-500">${escapeHtml(fixture.court)}</p>` : ''}
                  </a>
                `).join('')}
              </div>
            ` : `
              <p class="text-sm text-gray-500 border border-dashed border-gray-200 rounded-lg p-3">No games scheduled.</p>
            `}
          </section>
        `;
      }).join('')}
    </div>
  `;
}

export function renderGameDetailStateHtml(game: GameDetailViewModel | null): string {
  if (!game) {
    return `
      <section class="py-12 px-4">
        <div class="max-w-3xl mx-auto rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h2 class="text-xl font-bold text-brand-black mb-2">Game not found</h2>
          <p class="text-gray-600 text-sm mb-4">This game may be unavailable or no longer in the published dataset.</p>
          <a href="/scores" class="text-brand-purple font-bold hover:underline">View all scores</a>
        </div>
      </section>
    `;
  }

  return `
    <section class="py-10 px-4 sm:px-6 lg:px-8 bg-brand-offwhite">
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">${escapeHtml(game.competition ?? 'Competition')}</p>
        <h2 class="text-2xl font-bold text-brand-purple mb-2">${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}</h2>
        <p class="text-gray-600 text-sm mb-4">${escapeHtml(game.date ?? game.kickoffAt?.slice(0, 10) ?? 'TBA')} ${game.time || game.kickoffDisplay ? `• ${escapeHtml(game.time ?? game.kickoffDisplay ?? 'TBA')}` : '• TBA'}</p>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="rounded-lg bg-brand-offwhite p-4 text-center">
            <p class="text-xs text-gray-500 uppercase">Home</p>
            <p class="font-bold text-brand-black">${escapeHtml(game.homeTeam)}</p>
            <p class="text-2xl font-black text-brand-purple">${game.homeScore ?? '-'}</p>
          </div>
          <div class="rounded-lg bg-brand-offwhite p-4 text-center">
            <p class="text-xs text-gray-500 uppercase">Away</p>
            <p class="font-bold text-brand-black">${escapeHtml(game.awayTeam)}</p>
            <p class="text-2xl font-black text-brand-purple">${game.awayScore ?? '-'}</p>
          </div>
        </div>

        ${game.grade ? `<p class="text-sm text-gray-600"><strong>Grade:</strong> ${escapeHtml(game.grade)}</p>` : ''}
        <p class="text-sm text-gray-600"><strong>Status:</strong> ${escapeHtml(game.status ?? 'unknown')}</p>
        <p class="text-sm text-gray-600"><strong>Venue:</strong> ${escapeHtml(game.venue ?? 'TBA')}</p>
        <p class="text-sm text-gray-600"><strong>Court:</strong> ${escapeHtml(game.court ?? 'TBA')}</p>

        ${Array.isArray(game.squads) && game.squads.length > 0 ? `
          <div class="mt-6 space-y-4">
            ${game.squads.map((squad) => `
              <div class="rounded-lg border border-gray-200 bg-brand-offwhite p-4">
                <p class="text-xs uppercase tracking-wide text-gray-500 mb-2">${escapeHtml(squad.teamName)}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  ${squad.players.map((player) => `<span class="rounded-md bg-white px-3 py-2 text-sm text-gray-700 border border-gray-200">${escapeHtml(player.name)}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="mt-6">
          <a href="/scores" class="text-brand-purple font-bold hover:underline focus-visible:outline-2 focus-visible:outline-brand-gold">
            ← Back to Scores
          </a>
        </div>
      </div>
    </section>
  `;
}
