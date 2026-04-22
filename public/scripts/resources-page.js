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
  const memoryStore = new Map();
  const state = {
    coaching_resources: {
      filters: { age: [], category: [], skill: [] },
      search: '',
      panel: { isOpen: false },
    },
    player_resources: {
      filters: { age: [], category: [], skill: [] },
      search: '',
      panel: { isOpen: false },
    },
  };

  let activeSection = 'coaching_resources';
  const searchTimers = new Map();
  const panelOpenClasses = ['max-h-[50vh]', 'overflow-y-auto', 'opacity-100', 'pointer-events-auto', 'translate-y-0'];
  const panelClosedClasses = ['max-h-0', 'overflow-hidden', 'opacity-0', 'pointer-events-none', '-translate-y-2'];
  const panelVisibleClasses = ['md:flex', 'md:max-h-none', 'md:flex-col', 'md:gap-3', 'md:overflow-visible', 'md:opacity-100', 'md:pointer-events-auto', 'md:translate-y-0'];

  function getStorage() {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }

  function readValue(key, fallback = null) {
    const storage = getStorage();
    if (storage) {
      try {
        const value = storage.getItem(key);
        if (value !== null) return value;
      } catch {
        // Fall through to memory store.
      }
    }

    return memoryStore.has(key) ? memoryStore.get(key) : fallback;
  }

  function writeValue(key, value) {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(key, value);
        return;
      } catch {
        // Fall through to memory store.
      }
    }

    memoryStore.set(key, value);
  }

  function readJSON(key, fallback) {
    const raw = readValue(key, null);
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function cloneFilters(filters) {
    return {
      age: [...(filters?.age || [])],
      category: [...(filters?.category || [])],
      skill: [...(filters?.skill || [])],
    };
  }

  function loadSectionState(section) {
    const storedFilters = readJSON(`filters:${section}`, { age: [], category: [], skill: [] });
    const storedPanel = readJSON(`panel:${section}`, { isOpen: false });
    const storedSearch = readValue(`search:${section}`, '') || '';

    state[section] = {
      filters: cloneFilters(storedFilters),
      search: storedSearch,
      panel: { isOpen: Boolean(storedPanel?.isOpen) },
    };
  }

  function saveFilters(section) {
    writeValue(`filters:${section}`, JSON.stringify(state[section].filters));
  }

  function savePanel(section) {
    writeValue(`panel:${section}`, JSON.stringify(state[section].panel));
  }

  function saveSearch(section) {
    writeValue(`search:${section}`, state[section].search);
  }

  function errorDetails(error) {
    if (!error || typeof error !== 'object') {
      return { name: 'Error', message: String(error), stack: '' };
    }

    const err = error;
    return {
      name: err.name || 'Error',
      message: err.message || String(error),
      stack: err.stack || '',
    };
  }

  function logError(scope, error) {
    console.error('[Resources Page]', scope, errorDetails(error));
  }

  function setErrorMessage(section, message) {
    const bar = getFilterBar(section);
    if (!bar) return;

    const errorEl = bar.querySelector('[data-filter-error]');
    if (!(errorEl instanceof HTMLElement)) return;

    if (!message) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
      return;
    }

    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }

  function getFilterBar(section) {
    return document.querySelector(`[data-filter-bar][data-section="${section}"]`);
  }

  function getToggle(section) {
    return document.querySelector(`[data-mobile-filter-toggle][aria-controls="filter-panel-${section}"]`);
  }

  function getToggleLabel(section) {
    const toggle = getToggle(section);
    return toggle ? toggle.querySelector('[data-mobile-filter-toggle-label]') : null;
  }

  function getToggleStatus(section) {
    const toggle = getToggle(section);
    return toggle ? toggle.querySelector('[data-mobile-filter-status]') : null;
  }

  function getPanel(section) {
    return document.getElementById(`filter-panel-${section}`);
  }

  function getGrid(section) {
    return document.getElementById(section === 'coaching_resources' ? 'coaching-grid' : section === 'player_resources' ? 'players-grid' : `${section}-grid`);
  }

  function getNoResults(section) {
    return document.getElementById(section === 'coaching_resources' ? 'coaching-no-results' : 'players-no-results');
  }

  function getSearchInput(section) {
    const bar = getFilterBar(section);
    return bar ? bar.querySelector('[data-search-input]') : null;
  }

  function getResultCount(section) {
    const bar = getFilterBar(section);
    return bar ? bar.querySelector('[data-result-count]') : null;
  }

  function getLiveRegion(section) {
    const bar = getFilterBar(section);
    return bar ? bar.querySelector('[data-live-region]') : null;
  }

  function getSectionsForUpdate() {
    return Array.from(interactiveSections).filter((section) => !!getFilterBar(section));
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

    return [...results].sort((a, b) => a.title.localeCompare(b.title));
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

  function getResources(section) {
    return sectionResources[section] || [];
  }

  function isDesktop() {
    return window.matchMedia('(min-width: 768px)').matches;
  }

  function updateToggleStatus(section) {
    const status = getToggleStatus(section);
    if (!(status instanceof HTMLElement)) return;

    const activeCount = state[section].filters.age.length + state[section].filters.category.length + state[section].filters.skill.length;
    const resultCount = currentResults(section).length;
    status.textContent = activeCount > 0 ? `${activeCount} active` : `${resultCount} results`;
  }

  function syncToggle(section) {
    const toggle = getToggle(section);
    const label = getToggleLabel(section);
    const panel = getPanel(section);

    if (!(toggle instanceof HTMLButtonElement) || !(panel instanceof HTMLElement) || !(label instanceof HTMLElement)) return;

    const open = state[section].panel.isOpen;
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Hide filters' : 'Show filters';

    if (isDesktop()) {
      panel.classList.add(...panelVisibleClasses);
      panel.classList.remove(...panelOpenClasses, ...panelClosedClasses);
      panel.style.removeProperty('max-height');
      panel.style.removeProperty('opacity');
      panel.style.removeProperty('pointer-events');
      panel.style.removeProperty('transform');
      panel.style.removeProperty('overflow-y');
      return;
    }

    if (open) {
      panel.classList.remove(...panelClosedClasses);
      panel.classList.add(...panelOpenClasses);
      panel.style.removeProperty('max-height');
    } else {
      panel.classList.remove(...panelOpenClasses);
      panel.classList.add(...panelClosedClasses);
    }
  }

  function syncFilterButtonState(section) {
    const bar = getFilterBar(section);
    if (!bar) return;

    const filters = state[section].filters;
    bar.querySelectorAll('button[data-filter-type]').forEach((button) => {
      if (!(button instanceof HTMLButtonElement)) return;
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
      saveFilters(section);
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

    const searchInput = getSearchInput(section);
    if (searchInput instanceof HTMLInputElement && searchInput.value !== state[section].search) {
      searchInput.value = state[section].search;
    }

    syncFilterButtonState(section);
    renderSkillButtons(section);
    syncToggle(section);
    updateToggleStatus(section);

    const resultCountEl = getResultCount(section);
    const liveRegion = getLiveRegion(section);
    const count = currentResults(section).length;
    if (resultCountEl) resultCountEl.textContent = `${count} resource${count === 1 ? '' : 's'} found`;
    if (liveRegion) {
      const filterParts = getFilterSummary(state[section].filters);
      const search = state[section].search.trim();
      liveRegion.textContent = filterParts.length || search
        ? `${count} resource${count === 1 ? '' : 's'} found with ${[...filterParts, search ? `"${search}"` : null].filter(Boolean).join(' and ')} applied`
        : `${count} resource${count === 1 ? '' : 's'} found`;
    }

    setErrorMessage(section, '');
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

  function getTabButtonId(section) {
    if (section === 'coaching_resources') return 'tab-coaching';
    if (section === 'player_resources') return 'tab-players';
    if (section === 'manager') return 'tab-managers';
    if (section === 'guides') return 'tab-guides';
    return 'tab-forms';
  }

  function getPanelId(section) {
    if (section === 'coaching_resources') return 'panel-coaching';
    if (section === 'player_resources') return 'panel-players';
    if (section === 'manager') return 'panel-managers';
    if (section === 'guides') return 'panel-guides';
    return 'panel-forms';
  }

  function setActiveSection(section) {
    activeSection = section;
    sectionOrder.forEach((name) => {
      const button = document.getElementById(getTabButtonId(name));
      const panel = document.getElementById(getPanelId(name));
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

    updateResults(section);
    if (submitResource) {
      submitResource.classList.toggle('hidden', !interactiveSections.has(section));
    }
  }

  function toggleFilter(section, type, value) {
    const filters = state[section].filters;
    const current = filters[type] || [];
    filters[type] = current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value];
    saveFilters(section);
  }

  function clearAll(section) {
    state[section].filters = { age: [], category: [], skill: [] };
    state[section].search = '';
    saveFilters(section);
    saveSearch(section);
    const searchInput = getSearchInput(section);
    if (searchInput instanceof HTMLInputElement) searchInput.value = '';
    updateResults(section);
  }

  function applySearch(section, value) {
    state[section].search = (value || '').trim();
    saveSearch(section);
    updateResults(section);
  }

  function togglePanel(section) {
    state[section].panel = { isOpen: !state[section].panel.isOpen };
    savePanel(section);
    syncToggle(section);
  }

  function setupFilterBar(section) {
    const bar = getFilterBar(section);
    if (!bar) return;

    const toggle = getToggle(section);
    if (toggle instanceof HTMLButtonElement) {
      toggle.addEventListener('click', () => {
        try {
          setErrorMessage(section, '');
          togglePanel(section);
        } catch (error) {
          logError('Toggle error', error);
          setErrorMessage(section, 'Failed to apply filters. Try again.');
        }
      });
    }

    bar.addEventListener('click', (event) => {
      try {
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
        updateResults(section);
      } catch (error) {
        logError('Filter error', error);
        setErrorMessage(section, 'Failed to apply filters. Try again.');
      }
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

    const searchInput = getSearchInput(section);
    if (searchInput instanceof HTMLInputElement) {
      searchInput.addEventListener('input', (event) => {
        const value = event.target.value;
        const timerKey = `${section}:search`;
        if (searchTimers.has(timerKey)) {
          window.clearTimeout(searchTimers.get(timerKey));
        }
        searchTimers.set(timerKey, window.setTimeout(() => applySearch(section, value), 250));
      });

      searchInput.addEventListener('blur', (event) => {
        applySearch(section, event.target.value);
      });
    }
  }

  function setupAutoCollapse() {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      try {
        const currentY = window.scrollY;
        const activeBar = getFilterBar(activeSection);
        if (!activeBar || !interactiveSections.has(activeSection)) {
          lastScrollY = currentY;
          return;
        }

        if (isDesktop()) {
          lastScrollY = currentY;
          return;
        }

        if (currentY > 100 && currentY > lastScrollY && state[activeSection].panel.isOpen) {
          state[activeSection].panel = { isOpen: false };
          savePanel(activeSection);
          syncToggle(activeSection);
        }

        lastScrollY = currentY;
      } catch (error) {
        logError('Auto-collapse error', error);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function setupResponsiveSync() {
    const handleResize = () => {
      getSectionsForUpdate().forEach((section) => syncToggle(section));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
  }

  sectionOrder.forEach((section) => {
    if (interactiveSections.has(section)) {
      loadSectionState(section);
      setupFilterBar(section);
    }
  });

  sectionOrder.forEach((section) => updateResults(section));
  setActiveSection(activeSection);
  getSectionsForUpdate().forEach((section) => syncToggle(section));
  setupAutoCollapse();
  setupResponsiveSync();

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
