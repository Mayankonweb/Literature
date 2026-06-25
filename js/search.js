/* SLS — Search engine backed by SQLite (sql.js-httpvfs) over HTTP Range.
 *
 * The browser never downloads the whole dataset: queries run against
 * data/papers.sqlite in a Web Worker, which fetches only the few KB of B-tree
 * pages each query touches. Results are paginated at the SQL level (LIMIT/
 * OFFSET) so even a broad browse reads almost nothing up front.
 */

const SearchEngine = {
  _worker: null,
  _db: null,
  _stats: null,
  _ready: false,

  /** Spin up the worker, open the DB, and read aggregate stats. */
  async init() {
    if (typeof createDbWorker !== "function") {
      throw new Error(
        "sql.js-httpvfs not loaded (js/vendor/sql.js-httpvfs/index.js).",
      );
    }

    const base = "js/vendor/sql.js-httpvfs/";
    const abs = (p) => new URL(p, document.baseURI).href;

    this._worker = await createDbWorker(
      [
        {
          from: "inline",
          config: {
            serverMode: "full",
            url: abs("data/papers.sqlite"),
            requestChunkSize: 4096, // matches the DB page_size
          },
        },
      ],
      abs(base + "sqlite.worker.js"),
      abs(base + "sql-wasm.wasm"),
    );
    this._db = this._worker.db;

    // Stats straight from the DB — no separate stats.json needed.
    const [agg] = await this._db.query(
      "SELECT count(*) AS total, min(nullif(year,0)) AS minY, max(year) AS maxY FROM papers",
    );
    this._stats = {
      totalPapers: agg.total,
      yearRange: { min: agg.minY, max: agg.maxY },
      lastUpdated: null,
    };

    this._ready = true;
    return this._stats;
  },

  isReady() {
    return this._ready;
  },

  getStats() {
    return this._stats;
  },

  /** Build the FROM/WHERE clause + bound params shared by query() and count(). */
  _buildWhere(filters) {
    const where = [];
    const params = [];
    let ftsJoin = "";

    const q = (filters.query || "").trim();
    const hasQuery = q.length > 0;
    if (hasQuery) {
      // Prefix-match each token, implicit AND. Quoting neutralizes FTS5 syntax
      // chars in user input so arbitrary text can't produce a parse error.
      const match = q
        .split(/\s+/)
        .filter(Boolean)
        .map((t) => `"${t.replace(/"/g, '""')}"*`)
        .join(" ");
      ftsJoin = "JOIN papers_fts f ON f.rowid = p.id";
      where.push("papers_fts MATCH ?");
      params.push(match);
    }

    if (filters.venues && filters.venues.size < ALL_VENUES.length) {
      const vs = [...filters.venues];
      where.push(`p.venue IN (${vs.map(() => "?").join(",")})`);
      params.push(...vs);
    }

    if (filters.paperTypes && filters.paperTypes.size < PAPER_TYPES.length) {
      const ts = [...filters.paperTypes];
      where.push(`p.paperType IN (${ts.map(() => "?").join(",")})`);
      params.push(...ts);
    }

    if (filters.yearMin) {
      where.push("p.year >= ?");
      params.push(filters.yearMin);
    }
    if (filters.yearMax) {
      where.push("p.year <= ?");
      params.push(filters.yearMax);
    }

    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
    return { ftsJoin, whereSql, params, hasQuery };
  },

  _orderBy(filters, hasQuery) {
    switch (filters.sort) {
      case "year-asc":
        return "ORDER BY p.year ASC, p.id DESC";
      case "citations":
        return "ORDER BY p.citationCount DESC, p.year DESC";
      case "year-desc":
        return "ORDER BY p.year DESC, p.id DESC";
      default: // relevance — bm25 when searching, else newest first
        return hasQuery
          ? "ORDER BY bm25(papers_fts, 10.0, 2.0, 5.0)"
          : "ORDER BY p.year DESC, p.id DESC";
    }
  },

  /** Fetch one page of full paper rows for the given filters. */
  async query(filters, limit, offset) {
    if (!this._ready) return [];
    const { ftsJoin, whereSql, params, hasQuery } = this._buildWhere(filters);
    const order = this._orderBy(filters, hasQuery);
    const rows = await this._db.query(
      `SELECT p.id, p.title, p.authors, p.year, p.venue, p.doi, p.ee, p.url,
              p.pages, p.abstract, p.citationCount, p.isWorkshop, p.paperType
       FROM papers p ${ftsJoin} ${whereSql} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return rows.map(hydratePaper);
  },

  /** Total number of papers matching the filters (for the result header). */
  async count(filters) {
    if (!this._ready) return 0;
    const { ftsJoin, whereSql, params } = this._buildWhere(filters);
    const [r] = await this._db.query(
      `SELECT count(*) AS c FROM papers p ${ftsJoin} ${whereSql}`,
      params,
    );
    return r.c;
  },

  /** Title suggestions for a partial query. */
  async suggest(q) {
    if (!this._ready || !q || q.length < 2) return [];
    const match = q
      .split(/\s+/)
      .filter(Boolean)
      .map((t) => `"${t.replace(/"/g, '""')}"*`)
      .join(" ");
    if (!match) return [];
    try {
      const rows = await this._db.query(
        `SELECT p.title FROM papers p JOIN papers_fts f ON f.rowid = p.id
         WHERE papers_fts MATCH ? ORDER BY bm25(papers_fts, 10.0, 2.0, 5.0) LIMIT 8`,
        [match],
      );
      return rows.map((r) => ({ suggestion: r.title }));
    } catch {
      return [];
    }
  },
};

/** Turn a flat DB row into the paper shape the UI renders. */
function hydratePaper(r) {
  return {
    id: r.id,
    title: r.title,
    authors: r.authors
      ? r.authors.split(", ").map((name) => ({ name }))
      : [],
    year: r.year,
    venue: r.venue,
    doi: r.doi,
    ee: r.ee,
    url: r.url,
    pages: r.pages,
    abstract: r.abstract,
    citationCount: r.citationCount,
    tldr: null,
    pdfUrl: null,
    isWorkshop: !!r.isWorkshop,
    paperType: r.paperType,
  };
}
