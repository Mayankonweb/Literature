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
  // {
  //   key: "PETS",
  //   name: "PETS",
  //   fullName: "Privacy Enhancing Technologies Symposium",
  //   color: "#0d9488",
  //   // PETS proceedings are published as PoPETs (Proceedings on Privacy
  //   // Enhancing Technologies). Verify the hit count before committing:
  //   //   https://dblp.org/search/publ/api?q=stream:journals/popets:&format=json&h=0
  //   dblpQuery: "stream:journals/popets:",
  // },
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
  // {
  //   key: "TITS",
  //   name: "IEEE T-ITS",
  //   fullName: "IEEE Transactions on Intelligent Transportation Systems",
  //   color: "#10b981",
  //   dblpQuery: "stream:journals/tits:",
  // },
  // {
  //   key: "TVT",
  //   name: "IEEE TVT",
  //   fullName: "IEEE Transactions on Vehicular Technology",
  //   color: "#8b5cf6",
  //   dblpQuery: "stream:journals/tvt:",
  // },
  // {
  //   key: "VC",
  //   name: "Veh. Comms.",
  //   fullName: "Vehicular Communications",
  //   color: "#84cc16",
  //   dblpQuery: "stream:journals/vc:",
  // },
  // {
  //   key: "TIFS",
  //   name: "TIFS",
  //   fullName: "IEEE Transactions on Information Forensics and Security",
  //   color: "#f59e0b",
  //   dblpQuery: "stream:journals/tifs:",
  // },
  // {
  //   key: "TDSC",
  //   name: "TDSC",
  //   fullName: "IEEE Transactions on Dependable and Secure Computing",
  //   color: "#fda4af",
  //   dblpQuery: "stream:journals/tdsc:",
  // },
  {
    key: "COMPSEC",
    name: "Comp. & Sec.",
    fullName: "Computers & Security",
    color: "#6366f1",
    dblpQuery: "stream:journals/compsec:",
  },

  // ── Networking / communications / systems venues ──────────
  // DBLP stream slugs verified against https://dblp.org/db/journals/<slug>/
  // {
  //   key: "TOPS",
  //   name: "ACM TOPS",
  //   fullName: "ACM Transactions on Privacy and Security",
  //   color: "#a3e635",
  //   // Formerly TISSEC; DBLP still keys the stream as tissec.
  //   dblpQuery: "stream:journals/tissec:",
  // },
  // {
  //   key: "TOCS",
  //   name: "ACM TOCS",
  //   fullName: "ACM Transactions on Computer Systems",
  //   color: "#fb7185",
  //   dblpQuery: "stream:journals/tocs:",
  // },
  // {
  //   key: "TIOT",
  //   name: "ACM TIOT",
  //   fullName: "ACM Transactions on Internet of Things",
  //   color: "#2dd4bf",
  //   dblpQuery: "stream:journals/tiot:",
  // },
  {
    key: "WISEC",
    name: "WiSec",
    fullName:
      "ACM Conference on Security and Privacy in Wireless and Mobile Networks",
    color: "#e879f9",
    dblpQuery: "venue:WISEC:",
  },
  // {
  //   key: "COMNET",
  //   name: "Comput. Netw.",
  //   fullName: "Computer Networks (Elsevier)",
  //   color: "#38bdf8",
  //   dblpQuery: "stream:journals/cn:",
  // },
  {
    key: "COMST",
    name: "IEEE COMST",
    fullName: "IEEE Communications Surveys & Tutorials",
    color: "#4ade80",
    dblpQuery: "stream:journals/comsur:",
  },
  // {
  //   key: "COMMAG",
  //   name: "IEEE Comm. Mag.",
  //   fullName: "IEEE Communications Magazine",
  //   color: "#fcd34d",
  //   dblpQuery: "stream:journals/cm:",
  // },
  {
    key: "COMSTDMAG",
    name: "IEEE Comm. Std. Mag.",
    fullName: "IEEE Communications Standards Magazine",
    color: "#fdba74",
    dblpQuery: "stream:journals/csm:",
  },
  // {
  //   key: "IOTJ",
  //   name: "IEEE IoT-J",
  //   fullName: "IEEE Internet of Things Journal",
  //   color: "#67e8f9",
  //   dblpQuery: "stream:journals/iotj:",
  // },
  // {
  //   key: "JSAC",
  //   name: "IEEE JSAC",
  //   fullName: "IEEE Journal on Selected Areas in Communications",
  //   color: "#818cf8",
  //   dblpQuery: "stream:journals/jsac:",
  // },
  // {
  //   key: "IEEENET",
  //   name: "IEEE Network",
  //   fullName: "IEEE Network",
  //   color: "#c4b5fd",
  //   dblpQuery: "stream:journals/network:",
  // },
  {
    key: "NETLET",
    name: "IEEE Netw. Lett.",
    fullName: "IEEE Networking Letters",
    color: "#f0abfc",
    dblpQuery: "stream:journals/ieeenl:",
  },
  {
    key: "IEEESP",
    name: "IEEE S&P Mag.",
    fullName: "IEEE Security & Privacy (Magazine)",
    color: "#facc15",
    dblpQuery: "stream:journals/ieeesp:",
  },
  // {
  //   key: "SYSJ",
  //   name: "IEEE Syst. J.",
  //   fullName: "IEEE Systems Journal",
  //   color: "#5eead4",
  //   dblpQuery: "stream:journals/sj:",
  // },
  // {
  //   key: "TCCN",
  //   name: "IEEE TCCN",
  //   fullName: "IEEE Transactions on Cognitive Communications and Networking",
  //   color: "#93c5fd",
  //   dblpQuery: "stream:journals/tccn:",
  // },
  // {
  //   key: "TCOM",
  //   name: "IEEE TCOM",
  //   fullName: "IEEE Transactions on Communications",
  //   color: "#fca5a5",
  //   dblpQuery: "stream:journals/tcom:",
  // },
  {
    key: "TWC",
    name: "IEEE TWC",
    fullName: "IEEE Transactions on Wireless Communications",
    color: "#d8b4fe",
    dblpQuery: "stream:journals/twc:",
  },
  {
    key: "WCMAG",
    name: "IEEE Wireless Comm.",
    fullName: "IEEE Wireless Communications",
    color: "#7dd3fc",
    dblpQuery: "stream:journals/wc:",
  },
  {
    key: "TON",
    name: "IEEE/ACM ToN",
    fullName: "IEEE/ACM Transactions on Networking",
    color: "#86efac",
    dblpQuery: "stream:journals/ton:",
  },
  {
    key: "PACMNET",
    name: "ACM PACMNET",
    fullName: "Proceedings of the ACM on Networking",
    color: "#fda4af",
    dblpQuery: "stream:journals/pacmnet:",
  },
];

// Journal venues are capped to their newest N entries at build time (the
// back-catalog grows without bound and isn't what this tool is for).
// Conferences keep their full history.
export const JOURNAL_MAX_ENTRIES = 2000;

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
export const DBLP_MAX_RESULTS = 5000;
