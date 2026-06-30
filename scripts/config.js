// Venue configuration for SLS (Security Literature Search)
// To add a new conference/journal: add an entry here, add it to the relevant
// group in js/utils.js (VENUE_GROUPS), add a --color-<KEY> in css/style.css,
// then rebuild (npm run build-data-quick).

export const VENUES = [
// -- Networking / Systems ----------------------------------
{
key: "SIGCOMM",
name: "SIGCOMM",
fullName: "ACM SIGCOMM Conference",
color: "#22c55e",
dblpQuery: "venue:SIGCOMM:",
},
{
key: "NSDI",
name: "NSDI",
fullName: "USENIX Networked Systems Design and Implementation",
color: "#3b82f6",
dblpQuery: "venue:NSDI:",
},
{
key: "INFOCOM",
name: "INFOCOM",
fullName: "IEEE INFOCOM",
color: "#ef4444",
dblpQuery: "venue:INFOCOM:",
},
{
key: "CONEXT",
name: "CoNEXT",
fullName: "ACM Conference on Emerging Networking Experiments and Technologies",
color: "#a855f7",
dblpQuery: "venue:CoNEXT:",
},
{
key: "IMC",
name: "IMC",
fullName: "ACM Internet Measurement Conference",
color: "#d97706",
dblpQuery: "venue:IMC:",
},
{
key: "MOBICOM",
name: "MobiCom",
fullName: "ACM International Conference on Mobile Computing and Networking",
color: "#06b6d4",
dblpQuery: "venue:MobiCom:",
},
{
key: "EUROSYS",
name: "EuroSys",
fullName: "European Conference on Computer Systems",
color: "#14b8a6",
dblpQuery: "venue:EuroSys:",
},
{
key: "OSDI",
name: "OSDI",
fullName: "USENIX Symposium on Operating Systems Design and Implementation",
color: "#f97316",
dblpQuery: "venue:OSDI:",
},
{
key: "SOSP",
name: "SOSP",
fullName: "ACM Symposium on Operating Systems Principles",
color: "#6366f1",
dblpQuery: "venue:SOSP:",
},

// -- ML / AI -----------------------------------------------
{
key: "NEURIPS",
name: "NeurIPS",
fullName: "Conference on Neural Information Processing Systems",
color: "#16a34a",
dblpQuery: "venue:NeurIPS:",
},
{
key: "ICML",
name: "ICML",
fullName: "International Conference on Machine Learning",
color: "#0ea5e9",
dblpQuery: "venue:ICML:",
},
{
key: "ICLR",
name: "ICLR",
fullName: "International Conference on Learning Representations",
color: "#8b5cf6",
dblpQuery: "venue:ICLR:",
},
{
key: "AAAI",
name: "AAAI",
fullName: "AAAI Conference on Artificial Intelligence",
color: "#f59e0b",
dblpQuery: "venue:AAAI:",
},
{
key: "AISTATS",
name: "AISTATS",
fullName: "International Conference on Artificial Intelligence and Statistics",
color: "#f43f5e",
dblpQuery: "venue:AISTATS:",
},
{
key: "KDD",
name: "KDD",
fullName: "ACM SIGKDD Conference on Knowledge Discovery and Data Mining",
color: "#84cc16",
dblpQuery: "venue:KDD:",
},
{
key: "WWW",
name: "WWW",
fullName: "The Web Conference",
color: "#2dd4bf",
dblpQuery: "venue:WWW:",
},

// -- ML Systems --------------------------------------------
{
key: "MLSYS",
name: "MLSys",
fullName: "Conference on Machine Learning and Systems",
color: "#e879f9",
dblpQuery: "venue:MLSys:",
},

// -- ABR / Streaming / Multimedia -------------------------
{
key: "NOSSDAV",
name: "NOSSDAV",
fullName: "Network and Operating Systems Support for Digital Audio and Video",
color: "#38bdf8",
dblpQuery: "venue:NOSSDAV:",
},
{
key: "MMSYS",
name: "MMSys",
fullName: "ACM Multimedia Systems Conference",
color: "#4ade80",
dblpQuery: "venue:MMSys:",
},
{
key: "ACMMM",
name: "ACM MM",
fullName: "ACM Multimedia",
color: "#fdba74",
dblpQuery: "venue:ACM Multimedia:",
},

// -- XAI / Interpretability -------------------------------
{
key: "FACT",
name: "FAccT",
fullName: "ACM Conference on Fairness, Accountability and Transparency",
color: "#9333ea",
dblpQuery: "venue:FAccT:",
},
{
key: "AIES",
name: "AIES",
fullName: "AAAI/ACM Conference on AI, Ethics, and Society",
color: "#ec4899",
dblpQuery: "venue:AIES:",
},

// -- RL ---------------------------------------------------
{
key: "AAMAS",
name: "AAMAS",
fullName: "International Conference on Autonomous Agents and Multiagent Systems",
color: "#facc15",
dblpQuery: "venue:AAMAS:",
},

// -- Journals ---------------------------------------------
{
key: "TON",
name: "IEEE/ACM ToN",
fullName: "IEEE/ACM Transactions on Networking",
color: "#86efac",
dblpQuery: "stream:journals/ton:",
},
{
key: "JSAC",
name: "IEEE JSAC",
fullName: "IEEE Journal on Selected Areas in Communications",
color: "#818cf8",
dblpQuery: "stream:journals/jsac:",
},
{
key: "JMLR",
name: "JMLR",
fullName: "Journal of Machine Learning Research",
color: "#fb7185",
dblpQuery: "stream:journals/jmlr:",
},
{
key: "COMST",
name: "IEEE COMST",
fullName: "IEEE Communications Surveys & Tutorials",
color: "#4ade80",
dblpQuery: "stream:journals/comsur:",
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
export const DBLP_MAX_RESULTS = 10000;
