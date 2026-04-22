import { afterEach, describe, expect, it, vi } from 'vitest';

function createSessionStorageMock(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));

  return {
    getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    __store: store,
  };
}

async function loadState() {
  vi.resetModules();
  return import('../state');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resource filter state', () => {
  it('returns empty filters and a closed panel on first load', async () => {
    const sessionStorage = createSessionStorageMock();
    vi.stubGlobal('sessionStorage', sessionStorage);

    const state = await loadState();

    expect(state.getActiveFilters('coaching_resources')).toEqual({ age: [], category: [], skill: [] });
    expect(state.getPanelState('coaching_resources')).toEqual({ isOpen: false });
    expect(state.getFilterCount('coaching_resources')).toBe(0);
  });

  it('adds and removes filters while persisting to sessionStorage', async () => {
    const sessionStorage = createSessionStorageMock();
    vi.stubGlobal('sessionStorage', sessionStorage);

    const state = await loadState();

    state.setActiveFilter('coaching_resources', 'age', 'U12', true);
    state.setActiveFilter('coaching_resources', 'category', 'Defence', true);
    state.setActiveFilter('coaching_resources', 'skill', 'Footwork', true);

    expect(state.getActiveFilters('coaching_resources')).toEqual({
      age: ['U12'],
      category: ['Defence'],
      skill: ['Footwork'],
    });
    expect(state.getFilterCount('coaching_resources')).toBe(3);
    expect(sessionStorage.setItem).toHaveBeenCalledWith(
      'filters:coaching_resources',
      JSON.stringify({ age: ['U12'], category: ['Defence'], skill: ['Footwork'] }),
    );

    state.setActiveFilter('coaching_resources', 'age', 'U12', false);
    expect(state.getActiveFilters('coaching_resources').age).toEqual([]);
    expect(state.getFilterCount('coaching_resources')).toBe(2);
  });

  it('clears filters without affecting panel state', async () => {
    const sessionStorage = createSessionStorageMock();
    vi.stubGlobal('sessionStorage', sessionStorage);

    const state = await loadState();

    state.setActiveFilter('player_resources', 'age', 'U10', true);
    state.setActiveFilter('player_resources', 'category', 'Solo', true);
    state.setPanelState('player_resources', true);

    state.clearFilters('player_resources');

    expect(state.getActiveFilters('player_resources')).toEqual({ age: [], category: [], skill: [] });
    expect(state.getPanelState('player_resources')).toEqual({ isOpen: true });
    expect(state.getFilterCount('player_resources')).toBe(0);
  });

  it('restores state from sessionStorage after a reload simulation', async () => {
    const sessionStorage = createSessionStorageMock({
      'filters:coaching_resources': JSON.stringify({ age: ['U14'], category: ['Tools'], skill: [] }),
      'panel:coaching_resources': JSON.stringify({ isOpen: true }),
    });
    vi.stubGlobal('sessionStorage', sessionStorage);

    const state = await loadState();

    expect(state.getActiveFilters('coaching_resources')).toEqual({
      age: ['U14'],
      category: ['Tools'],
      skill: [],
    });
    expect(state.getPanelState('coaching_resources')).toEqual({ isOpen: true });
    expect(state.getFilterCount('coaching_resources')).toBe(2);
  });

  it('falls back to in-memory state when sessionStorage is unavailable', async () => {
    const failingStorage = {
      getItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      setItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      removeItem: vi.fn(() => {
        throw new Error('blocked');
      }),
      clear: vi.fn(() => {
        throw new Error('blocked');
      }),
    };

    vi.stubGlobal('sessionStorage', failingStorage);

    const state = await loadState();

    state.setActiveFilter('coaching_resources', 'skill', 'Spacing', true);
    state.setPanelState('coaching_resources', true);

    expect(state.getActiveFilters('coaching_resources')).toEqual({ age: [], category: [], skill: ['Spacing'] });
    expect(state.getPanelState('coaching_resources')).toEqual({ isOpen: true });
    expect(state.getFilterCount('coaching_resources')).toBe(1);
  });
});
