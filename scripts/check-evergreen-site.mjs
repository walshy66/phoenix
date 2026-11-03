import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const page = (route = '') => readFileSync(`dist/${route ? `${route}/` : ''}index.html`, 'utf8');
const home = page();
assert.match(home, /href="\/play-basketball"/, 'Home should offer Play Basketball');
assert.doesNotMatch(home, /hero-carousel|home-scores|live-data|Welcome Day/, 'Home should not publish promotions or scores');
console.log('PASS: evergreen homepage');

assert.ok(existsSync('dist/play-basketball/index.html'), 'Play Basketball page should exist');
const play = page('play-basketball');
assert.match(play, /https:\/\/www.playhq.com\/basketball-victoria\/org\/phoenix-united-basketball-development-club-bendigo\/90c7fb8e/);
assert.match(play, /https:\/\/facebook.com\/phoenixunitedbasketball/);
assert.match(play, /mailto:hello@bendigophoenix.org.au/);
assert.match(play, /\/about#slam-dunk/);
assert.doesNotMatch(play, /Winter 2026|Summer 2026|live-data|<iframe|trainingSchedule|\$\d/);
console.log('PASS: evergreen joining guidance and season-independent onward links');

const contact = page('contact');
assert.match(contact, /General Enquiries/);
assert.match(contact, /mailto:hello@bendigophoenix.org.au/);
assert.match(contact, /mailto:president@bendigophoenix.org.au/);
assert.doesNotMatch(contact, /treasurer@|office-bearers|Committee Members|Committee Office/);
const involved = page('get-involved');
assert.match(involved, /Sponsorship/);
assert.match(involved, /Volunteer With Us/);
assert.match(involved, /PHOENIX_SponsorProspectus_20251010.pdf/);
assert.doesNotMatch(involved, /Upcoming Events|Past Events|event-modal|No upcoming events|carousel-upcoming/);
console.log('PASS: general enquiries and evergreen community involvement');

for (const route of ['seasons', 'teams', 'team', 'scores', 'scores/game', 'teams/phoenix-flames']) {
  const html = page(route);
  assert.match(html, /http-equiv="refresh"[^>]*\/play-basketball/, `${route} should redirect without JavaScript`);
  assert.match(html, /href="\/play-basketball"/, `${route} should provide a fallback link`);
  assert.doesNotMatch(html, /live-data|teams-details|Scores are temporarily unavailable/);
}
console.log('PASS: legacy URLs direct visitors to Play Basketball');

for (const route of ['', 'play-basketball', 'get-involved', 'contact', 'about', 'resources', 'court-time-calculator']) {
  const html = page(route);
  assert.doesNotMatch(html, /href="\/(?:seasons|teams|team|scores)(?:[/?#"])/, `${route || 'home'} must not link to retired pages`);
  assert.doesNotMatch(html, /(?:src|href)="[^" ]*live-data|api\.playhq\.com/, `${route || 'home'} must not depend on live scores`);
  assert.match(html, /Skip to content/);
  assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route || 'home'} needs one primary heading`);
}
assert.equal(existsSync('dist/live-data'), false, 'Do not publish obsolete live data');
assert.equal(existsSync('dist/live-snapshot'), false, 'Do not publish obsolete snapshots');
const rewrites = readFileSync('dist/.htaccess', 'utf8');
assert.match(rewrites, /seasons\|teams\|team\|scores/);
assert.match(rewrites, /team\/players/);
assert.match(rewrites, /tab=policies/);
console.log('PASS: shared navigation, accessibility landmarks and data-free static output');
