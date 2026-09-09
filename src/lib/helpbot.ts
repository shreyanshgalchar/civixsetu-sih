// CivixSetu HelpBot — offline rule-based assistant + multilingual intent.
// Deterministic, fast, no network. Tuned to answer civic questions + guide the user.

export interface BotMessage {
  id: string;
  from: "bot" | "user";
  text: string;
  ts: number;
  kind?: "text" | "action" | "suggestion";
  actions?: { label: string; link: string }[];
  suggestions?: string[];
  confidence?: number;
  liked?: boolean;
}

interface Rule {
  intents: string[];
  keywords: string[];
  answers: string[];
  actions?: { label: string; link: string }[];
  suggestions?: string[];
}

const RULES: Rule[] = [
  {
    intents: ["report", "complaint", "file"],
    keywords: ["report", "complaint", "file", "submit", "register", "issue batao", "shikayat"],
    answers: [
      "You can file a report in under a minute — in any language. Tap “New Report”, describe the problem (voice or text in हिन्दी, తెలుగు, Tamil, Hinglish… anything), and Setu AI auto-translates it to an English summary, picks the right department and sets a priority + SLA.",
      "To raise a civic issue, go to the New Report page. Type or speak in any Indian language — the AI handles the English summary and department routing for you. Add your location (GPS works) and a photo.",
    ],
    actions: [{ label: "📝 New Report", link: "/citizen/report" }],
    suggestions: ["How are reports tracked?", "Which department handles potholes?"],
  },
  {
    intents: ["track", "status"],
    keywords: ["track", "status", "where is my", "progress", "timeline", "update", "kahan", "my report"],
    answers: [
      "Every report has a live public timeline. Open “My Reports” → tap any case to see its status (Reported → AI Verified → In Progress → Resolved), the assigned department, SLA timer and every action logged with timestamps.",
      "You can track any report in “My Reports”. Each card shows its current status, AI confidence, priority and a full audit timeline of who did what and when.",
    ],
    actions: [{ label: "🗂 My Reports", link: "/citizen/reports" }],
    suggestions: ["How do I upvote an issue?", "What is karma?"],
  },
  {
    intents: ["department", "route", "which"],
    keywords: ["department", "which department", "route", "routed", "who handles", "kaunsa", "pothole department", "classification"],
    answers: [
      "Setu AI auto-detects the department — there's no manual dropdown. It scores 8 departments: Public Works (roads), Solid Waste (garbage), Electrical (lights), Water Board, Sewerage (drains), Horticulture (parks), Traffic Police and Veterinary (stray animals).",
      "Department routing is automatic and shown as a confidence score (e.g. “Public Works Dept. · 99% confidence”). The AI reads keywords + native-language terms to pick the right desk.",
    ],
    suggestions: ["Which department handles potholes?", "How does the AI route reports?"],
  },
  {
    intents: ["ai"],
    keywords: ["ai", "how does", "triage", "artificial", "engine", "language", "translate", "multilingual", "summaries"],
    answers: [
      "Setu AI runs entirely on-device — no internet needed. It: (1) detects the language/script (Devanagari, Telugu, Tamil, Kannada, Bengali, Gujarati, Odia, Punjabi, Urdu, Hinglish…), (2) translates to a clean English summary for officers, (3) classifies the department, (4) sets severity, priority and SLA — in ~8 seconds.",
      "The triage is multilingual-in → English-out. A citizen writes in their own language; the officer sees a readable English summary plus a per-phrase translation, so nothing gets lost.",
    ],
    suggestions: ["Tell me about karma", "How do I register?"],
  },
  {
    intents: ["upvote", "vote"],
    keywords: ["upvote", "vote", "support", "priority", "up voter", "like"],
    answers: [
      "Upvoting pushes urgent issues up the municipal queue. When you see a problem that affects you too, tap ▲ Upvote on its card — more votes = higher priority.",
      "Upvoting is community signal. Reports with more votes get surfaced first to officers. You can only upvote to show support; the report owner still owns the case.",
    ],
    suggestions: ["How do I track my reports?", "What is karma?"],
  },
  {
    intents: ["karma", "streak", "points"],
    keywords: ["karma", "streak", "points", "reward", "score", "leaderboard", "ranking", "badge"],
    answers: [
      "Karma = verified reports × speed × community votes. More verified reports and faster follow-ups grow your score and streak, climbing the Changemaker leaderboard.",
      "Every verified report earns you karma. Keep a daily streak and help your ward — your rank updates in the Citizens leaderboard.",
    ],
    actions: [{ label: "🏆 Leaderboard", link: "/citizen/leaderboard" }],
    suggestions: ["Tell me about the AI", "How do I report?"],
  },
  {
    intents: ["register", "signup", "account"],
    keywords: ["register", "signup", "sign up", "create account", "account"],
    answers: [
      "You can create an account in seconds. Choose Citizen (report & track) or Officer (review & resolve). Demo accounts are pre-loaded: citizen@civixsetu.demo / citizen123 and officer@civixsetu.demo / officer123.",
      "Sign up at the login page. Pick your role — Citizen or Officer — and you'll be taken to the right workspace automatically.",
    ],
    actions: [{ label: "🔐 Login / Register", link: "/login" }],
  },
  {
    intents: ["pothole", "roads"],
    keywords: ["pothole", "road", "gaddha", "sadak", "footpath"],
    answers: [
      "Potholes, broken roads and footpaths are handled by the Public Works Dept. (PWD). Report with the exact street/landmark and a photo; the AI auto-routes there and targets a ~2-day SLA.",
    ],
    actions: [{ label: "📝 Report a pothole", link: "/citizen/report" }],
    suggestions: ["Which department handles garbage?", "How does AI route?"],
  },
  {
    intents: ["garbage", "sanitation"],
    keywords: ["garbage", "trash", "waste", "kachra", "kooda", "dump", "dumping"],
    answers: [
      "Garbage, waste and sanitation issues go to Solid Waste Management. Include the bin/street and whether it's regular collection or illegal dumping.",
    ],
    actions: [{ label: "📝 Report garbage", link: "/citizen/report" }],
    suggestions: ["Which department handles water?", "How do I track?"],
  },
  {
    intents: ["water", "leak"],
    keywords: ["water", "paani", "leak", "supply", "tanker", "no water"],
    answers: [
      "Water supply, leaks and quality issues go to the Water Board. If it's no-water or contamination, it auto-escalates faster (highest citizen anxiety). Report the street/standpost and how many households are affected.",
    ],
    actions: [{ label: "📝 Report water issue", link: "/citizen/report" }],
    suggestions: ["Which department handles drains?", "How does AI triage?"],
  },
  {
    intents: ["sla", "time", "days"],
    keywords: ["sla", "how long", "time", "days", "hours", "eta", "when resolved", "deadline"],
    answers: [
      "Each department has a target SLA (e.g. 2 days for roads, 1 day for garbage, 2 days for water). The report card shows a live SLA timer; critical cases auto-escalate 2× faster.",
      "SLA targets: Sanitation 1 day, Roads 2, Water 2, Streetlights 2, Drains 2, Parks 3, Traffic 3, Animals 3 days. Critical severity gets priority routing.",
    ],
    suggestions: ["How do I track?", "Tell me about the AI"],
  },
  {
    intents: ["photo", "image", "evidence"],
    keywords: ["photo", "image", "picture", "evidence", "attach"],
    answers: [
      "Yes — add a photo when reporting. It helps the AI verify and gives officers evidence. We also attach an illustrative reference image for the detected issue type, and you can add your own on the report form.",
    ],
    suggestions: ["How do I report?", "Which department?"],
  },
  {
    intents: ["voice", "speak"],
    keywords: ["voice", "speak", "audio", "record", "mic", "speech"],
    answers: [
      "Voice input is built in — tap the mic on the report form and speak in English, हिन्दी, తెలుగు, Tamil, etc. We also support 12 languages (the record button uses your browser's speech engine).",
    ],
    actions: [{ label: "🎙 Try voice report", link: "/citizen/report" }],
    suggestions: ["Tell me about the AI", "How do I report?"],
  },
  {
    intents: ["officer", "role"],
    keywords: ["officer", "role", "employee", "admin", "operator", "staff"],
    answers: [
      "Officers get a separate workspace: review the AI-verified queue, re-route, assign crews, add escalation notes and resolve with an audit trail. Sign in as the demo officer: officer@civixsetu.demo / officer123.",
    ],
    actions: [{ label: "🛡 Officer login", link: "/login?role=officer" }],
  },
  {
    intents: ["hello", "hi", "help", "start"],
    keywords: ["hello", "hi", "hey", "help", "namaste", "start", "what can you"],
    answers: [
      "Namaste! 👋 I'm Setu. I can help you report a civic issue, track one, explain how the AI routes/translates, or tell you about karma & leaderboards. What would you like to do?",
      "Hi! I'm Setu, your civic assistant. Ask me anything — like “how do I report a pothole?” or “which department handles water?”.",
    ],
    suggestions: ["How do I report?", "Tell me about the AI", "Which department handles potholes?"],
  },
  {
    intents: ["thanks"],
    keywords: ["thanks", "thank", "thank you", "dhanyavad", "shukriya", "ok", "okay"],
    answers: [
      "You're welcome! Glad I could help. Keep up the great work for your city. 🌆",
      "Anytime! If you need anything else, just ask. Your city is better because of you.",
    ],
    suggestions: ["How do I report?", "Track my report"],
  },
];

const HELLO = RULES.find((r) => r.intents.includes("hello"))!;

// Simple tokenizer for intents (handles latin + a few native markers)
function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f\u0980-\u09ff\u0c00-\u0c7f\u0b80-\u0bff]/g, " ").split(/\s+/).filter((w) => w.length > 1);
}

function scoreRule(text: string, rule: Rule): number {
  const tokens = tokenize(text);
  let score = 0;
  for (const kw of rule.keywords) {
    if (text.toLowerCase().includes(kw)) score += 3;
    else if (tokens.some((t) => t.startsWith(kw.slice(0, 4)))) score += 1;
  }
  return score;
}

export function askBot(input: string): { text: string; actions?: BotMessage["actions"]; suggestions?: string[]; confidence: number; intent: string } {
  const text = input.trim();
  if (!text) return { text: "Please tell me what you need help with.", confidence: 0, intent: "none" };
  let best = HELLO, bestScore = -1;
  for (const r of RULES) {
    const s = scoreRule(text, r);
    if (s > bestScore) { bestScore = s; best = r; }
  }
  if (bestScore <= 0) {
    // fallback: attempt to classify by matching department-style content
    const deptHint = /pothole|road|gaddha|sadak/.test(text) ? "roads"
      : /garbage|trash|kachra|kooda/i.test(text) ? "sanitation"
      : /light|bijli|streetlight/i.test(text) ? "streetlights"
      : /water|paani|leak/i.test(text) ? "water"
      : /drain|sewage|naali/i.test(text) ? "drainage"
      : /park|tree|ped|garden/i.test(text) ? "parks"
      : /traffic|signal|parking|jam/i.test(text) ? "traffic"
      : /cow|dog|cattle|animal|janwar/i.test(text) ? "animals" : "";
    if (deptHint) {
      const label = { roads: "Public Works (roads)", sanitation: "Solid Waste (garbage)", streetlights: "Electrical (lights)", water: "Water Board", drainage: "Sewerage (drains)", parks: "Horticulture (parks)", traffic: "Traffic Police", animals: "Veterinary (stray animals)" }[deptHint];
      return { text: `That sounds like a **${label}** issue. I can help you file it — tap below and describe the problem; the AI will route it automatically.`, actions: [{ label: "📝 File it now", link: "/citizen/report" }], suggestions: ["How do I track?", "Tell me about the AI"], confidence: 0.6, intent: deptHint };
    }
    return {
      text: "I'm not 100% sure about that one, but I'm here for civic help. You can ask me about reporting, tracking, departments, the AI, karma, or SLAs — or just file a report directly.",
      actions: [{ label: "📝 New Report", link: "/citizen/report" }],
      suggestions: ["How do I report?", "Which department handles potholes?", "Tell me about the AI"],
      confidence: 0.2, intent: "unknown",
    };
  }
  const answer = best.answers[Math.floor(Math.random() * best.answers.length)];
  return { text: answer, actions: best.actions, suggestions: best.suggestions, confidence: Math.min(0.99, 0.5 + bestScore * 0.08), intent: best.intents[0] };
}
