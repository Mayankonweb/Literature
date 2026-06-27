#!/usr/bin/env node
/**
 * Fetches papers from DBLP for the configured venues.
 *
 * INCREMENTAL BY DEFAULT: for each venue it asks DBLP only for the total hit
 * count (one cheap request), compares that to what we already have stored, and
 * re-downloads the venue *only* when the count changed or the venue is new.
 * Unchanged venues are kept as-is (abstracts/citations preserved), so a normal
 * run touches only the venues that actually changed — far fewer requests, and
 * much less likely to hit DBLP's rate limit (HTTP 429).
 *
 * Existing data is read from data/papers.json (the built database). Per-venue
 * counts are tracked in data/dblp-meta.json. Output is data/raw-dblp.json,
 * written incrementally after each venue so an interrupted run keeps progress.
 *
 * Flags:
 *   --force            Re-fetch every venue, ignoring stored counts.
 *   --venue=CCS,PETS   Only consider these venue keys (others are left as-is).
 *   --delay=15         Seconds to wait between page requests (default 5).
 *                      Raise this when DBLP keeps returning HTTP 429.
 */

import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
} from "fs";
import {
  VENUES,
  DBLP_API_BASE,
  DBLP_HITS_PER_PAGE,
  DBLP_DELAY_MS,
  DBLP_MAX_RESULTS,
} from "./config.js";

const RAW_FILE = "data/raw-dblp.json";
const META_FILE = "data/dblp-meta.json";
const DB_FILE = "data/papers.json";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FETCH_RETRY_ATTEMPTS = 6;
const FETCH_RETRY_DELAY_MS = 5000;
const FETCH_MAX_RETRY_DELAY_MS = 120000;
// Abort a single request that stalls, so a hung connection becomes a retryable
// timeout instead of blocking the whole run on undici's ~5 min default.
const REQUEST_TIMEOUT_MS = 60000;
const RETRYABLE_HTTP_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

// DBLP throttles anonymous clients hard. Identify ourselves (politeness) and
// keep a generous gap between page requests, with a little jitter.
const USER_AGENT =
  "SLS-research/1.0 (+https://github.com/boardslayer/SLS; mailto:csz228227@iitd.ac.in)";
// Gap between page requests. Override with --delay=<seconds> when DBLP is cranky.
let PAGE_DELAY_MS = Math.max(DBLP_DELAY_MS, 5000);
const jitter = () => Math.floor(Math.random() * 1500);

/** Parse a Retry-After header (seconds or HTTP-date) into milliseconds. */
function parseRetryAfter(resp) {
  const h = resp.headers.get("retry-after");
  if (!h) return null;
  const secs = Number(h);
  if (Number.isFinite(secs)) return Math.max(0, secs * 1000);
  const when = Date.parse(h);
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  return null;
}
const RETRYABLE_ERROR_CODES = new Set([
  "ECONNRESET",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
]);

/** Network/timeout errors worth retrying: known codes, undici internals, aborts. */
function isRetryableNetworkError(err) {
  if (err?.name === "TimeoutError" || err?.name === "AbortError") return true;
  const code = getErrorCode(err);
  if (typeof code === "string" && code.startsWith("UND_ERR_")) return true;
  return RETRYABLE_ERROR_CODES.has(code);
}

// ── CLI flags ─────────────────────────────────────────────
const args = process.argv.slice(2);
const FORCE = args.includes("--force") || args.includes("--all");
const delayArg = args.find((a) => a.startsWith("--delay="));
if (delayArg) {
  const secs = Number(delayArg.slice("--delay=".length));
  if (Number.isFinite(secs) && secs >= 0) PAGE_DELAY_MS = secs * 1000;
}
const venueArg = args.find((a) => a.startsWith("--venue="));
const VENUE_FILTER = venueArg
  ? new Set(
      venueArg
        .slice("--venue=".length)
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    )
  : null;

function getErrorCode(err) {
  return err?.cause?.code || err?.code || null;
}

function getRetryDelay(attempt) {
  return Math.min(
    FETCH_RETRY_DELAY_MS * 2 ** (attempt - 1),
    FETCH_MAX_RETRY_DELAY_MS,
  );
}

async function fetchWithRetry(url, context) {
  let lastError = null;

  for (let attempt = 1; attempt <= FETCH_RETRY_ATTEMPTS; attempt += 1) {
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (resp.ok) return resp;

      const statusError = new Error(
        `HTTP ${resp.status} for ${context} (attempt ${attempt}/${FETCH_RETRY_ATTEMPTS})`,
      );

      if (
        RETRYABLE_HTTP_STATUSES.has(resp.status) &&
        attempt < FETCH_RETRY_ATTEMPTS
      ) {
        // Honor DBLP's Retry-After if present, otherwise exponential backoff.
        const retryAfter = parseRetryAfter(resp);
        const wait =
          retryAfter != null
            ? Math.min(retryAfter + jitter(), FETCH_MAX_RETRY_DELAY_MS)
            : getRetryDelay(attempt);
        console.error(
          `  HTTP ${resp.status} for ${context} (attempt ${attempt}/${FETCH_RETRY_ATTEMPTS}); ` +
            `waiting ${Math.round(wait / 1000)}s${retryAfter != null ? " (Retry-After)" : ""}...`,
        );
        await sleep(wait);
        lastError = statusError;
        continue;
      }

      lastError = statusError;
      break;
    } catch (err) {
      const reason = getErrorCode(err) || err?.name || "unknown";
      if (isRetryableNetworkError(err) && attempt < FETCH_RETRY_ATTEMPTS) {
        console.error(
          `  Network error (${reason}) for ${context} (attempt ${attempt}/${FETCH_RETRY_ATTEMPTS}), retrying...`,
        );
        await sleep(getRetryDelay(attempt));
        lastError = err;
        continue;
      }
      lastError = err;
      break;
    }
  }

  throw lastError;
}

// Decode HTML entities that DBLP includes in titles/names
function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// Workshop indicators in DBLP key paths or venue names
const WORKSHOP_KEY_PATTERNS = ["-ws/", "workshop/"];
const WORKSHOP_VENUE_MARKER = "@";

function isWorkshop(paper) {
  const key = paper.key || "";
  const venue = paper.venue || "";
  if (venue.includes(WORKSHOP_VENUE_MARKER)) return true;
  for (const pat of WORKSHOP_KEY_PATTERNS) {
    if (key.includes(pat)) return true;
  }
  return false;
}

function normalizeAuthors(authorsField) {
  if (!authorsField || !authorsField.author) return [];
  const raw = authorsField.author;
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((a) => ({
    name: decodeHtmlEntities(
      (a.text || "").replace(/ \d{4}$/, "").replace(/ 000\d$/, ""),
    ),
    pid: a["@pid"] || null,
  }));
}

function normalizeVenue(dblpVenue, venueKey) {
  // DBLP sometimes returns "CCSW@CCS" etc. Map back to the parent venue key.
  return venueKey;
}

/** Fetch the live total hit count for a venue (one cheap request). */
async function fetchVenueCount(venue) {
  const countUrl = `${DBLP_API_BASE}?q=${encodeURIComponent(venue.dblpQuery)}&format=json&h=0`;
  const resp = await fetchWithRetry(countUrl, `${venue.key} count`);
  const data = await resp.json();
  return parseInt(data.result.hits["@total"], 10) || 0;
}

/** Fetch and normalize a single page of results at the given offset. */
async function fetchPage(venue, offset) {
  const url = `${DBLP_API_BASE}?q=${encodeURIComponent(venue.dblpQuery)}&format=json&h=${DBLP_HITS_PER_PAGE}&f=${offset}`;
  const resp = await fetchWithRetry(url, `${venue.key} at offset ${offset}`);
  const data = await resp.json();
  const hits = data.result.hits.hit;
  if (!hits) return [];
  const hitArr = Array.isArray(hits) ? hits : [hits];
  return hitArr.map((hit) => {
    const info = hit.info;
    return {
      title: decodeHtmlEntities((info.title || "").replace(/\.$/, "")),
      authors: normalizeAuthors(info.authors),
      year: parseInt(info.year, 10) || 0,
      venue: normalizeVenue(info.venue, venue.key),
      rawVenue: info.venue || "",
      doi: info.doi || null,
      ee: info.ee || null,
      url: info.url || null,
      pages: info.pages || null,
      key: info.key || null,
      type: info.type || null,
      isWorkshop: isWorkshop(info),
    };
  });
}

/**
 * Fully download a venue (paginated), capped at the window DBLP actually serves.
 * Used only to populate a brand-new venue; established venues use the cheaper
 * incremental update below.
 */
async function fetchVenue(venue, total) {
  const papers = [];
  const target = Math.min(total, DBLP_MAX_RESULTS);
  let offset = 0;
  while (offset < target) {
    console.log(`  Fetching ${venue.key} from offset ${offset}`);
    const page = await fetchPage(venue, offset);
    if (page.length === 0) break;
    papers.push(...page);
    // Advance by what DBLP ACTUALLY returned, not the requested page size.
    // Under load it returns short pages (HTTP 200, fewer hits); striding by a
    // fixed page size would silently skip the records it didn't send.
    offset += page.length;
    if (offset < target) await sleep(PAGE_DELAY_MS + jitter());
  }
  return papers;
}

/** Signature for dedup: normalized title + year (stable across our store/DBLP). */
function paperSig(p) {
  return `${(p.title || "").toLowerCase().replace(/\s+/g, " ").trim()}|${p.year || 0}`;
}

/**
 * Incrementally update a venue we already have. DBLP returns results
 * newest-first, so we walk pages from the front, collect papers we don't yet
 * hold, and STOP as soon as a whole page contains nothing new — by then we've
 * passed the freshly-published papers and reached the part we already mirror.
 *
 * This is cheap (usually a single page when little changed), never re-downloads
 * the whole venue, and works for venues capped at DBLP_MAX_RESULTS, whose total
 * count can't grow — so a count-based check would never notice new papers.
 */
async function incrementalUpdate(venue, existing, reachable) {
  const seen = new Set(existing.map(paperSig));
  const additions = [];
  let offset = 0;
  while (offset < reachable) {
    console.log(`  Checking ${venue.key} from offset ${offset} for new papers`);
    const page = await fetchPage(venue, offset);
    if (page.length === 0) break;
    let newInPage = 0;
    for (const p of page) {
      const s = paperSig(p);
      if (!seen.has(s)) {
        seen.add(s);
        additions.push(p);
        newInPage += 1;
      }
    }
    // A page with no new papers means we've caught up to what we hold.
    if (newInPage === 0) break;
    // Advance by actual hits returned (DBLP sends short pages under load).
    offset += page.length;
    if (offset < reachable) await sleep(PAGE_DELAY_MS + jitter());
  }
  console.log(
    additions.length
      ? `  Incremental: +${additions.length} new paper(s).`
      : "  Incremental: no new papers.",
  );
  // DBLP serves newest-first; keep new papers at the front of the store too.
  return additions.concat(existing);
}

/** Load the existing database (data/papers.json) grouped by venue key. */
function loadExistingByVenue() {
  const byVenue = new Map();
  if (!existsSync(DB_FILE)) return byVenue;
  try {
    const papers = JSON.parse(readFileSync(DB_FILE, "utf-8"));
    for (const p of papers) {
      if (!byVenue.has(p.venue)) byVenue.set(p.venue, []);
      byVenue.get(p.venue).push(p);
    }
  } catch (err) {
    console.warn(`  Could not read ${DB_FILE}: ${err.message}`);
  }
  return byVenue;
}

function loadMeta() {
  if (!existsSync(META_FILE)) return { venues: {} };
  try {
    return JSON.parse(readFileSync(META_FILE, "utf-8"));
  } catch {
    return { venues: {} };
  }
}

/** Flatten the per-venue map (in config order), assign IDs, and persist. */
function persist(byVenue, meta) {
  const all = [];
  for (const venue of VENUES) {
    const list = byVenue.get(venue.key);
    if (list) all.push(...list);
  }
  all.forEach((p, i) => {
    p.id = i + 1;
  });
  mkdirSync("data", { recursive: true });
  writeFileSync(RAW_FILE, JSON.stringify(all, null, 2));
  writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
  return all;
}

async function main() {
  console.log("SLS: Updating DBLP data (incremental)...");
  console.log(`  Pace: ~${(PAGE_DELAY_MS / 1000).toFixed(1)}s between requests\n`);
  if (FORCE) console.log("  --force: re-fetching every venue\n");
  if (VENUE_FILTER)
    console.log(`  --venue: only ${[...VENUE_FILTER].join(", ")}\n`);

  const byVenue = loadExistingByVenue();
  const meta = loadMeta();
  meta.venues = meta.venues || {};

  let fetched = 0;
  let skipped = 0;
  const incomplete = [];

  for (const venue of VENUES) {
    console.log(`\n[${venue.key}] ${venue.fullName}`);

    // --venue filter: leave other venues exactly as-is.
    if (VENUE_FILTER && !VENUE_FILTER.has(venue.key.toUpperCase())) {
      console.log("  (skipped — not in --venue filter)");
      skipped++;
      continue;
    }

    const existing = byVenue.get(venue.key) || [];

    console.log(`  Counting ${venue.key}...`);
    const total = await fetchVenueCount(venue);
    // DBLP only serves the newest DBLP_MAX_RESULTS papers of a query, so that
    // window — not the raw total — is what we can actually reach and store.
    const reachable = Math.min(total, DBLP_MAX_RESULTS);
    const capped = total > DBLP_MAX_RESULTS;
    if (capped) {
      console.log(
        `  DBLP has ${total}; serving only the newest ${reachable}. Stored ${existing.length}`,
      );
    } else {
      console.log(`  DBLP has ${total}; stored ${existing.length}`);
    }

    // Count-based skip only works when DBLP's count can actually grow. For
    // capped venues the count is pinned at the cap, so it can never signal new
    // papers — those always run the (cheap) incremental check instead.
    const upToDate =
      !FORCE && !capped && existing.length > 0 && existing.length >= reachable;

    if (upToDate) {
      console.log("  Up to date — skipping fetch.");
      meta.venues[venue.key] = {
        total,
        reachable,
        count: existing.length,
        checkedAt: new Date().toISOString(),
      };
      skipped++;
      await sleep(PAGE_DELAY_MS); // be polite between count calls
      continue;
    }

    let papers;
    if (existing.length === 0) {
      console.log("  New venue — fetching all papers.");
      papers = await fetchVenue(venue, reachable);
    } else {
      // Established venue: walk newest-first pages and stop once we reach papers
      // we already hold. No whole-venue re-download (that was the source of the
      // 503 storms / timeouts).
      papers = await incrementalUpdate(venue, existing, reachable);
    }

    // Integrity guard: DBLP under load returns partial pages. Treat a fetch
    // that falls well short of the reachable count as INCOMPLETE, and never
    // overwrite a larger good set with a smaller partial one.
    const enough = papers.length >= Math.floor(reachable * 0.95);
    if (!enough) {
      console.warn(
        `  WARNING: only got ${papers.length}/${reachable} for ${venue.key} — DBLP likely throttling/erroring.`,
      );
      incomplete.push(venue.key);
    }
    if (!enough && existing.length >= papers.length) {
      console.warn(
        `  Keeping existing ${existing.length}; not overwriting with a smaller partial fetch. Re-run later.`,
      );
      meta.venues[venue.key] = {
        total,
        reachable,
        count: existing.length,
        incomplete: true,
        checkedAt: new Date().toISOString(),
      };
      skipped++;
      await sleep(PAGE_DELAY_MS);
      continue;
    }

    byVenue.set(venue.key, papers);
    meta.venues[venue.key] = {
      total,
      reachable,
      count: papers.length,
      incomplete: !enough,
      fetchedAt: new Date().toISOString(),
    };
    fetched++;
    console.log(
      `  -> ${papers.length} papers (${papers.filter((p) => p.isWorkshop).length} workshop)${enough ? "" : " [INCOMPLETE]"}`,
    );

    // Persist after each venue so an interrupted run keeps progress.
    persist(byVenue, meta);
    await sleep(PAGE_DELAY_MS);
  }

  const all = persist(byVenue, meta);
  const mainTrack = all.filter((p) => !p.isWorkshop).length;
  const workshop = all.filter((p) => p.isWorkshop).length;
  console.log(
    `\nDone! ${all.length} total papers (${mainTrack} main track, ${workshop} workshop)`,
  );
  console.log(`  Venues fetched: ${fetched}, skipped/unchanged: ${skipped}`);
  console.log(`  Output: ${RAW_FILE}`);
  if (incomplete.length) {
    console.warn(
      `\n  ⚠ INCOMPLETE venues (DBLP returned partial data): ${incomplete.join(", ")}`,
    );
    console.warn(
      `    Re-run later, e.g.: node scripts/fetch-dblp.js --venue=${incomplete.join(",")}`,
    );
  }
  if (fetched > 0) {
    console.log("  Note: run `npm run build-sqlite` to rebuild the database.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
