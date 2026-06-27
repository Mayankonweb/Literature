/* SLS — Grouped venue + paper-type filter UI
 *
 * Builds the collapsible filter sub-menus into the filter bar and keeps them
 * in sync with FilterState. Depends on:
 *   - utils.js   (VENUE_GROUPS, VENUE_NAMES, DEFAULT_VENUES, PAPER_TYPES, ALL_VENUES)
 *   - filters.js (FilterState: .venues Set, .toggleVenue, .set, .onChange)
 *
 * Load order in index.html: utils.js → filters.js → search.js → filter-ui.js → app.js
 *
 * It manages two pieces of filter state:
 *   FilterState.venues      (Set<string>)  — existing
 *   FilterState.paperTypes  (Set<string>)  — added here ("full"/"workshop"/…)
 * and keeps FilterState.includeWorkshops in sync for backward compatibility
 * with the existing search filter.
 */
const FilterUI = (function () {
  "use strict";

  const els = {};
  const ICONS = {
    caret:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    check:
      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  };

  /* Ensure FilterState carries a paperTypes set (all on by default). */
  function ensurePaperTypes() {
    if (!FilterState.paperTypes) {
      FilterState.paperTypes = new Set(PAPER_TYPES.map((t) => t.key));
    }
  }

  /* Keep the legacy includeWorkshops flag aligned with the type set. */
  function syncWorkshopFlag() {
    FilterState.includeWorkshops = FilterState.paperTypes.has("workshop");
  }

  /* ── Builders ─────────────────────────────────────────── */
  function buildVenueGroup(group) {
    const wrap = document.createElement("div");
    wrap.className = "filter-dropdown";
    wrap.dataset.group = group.id;

    wrap.innerHTML = `
      <button class="filter-dropdown-trigger" type="button" style="--fd-dot-color:${group.dot}">
        <span class="fd-dot"></span>
        <span class="fd-name">${escapeHtml(group.label)}</span>
        <span class="fd-count"></span>
        <span class="fd-caret">${ICONS.caret}</span>
      </button>
      <div class="filter-dropdown-menu" role="menu">
        <div class="filter-dropdown-head">
          <span class="fd-title">${escapeHtml(group.label)}</span>
          <button class="fd-toggle-all" type="button"></button>
        </div>
        <div class="fd-options"></div>
      </div>`;

    const optsEl = wrap.querySelector(".fd-options");
    group.venues.forEach((key) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fd-option";
      btn.dataset.venue = key;
      const full = VENUE_FULLNAMES[key];
      btn.innerHTML = `
        <span class="fd-check">${ICONS.check}</span>
        <span class="fd-swatch" style="background:var(--color-${key})"></span>
        <span class="fd-label">
          <span class="fd-short">${escapeHtml(VENUE_NAMES[key] || key)}</span>
          ${full ? `<span class="fd-full">${escapeHtml(full)}</span>` : ""}
        </span>
        <span class="fd-num" data-count></span>`;
      btn.addEventListener("click", () => FilterState.toggleVenue(key));
      optsEl.appendChild(btn);
    });

    // Select-all / clear-all
    wrap.querySelector(".fd-toggle-all").addEventListener("click", () => {
      const allOn = group.venues.every((k) => FilterState.venues.has(k));
      group.venues.forEach((k) => {
        if (allOn) FilterState.venues.delete(k);
        else FilterState.venues.add(k);
      });
      FilterState._writeURL();
      FilterState._notify();
    });

    bindToggle(wrap);
    return wrap;
  }

  function buildTypeMenu() {
    const wrap = document.createElement("div");
    wrap.className = "filter-dropdown";
    wrap.dataset.group = "type";
    wrap.innerHTML = `
      <button class="filter-dropdown-trigger" type="button">
        <span class="fd-name">Type</span>
        <span class="fd-count"></span>
        <span class="fd-caret">${ICONS.caret}</span>
      </button>
      <div class="filter-dropdown-menu" role="menu">
        <div class="filter-dropdown-head">
          <span class="fd-title">Paper type</span>
        </div>
        <div class="fd-options"></div>
      </div>`;

    const optsEl = wrap.querySelector(".fd-options");
    PAPER_TYPES.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fd-option";
      btn.dataset.type = t.key;
      btn.innerHTML = `
        <span class="fd-check">${ICONS.check}</span>
        <span class="fd-label">${escapeHtml(t.name)}</span>`;
      btn.addEventListener("click", () => {
        const s = FilterState.paperTypes;
        if (s.has(t.key)) s.delete(t.key);
        else s.add(t.key);
        syncWorkshopFlag();
        FilterState.set("paperTypes", s); // writes URL + notifies
      });
      optsEl.appendChild(btn);
    });

    bindToggle(wrap);
    return wrap;
  }

  /* Open/close behaviour (one menu open at a time). */
  function bindToggle(wrap) {
    const trigger = wrap.querySelector(".filter-dropdown-trigger");
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !wrap.classList.contains("open");
      closeAll();
      if (willOpen) wrap.classList.add("open");
    });
    wrap
      .querySelector(".filter-dropdown-menu")
      .addEventListener("click", (e) => e.stopPropagation());
  }

  function closeAll() {
    document
      .querySelectorAll(".filter-dropdown.open")
      .forEach((d) => d.classList.remove("open"));
  }

  /* ── Render (reflect current state) ───────────────────── */
  function render() {
    ensurePaperTypes();

    // Venue groups: checks, counts, per-venue numbers
    VENUE_GROUPS.forEach((group) => {
      const wrap = els.venueMenus.querySelector(
        `.filter-dropdown[data-group="${group.id}"]`,
      );
      if (!wrap) return;
      let selCount = 0;
      group.venues.forEach((key) => {
        const on = FilterState.venues.has(key);
        if (on) selCount++;
        const opt = wrap.querySelector(`.fd-option[data-venue="${key}"]`);
        if (opt) opt.classList.toggle("checked", on);
        const num = opt && opt.querySelector("[data-count]");
        if (num) num.textContent = formatVenueCount(key);
      });
      wrap.querySelector(".fd-count").textContent =
        `${selCount}/${group.venues.length}`;
      const allOn = selCount === group.venues.length;
      wrap.querySelector(".fd-toggle-all").textContent = allOn
        ? "Clear all"
        : "Select all";
    });

    // Type menu
    if (els.typeMenu) {
      const wrap = els.typeMenu.querySelector('.filter-dropdown[data-group="type"]');
      if (wrap) {
        let n = 0;
        PAPER_TYPES.forEach((t) => {
          const on = FilterState.paperTypes.has(t.key);
          if (on) n++;
          const opt = wrap.querySelector(`.fd-option[data-type="${t.key}"]`);
          if (opt) opt.classList.toggle("checked", on);
        });
        wrap.querySelector(".fd-count").textContent = `${n}/${PAPER_TYPES.length}`;
      }
    }

    renderActiveChips();
  }

  function formatVenueCount(key) {
    const stats = SearchEngine.getStats && SearchEngine.getStats();
    const per = stats && stats.perVenue && stats.perVenue[key];
    return per ? per.total.toLocaleString() : "";
  }

  function renderActiveChips() {
    if (!els.activeVenues) return;
    const selected = ALL_VENUES.filter((k) => FilterState.venues.has(k));
    if (selected.length === 0 || selected.length === ALL_VENUES.length) {
      els.activeVenues.innerHTML =
        selected.length === ALL_VENUES.length
          ? '<span class="av-label">All venues selected</span>'
          : '<span class="av-label">No venues selected</span>';
      return;
    }
    const label = `<span class="av-label">${selected.length} of ${ALL_VENUES.length} venues:</span>`;
    const chips = selected
      .map(
        (k) =>
          `<span class="av-chip" style="--chip-color:var(--color-${k})" title="${escapeHtml(
            VENUE_FULLNAMES[k] || VENUE_NAMES[k] || k,
          )}">${escapeHtml(
            VENUE_NAMES[k] || k,
          )}<span class="av-x" data-remove="${k}">&times;</span></span>`,
      )
      .join("");
    els.activeVenues.innerHTML = label + chips;
  }

  /* ── Init ─────────────────────────────────────────────── */
  function init() {
    els.venueMenus = document.getElementById("venueMenus");
    els.typeMenu = document.getElementById("typeMenu");
    els.activeVenues = document.getElementById("activeVenues");
    if (!els.venueMenus) return;

    ensurePaperTypes();
    syncWorkshopFlag();

    VENUE_GROUPS.forEach((g) => els.venueMenus.appendChild(buildVenueGroup(g)));
    if (els.typeMenu) els.typeMenu.appendChild(buildTypeMenu());

    // Remove active chip → toggle venue off
    if (els.activeVenues) {
      els.activeVenues.addEventListener("click", (e) => {
        const x = e.target.closest("[data-remove]");
        if (x) FilterState.toggleVenue(x.dataset.remove);
      });
    }

    // Close menus on outside click / Escape
    document.addEventListener("click", closeAll);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
    });

    // Re-render whenever filters change
    FilterState.onChange(render);
    render();
  }

  return { init, render };
})();
