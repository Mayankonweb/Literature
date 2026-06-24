/* SLS — Utility functions */

/**
 * Debounce a function call.
 */
function debounce(fn, ms) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/** Truncate text to a max length, appending "..." if needed. */
function truncate(text, maxLen) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

/** Format author list for display. Shows up to `max` authors, then "+ N more". */
function formatAuthors(authors, max = 5) {
  if (!authors || authors.length === 0) return "";
  const names = authors.map((a) => a.name);
  if (names.length <= max) return names.join(", ");
  return names.slice(0, max).join(", ") + ` + ${names.length - max} more`;
}

/** Escape HTML to prevent XSS. */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Venue display names (short labels used in chips/menus).
 */
const VENUE_NAMES = {
  CCS: "CCS",
  NDSS: "NDSS",
  USENIX: "USENIX Security",
  SP: "IEEE S&P",
  CRYPTO: "CRYPTO",
  EUROCRYPT: "EUROCRYPT",
  PETS: "PETS",
  EuroSP: "EURO S&P",
  VehicleSec: "VehicleSec",
  TITS: "IEEE T-ITS",
  TVT: "IEEE TVT",
  VC: "Veh. Comms.",
  TIFS: "TIFS",
  TDSC: "TDSC",
  COMPSEC: "Comp. & Sec.",
  TOPS: "ACM TOPS",
  TOCS: "ACM TOCS",
  TIOT: "ACM TIOT",
  WISEC: "WiSec",
  COMNET: "Comput. Netw.",
  COMST: "IEEE COMST",
  COMMAG: "IEEE Comm. Mag.",
  COMSTDMAG: "Comm. Std. Mag.",
  IOTJ: "IEEE IoT-J",
  JSAC: "IEEE JSAC",
  IEEENET: "IEEE Network",
  NETLET: "Netw. Lett.",
  IEEESP: "IEEE S&P Mag.",
  SYSJ: "IEEE Syst. J.",
  TCCN: "IEEE TCCN",
  TCOM: "IEEE TCOM",
  TWC: "IEEE TWC",
  WCMAG: "Wireless Comm.",
  TON: "IEEE/ACM ToN",
  PACMNET: "ACM PACMNET",
};

/**
 * All venue keys (every venue that exists in the dataset).
 */
const ALL_VENUES = [
  "CCS",
  "NDSS",
  "USENIX",
  "SP",
  "CRYPTO",
  "EUROCRYPT",
  "PETS",
  "EuroSP",
  "VehicleSec",
  "TITS",
  "TVT",
  "VC",
  "TIFS",
  "TDSC",
  "COMPSEC",
  "TOPS",
  "TOCS",
  "TIOT",
  "WISEC",
  "COMNET",
  "COMST",
  "COMMAG",
  "COMSTDMAG",
  "IOTJ",
  "JSAC",
  "IEEENET",
  "NETLET",
  "IEEESP",
  "SYSJ",
  "TCCN",
  "TCOM",
  "TWC",
  "WCMAG",
  "TON",
  "PACMNET",
];

/**
 * Grouped venues — drives the collapsible filter sub-menus.
 * Each group renders as one dropdown in the filter bar.
 * `dot` is the small color indicator shown on the dropdown trigger.
 */
const VENUE_GROUPS = [
  {
    id: "conf",
    label: "Conferences",
    dot: "#2563eb",
    venues: [
      "CCS",
      "NDSS",
      "USENIX",
      "SP",
      "CRYPTO",
      "EUROCRYPT",
      "PETS",
      "EuroSP",
      "VehicleSec",
      "WISEC",
    ],
  },
  {
    id: "journals",
    label: "Security Journals",
    dot: "#6366f1",
    venues: ["TIFS", "TDSC", "COMPSEC", "TOPS", "IEEESP"],
  },
  {
    id: "vehicular",
    label: "Vehicular & ITS",
    dot: "#10b981",
    venues: ["TITS", "TVT", "VC"],
  },
  {
    id: "comms",
    label: "Networking & Communications",
    dot: "#38bdf8",
    venues: [
      "TON",
      "JSAC",
      "TCOM",
      "TWC",
      "TCCN",
      "COMST",
      "COMNET",
      "IOTJ",
      "TOCS",
      "TIOT",
      "SYSJ",
      "PACMNET",
      "IEEENET",
      "NETLET",
      "COMMAG",
      "COMSTDMAG",
      "WCMAG",
    ],
  },
];

/**
 * Venues selected by default on first load (A* / top-tier only).
 * Everything else is opt-in via the dropdowns.
 */
const DEFAULT_VENUES = ["CCS", "NDSS", "USENIX", "SP", "CRYPTO", "EUROCRYPT"];

/**
 * Paper-type options for the Type dropdown.
 *
 * NOTE: the current dataset only distinguishes `isWorkshop` (true/false).
 * "poster" and "demo" are defined here so the UI is ready, but they will only
 * have any effect once the build pipeline tags papers with a `paperType` field
 * (see INTEGRATION.md → "Tagging posters/demos"). Until then, mapping is:
 *   isWorkshop === true  -> "workshop"
 *   isWorkshop === false -> "full"
 */
const PAPER_TYPES = [
  { key: "full", name: "Full papers" },
  { key: "workshop", name: "Workshops" },
  { key: "poster", name: "Posters" },
  { key: "demo", name: "Demos" },
];

/** Resolve a paper's type key from its data fields. */
function paperTypeOf(paper) {
  if (paper.paperType) return paper.paperType; // future-proof
  return paper.isWorkshop ? "workshop" : "full";
}
