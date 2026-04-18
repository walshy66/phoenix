(() => {
  const dataEl = document.getElementById('resources-page-data');
  if (!dataEl) return;

  let data;
  try {
    data = JSON.parse(dataEl.textContent || '{}');
  } catch (error) {
    console.error('[Resources Page] Failed to parse resource data', error);
    return;
  }

  const sectionResources = data.sectionResources || {};
  const sectionOrder = ['coaching_resources', 'player_resources', 'manager', 'guides', 'forms'];
  const interactiveSections = new Set(['coaching_resources', 'player_resources']);
  const submitResource = document.querySelector('[data-submit-resource]');
  const state = {
    coaching_resources: { filters: { age: [], category: [], skill: [] }, search: '' },
    player_resources: { filters: { age: [], category: [], skill: [] }, search: '' },
  };

  let activeSection = 'coaching_resources';

  const tabButtons = {
    coaching_resources: document.getElementById('tab-coaching'),
    player_resources: document.getElementById('tab-players'),
    manager: document.getElementById('tab-managers'),
    guides: document.getElementById('tab-guides'),
    forms: document.getElementById('tab-forms'),
  };

  const panelSelectors = {
    coaching_resources: document.getElementById('panel-coaching'),
    player_resources: document.getElementById('panel-players'),
    manager: document.getElementById('panel-managers'),
    guides: document.getElementById('panel-guides'),
    forms: document.getElementById('panel-forms'),
  };

  function getFilterBar(section) {
    return document.querySelector(`[data-filter-bar][data-section="${section}"]`);
  }

  function getGrid(section) {
    return document.getElementById(section === 'coaching_resources' ? 'coaching-grid' : section === 'player_resources' ? 'players-grid' : `${section}-grid`);
  }

  function getNoResults(section) {
    return document.getElementById(section === 'coaching_resources' ? 'coaching-no-results' : 'players-no-results');
  }

  function getResources(section) {
    return sectionResources[section] || [];
  }

  function matchesAny(values, selected) {
    if (!selected.length) return true;
    if (!Array.isArray(values) || !values.length) return false;
    return values.some((value) => selected.includes(value));
  }

  function filterResources(resources, filters, searchKeyword, section) {
    let results = resources.filter((resource) => resource.section === section);

    results = results.filter((resource) => matchesAny(resource.tags?.age, filters.age));
    results = results.filter((resource) => matchesAny(resource.tags?.category, filters.category));
    results = results.filter((resource) => matchesAny(resource.tags?.skill, filters.skill));

    const keyword = searchKeyword.trim().toLowerCase();
    if (keyword) {
      results = results.filter((resource) => {
        const title = (resource.title || '').toLowerCase();
        const description = (resource.description || '').toLowerCase();
        return title.includes(keyword) || description.includes(keyword);
      });
    }

    results = [...results].sort((a, b) => a.title.localeCompare(b.title));

    return results;
  }

  function getFilterSummary(filters) {
    const parts = [];
    if (filters.age.length) parts.push(`Age=${filters.age.join(', ')}`);
    if (filters.category.length) parts.push(`Category=${filters.category.join(', ')}`);
    if (filters.skill.length) parts.push(`Skill=${filters.skill.join(', ')}`);
    return parts;
  }

  function extractAvailableSkills(resources, section, activeFilters) {
    const skills = new Set();
    resources
      .filter((resource) => resource.section === section)
      .filter((resource) => {
        const ageMatch = !activeFilters || !activeFilters.age.length || matchesAny(resource.tags?.age, activeFilters.age);
        const categoryMatch = !activeFilters || !activeFilters.category.length || matchesAny(resource.tags?.category, activeFilters.category);
        return ageMatch && categoryMatch;
      })
      .forEach((resource) => {
        (resource.tags?.skill || []).forEach((skill) => skills.add(skill));
      });

    return [...skills].sort((a, b) => a.localeCompare(b));
  }

  function syncTabButtons(section) {
    sectionOrder.forEach((name) => {
      const button = tabButtons[name];
      const panel = panelSelectors[name];
      const active = name === section;
      if (button) {
        button.setAttribute('aria-selected', String(active));
        button.classList.toggle('border-brand-purple', active);
        button.classList.toggle('text-brand-purple', active);
        button.classList.toggle('border-transparent', !active);
        button.classList.toggle('text-gray-500', !active);
      }
      if (panel) panel.classList.toggle('hidden', !active);
    });
  }

  function syncFilterButtonState(section) {
    const bar = getFilterBar(section);
    if (!bar) return;

    const filters = state[section].filters;
    bar.querySelectorAll('button[data-filter-type]').forEach((button) => {
      const type = button.dataset.filterType;
      const value = button.dataset.filterValue;
      const active = Boolean(type && value && filters[type]?.includes(value));
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('is-active', active);
      button.classList.toggle('border-brand-purple', active);
      button.classList.toggle('bg-brand-purple', active);
      button.classList.toggle('bg-white', !active);
      button.classList.toggle('text-white', active);
      button.classList.toggle('border-gray-200', !active);
      button.classList.toggle('text-gray-700', !active);
      button.classList.toggle('hover:border-brand-purple', !active);
      button.classList.toggle('hover:text-brand-purple', !active);
    });
  }

  function renderSkillButtons(section) {
    const bar = getFilterBar(section);
    if (!bar) return;

    const group = bar.querySelector('[data-filter-group="skill"]');
    if (!group) return;

    const filters = state[section].filters;
    const availableSkills = extractAvailableSkills(getResources(section), section, {
      age: filters.age,
      category: filters.category,
    });

    const selectedSkills = filters.skill.filter((skill) => availableSkills.includes(skill));
    if (selectedSkills.length !== filters.skill.length) {
      filters.skill = selectedSkills;
    }

    group.innerHTML = availableSkills.length > 0
      ? availableSkills.map((skill) => {
          const active = filters.skill.includes(skill);
          return `
            <button type="button" class="min-h-[44px] rounded-full border px-3 py-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 ${active
              ? 'is-active border-brand-purple bg-brand-purple text-white'
              : 'border-gray-200 bg-white text-gray-700 hover:border-brand-purple hover:text-brand-purple'}" data-filter-type="skill" data-filter-value="${skill}" aria-pressed="${active ? 'true' : 'false'}">${skill}</button>
          `;
        }).join('')
      : '<p class="py-3 text-sm text-gray-500">No skills available yet.</p>';

    syncFilterButtonState(section);
  }

  function currentResults(section) {
    if (!interactiveSections.has(section)) {
      return filterResources(getResources(section), { age: [], category: [], skill: [] }, '', section);
    }
    const { filters, search } = state[section];
    return filterResources(getResources(section), filters, search, section);
  }

  function updateFilterBar(section) {
    const bar = getFilterBar(section);
    if (!bar) return;

    const searchInput = bar.querySelector('[data-search-input]');
    if (searchInput && searchInput.value !== state[section].search) {
      searchInput.value = state[section].search;
    }

    syncFilterButtonState(section);
    renderSkillButtons(section);

    const resultCountEl = bar.querySelector('[data-result-count]');
    const liveRegion = bar.querySelector('[data-live-region]');
    const count = currentResults(section).length;
    if (resultCountEl) resultCountEl.textContent = `${count} resource${count === 1 ? '' : 's'} found`;
    if (liveRegion) liveRegion.textContent = `${count} resource${count === 1 ? '' : 's'} found`;
  }

  function updateResults(section) {
    const resources = currentResults(section);
    const grid = getGrid(section);
    const noResults = getNoResults(section);
    if (!grid) return;

    const visibleIds = new Set(resources.map((resource) => resource.id));
    grid.querySelectorAll('[data-resource-item]').forEach((card) => {
      const id = card.dataset.resourceId;
      card.classList.toggle('hidden', !visibleIds.has(id));
    });

    if (noResults) {
      const shouldShow = interactiveSections.has(section) && resources.length === 0;
      noResults.classList.toggle('hidden', !shouldShow);
      if (shouldShow) {
        const summary = noResults.querySelector('[data-no-results-summary]');
        const parts = getFilterSummary(state[section].filters);
        const search = state[section].search.trim();
        const detail = parts.length || search
          ? `No resources match ${[...parts, search ? `"${search}"` : null].filter(Boolean).join(' and ')}`
          : 'No resources found';
        const headline = noResults.querySelector('[data-no-results-text]');
        if (headline) headline.textContent = 'No results found';
        if (summary) summary.textContent = detail;
      }
    }

    updateFilterBar(section);
  }

  function setActiveSection(section) {
    activeSection = section;
    syncTabButtons(section);
    updateResults(section);
    if (submitResource) {
      submitResource.classList.toggle('hidden', !interactiveSections.has(section));
    }
  }

  function toggleFilter(section, type, value) {
    const filters = state[section].filters;
    const current = filters[type] || [];
    filters[type] = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
    updateResults(section);
  }

  function clearAll(section) {
    state[section].filters = { age: [], category: [], skill: [] };
    state[section].search = '';
    updateResults(section);
  }

  function applySearch(section, value) {
    state[section].search = (value || '').trim();
    updateResults(section);
  }

  function setupFilterBar(section) {
    const bar = getFilterBar(section);
    if (!bar) return;

    bar.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.closest('[data-clear-filters]')) {
        event.preventDefault();
        clearAll(section);
        return;
      }

      const button = target.closest('button[data-filter-type]');
      if (!button) return;
      const type = button.dataset.filterType;
      const value = button.dataset.filterValue;
      if (!type || !value) return;
      toggleFilter(section, type, value);
    });

    bar.addEventListener('keydown', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.matches('button[data-filter-type]') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        target.click();
      }

      if (target.matches('[data-search-input]') && event.key === 'Enter') {
        event.preventDefault();
        applySearch(section, target.value);
      }
    });

    const searchInput = bar.querySelector('[data-search-input]');
    if (searchInput) {
      let debounceTimer = null;
      const scheduleSearch = (value) => {
        if (debounceTimer) window.clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => applySearch(section, value), 300);
      };

      searchInput.addEventListener('input', (event) => {
        scheduleSearch(event.target.value);
      });

      searchInput.addEventListener('blur', (event) => {
        applySearch(section, event.target.value);
      });
    }
  }

  sectionOrder.forEach((section) => {
    if (interactiveSections.has(section)) setupFilterBar(section);
  });
  sectionOrder.forEach((section) => updateResults(section));
  setActiveSection(activeSection);

  Object.entries({
    'tab-coaching': 'coaching_resources',
    'tab-players': 'player_resources',
    'tab-managers': 'manager',
    'tab-guides': 'guides',
    'tab-forms': 'forms',
  }).forEach(([id, section]) => {
    document.getElementById(id)?.addEventListener('click', () => setActiveSection(section));
  });

})();
