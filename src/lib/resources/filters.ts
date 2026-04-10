import type { Resource } from './types';

export interface ActiveFilters {
  selectedTags: Set<string>;
}

/**
 * Filter resources using pure OR logic across ALL selected tags.
 * Any resource matching at least one selected tag (ageGroup or category) is shown.
 * When no tags are selected, all resources are shown.
 */
export function filterResources(resources: Resource[], activeFilters: ActiveFilters): Resource[] {
  if (activeFilters.selectedTags.size === 0) {
    return resources;
  }
  return resources.filter(resource =>
    activeFilters.selectedTags.has(resource.ageGroup) ||
    activeFilters.selectedTags.has(resource.category)
  );
}

export function getAvailableAgeGroups(): string[] {
  return ['All Ages', 'U8', 'U10', 'U12', 'U14', 'U16+'];
}

export function getAvailableCategories(audience: 'coaching' | 'players' | 'managers'): string[] {
  if (audience === 'coaching') {
    return ['Defence', 'Offence', 'Drills', 'Fundamentals', 'Game Plans', 'Tools'];
  }
  if (audience === 'managers') {
    return ['Policies', 'Administration', 'Finance', 'Compliance', 'Communication', 'Events'];
  }
  return ['Nutrition', 'Mental Skills', 'Drills', 'Rules', 'Development'];
}

export function logFilterEvent(params: {
  action: 'add' | 'remove' | 'clear';
  tag?: string;
  tab: string;
}): void {
  if (typeof window === 'undefined') return;
  console.log('[Resources Filter]', params);
}
