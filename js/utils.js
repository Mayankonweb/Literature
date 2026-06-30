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

```javascript
/**
 * Venue display names (short labels used in chips/menus)
 */
const VENUE_NAMES = {
  // Networking / Systems
  SIGCOMM: "SIGCOMM",
  NSDI: "NSDI",
  INFOCOM: "INFOCOM",
  CoNEXT: "CoNEXT",
  IMC: "IMC",
  MobiCom: "MobiCom",
  OSDI: "OSDI",
  SOSP: "SOSP",
  MLSYS: "MLSys",
  EuroSys: "EuroSys",

  // Networking Journals
  TON: "IEEE/ACM ToN",
  JSAC: "IEEE JSAC",
  TNETSEC: "IEEE TNSE",
  COMNET: "Comp. Netw.",
  COMST: "IEEE COMST",

  // ML / AI Conferences
  NeurIPS: "NeurIPS",
  ICML: "ICML",
  ICLR: "ICLR",
  AAAI: "AAAI",
  AISTATS: "AISTATS",
  KDD: "KDD",
  WWW: "WWW",
  ICDM: "ICDM",

  // ML Journals
  JMLR: "JMLR",
  TPAMI: "TPAMI",
  MLJ: "ML Journal",
  PR: "Pattern Rec.",

  // XAI / Interpretability
  FAccT: "FAccT",
  AIES: "AIES",

  // RL
  RLC: "RLC",
  AAMAS: "AAMAS",

  // Streaming / Multimedia
  NOSSDAV: "NOSSDAV",
  MMSys: "MMSys",
  MM: "ACM MM",

};


/**
 * Full venue names
 */
const VENUE_FULLNAMES = {
  SIGCOMM: "ACM SIGCOMM Conference",
  NSDI: "USENIX Networked Systems Design and Implementation",
  INFOCOM: "IEEE International Conference on Computer Communications",
  CoNEXT: "ACM International Conference on Emerging Networking Experiments and Technologies",
  IMC: "ACM Internet Measurement Conference",
  MobiCom: "ACM International Conference on Mobile Computing and Networking",
  OSDI: "USENIX Symposium on Operating Systems Design and Implementation",
  SOSP: "ACM Symposium on Operating Systems Principles",
  MLSYS: "Conference on Machine Learning and Systems",
  EuroSys: "European Conference on Computer Systems",

  TON: "IEEE/ACM Transactions on Networking",
  JSAC: "IEEE Journal on Selected Areas in Communications",
  TNETSEC: "IEEE Transactions on Network Science and Engineering",
  COMNET: "Computer Networks (Elsevier)",
  COMST: "IEEE Communications Surveys & Tutorials",

  NeurIPS: "Conference on Neural Information Processing Systems",
  ICML: "International Conference on Machine Learning",
  ICLR: "International Conference on Learning Representations",
  AAAI: "AAAI Conference on Artificial Intelligence",
  AISTATS: "International Conference on Artificial Intelligence and Statistics",
  KDD: "ACM SIGKDD Conference on Knowledge Discovery and Data Mining",
  WWW: "The Web Conference",
  ICDM: "IEEE International Conference on Data Mining",

  JMLR: "Journal of Machine Learning Research",
  TPAMI: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
  MLJ: "Machine Learning Journal",
  PR: "Pattern Recognition",

  FAccT: "ACM Conference on Fairness, Accountability, and Transparency",
  AIES: "AAAI/ACM Conference on AI, Ethics, and Society",

  RLC: "Reinforcement Learning Conference",
  AAMAS: "International Conference on Autonomous Agents and Multiagent Systems",

  NOSSDAV: "Network and Operating Systems Support for Digital Audio and Video",
  MMSys: "ACM Multimedia Systems Conference",
  MM: "ACM Multimedia",
};


/**
 * All venue keys
 */
const ALL_VENUES = Object.keys(VENUE_NAMES);


/**
 * Grouped venues
 */
const VENUE_GROUPS = [
  {
    id: "networking",
    label: "Networking & Systems",
    dot: "#2563eb",
    venues: [
      "SIGCOMM",
      "NSDI",
      "INFOCOM",
      "CoNEXT",
      "IMC",
      "MobiCom",
      "OSDI",
      "SOSP",
      "EuroSys",
      "MLSYS"
    ]
  },

  {
    id: "network_journals",
    label: "Networking Journals",
    dot: "#38bdf8",
    venues: [
      "TON",
      "JSAC",
      "TNETSEC",
      "COMNET",
      "COMST"
    ]
  },

  {
    id: "ml",
    label: "Machine Learning",
    dot: "#16a34a",
    venues: [
      "NeurIPS",
      "ICML",
      "ICLR",
      "AAAI",
      "AISTATS",
      "KDD",
      "WWW",
      "ICDM",
      "JMLR",
      "TPAMI",
      "MLJ",
      "PR"
    ]
  },

  {
    id: "xai",
    label: "XAI / Interpretability",
    dot: "#9333ea",
    venues: [
      "FAccT",
      "AIES"
    ]
  },

  {
    id: "rl",
    label: "Reinforcement Learning",
    dot: "#f59e0b",
    venues: [
      "RLC",
      "AAMAS"
    ]
  },

  {
    id: "streaming",
    label: "ABR / Streaming",
    dot: "#ef4444",
    venues: [
      "NOSSDAV",
      "MMSys",
      "MM"
    ]
  }

];


/**
 * Default venues (top-tier only)
 */
const DEFAULT_VENUES = [
  "SIGCOMM",
  "NSDI",
  "INFOCOM",
  "NeurIPS",
  "ICML",
  "ICLR",
  "MLSYS"
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
