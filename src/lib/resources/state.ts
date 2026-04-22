import type { ActiveFilters, ResourceSection } from './types';

export interface PanelState {
  isOpen: boolean;
}

type FilterKey = keyof ActiveFilters;

type StoredState = {
  filters: ActiveFilters;
  panel: PanelState;
};

const DEFAULT_FILTERS: ActiveFilters = {
  age: [],
  category: [],
  skill: [],
};

const DEFAULT_PANEL: PanelState = {
  isOpen: false,
};

const memoryStore = new Map<string, string>();

function cloneFilters(filters: ActiveFilters): ActiveFilters {
  return {
    age: [...filters.age],
    category: [...filters.category],
    skill: [...filters.skill],
  };
}

function clonePanel(panel: PanelState): PanelState {
  return { isOpen: panel.isOpen };
}

function getStorage(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

function readRaw(key: string): string | null {
  const storage = getStorage();
  if (storage) {
    try {
      const value = storage.getItem(key);
      if (value !== null) return value;
    } catch {
      // Fall through to in-memory fallback.
    }
  }

  return memoryStore.get(key) ?? null;
}

function writeRaw(key: string, value: string): void {
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch {
      // Fall through to in-memory fallback.
    }
  }

  memoryStore.set(key, value);
}

function readJSON<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizeFilters(value: unknown): ActiveFilters {
  const candidate = value as Partial<ActiveFilters> | null | undefined;
  const filters = cloneFilters(DEFAULT_FILTERS);

  (['age', 'category', 'skill'] as FilterKey[]).forEach((key) => {
    const entries = candidate?.[key];
    if (Array.isArray(entries)) {
      filters[key] = entries.filter((entry): entry is string => typeof entry === 'string');
    }
  });

  return filters;
}

function normalizePanel(value: unknown): PanelState {
  const candidate = value as Partial<PanelState> | null | undefined;
  return {
    isOpen: Boolean(candidate?.isOpen),
  };
}

function getStoredState(section: ResourceSection): StoredState {
  const filters = normalizeFilters(readJSON(`filters:${section}`, DEFAULT_FILTERS));
  const panel = normalizePanel(readJSON(`panel:${section}`, DEFAULT_PANEL));
  return {
    filters,
    panel,
  };
}

function setStoredFilters(section: ResourceSection, filters: ActiveFilters): void {
  writeRaw(`filters:${section}`, JSON.stringify(filters));
}

function setStoredPanel(section: ResourceSection, panel: PanelState): void {
  writeRaw(`panel:${section}`, JSON.stringify(panel));
}

export function getActiveFilters(section: ResourceSection): ActiveFilters {
  return cloneFilters(getStoredState(section).filters);
}

export function setActiveFilter(
  section: ResourceSection,
  type: FilterKey,
  value: string,
  active: boolean,
): void {
  const filters = getActiveFilters(section);
  const current = new Set(filters[type]);

  if (active) {
    current.add(value);
  } else {
    current.delete(value);
  }

  filters[type] = [...current];
  setStoredFilters(section, filters);
}

export function clearFilters(section: ResourceSection): void {
  setStoredFilters(section, cloneFilters(DEFAULT_FILTERS));
}

export function getPanelState(section: ResourceSection): PanelState {
  return clonePanel(getStoredState(section).panel);
}

export function setPanelState(section: ResourceSection, isOpen: boolean): void {
  setStoredPanel(section, { isOpen });
}

export function getFilterCount(section: ResourceSection): number {
  const filters = getActiveFilters(section);
  return filters.age.length + filters.category.length + filters.skill.length;
}

export function __resetResourceState(): void {
  memoryStore.clear();
}
