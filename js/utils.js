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
 * Full venue names (shown under the short code in the filter dropdowns and as
 * tooltips). Mirror scripts/config.js `fullName` when venues change.
 */
const VENUE_FULLNAMES = {
  CCS: "ACM Conference on Computer and Communications Security",
  NDSS: "Network and Distributed System Security Symposium",
  USENIX: "USENIX Security Symposium",
  SP: "IEEE Symposium on Security and Privacy",
  CRYPTO: "Annual International Cryptology Conference",
  EUROCRYPT:
    "Intl. Conference on the Theory and Application of Cryptographic Techniques",
  PETS: "Privacy Enhancing Technologies Symposium",
  EuroSP: "IEEE European Symposium on Security and Privacy",
  VehicleSec: "ISOC Symposium on Vehicle Security and Privacy",
  TITS: "IEEE Transactions on Intelligent Transportation Systems",
  TVT: "IEEE Transactions on Vehicular Technology",
  VC: "Vehicular Communications",
  TIFS: "IEEE Transactions on Information Forensics and Security",
  TDSC: "IEEE Transactions on Dependable and Secure Computing",
  COMPSEC: "Computers & Security",
  TOPS: "ACM Transactions on Privacy and Security",
  TOCS: "ACM Transactions on Computer Systems",
  TIOT: "ACM Transactions on Internet of Things",
  WISEC:
    "ACM Conference on Security and Privacy in Wireless and Mobile Networks",
  COMNET: "Computer Networks (Elsevier)",
  COMST: "IEEE Communications Surveys & Tutorials",
  COMMAG: "IEEE Communications Magazine",
  COMSTDMAG: "IEEE Communications Standards Magazine",
  IOTJ: "IEEE Internet of Things Journal",
  JSAC: "IEEE Journal on Selected Areas in Communications",
  IEEENET: "IEEE Network",
  NETLET: "IEEE Networking Letters",
  IEEESP: "IEEE Security & Privacy (Magazine)",
  SYSJ: "IEEE Systems Journal",
  TCCN: "IEEE Transactions on Cognitive Communications and Networking",
  TCOM: "IEEE Transactions on Communications",
  TWC: "IEEE Transactions on Wireless Communications",
  WCMAG: "IEEE Wireless Communications",
  TON: "IEEE/ACM Transactions on Networking",
  PACMNET: "Proceedings of the ACM on Networking",
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
      "TVT",
      "VC",
      "TOCS",
      "TIOT",
      "SYSJ",
      "PACMNET",
      "IEEENET",
      "NETLET",
      "COMMAG",
      "COMSTDMAG",
      "WCMAG",
      "TITS"
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
