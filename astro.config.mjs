import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import legacyTeamSlugs from './src/data/legacy-team-slugs.json' with { type: 'json' };

export default defineConfig({
  site: 'https://bendigophoenix.org.au',
  output: 'static',
  redirects: Object.fromEntries([
    ...['/seasons', '/teams', '/team', '/scores', '/scores/game'].map(path => [path, '/play-basketball']),
    ...legacyTeamSlugs.map(slug => [`/teams/${slug}`, '/play-basketball']),
  ]),
  vite: {
    plugins: [tailwindcss()],
  },
});
