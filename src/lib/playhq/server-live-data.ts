import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ValidationResult } from './contracts';

export const LIVE_DATA_BASE_PATH = resolve(process.cwd(), 'public', 'live-data');

export function loadLiveJsonSnapshot<T>(
  filePath: string,
  fallback: T,
  validator: (value: unknown) => ValidationResult,
): T {
  try {
    if (!existsSync(filePath)) return fallback;

    const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
    const validation = validator(parsed);

    if (!validation.ok) return fallback;

    return parsed as T;
  } catch {
    return fallback;
  }
}

export function loadLiveJsonFromPublic<T>(
  fileName: string,
  fallback: T,
  validator: (value: unknown) => ValidationResult,
): T {
  return loadLiveJsonSnapshot(resolve(LIVE_DATA_BASE_PATH, fileName), fallback, validator);
}
