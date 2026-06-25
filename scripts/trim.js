/**
 * Shared data trim: cap journal venues to their newest N entries.
 *
 * Conference venues keep their full history; only journals (queried via
 * `stream:journals/...`) are trimmed, since their back-catalogs grow without
 * bound and aren't the point of this tool. Used by both build-index.js and
 * build-sqlite.js so the JSON and SQLite outputs always agree.
 */
import { VENUES, JOURNAL_MAX_ENTRIES } from "./config.js";

const JOURNAL_KEYS = new Set(
  VENUES.filter((v) => v.dblpQuery.startsWith("stream:journals/")).map(
    (v) => v.key,
  ),
);

/** Return a new array with each journal venue capped to the newest N by year. */
export function trimJournals(papers, cap = JOURNAL_MAX_ENTRIES) {
  const byVenue = new Map();
  for (const p of papers) {
    if (!byVenue.has(p.venue)) byVenue.set(p.venue, []);
    byVenue.get(p.venue).push(p);
  }

  const out = [];
  for (const [venue, list] of byVenue) {
    if (JOURNAL_KEYS.has(venue) && list.length > cap) {
      const newest = [...list].sort((a, b) => (b.year || 0) - (a.year || 0));
      out.push(...newest.slice(0, cap));
    } else {
      out.push(...list);
    }
  }
  return out;
}
