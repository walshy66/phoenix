import { escapeHtml } from './strings';
import type { LiveScores, NormalisedGame, PlayerStats } from '../scores/round-file';

function renderStatusPill(status: NormalisedGame['status']): string {
  if (status === 'IN_PROGRESS') {
    return '<span class="inline-flex items-center rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-widest text-white">LIVE</span>';
  }
  if (status === 'COMPLETED') {
    return '<span class="inline-flex items-center rounded-full bg-brand-gold px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-purple">FINAL</span>';
  }
  return '<span class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-white/80">UPCOMING</span>';
}

function renderGameScore(status: NormalisedGame['status'], homeScore: number | null, awayScore: number | null): string {
  if (status === 'UPCOMING') {
    return '<div class="flex items-center justify-center"><span class="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">VS</span></div>';
  }

  return `
    <div class="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
      <div>
        <p class="text-3xl font-black text-brand-purple sm:text-4xl">${homeScore ?? '–'}</p>
      </div>
      <div class="text-xs font-black uppercase tracking-[0.25em] text-gray-400">${status === 'IN_PROGRESS' ? 'LIVE' : 'FINAL'}</div>
      <div>
        <p class="text-3xl font-black text-brand-purple sm:text-4xl">${awayScore ?? '–'}</p>
      </div>
    </div>
  `;
}

function renderMeta(game: NormalisedGame): string {
  const bits = [game.date ?? 'TBA', game.time ?? 'TBA', game.venue ?? 'Venue TBA'];
  if (game.court) bits.push(game.court);
  return `<p class="mt-3 text-center text-xs text-gray-500">${escapeHtml(bits.join(' • '))}</p>`;
}

export function renderGameCard(game: NormalisedGame, liveScores: LiveScores = {}): string {
  const live = liveScores[game.id];
  const status = live?.status ?? game.status;
  const homeScore = live?.homeScore ?? game.homeScore;
  const awayScore = live?.awayScore ?? game.awayScore;
  const href = `/scores/${encodeURIComponent(game.id)}`;

  return `
    <a href="${escapeHtml(href)}" class="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold" aria-label="Open details for ${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}">
      <article class="card-hover flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-transform duration-150 hover:-translate-y-0.5" data-game-id="${escapeHtml(game.id)}" data-status="${escapeHtml(status)}" aria-label="${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}">
        <div class="flex items-center justify-between gap-3 bg-brand-black px-4 py-2">
          <p class="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wide text-gray-300">${escapeHtml(game.competition)}</p>
          ${renderStatusPill(status)}
        </div>

        <div class="flex flex-1 flex-col p-4">
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div class="text-right">
              <p class="text-sm font-semibold leading-tight text-brand-purple">${escapeHtml(game.homeTeam)}</p>
            </div>

            <div class="flex items-center justify-center">
              ${status === 'UPCOMING' ? '<span class="text-sm font-bold uppercase tracking-[0.35em] text-gray-400">VS</span>' : '<span class="text-sm font-black uppercase tracking-[0.35em] text-gray-400">Score</span>'}
            </div>

            <div class="text-left">
              <p class="text-sm font-semibold leading-tight text-brand-purple">${escapeHtml(game.awayTeam)}</p>
            </div>
          </div>

          ${renderGameScore(status, homeScore, awayScore)}
          ${renderMeta(game)}
        </div>
      </article>
    </a>
  `;
}

function renderPlayerStatsSection(playerStats: PlayerStats): string {
  const groups = Object.entries(
    playerStats.players.reduce<Record<string, PlayerStats['players']>>((acc, player) => {
      const key = player.team || 'Unknown Team';
      (acc[key] ||= []).push(player);
      return acc;
    }, {}),
  );

  return `
    <section class="mt-8 rounded-2xl border border-gray-200 bg-brand-offwhite p-4 sm:p-5" aria-label="Player Statistics">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <h3 class="text-lg font-black uppercase tracking-wide text-brand-purple">Player Statistics</h3>
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-500">Game summary</p>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        ${groups.map(([teamName, players]) => `
          <article class="rounded-xl border border-gray-200 bg-white p-4">
            <h4 class="text-sm font-black uppercase tracking-wide text-brand-purple">${escapeHtml(teamName)}</h4>
            <div class="mt-3 overflow-x-auto">
              <table class="w-full min-w-[260px] text-sm">
                <thead>
                  <tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th class="py-2 pr-3">Player</th>
                    <th class="py-2 text-center">PTS</th>
                    <th class="py-2 text-center">PF</th>
                  </tr>
                </thead>
                <tbody>
                  ${players.map((player) => `
                    <tr class="border-b border-gray-100 last:border-b-0">
                      <td class="py-3 pr-3 font-semibold text-brand-black">${escapeHtml(player.name)}</td>
                      <td class="py-3 text-center font-bold text-brand-purple">${player.points}</td>
                      <td class="py-3 text-center text-gray-700">${player.fouls}</td>
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

  const scoreBlock = status === 'UPCOMING'
    ? ''
    : `<div class="mt-5 rounded-2xl bg-brand-purple px-4 py-4 text-center text-white sm:px-6"><div class="text-xs font-bold uppercase tracking-widest text-purple-200 sm:text-sm">${status === 'IN_PROGRESS' ? 'Live Score' : 'Final Score'}</div><div class="mt-2 text-3xl font-black sm:text-4xl"><span>${homeScore ?? '–'}</span><span class="px-3">–</span><span>${awayScore ?? '–'}</span></div></div>`;

  return `
    <section class="mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
      <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:rounded-3xl sm:p-6">
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <p class="text-xs font-bold uppercase tracking-widest text-brand-gold sm:text-sm">${escapeHtml(game.competition)}</p>
          ${renderStatusPill(status)}
        </div>
        <h2 class="mt-3 text-2xl font-black leading-tight text-brand-purple sm:text-3xl">${escapeHtml(game.homeTeam)} vs ${escapeHtml(game.awayTeam)}</h2>
        <p class="mt-2 text-sm text-gray-600 sm:text-base">${escapeHtml(game.date ?? 'TBA')} · ${escapeHtml(game.time ?? 'TBA')} · ${escapeHtml(game.venue ?? 'TBA')}${game.court ? ` · ${escapeHtml(game.court)}` : ''}</p>
        ${scoreBlock}
        ${shouldShowStats ? renderPlayerStatsSection(game.playerStats as PlayerStats) : ''}
      </div>
    </section>
  `;
}
