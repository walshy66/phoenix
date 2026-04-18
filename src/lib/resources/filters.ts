import type { ActiveFilters, Resource, ResourceSection } from './types';

export const COACHING_AGES = ['U8', 'U10', 'U12', 'U14', 'U16+'] as const;
export const PLAYER_AGES = ['U8', 'U10', 'U12', 'U14', 'U16+'] as const;

export const COACHING_CATEGORIES = ['Defence', 'Drills', 'Offence', 'Plays', 'Tools'] as const;
export const PLAYER_CATEGORIES = ['Solo', 'Group', 'Offence', 'Defence', 'Drill'] as const;

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function matchesAny(values: string[] | undefined, selected: string[]): boolean {
  if (selected.length === 0) return true;
  if (!values || values.length === 0) return false;
  return values.some((value) => selected.includes(value));
}

export function filterByAge(resources: Resource[], ageValues: string[]): Resource[] {
  if (ageValues.length === 0) return resources;
  return resources.filter((resource) => matchesAny(resource.tags?.age, ageValues));
}

export function filterByCategory(resources: Resource[], categoryValues: string[]): Resource[] {
  if (categoryValues.length === 0) return resources;
  return resources.filter((resource) => matchesAny(resource.tags?.category, categoryValues));
}

export function filterBySkill(resources: Resource[], skillValues: string[]): Resource[] {
  if (skillValues.length === 0) return resources;
  return resources.filter((resource) => matchesAny(resource.tags?.skill, skillValues));
}

export function searchByKeyword(resources: Resource[], keyword: string): Resource[] {
  const trimmed = keyword.trim();
  if (!trimmed) return resources;

  const lowerKeyword = trimmed.toLowerCase();
  return resources.filter((resource) => {
    const title = resource.title.toLowerCase();
    const description = resource.description?.toLowerCase() ?? '';
    return title.includes(lowerKeyword) || description.includes(lowerKeyword);
  });
}

function sortResources(resources: Resource[]): Resource[] {
  return [...resources].sort((a, b) => a.title.localeCompare(b.title));
}

export function filterResources(
  resources: Resource[],
  activeFilters: ActiveFilters,
  searchKeyword: string,
  section: ResourceSection,
): Resource[] {
  let results = resources.filter((resource) => resource.section === section);

  results = filterByAge(results, activeFilters.age);
  results = filterByCategory(results, activeFilters.category);
  results = filterBySkill(results, activeFilters.skill);
  results = searchByKeyword(results, searchKeyword);

  return sortResources(results, section);
}

export function getAvailableAgeGroups(section: 'coaching_resources' | 'player_resources'): string[] {
  return section === 'coaching_resources' ? [...COACHING_AGES] : [...PLAYER_AGES];
}

export function getAvailableCategories(section: 'coaching_resources' | 'player_resources' | 'manager' | 'guides' | 'forms'): string[] {
  if (section === 'coaching_resources') {
    return [...COACHING_CATEGORIES];
  }
  if (section === 'player_resources') {
    return [...PLAYER_CATEGORIES];
  }
  return [];
}

export function getFilterSummary(activeFilters: ActiveFilters): string[] {
  const parts: string[] = [];
  if (activeFilters.age.length > 0) parts.push(`Age=${activeFilters.age.join(', ')}`);
  if (activeFilters.category.length > 0) parts.push(`Category=${activeFilters.category.join(', ')}`);
  if (activeFilters.skill.length > 0) parts.push(`Skill=${activeFilters.skill.join(', ')}`);
  return parts;
}

export function getSectionLabel(section: ResourceSection): string {
  if (section === 'coaching_resources') return 'Coaching Resources';
  if (section === 'player_resources') return 'Player Resources';
  if (section === 'manager') return 'Manager Resources';
  if (section === 'guides') return 'Guides';
  return 'Forms';
}

export function isInteractiveSection(section: ResourceSection): boolean {
  return section === 'coaching_resources' || section === 'player_resources';
}
