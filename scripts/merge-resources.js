#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const COACHING_FILE = path.join(process.cwd(), 'src/data/coaching-resources.json');
const PLAYERS_FILE = path.join(process.cwd(), 'src/data/player-resources.json');

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

export function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

export function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'source';
}

export function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function filterApproved(candidates) {
  return candidates.filter((candidate) => candidate.status === 'approved');
}

function getNextId({ existingIds, audience, sourceDomain }) {
  const prefix = `${audience}-${slugify(sourceDomain)}-`;
  let max = 0;

  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const tail = Number(id.slice(prefix.length));
    if (!Number.isNaN(tail)) max = Math.max(max, tail);
  }

  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function transformCandidate({ candidate, audience, existingIds, dateAdded }) {
  return {
    id: getNextId({ existingIds, audience, sourceDomain: candidate.sourceDomain }),
    title: candidate.title,
    description: candidate.description || candidate.title,
    audience,
    category: candidate.inferredCategory,
    ageGroup: candidate.inferredAgeGroup || 'All Ages',
    type: candidate.inferredType,
    url: candidate.sourceUrl,
    sourceDomain: candidate.sourceDomain,
    dateAdded,
  };
}

function normaliseCandidates(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.candidates)) return payload.candidates;
  return [];
}

export function mergeEntries({ candidates, existingCoaching, existingPlayers, today }) {
  const approved = filterApproved(candidates);
  const coaching = [...existingCoaching];
  const players = [...existingPlayers];

  const existingByAudience = {
    coaching: new Set(coaching.map((r) => r.url)),
    players: new Set(players.map((r) => r.url)),
  };

  const idByAudience = {
    coaching: new Set(coaching.map((r) => r.id)),
    players: new Set(players.map((r) => r.id)),
  };

  const stats = {
    addedCoaching: 0,
    addedPlayers: 0,
    skippedDuplicate: 0,
    skippedUncategorised: 0,
    skippedInvalidAudience: 0,
  };

  for (const candidate of approved) {
    const audience = candidate.inferredAudience;
    if (audience !== 'coaching' && audience !== 'players') {
      console.warn(`[merge-resources] Skipping invalid audience: ${candidate.title} (${candidate.sourceUrl})`);
      stats.skippedInvalidAudience += 1;
      continue;
    }

    if (candidate.inferredCategory === 'uncategorised') {
      console.warn(`[merge-resources] Skipping uncategorised: ${candidate.title} (${candidate.sourceUrl})`);
      stats.skippedUncategorised += 1;
      continue;
    }

    if (existingByAudience[audience].has(candidate.sourceUrl)) {
      console.log(`[merge-resources] Skipping duplicate URL: ${candidate.title} (${candidate.sourceUrl})`);
      stats.skippedDuplicate += 1;
      continue;
    }

    const entry = transformCandidate({
      candidate,
      audience,
      existingIds: [...idByAudience[audience]],
      dateAdded: today,
    });

    if (audience === 'coaching') {
      coaching.push(entry);
      stats.addedCoaching += 1;
    } else {
      players.push(entry);
      stats.addedPlayers += 1;
    }

    existingByAudience[audience].add(candidate.sourceUrl);
    idByAudience[audience].add(entry.id);
  }

  return { coaching, players, stats };
}

export function runMerge(candidateFilePath) {
  if (!candidateFilePath) {
    throw new Error('Usage: node scripts/merge-resources.js <path-to-candidate-file.json>');
  }

  const resolvedCandidatePath = path.resolve(process.cwd(), candidateFilePath);
  if (!fs.existsSync(resolvedCandidatePath)) {
    throw new Error(`Candidate file not found: ${resolvedCandidatePath}`);
  }

  const payload = readJson(resolvedCandidatePath);
  const candidates = normaliseCandidates(payload);
  const today = new Date().toISOString().slice(0, 10);

  const existingCoaching = readJson(COACHING_FILE);
  const existingPlayers = readJson(PLAYERS_FILE);

  const result = mergeEntries({
    candidates,
    existingCoaching,
    existingPlayers,
    today,
  });

  writeJson(COACHING_FILE, result.coaching);
  writeJson(PLAYERS_FILE, result.players);

  console.log(`Added ${result.stats.addedCoaching} entries to coaching-resources.json.`);
  console.log(`Added ${result.stats.addedPlayers} entries to player-resources.json.`);
  console.log(`Skipped ${result.stats.skippedDuplicate} (duplicate).`);
  console.log(`Skipped ${result.stats.skippedUncategorised} (uncategorised).`);
  console.log(`Skipped ${result.stats.skippedInvalidAudience} (invalid audience).`);

  return result;
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectRun) {
  try {
    runMerge(process.argv[2]);
  } catch (error) {
    console.error(`[merge-resources] ${error.message}`);
    process.exit(1);
  }
}
