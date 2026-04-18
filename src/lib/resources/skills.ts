import type { Resource, ResourceSection } from './types';

function matchesFilter(resource: Resource, filters?: { age: string[]; category: string[] }): boolean {
  if (!filters) return true;

  const ageMatch = filters.age.length === 0 || (resource.tags?.age?.some((age) => filters.age.includes(age)) ?? false);
  const categoryMatch = filters.category.length === 0 || (resource.tags?.category?.some((category) => filters.category.includes(category)) ?? false);

  return ageMatch && categoryMatch;
}

export function extractAvailableSkills(
  resources: Resource[],
  section: ResourceSection,
  activeFilters?: { age: string[]; category: string[] },
): string[] {
  const skills = new Set<string>();

  resources
    .filter((resource) => resource.section === section)
    .filter((resource) => matchesFilter(resource, activeFilters))
    .forEach((resource) => {
      resource.tags?.skill?.forEach((skill) => skills.add(skill));
    });

  return [...skills].sort((a, b) => a.localeCompare(b));
}
