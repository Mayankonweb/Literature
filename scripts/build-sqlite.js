#!/usr/bin/env node
/**
 * Builds a static SQLite database (data/papers.sqlite) with an FTS5 full-text
 * index, for querying directly from the browser via sql.js-httpvfs over HTTP
 * Range requests — so the page fetches only the few KB of B-tree pages each
 * query touches instead of the whole dataset up front.
 *
 * Reads raw-dblp.json, applies the journal trim, and writes a VACUUMed,
 * WAL-free DB that any static host can serve with byte-range support.
 *
 * Uses Node's built-in node:sqlite (Node >= 22.5, FTS5 compiled in) — no deps.
 */
import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync, rmSync, statSync } from "fs";
import { trimJournals } from "./trim.js";

const OUT = "data/papers.sqlite";

// DBLP doesn't tag posters/demos, but their titles almost always announce it
// ("Poster: …", "Demo: …", "Demonstration of …"). Derive the type here so the
// Type filter and the card tag work without re-fetching.
const POSTER_RE = /^\s*posters?\b[\s:.\-—]/i;
const DEMO_RE = /^\s*(?:demo|demonstrations?)\b[\s:.\-—]/i;

function classifyType(p) {
  if (p.paperType) return p.paperType;
  const title = p.title || "";
  if (POSTER_RE.test(title)) return "poster";
  if (DEMO_RE.test(title)) return "demo";
  return p.isWorkshop ? "workshop" : "full";
}

function main() {
  const inputFile = "data/raw-dblp.json";
  if (!existsSync(inputFile)) {
    console.error("No data found. Run fetch-dblp.js / seed from the dump first.");
    process.exit(1);
  }

  const papers = trimJournals(JSON.parse(readFileSync(inputFile, "utf-8")));
  console.log(`Building SQLite from ${papers.length} papers...`);

  if (existsSync(OUT)) rmSync(OUT);
  const db = new DatabaseSync(OUT);

  // page_size must be set before any table exists. 4096 keeps each Range
  // request small while covering a useful chunk of the B-tree.
  db.exec("PRAGMA page_size = 4096");
  db.exec("PRAGMA journal_mode = DELETE"); // no WAL — must be a single file

  db.exec(`CREATE TABLE papers (
    id            INTEGER PRIMARY KEY,
    title         TEXT,
    authors       TEXT,
    year          INTEGER,
    venue         TEXT,
    doi           TEXT,
    ee            TEXT,
    url           TEXT,
    pages         TEXT,
    abstract      TEXT,
    isWorkshop    INTEGER,
    paperType     TEXT
  )`);

  // External-content FTS: the index reads its text from `papers`, so the
  // searchable columns aren't duplicated on disk.
  db.exec(`CREATE VIRTUAL TABLE papers_fts USING fts5(
    title, authors, abstract,
    content='papers', content_rowid='id',
    tokenize='porter unicode61'
  )`);

  const insert = db.prepare(`INSERT INTO papers
    (id, title, authors, year, venue, doi, ee, url, pages, abstract, isWorkshop, paperType)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);

  db.exec("BEGIN");
  let rowid = 0;
  for (const p of papers) {
    rowid += 1;
    const authors = (p.authors || []).map((a) => a.name).join(", ");
    const paperType = classifyType(p);
    insert.run(
      rowid,
      p.title || "",
      authors,
      p.year || 0,
      p.venue || "",
      p.doi || null,
      p.ee || null,
      p.url || null,
      p.pages || null,
      p.abstract || null,
      p.isWorkshop ? 1 : 0,
      paperType,
    );
  }
  db.exec("COMMIT");

  // Build the FTS index from the content table, plus browse/sort indexes.
  db.exec("INSERT INTO papers_fts(papers_fts) VALUES('rebuild')");
  db.exec("CREATE INDEX idx_year ON papers(year)");
  db.exec("CREATE INDEX idx_venue_year ON papers(venue, year)");
  db.exec("INSERT INTO papers_fts(papers_fts) VALUES('optimize')");
  db.close();

  // VACUUM in a fresh connection so the file is compact and contiguous.
  const vac = new DatabaseSync(OUT);
  vac.exec("VACUUM");
  vac.close();

  const mb = (statSync(OUT).size / 1024 / 1024).toFixed(1);
  console.log(`Wrote ${OUT} (${mb} MB, ${rowid} papers)`);
}

main();
