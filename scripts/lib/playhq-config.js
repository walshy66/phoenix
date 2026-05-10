import fs from 'node:fs';
import path from 'node:path';

export function readLocalEnvVar(key, cwd = process.cwd()) {
  const envPath = path.join(cwd, '.env.local');
  if (!fs.existsSync(envPath)) return undefined;

  const raw = fs.readFileSync(envPath, 'utf-8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const k = trimmed.slice(0, idx).trim();
    const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (k === key) return v;
  }

  return undefined;
}

function valueFrom(env, readEnv, key) {
  return env[key] || readEnv(key);
}

function parseList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

const REQUIRED_ENV_BY_KEY = {
  apiKey: 'PLAYHQ_API_KEY',
  tenant: 'PLAYHQ_TENANT',
  clubName: 'PLAYHQ_CLUB_NAME',
  seasonIds: 'PLAYHQ_SEASON_IDS',
};

export function getPlayHQConfig(options = {}) {
  const env = options.env ?? process.env;
  const readEnv = options.readLocalEnvVar ?? ((key) => readLocalEnvVar(key, options.cwd));

  const config = {
    apiBase: valueFrom(env, readEnv, 'PLAYHQ_API_BASE') || 'https://api.playhq.com',
    apiKey: valueFrom(env, readEnv, 'PLAYHQ_API_KEY') || '',
    tenant: valueFrom(env, readEnv, 'PLAYHQ_TENANT') || '',
    clubName: valueFrom(env, readEnv, 'PLAYHQ_CLUB_NAME') || '',
    clubMatch: valueFrom(env, readEnv, 'PLAYHQ_CLUB_MATCH') || valueFrom(env, readEnv, 'PLAYHQ_CLUB_NAME') || '',
    seasonIds: parseList(valueFrom(env, readEnv, 'PLAYHQ_SEASON_IDS')),
  };

  const required = options.required ?? [];
  const missing = required
    .filter((key) => {
      const value = config[key];
      return Array.isArray(value) ? value.length === 0 : !value;
    })
    .map((key) => REQUIRED_ENV_BY_KEY[key] || key);

  if (missing.length) {
    throw new Error(`Missing required PlayHQ configuration: ${missing.join(', ')}`);
  }

  return config;
}

export function buildPlayHQHeaders(config) {
  return {
    Accept: 'application/json',
    'x-api-key': config.apiKey,
    'x-phq-tenant': config.tenant,
  };
}
