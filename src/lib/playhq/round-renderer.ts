import { escapeHtml } from './strings';
import type { LiveScores, NormalisedGame, PlayerStats } from '../scores/round-file';

function getPhoenixResult(
  status: NormalisedGame['status'],
  homeTeam: string,
  awayTeam: string,
  homeScore: number | null,
  awayScore: number | null,
): 'win' | 'loss' | 'draw' | 'pending' | 'live' {
  if (status === 'IN_PROGRESS') return 'live';
  if (status !== 'COMPLETED' || homeScore === null || awayScore === null) return 'pending';

  const isPhoenixHome = homeTeam.toLowerCase().includes('phoenix');
  const phoenixScore = isPhoenixHome ? homeScore : awayScore;
  const opponentScore = isPhoenixHome ? awayScore : homeScore;

  if (phoenixScore > opponentScore) return 'win';
  if (phoenixScore < opponentScore) return 'loss';
  return 'draw';
}

function renderResultPill(result: 'win' | 'loss' | 'draw' | 'pending' | 'live'): string {
  const styles = {
    win: 'bg-green-500 text-white',
    loss: 'bg-red-500 text-white',
    draw: 'bg-gray-400 text-white',
    pending: 'bg-gray-200 text-gray-600',
    live: 'bg-red-600 text-white',
  } as const;
  const labels = {
    win: 'W',
    loss: 'L',
    draw: 'D',
    pending: 'TBD',
    live: 'LIVE',
  } as const;

  return `<span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${styles[result]}">${labels[result]}</span>`;
}

function formatShortDate(date: string | null, time: string | null): string {
  const formattedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
    : 'Date TBA';
  const formattedTime = time && /^\d{2}:\d{2}(:\d{2})?$/.test(time) ? time.slice(0, 5) : 'TBA';
  return `${formattedDate} · ${formattedTime}`;
}

function renderMeta(game: NormalisedGame): string {
  const venueCourt = game.court ? `${game.venue ?? 'Venue TBA'} · ${game.court}` : (game.venue ?? 'Venue TBA');
  return `
    <div class="mt-auto px-4 pb-3">
      <p class="text-[11px] font-medium leading-tight text-gray-400">${escapeHtml(formatShortDate(game.date, game.time))}</p>
      <p class="mt-1 truncate text-[11px] leading-tight text-gray-500" title="${escapeHtml(venueCourt)}">${escapeHtml(venueCourt)}</p>
    </div>
  `;
}

export function renderGameCard(game: NormalisedGame, liveScores: LiveScores = {}): string {
  const live = liveScores[game.id];
  const status = live?.status ?? game.status;
  const homeScore = live?.homeScore ?? game.homeScore;
  const awayScore = live?.awayScore ?? game.awayScore;
  const href = `/scores/${encodeURIComponent(game.id)}`;
  const isPhoenixHome = game.homeTeam.toLowerCase().includes('phoenix');
  const result = getPhoenixResult(status, game.homeTeam, game.awayTeam, homeScore, awayScore);

  return `
    <a href="${escapeHtml(href)}" class="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold" aria-label="Open details for ${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}">
      <article class="card-hover flex h-full min-h-[142px] flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5" data-game-id="${escapeHtml(game.id)}" data-status="${escapeHtml(status)}" aria-label="${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}">
        <div class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 bg-brand-black px-3 py-2">
          <p class="min-w-0 truncate text-[10px] font-bold uppercase tracking-wide text-gray-300" title="${escapeHtml(game.competition)}">${escapeHtml(game.competition)}</p>
          ${renderResultPill(result)}
        </div>

        <div class="flex flex-1 flex-col gap-2 px-4 py-3">
          <div class="flex items-center justify-between gap-3">
            <p class="round-score-team-name text-sm font-semibold leading-tight ${isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}" title="${escapeHtml(game.homeTeam)}">${escapeHtml(game.homeTeam)}</p>
            <p class="shrink-0 text-2xl font-black ${isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}">${homeScore ?? '–'}</p>
          </div>

          <div class="flex items-center justify-between gap-3">
            <p class="round-score-team-name text-sm font-semibold leading-tight ${!isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}" title="${escapeHtml(game.awayTeam)}">${escapeHtml(game.awayTeam)}</p>
            <p class="shrink-0 text-2xl font-black ${!isPhoenixHome ? 'text-brand-purple' : 'text-gray-700'}">${awayScore ?? '–'}</p>
          </div>
        </div>

        ${renderMeta(game)}
      </article>
    </a>
  `;
}

function renderPlayerStatsSection(playerStats: PlayerStats, teamOrder: string[]): string {
  const grouped = playerStats.players.reduce<Record<string, PlayerStats['players']>>((acc, player) => {
    const key = player.team || 'Unknown Team';
    (acc[key] ||= []).push(player);
    return acc;
  }, {});

  const orderedTeamNames = [
    ...teamOrder.filter((teamName) => grouped[teamName]),
    ...Object.keys(grouped).filter((teamName) => !teamOrder.includes(teamName)),
  ];

  const groups = orderedTeamNames.map((teamName) => [teamName, grouped[teamName]] as const);

  return `
    <section class="mt-4 rounded-2xl border border-gray-200 bg-brand-offwhite p-3 sm:p-4" aria-label="Player Statistics">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h3 class="text-base font-black uppercase tracking-wide text-brand-purple">Player Statistics</h3>
        <p class="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Game summary</p>
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        ${groups.map(([teamName, players]) => `
          <article class="rounded-xl border border-gray-200 bg-white p-3">
            <h4 class="text-sm font-black uppercase tracking-wide text-brand-purple">${escapeHtml(teamName)}</h4>
            <div class="mt-2 overflow-x-auto">
              <table class="w-full min-w-[240px] text-sm">
                <thead>
                  <tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th class="py-1.5 pr-3">Player</th>
                    <th class="py-1.5 text-center">PTS</th>
                    <th class="py-1.5 text-center">PF</th>
                  </tr>
                </thead>
                <tbody>
                  ${players.map((player) => `
                    <tr class="border-b border-gray-100 last:border-b-0">
                      <td class="py-2 pr-3 font-semibold text-brand-black">${escapeHtml(player.name)}</td>
                      <td class="py-2 text-center font-bold text-brand-purple">${player.points}</td>
                      <td class="py-2 text-center text-gray-700">${player.fouls}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export function renderGameDetail(game: NormalisedGame, liveScores: LiveScores = {}): string {
  const live = liveScores[game.id];
  const status = live?.status ?? game.status;
  const homeScore = live?.homeScore ?? game.homeScore;
  const awayScore = live?.awayScore ?? game.awayScore;
  const shouldShowStats = status === 'COMPLETED' && !!game.playerStats?.players?.length;
  const result = getPhoenixResult(status, game.homeTeam, game.awayTeam, homeScore, awayScore);

  const scoreBlock = status === 'UPCOMING'
    ? ''
    : `<div class="mt-4 rounded-2xl bg-brand-purple px-4 py-3 text-center text-white sm:px-6"><div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3"><div><p class="truncate text-xs font-bold uppercase tracking-wide text-purple-200" title="${escapeHtml(game.homeTeam)}">${escapeHtml(game.homeTeam)}</p><p class="mt-1 text-3xl font-black sm:text-4xl">${homeScore ?? '–'}</p></div><span class="pb-1 text-3xl font-black text-purple-200 sm:text-4xl">–</span><div><p class="truncate text-xs font-bold uppercase tracking-wide text-purple-200" title="${escapeHtml(game.awayTeam)}">${escapeHtml(game.awayTeam)}</p><p class="mt-1 text-3xl font-black sm:text-4xl">${awayScore ?? '–'}</p></div></div></div>`;

  return `
    <section class="mx-auto max-w-3xl px-3 py-3 sm:px-4 sm:py-4">
      <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:rounded-3xl sm:p-5">
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <p class="text-xs font-bold uppercase tracking-widest text-brand-gold sm:text-sm">${escapeHtml(game.competition)}</p>
        </div>
        <h2 class="mt-2 text-2xl font-black leading-tight text-brand-purple sm:text-3xl">${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}</h2>
        <p class="mt-2 flex items-center justify-between gap-3 text-sm text-gray-600"><span class="min-w-0 truncate">${escapeHtml(game.date ?? 'TBA')} · ${escapeHtml(game.time ?? 'TBA')} · ${escapeHtml(game.venue ?? 'TBA')}${game.court ? ` · ${escapeHtml(game.court)}` : ''}</span>${renderResultPill(result)}</p>
        ${scoreBlock}
        ${shouldShowStats ? renderPlayerStatsSection(game.playerStats as PlayerStats, [game.homeTeam, game.awayTeam]) : ''}
      </div>
    </section>
  `;
}
