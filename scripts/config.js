// Venue configuration for SLS (Security Literature Search)
// To add a new conference/journal: add an entry here, add it to the relevant
// group in js/utils.js (VENUE_GROUPS), add a --color-<KEY> in css/style.css,
// then rebuild (npm run build-data-quick).

export const VENUES = [
  {
    key: "CCS",
    name: "CCS",
    fullName: "ACM Conference on Computer and Communications Security",
    color: "#22c55e",
    dblpQuery: "venue:CCS:",
  },
  {
    key: "NDSS",
    name: "NDSS",
    fullName: "Network and Distributed System Security Symposium",
    color: "#3b82f6",
    dblpQuery: "venue:NDSS:",
  },
  {
    key: "USENIX",
    name: "USENIX Security",
    fullName: "USENIX Security Symposium",
    color: "#ef4444",
    dblpQuery: "venue:USENIX Security:",
  },
  {
    key: "SP",
    name: "IEEE S&P",
    fullName: "IEEE Symposium on Security and Privacy",
    color: "#a855f7",
    dblpQuery: "venue:SP:",
  },
  {
    key: "CRYPTO",
    name: "CRYPTO",
    fullName: "Annual International Cryptology Conference",
    color: "#d97706",
    dblpQuery: "venue:CRYPTO:",
  },
  {
    key: "EUROCRYPT",
    name: "EUROCRYPT",
    fullName:
      "International Conference on the Theory and Application of Cryptographic Techniques",
    color: "#06b6d4",
    dblpQuery: "venue:EUROCRYPT:",
  },
  {
    key: "PETS",
    name: "PETS",
    fullName: "Privacy Enhancing Technologies Symposium",
    color: "#0d9488",
    // PETS proceedings are published as PoPETs (Proceedings on Privacy
    // Enhancing Technologies). Verify the hit count before committing:
    //   https://dblp.org/search/publ/api?q=stream:journals/popets:&format=json&h=0
    dblpQuery: "stream:journals/popets:",
  },
  {
    key: "EuroSP",
    name: "EURO S&P",
    fullName: "IEEE European Symposium on Security and Privacy",
    color: "#4f46e5",
    dblpQuery: "venue:EuroS&P:",
  },
  {
    key: "VehicleSec",
    name: "VehicleSec",
    fullName: "ISOC Symposium on Vehicle Security and Privacy",
    color: "#f97316",
    dblpQuery: "venue:VehicleSec:",
  },
  {
    key: "TITS",
    name: "IEEE T-ITS",
    fullName: "IEEE Transactions on Intelligent Transportation Systems",
    color: "#10b981",
    dblpQuery: "stream:journals/tits:",
  },
  {
    key: "TVT",
    name: "IEEE TVT",
    fullName: "IEEE Transactions on Vehicular Technology",
    color: "#8b5cf6",
    dblpQuery: "stream:journals/tvt:",
  },
  {
    key: "VC",
    name: "Veh. Comms.",
    fullName: "Vehicular Communications",
    color: "#84cc16",
    dblpQuery: "stream:journals/vc:",
  },
  {
    key: "TIFS",
    name: "TIFS",
    fullName: "IEEE Transactions on Information Forensics and Security",
    color: "#f59e0b",
    dblpQuery: "stream:journals/tifs:",
  },
  {
    key: "TDSC",
    name: "TDSC",
    fullName: "IEEE Transactions on Dependable and Secure Computing",
    color: "#fda4af",
    dblpQuery: "stream:journals/tdsc:",
  },
  {
    key: "COMPSEC",
    name: "Comp. & Sec.",
    fullName: "Computers & Security",
    color: "#6366f1",
    dblpQuery: "stream:journals/compsec:",
  },
];

// DBLP API settings
export const DBLP_API_BASE = "https://dblp.org/search/publ/api";
// Smaller pages keep each request (and each retry) cheap and make large
// transfers far less likely to stall and hit a body timeout. 500 means ~20
// requests for a fully-capped venue (see DBLP_MAX_RESULTS).
export const DBLP_HITS_PER_PAGE = 500;
export const DBLP_DELAY_MS = 3000; // Delay between API requests to be polite
// DBLP's search API only serves the first 10,000 results of any query
// (responses past offset 10000 come back with an empty hit list). Results are
// returned newest-first, so this window always covers the most recent papers —
// we just can't mirror a venue's entire back-catalog beyond it.
export const DBLP_MAX_RESULTS = 10000;

// Semantic Scholar API settings
export const S2_API_BASE = "https://api.semanticscholar.org/graph/v1/paper";
export const S2_FIELDS = "abstract,citationCount,tldr,openAccessPdf";
export const S2_RATE_LIMIT = 5; // requests per second
export const S2_CACHE_DIR = "data/s2-cache";
