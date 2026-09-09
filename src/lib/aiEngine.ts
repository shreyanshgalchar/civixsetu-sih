/* =====================================================================
   CivixSetu Language & Triage Engine
   ---------------------------------------------------------------------
   Everything runs client-side (offline, instant, no API key).
   Pipeline:  Listen/Speak -> detectLanguage -> EnglishSummary
              -> auto classify DEPARTMENT -> severity -> entities -> verdict
   ===================================================================== */

import { DEPARTMENTS } from "./departments";

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface DeptScore {
  id: string;
  name: string;
  score: number;
  confidence: number;
}

export interface Analysis {
  raw: string;
  lang: string;            // human label e.g. "Hindi (Devanagari)"
  langCode: string;        // "hin", "tel", "eng", "hing"...
  script: string;          // "Devanagari" | "Latin" | ...
  englishSummary: string;
  translations: string[];
  departments: DeptScore[];   // all, sorted desc
  dept: DeptScore;            // best
  severity: Severity;
  urgency: number;            // 0-100
  priorityScore: number;      // 0-100
  slaDays: number;
  reasons: string[];          // human reasons for the verdict
  entities: {
    location?: string;
    counts: Record<string, number>;
    landmarks: string[];
  };
  isHinglish: boolean;
  detectedScripts: string[];
  tokens: string[];
}

/* ----------------------- Unicode script detection ------------------- */
const SCRIPT_RANGES: [string, [number, number]][] = [
  ["Devanagari", [0x0900, 0x097f]],
  ["Bengali", [0x0980, 0x09ff]],
  ["Gurmukhi", [0x0a00, 0x0a7f]],
  ["Gujarati", [0x0a80, 0x0aff]],
  ["Oriya", [0x0b00, 0x0b7f]],
  ["Tamil", [0x0b80, 0x0bff]],
  ["Telugu", [0x0c00, 0x0c7f]],
  ["Kannada", [0x0c80, 0x0cff]],
  ["Malayalam", [0x0d00, 0x0d7f]],
  ["Arabic", [0x0600, 0x06ff]],
];

const LANG_BY_SCRIPT: Record<string, string> = {
  Devanagari: "Hindi / Marathi",
  Bengali: "Bengali",
  Gurmukhi: "Punjabi",
  Gujarati: "Gujarati",
  Oriya: "Odia",
  Tamil: "Tamil",
  Telugu: "Telugu",
  Kannada: "Kannada",
  Malayalam: "Malayalam",
  Arabic: "Urdu",
  Latin: "English",
};

export function detectScripts(text: string): string[] {
  const counts: Record<string, number> = {};
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    for (const [name, [lo, hi]] of SCRIPT_RANGES) {
      if (c >= lo && c <= hi) {
        counts[name] = (counts[name] || 0) + 1;
        break;
      }
    }
  }
  return Object.entries(counts)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}

/* ----------------------- Hinglish / romanized Hindi ---------------- */
// Distinctly Hindi-romanised words (NOT common English) so we don't false-positive on pure English.
const HINGLISH_MARKERS = [
  "sadak", "gaddha", "kachra", "kooda", "kuda", "paani", "pani", "bijli", "naali",
  "nalla", "gali", "rasta", "kutta", "bandar", "gaya", "gaay", "ped", "janwar",
  "nahi", "bhar", "kharab", "hai", "bahut", "sarkari", "gully", "ganda", "saaf",
  "kaccha", "chowk", "basti", "mohalla", "bada", "bahut", "andar", "bahar", "sab",
  "apni", "humare", "hamare", "bhaari", "baad", "dhoop", "koi", "kuch", "nach",
  "theek", "thik", "roza", "roz", "sarhi", "mohalla",
];

export function isHinglish(text: string): boolean {
  const t = text.toLowerCase();
  const latinWords = t.replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  if (latinWords.length < 4) return false;
  let hits = 0;
  for (const w of latinWords) {
    if (w.length >= 3 && HINGLISH_MARKERS.some((m) => w === m || w.startsWith(m.slice(0, 4)))) hits++;
  }
  return hits / latinWords.length >= 0.12 && hits >= 2;
}

/* ------------------------- normalization ---------------------------- */
function normText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const tokenize = (s: string) => normText(s).split(/[^a-z\u0900-\u097f\u0980-\u09ff\u0a00-\u0a7f\u0a80-\u0aff\u0b00-\u0b7f\u0b80-\u0bff\u0c00-\u0c7f\u0c80-\u0cff\u0d00-\u0d7f\u0600-\u06ff]+/i).filter(Boolean);

/* =====================================================================
   TRANSLATION DICTIONARIES  (original phrase -> english phrase, cat tags)
   ===================================================================== */
interface Phrase { m: string; en: string; cat: string[] }
// latin / hinglish
const LATIN: Phrase[] = [
  { m: "pothole", en: "pothole", cat: ["roads"] },
  { m: "sadak kharab", en: "damaged road", cat: ["roads"] },
  { m: "sadak", en: "road", cat: ["roads"] },
  { m: "gaddha", en: "pothole", cat: ["roads"] },
  { m: "gadda", en: "pothole", cat: ["roads"] },
  { m: "rasta", en: "road", cat: ["roads"] },
  { m: "footpath", en: "footpath", cat: ["roads"] },
  { m: "speed breaker", en: "speed breaker", cat: ["roads", "traffic"] },
  { m: "kachra", en: "garbage", cat: ["sanitation"] },
  { m: "kooda", en: "garbage", cat: ["sanitation"] },
  { m: "kuda", en: "garbage", cat: ["sanitation"] },
  { m: "kuppai", en: "garbage", cat: ["sanitation"] },
  { m: "garbage", en: "garbage", cat: ["sanitation"] },
  { m: "dumping", en: "illegal dumping", cat: ["sanitation"] },
  { m: "ganda", en: "dirty", cat: ["sanitation"] },
  { m: "saaf nahi", en: "not cleaned", cat: ["sanitation"] },
  { m: "paani", en: "water", cat: ["water"] },
  { m: "pani", en: "water", cat: ["water"] },
  { m: "pani nahi", en: "no water supply", cat: ["water"] },
  { m: "paani nahi", en: "no water supply", cat: ["water"] },
  { m: "neeru", en: "water", cat: ["water"] },
  { m: "tanker", en: "water tanker", cat: ["water"] },
  { m: "leak", en: "water leak", cat: ["water"] },
  { m: "bijli", en: "power / electricity", cat: ["streetlights"] },
  { m: "battery", en: "power", cat: ["streetlights"] },
  { m: "bijli nahi", en: "no electricity", cat: ["streetlights"] },
  { m: "light nahi", en: "no streetlight", cat: ["streetlights"] },
  { m: "streetlight", en: "streetlight", cat: ["streetlights"] },
  { m: "naali", en: "drain", cat: ["drainage"] },
  { m: "nalla", en: "drain", cat: ["drainage"] },
  { m: "drain", en: "drain", cat: ["drainage"] },
  { m: "nallah", en: "drain", cat: ["drainage"] },
  { m: "sewage", en: "sewage", cat: ["drainage"] },
  { m: "kutta", en: "stray dog", cat: ["animals"] },
  { m: "kutte", en: "stray dogs", cat: ["animals"] },
  { m: "bandar", en: "monkey", cat: ["animals"] },
  { m: "gaya", en: "stray cattle", cat: ["animals"] },
  { m: "gaay", en: "gau / cow", cat: ["animals"] },
  { m: "janwar", en: "animal", cat: ["animals"] },
  { m: "ped", en: "tree", cat: ["parks"] },
  { m: "tree gir", en: "fallen tree", cat: ["parks"] },
  { m: "park", en: "park", cat: ["parks"] },
  { m: "garden", en: "garden", cat: ["parks"] },
  { m: "traffic", en: "traffic", cat: ["traffic"] },
  { m: "traffic jam", en: "traffic jam", cat: ["traffic"] },
  { m: "gadi", en: "vehicle", cat: ["traffic"] },
  { m: "signal", en: "traffic signal", cat: ["traffic"] },
  { m: "school", en: "school", cat: [] },
  { m: "hospital", en: "hospital", cat: [] },
  { m: "mandir", en: "temple", cat: [] },
  { m: "nagar", en: "neighbourhood", cat: [] },
  { m: "basti", en: "settlement", cat: [] },
  { m: "mohalla", en: "locality", cat: [] },
  { m: "chowk", en: "junction", cat: [] },
];

const DEVANAGARI: Phrase[] = [
  { m: "सड़क", en: "road", cat: ["roads"] },
  { m: "सड़क खराब", en: "damaged road", cat: ["roads"] },
  { m: "गड्ढा", en: "pothole", cat: ["roads"] },
  { m: "रास्ता", en: "road", cat: ["roads"] },
  { m: "फुटपाथ", en: "footpath", cat: ["roads"] },
  { m: "कचरा", en: "garbage", cat: ["sanitation"] },
  { m: "कूड़ा", en: "garbage", cat: ["sanitation"] },
  { m: "कूड़े", en: "garbage", cat: ["sanitation"] },
  { m: "पानी", en: "water", cat: ["water"] },
  { m: "पानी नहीं", en: "no water supply", cat: ["water"] },
  { m: "बिजली", en: "power / electricity", cat: ["streetlights"] },
  { m: "बिजली नहीं", en: "no electricity", cat: ["streetlights"] },
  { m: "स्ट्रीट लाइट", en: "streetlight", cat: ["streetlights"] },
  { m: "नाली", en: "drain", cat: ["drainage"] },
  { m: "नाले", en: "drain", cat: ["drainage"] },
  { m: "सीवर", en: "sewage", cat: ["drainage"] },
  { m: "कुत्ता", en: "stray dog", cat: ["animals"] },
  { m: "बंदर", en: "monkey", cat: ["animals"] },
  { m: "गाय", en: "gau / cattle", cat: ["animals"] },
  { m: "जानवर", en: "animal", cat: ["animals"] },
  { m: "पेड़", en: "tree", cat: ["parks"] },
  { m: "बेंच", en: "bench", cat: ["parks"] },
  { m: "पार्क", en: "park", cat: ["parks"] },
  { m: "ट्रैफिक", en: "traffic", cat: ["traffic"] },
  { m: "सिग्नल", en: "traffic signal", cat: ["traffic"] },
  { m: "स्कूल", en: "school", cat: [] },
  { m: "अस्पताल", en: "hospital", cat: [] },
  { m: "मंदिर", en: "temple", cat: [] },
  { m: "नगर", en: "neighbourhood", cat: [] },
];

// shorter, top-complaint phrase sets for other Indian scripts
const TELUGU: Phrase[] = [
  { m: "రోడ్డు", en: "road", cat: ["roads"] },
  { m: "గుంత", en: "pothole", cat: ["roads"] },
  { m: "చెత్త", en: "garbage", cat: ["sanitation"] },
  { m: "నీళ్లు", en: "water", cat: ["water"] },
  { m: "నీరు", en: "water", cat: ["water"] },
  { m: "విద్యుత్", en: "power / electricity", cat: ["streetlights"] },
  { m: "డ్రైనేజ్", en: "drainage", cat: ["drainage"] },
  { m: "డ్రెయిన్", en: "drain", cat: ["drainage"] },
  { m: "పాఠశాల", en: "school", cat: [] },
];
const TAMIL: Phrase[] = [
  { m: "சாலை", en: "road", cat: ["roads"] },
  { m: "பள்ளம்", en: "pothole", cat: ["roads"] },
  { m: "குப்பை", en: "garbage", cat: ["sanitation"] },
  { m: "தண்ணீர்", en: "water", cat: ["water"] },
  { m: "மின்சாரம்", en: "power / electricity", cat: ["streetlights"] },
  { m: "வடிகால்", en: "drainage", cat: ["drainage"] },
  { m: "பள்ளி", en: "school", cat: [] },
];
const KANNADA: Phrase[] = [
  { m: "ರಸ್ತೆ", en: "road", cat: ["roads"] },
  { m: "ಹೊಂಡ", en: "pothole", cat: ["roads"] },
  { m: "ಕಸ", en: "garbage", cat: ["sanitation"] },
  { m: "ನೀರು", en: "water", cat: ["water"] },
  { m: "ವಿದ್ಯುತ್", en: "power / electricity", cat: ["streetlights"] },
  { m: "ಚರಂಡಿ", en: "drain", cat: ["drainage"] },
  { m: "ಶಾಲೆ", en: "school", cat: [] },
];
const BENGALI: Phrase[] = [
  { m: "রাস্তা", en: "road", cat: ["roads"] },
  { m: "গর্ত", en: "pothole", cat: ["roads"] },
  { m: "আবর্জনা", en: "garbage", cat: ["sanitation"] },
  { m: "পানি", en: "water", cat: ["water"] },
  { m: "বিদ্যুৎ", en: "power / electricity", cat: ["streetlights"] },
  { m: "নর্দমা", en: "drain", cat: ["drainage"] },
  { m: "স্কুল", en: "school", cat: [] },
];
const GUJARATI: Phrase[] = [
  { m: "રસ્તો", en: "road", cat: ["roads"] },
  { m: "ખાડો", en: "pothole", cat: ["roads"] },
  { m: "કચરો", en: "garbage", cat: ["sanitation"] },
  { m: "પાણી", en: "water", cat: ["water"] },
  { m: "વીજળી", en: "power / electricity", cat: ["streetlights"] },
  { m: "નાળો", en: "drain", cat: ["drainage"] },
  { m: "શાળા", en: "school", cat: [] },
];
const MARATHI: Phrase[] = [
  { m: "रस्ता", en: "road", cat: ["roads"] },
  { m: "खड्डा", en: "pothole", cat: ["roads"] },
  { m: "कचरा", en: "garbage", cat: ["sanitation"] },
  { m: "पाणी", en: "water", cat: ["water"] },
  { m: "वीज", en: "power / electricity", cat: ["streetlights"] },
  { m: "नाला", en: "drain", cat: ["drainage"] },
  { m: "शाळा", en: "school", cat: [] },
];
const MALAYALAM: Phrase[] = [
  { m: "റോഡ്", en: "road", cat: ["roads"] },
  { m: "കുഴി", en: "pothole", cat: ["roads"] },
  { m: "ചപ്പുകൂട്ടം", en: "garbage", cat: ["sanitation"] },
  { m: "വെള്ളം", en: "water", cat: ["water"] },
  { m: "വൈദ്യുതി", en: "power / electricity", cat: ["streetlights"] },
  { m: "ഡ്രെയിൻ", en: "drain", cat: ["drainage"] },
  { m: "സ്കൂൾ", en: "school", cat: [] },
];
const PUNJABI: Phrase[] = [
  { m: "ਸੜਕ", en: "road", cat: ["roads"] },
  { m: "ਟੋਏ", en: "pothole", cat: ["roads"] },
  { m: "ਕੂੜਾ", en: "garbage", cat: ["sanitation"] },
  { m: "ਪਾਣੀ", en: "water", cat: ["water"] },
  { m: "ਬਿਜਲੀ", en: "power / electricity", cat: ["streetlights"] },
  { m: "ਨਾਲੀ", en: "drain", cat: ["drainage"] },
  { m: "ਸਕੂਲ", en: "school", cat: [] },
];
const ODIA: Phrase[] = [
  { m: "ରାସ୍ତା", en: "road", cat: ["roads"] },
  { m: "ଗାତ", en: "pothole", cat: ["roads"] },
  { m: "ଆବର୍ଜନା", en: "garbage", cat: ["sanitation"] },
  { m: "ପାଣି", en: "water", cat: ["water"] },
  { m: "ବିଜୁଳି", en: "power / electricity", cat: ["streetlights"] },
  { m: "ଡ୍ରେନ", en: "drain", cat: ["drainage"] },
  { m: "ସ୍କୁଲ", en: "school", cat: [] },
];
const URDU: Phrase[] = [
  { m: "سڑک", en: "road", cat: ["roads"] },
  { m: "گڑھا", en: "pothole", cat: ["roads"] },
  { m: "کچرا", en: "garbage", cat: ["sanitation"] },
  { m: "پانی", en: "water", cat: ["water"] },
  { m: "بجلی", en: "power / electricity", cat: ["streetlights"] },
  { m: "نالی", en: "drain", cat: ["drainage"] },
  { m: "اسکول", en: "school", cat: [] },
];

const PHRASE_BY_SCRIPT: Record<string, Phrase[]> = {
  Devanagari: DEVANAGARI,
  Telugu: TELUGU,
  Tamil: TAMIL,
  Kannada: KANNADA,
  Bengali: BENGALI,
  Gujarati: GUJARATI,
  Malayalam: MALAYALAM,
  Gurmukhi: PUNJABI,
  Oriya: ODIA,
  Arabic: URDU,
};

/* Build a category->terms index from ALL dictionaries (native + latin).
   This lets the classifier route native-language input correctly. */
const CATEGORY_TERMS: Record<string, string[]> = {};
for (const dict of [LATIN, DEVANAGARI, TELUGU, TAMIL, KANNADA, BENGALI, GUJARATI, MARATHI, MALAYALAM, PUNJABI, ODIA, URDU]) {
  for (const p of dict) {
    for (const c of p.cat) {
      (CATEGORY_TERMS[c] ||= []).push(p.m);
    }
  }
}

function translateText(text: string, script: string, isHing: boolean): { summary: string; translations: string[] } {
  const norm = normText(text);
  const translations: string[] = [];
  const matchedEn: { en: string; idx: number }[] = [];

  // collect candidate phrase dictionaries
  const dicts: Phrase[][] = [];
  if (isHing) dicts.push(LATIN);
  const set = PHRASE_BY_SCRIPT[script];
  if (set) dicts.push(set);

  for (const dict of dicts) {
    for (const p of dict) {
      const idx = norm.indexOf(p.m);
      if (idx >= 0) {
        if (!matchedEn.some((m) => m.en === p.en)) matchedEn.push({ en: p.en, idx });
        if (!translations.some((t) => t === `${p.m} → ${p.en}`)) translations.push(`${p.m} → ${p.en}`);
      }
    }
  }
  // order english terms by their appearance in the source text
  const ordered = matchedEn.sort((a, b) => a.idx - b.idx).map((m) => m.en);
  return { summary: ordered.join(", "), translations };
}

/* =====================================================================
   DEPARTMENT CLASSIFICATION  (weighted keyword + n-gram scoring)
   ===================================================================== */
export function scoreDepartments(text: string): DeptScore[] {
  const norm = normText(text);
  const tokens = tokenize(text);
  const scores = DEPARTMENTS.map((d) => {
    let score = 0;
    const hits: string[] = [];
    // English + romanized keywords merged with native-script terms
    const terms = d.keywords.concat(CATEGORY_TERMS[d.id] || []);
    for (const kw of terms) {
      if (norm.includes(kw)) {
        const w = kw.length > 6 ? 3 : kw.length > 4 ? 2 : kw.length > 2 ? 1.4 : 1;
        score += w;
        hits.push(kw);
      }
    }
    // n-gram scoring over tokens for partial English matches
    for (const t of tokens) {
      if (t.length > 4) {
        for (const kw of d.keywords) {
          if (kw.length > 4 && (t.startsWith(kw) || kw.startsWith(t)) && Math.abs(t.length - kw.length) <= 2) {
            score += 0.5;
          }
        }
      }
    }
    // proximity boost: category icon mention
    if (d.emoji && text.includes(d.emoji)) score += 2;
    return { id: d.id, name: d.name, score, confidence: 0, hits };
  });

  const max = Math.max(...scores.map((s) => s.score));
  const sorted = scores.sort((a, b) => b.score - a.score);
  // confidence from margin between top-1 and top-2 (and absolute floor)
  const total = sorted.reduce((s, x) => s + x.score, 0) || 1;
  sorted.forEach((s, i) => {
    const margin = i === 0 && sorted[1] ? (s.score - sorted[1].score) : 0.12;
    const share = s.score / total;
    s.confidence = Math.min(0.99, Math.max(0, 0.55 + share * 0.42 + margin * 0.1));
  });
  return sorted.map(({ ...rest }) => rest);
}

/* =====================================================================
   SEVERITY / URGENCY
   ===================================================================== */
const SEV_HIGH_TERMS = [
  "accident", "child", "school", "hospital", "emergency", "drown", "drowning",
  "fire", "electrocut", "shock", "sewage", "flood", "overflow", "contaminat",
  "drinking water", "collapse", "injur", "death", "dead", "broken leg", "fatal",
  "feces", "kids", "student", "elderly", "senior", "death", "threat", "blast",
  "gas leak", "danger", "unsafe", "risk",
];
const SEV_HIGH_TERMS_NATIVE = [
  "बच्चे", "स्कूल", "अस्पताल", "आपात", "आग", "डूब", "खतरा",
  "పిల్లలు", "పాఠశాల", "ఆసుపత్రి", "ప్రమాదం",
  "குழந்தை", "பள்ளி", "மருத்துவமனை", "அபாயம்",
  "ಮಗು", "ಶಾಲೆ", "ಆಸ್ಪತ್ರೆ", "ಅಪಾಯ",
  "বাচ্চা", "স্কুল", "হাসপাতাল", "বিপদ",
];

const SEV_MED_TERMS = [
  "stink", "smell", "foul", "nuisance", "broken", "damaged", "blocked", "clog",
  "overflow", "dark", "contamination", "mosquito", "stray", "pain", "discomfort",
  "children", "residents", "many", "several", "three", "weeks", "week", "days",
];

// detect "<utility> nahi / no <utility>" in english or romanized text
function outageRegex(text: string): boolean {
  const n = normText(text);
  return /\b(paani|pani|water|bijli|biyli|battery|light)\s+nahi\b/.test(n) || /\bno (water|power|electricity|piped|supply)\b/.test(n) || n.includes("no water supply") || n.includes("water nahi") || n.includes("bijli nahi");
}

function assessSeverity(text: string, topDept: string, translatedSummary: string): { severity: Severity; urgency: number; reasons: string[] } {
  const norm = normText(text);
  const tnorm = normText(translatedSummary);
  let sevScore = 0;
  const reasons: string[] = [];

  const highHits = [...new Set([...SEV_HIGH_TERMS.filter((t) => norm.includes(t)), ...SEV_HIGH_TERMS.filter((t) => tnorm.includes(t))])];
  const highNativeHits = SEV_HIGH_TERMS_NATIVE.filter((t) => text.includes(t));
  sevScore += highHits.length * 2.2;
  sevScore += highNativeHits.length * 2.2;

  if (highHits.length > 0 || highNativeHits.length > 0) {
    reasons.push(`Safety-critical signals (${[...highHits, ...highNativeHits].slice(0, 4).join(", ")})`);
  }
  // essential utility outage — english summary OR native terms
  const devOutage = /पानी\s*नहीं|बिजली\s*नहीं|పానీ|தண்ணீர்\s*இல்லை|ನೀರು/.test(text);
  const englishOutage = outageRegex(text) || outageRegex(translatedSummary) || tnorm.includes("no water") || tnorm.includes("no electricity");
  if (devOutage || englishOutage) {
    sevScore += 3.5;
    if (!reasons.includes("Essential utility outage")) reasons.push("Essential utility outage");
  }

  const medHits = SEV_MED_TERMS.filter((t) => norm.includes(t));
  sevScore += medHits.length * 0.8;
  if (medHits.length >= 2) reasons.push("Impact affecting multiple residents");

  // department-specific escalation
  if (topDept === "water") sevScore += 2;
  if (topDept === "drainage") sevScore += 1.5;

  let severity: Severity;
  if (sevScore >= 9) severity = "CRITICAL";
  else if (sevScore >= 4.5) severity = "HIGH";
  else if (sevScore >= 1.5) severity = "MEDIUM";
  else severity = "LOW";

  const urgency = Math.min(100, Math.round(sevScore * 6.5 + (severity === "CRITICAL" ? 35 : 0)));
  return { severity, urgency, reasons };
}

/* =====================================================================
   ENTITY EXTRACTION  (location, counts, landmarks)
   ===================================================================== */
const LOC_STOP = ["and", "is", "are", "was", "were", "the", "to", "for", "of", "in", "on", "at", "a", "an", "by", "from", "with", "that", "this", "my", "our", "we", "it", "they", "has", "have", "been", "but", "so", "since", "because", "while", "waiting", "causing", "where", "which", "who", "there", "also", "very", "getting", "due", "lot"];

function extractEntities(text: string): Analysis["entities"] {
  const norm = normText(text);
  const landmarks: string[] = [];
  const locWords = [
    "near", "at", "opposite", "behind", "in front of", "beside", "next to", "junction",
    "crossing", "beyond", "corner", "opposite to", "nearby",
  ];
  const countWords = ["one", "two", "three", "four", "five", "six", "1", "2", "3", "4", "5", "6", "many", "several"];
  const counts: Record<string, number> = {};

  // Find landmark after prepositions (stop at stopwords / sentence breakers)
  const tokens = tokenize(text);
  for (let i = 0; i < tokens.length; i++) {
    if (locWords.includes(tokens[i])) {
      const parts: string[] = [];
      for (let j = i + 1; j < tokens.length && parts.length < 3; j++) {
        const w = tokens[j];
        if (LOC_STOP.includes(w) || w.length < 2 || /\d/.test(w)) break;
        if (parts.length >= 1 && w.length < 2) break;
        parts.push(w);
      }
      const cand = parts.join(" ");
      if (cand.length >= 2 && cand.length <= 40) landmarks.push(cand);
    }
  }
  // Counts
  for (const cw of countWords) {
    if (norm.includes(` ${cw} `) || norm.startsWith(cw + " ") || norm.endsWith(" " + cw)) {
      const key = ["one", "1"].includes(cw) ? "one" : cw;
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  // street/road name pattern
  let location: string | undefined;
  const streetMatch = norm.match(/([\w\u0900-\u097f\u0980-\u09ff\u0a80-\u0aff]+(?:\s+[\w\u0900-\u097f\u0980-\u09ff\u0a80-\u0aff]+)*)\s+(road|street|lane|marg|gali|chowk|market|colony|nagar)/);
  if (streetMatch) location = streetMatch[1].trim() + ", " + streetMatch[2].trim();
  else if (landmarks.length) location = landmarks[0];

  return { location, counts, landmarks: landmarks.slice(0, 4) };
}

/* =====================================================================
   TOP-LEVEL ANALYZE
   ===================================================================== */
const SEV_WEIGHT: Record<Severity, number> = { CRITICAL: 6, HIGH: 3.5, MEDIUM: 1.8, LOW: 0.6 };

export function analyze(raw: string): Analysis {
  const cleaned = raw.trim();
  const scripts = detectScripts(cleaned);
  const dominantScript = scripts[0] || "Latin";
  const hing = isHinglish(cleaned);

  const langCode =
    dominantScript === "Latin" ? (hing ? "hing" : "eng") :
      dominantScript === "Devanagari" ? "hin" :
        dominantScript === "Telugu" ? "tel" :
          dominantScript === "Tamil" ? "tam" :
            dominantScript === "Kannada" ? "kan" :
              dominantScript === "Bengali" ? "ben" :
                dominantScript === "Gujarati" ? "guj" :
                  dominantScript === "Gurmukhi" ? "pan" :
                    dominantScript === "Oriya" ? "ori" :
                      dominantScript === "Malayalam" ? "mal" :
                        dominantScript === "Arabic" ? "urd" : "eng";

  const lang = langCode === "hing" ? "Hindi (Roman / Hinglish)"
    : langCode === "eng" ? "English"
    : dominantScript === "Devanagari" ? "Hindi / Marathi"
    : LANG_BY_SCRIPT[dominantScript] || "English";

  const { summary: transSummary, translations } = translateText(cleaned, dominantScript, hing);

  const departments = scoreDepartments(cleaned);
  const dept = departments[0];
  const { severity, urgency, reasons } = assessSeverity(cleaned, dept.id, transSummary);
  const entities = extractEntities(cleaned);

  // craft English summary
  let englishSummary: string;
  const deptName = dept.name;
  if (transSummary) {
    englishSummary = `${transSummary.charAt(0).toUpperCase()}${transSummary.slice(1)}`;
    // enrich with count / location
    const countTotal = Object.values(entities.counts).reduce((a, b) => a + b, 0);
    if (entities.location) englishSummary += ` — reported near ${entities.location}.`;
    else englishSummary += ".";
  } else if (cleaned.trim().length > 0 && /^[A-Za-z0-9\s.,'!?()\/%&-]+$/.test(cleaned)) {
    // already english
    englishSummary = cleaned.replace(/\s+/g, " ").trim();
    englishSummary = englishSummary.charAt(0).toUpperCase() + englishSummary.slice(1);
    if (!/[.!?]$/.test(englishSummary)) englishSummary += ".";
  } else {
    // unknown native text -> structural summary
    const deptShort = DEPARTMENTS.find((d) => d.id === dept.id)?.short || "civic";
    englishSummary = `Citizen reported a ${deptShort.toLowerCase()} issue${entities.location ? ` near ${entities.location}` : ""}. The complaint language is ${lang}. AI extracted the core problem and routed it for human verification.`;
  }

  const priorityScore = Math.min(100, Math.round(urgency * 0.6 + SEV_WEIGHT[severity] * 6 + dept.confidence * 20));
  const slaDays = dept ? DEPARTMENTS.find((d) => d.id === dept.id)!.slaDays : 2;

  return {
    raw: cleaned,
    lang,
    langCode,
    script: dominantScript,
    englishSummary,
    translations,
    departments,
    dept,
    severity,
    urgency,
    priorityScore,
    slaDays,
    reasons,
    entities,
    isHinglish: hing,
    detectedScripts: scripts,
    tokens: tokenize(cleaned),
  };
}
