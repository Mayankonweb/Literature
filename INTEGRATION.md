# SLS — Integration notes for the grouped-filter update

These files are **drop-in for the view layer**. Copy them over the matching repo
paths:

```
repo-ready/index.html          ->  index.html
repo-ready/css/sls-filters.css ->  css/sls-filters.css   (new file)
repo-ready/js/filter-ui.js     ->  js/filter-ui.js       (new file)
repo-ready/js/utils.js         ->  js/utils.js           (replaces; adds PETS + groups)
repo-ready/scripts/config.js   ->  scripts/config.js     (adds PETS, enables CRYPTO)
```

After copying `config.js`, rebuild data: `npm run build-data-quick`
(verify the PETS DBLP query hit count first — see the comment in `config.js`).

The remaining changes are **logic** (the part you said you'd do in your own
window). They're small; here's exactly what each one is.

---

## 1. `js/filters.js` — defaults, paper types, URL sync

**a) Default to A* venues only** (instead of every venue):

```js
// before
venues: new Set(ALL_VENUES),
includeWorkshops: true,

// after
venues: new Set(DEFAULT_VENUES),   // DEFAULT_VENUES is defined in utils.js
includeWorkshops: true,
paperTypes: null,                  // FilterUI initialises this to all types
```

**b) Persist paper types in the URL** (optional but recommended). In
`readFromURL()`:

```js
if (params.has("types")) {
  const t = params.get("types").split(",").filter(Boolean);
  if (t.length) this.paperTypes = new Set(t);
}
```

In `_writeURL()`:

```js
if (this.paperTypes && this.paperTypes.size < PAPER_TYPES.length) {
  params.set("types", [...this.paperTypes].join(","));
}
```

(`_writeURL` already only writes `venues` when not all are selected — that logic
still works with the A* default.)

---

## 2. `js/search.js` — filter by paper type

Both `_makeFilter()` and `_browse()` currently check `includeWorkshops`.
Replace that single check with a `paperTypes` check so posters/demos work once
tagged. `paperTypeOf(paper)` is provided in `utils.js`.

In `_makeFilter()`:

```js
// before
if (!filters.includeWorkshops && result.isWorkshop) return false;

// after
if (filters.paperTypes && !filters.paperTypes.has(paperTypeOf(result)))
  return false;
```

In `_browse()`:

```js
// before
if (!filters.includeWorkshops) {
  papers = papers.filter((p) => !p.isWorkshop);
}

// after
if (filters.paperTypes) {
  papers = papers.filter((p) => filters.paperTypes.has(paperTypeOf(p)));
}
```

> The MiniSearch index stores `isWorkshop`; `paperTypeOf` derives "full"/"workshop"
> from it. Posters/demos need the build-pipeline change in §4 before they filter.

---

## 3. `js/app.js` — wire FilterUI, drop the old controls, add the inline tag

**a)** Remove the now-deleted DOM lookups + bindings:
- delete `const workshopToggle = …` and `const venueChips = …`
- delete the **Venue chips** `forEach` block and the **Workshop toggle** block in `bindEvents()`
- in `syncUIFromState()`, delete the `venueChips.forEach(...)` and
  `workshopToggle.checked = …` lines

**b)** Initialise the new UI inside `init()` (after `bindEvents()`):

```js
bindEvents();
FilterUI.init();   // builds the grouped venue + type dropdowns
```

**c)** Show the paper type inline in the title (your earlier request). In
`renderPaperCard()`, replace the old workshop badge logic:

```js
// before
let badges = `<span class="venue-badge" …>…</span>`;
if (paper.isWorkshop) badges += `<span class="workshop-badge">Workshop</span>`;
```

```js
// after — venue badge stays; type shown as a tag next to the title
let badges = `<span class="venue-badge" style="--badge-color: ${venueColor}">${escapeHtml(VENUE_NAMES[paper.venue] || paper.venue)}</span>`;

const type = paperTypeOf(paper);                    // "full" | "workshop" | "poster" | "demo"
const TYPE_LABELS = { workshop: "Workshop", poster: "Poster", demo: "Demo" };
const typeTag = TYPE_LABELS[type]
  ? `<span class="paper-type-tag">${TYPE_LABELS[type]}</span>`
  : "";
```

Then add `${typeTag}` right after the title text inside `.paper-title`:

```js
<div class="paper-title"><a href="…">${title}</a>${typeTag}</div>
```

**d)** The stats line still says "6 top-tier conferences" — update the copy:

```js
statsLine.textContent =
  `Searching across ${stats.totalPapers.toLocaleString()} papers from ` +
  `${ALL_VENUES.length} venues (${stats.yearRange.min}\u2013${stats.yearRange.max})`;
```

---

## 4. Tagging posters / demos (build pipeline — optional, future)

Today DBLP gives us `isWorkshop` only, so the Type menu's **Posters** and
**Demos** options are inert until papers carry a `paperType`. To enable them:

- In `scripts/fetch-dblp.js`, when normalising each paper, set
  `paperType` from DBLP signals — e.g. title prefixes ("Poster:", "Demo:",
  "POSTER:") and/or the DBLP key/`type` field — falling back to
  `isWorkshop ? "workshop" : "full"`.
- In `scripts/build-index.js`, carry `paperType` into both the indexed record
  (`storeFields`) and `papers.json`.
- No frontend change needed — `paperTypeOf()` already prefers `paper.paperType`.

---

## Notes
- The header theme toggle (`#themeToggle`) is unchanged — dark mode keeps working
  through your existing `data-theme` + `--color-*` variables. Only the new
  `--color-PETS` token is added (in `sls-filters.css`; move it into the `:root`
  blocks of `style.css` if you prefer it alongside the others).
- `.workshop-badge` CSS in `style.css` can stay or be removed; the new inline
  tag uses `.paper-type-tag` (defined in `sls-filters.css`).
