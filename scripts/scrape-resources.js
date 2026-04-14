#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const SOURCES = [
  {
    name: 'Basketball Victoria',
    urls: [
      'https://www.basketballvictoria.com.au/coaches',
      'https://www.basketballvictoria.com.au/resources',
    ],
  },
  {
    name: 'Basketball Australia',
    urls: [
      'https://www.australia.basketball/',
      'https://www.australia.basketball/coaches',
    ],
  },
  {
    name: 'NBL',
    urls: [
      'https://nbl.com.au/',
      'https://nbl.com.au/news',
    ],
  },
  {
    name: 'WNBL',
    urls: [
      'https://wnbl.basketball/',
      'https://wnbl.basketball/news/',
    ],
  },
  {
    name: 'NBA',
    urls: [
      'https://jr.nba.com/',
      'https://jr.nba.com/category/coaches/',
    ],
  },
  {
    name: 'WNBA',
    urls: [
      'https://wnba.com/',
      'https://wnba.com/news/',
    ],
  },
];

const EXCLUDE_PATHS = [/\/tickets/i, /\/merch/i, /\/shop/i, /\/press/i, /\/contracts/i];
const FOCUS_TERMS = /(skill|drill|fundamental|defence|defense|zone|man-to-man|offence|offense|flow|coach)/i;

function normaliseUrl(url, base) {
  try {
    return new URL(url, base).toString();
  } catch {
    return null;
  }
}

function inferType(url) {
  if (/\.pdf($|\?)/i.test(url)) return 'pdf';
  if (/(youtube\.com|youtu\.be|vimeo\.com)/i.test(url)) return 'video';
  return 'link';
}

function inferCategory(text) {
  const lower = text.toLowerCase();
  if (/(man-to-man|zone|defence|defense)/.test(lower)) return 'Defence';
  if (/(offence|offense|flow|attack|transition)/.test(lower)) return 'Offence';
  if (/(drill|practice)/.test(lower)) return 'Drills';
  if (/(fundamental|footwork|passing|shooting|ball handling)/.test(lower)) return 'Fundamentals';
  return 'uncategorised';
}

function inferAudience(text) {
  const lower = text.toLowerCase();
  if (/(coach|coaching|training plan|session)/.test(lower)) return 'coaching';
  if (/(player|athlete|junior)/.test(lower)) return 'players';
  return 'coaching';
}

function extractLinks(html) {
  const links = [];
  const regex = /<a\s[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gims;
  let match;

  while ((match = regex.exec(html))) {
    const href = match[1]?.trim();
    const text = match[2]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!href) continue;
    links.push({ href, text: text || 'Untitled resource' });
  }

  return links;
}

function shouldSkip(url, text) {
  if (!url.startsWith('http')) return true;
  if (EXCLUDE_PATHS.some((pattern) => pattern.test(url))) return true;
  if (!FOCUS_TERMS.test(`${url} ${text}`) && inferType(url) === 'link') return true;
  return false;
}

async function checkReachable(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.ok;
  } catch {
    return false;
  }
}

async function scrapeSource(source) {
  const candidates = [];
  const seen = new Set();

  for (const pageUrl of source.urls) {
    try {
      const res = await fetch(pageUrl, { redirect: 'follow' });
      if (!res.ok) continue;
      const html = await res.text();
      const links = extractLinks(html);

      for (const link of links) {
        const absolute = normaliseUrl(link.href, pageUrl);
        if (!absolute || seen.has(absolute)) continue;
        if (shouldSkip(absolute, link.text)) continue;

        seen.add(absolute);

        const title = link.text.length > 3 ? link.text : `Resource from ${source.name}`;
        const combinedText = `${title} ${absolute}`;

        candidates.push({
          title,
          sourceUrl: absolute,
          sourceDomain: source.name,
          inferredType: inferType(absolute),
          inferredCategory: inferCategory(combinedText),
          inferredAgeGroup: 'All Ages',
          inferredAudience: inferAudience(combinedText),
          reachable: await checkReachable(absolute),
          status: 'pending',
        });
      }
    } catch {
      // Continue with the next URL/source; zero-result source handled in summary
    }
  }

  return candidates;
}

async function main() {
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(process.cwd(), 'specs/coa-27-resources/candidates');
  const outFile = path.join(outDir, `candidates-${date}.json`);

  fs.mkdirSync(outDir, { recursive: true });

  const allCandidates = [];
  const zeroResultSources = [];

  for (const source of SOURCES) {
    console.log(`[scrape-resources] Scraping ${source.name}...`);
    const sourceCandidates = await scrapeSource(source);
    if (sourceCandidates.length === 0) {
      zeroResultSources.push(source.name);
    }
    allCandidates.push(...sourceCandidates);
  }

  const reachable = allCandidates.filter((c) => c.reachable).length;
  const unreachable = allCandidates.length - reachable;
  const uniqueSources = [...new Set(allCandidates.map((c) => c.sourceDomain))];

  const payload = {
    scrapeDate: date,
    sources: SOURCES.map((s) => s.name),
    zeroResultSources,
    summary: {
      total: allCandidates.length,
      reachable,
      unreachable,
      sourceCountWithResults: uniqueSources.length,
    },
    candidates: allCandidates,
  };

  fs.writeFileSync(outFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  console.log(`[scrape-resources] Wrote ${allCandidates.length} candidates to ${outFile}`);
  if (zeroResultSources.length) {
    console.log(`[scrape-resources] Zero results: ${zeroResultSources.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(`[scrape-resources] ${error.message}`);
  process.exit(1);
});
