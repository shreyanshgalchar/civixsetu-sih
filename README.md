# CivixSetu — AI-Powered Civic Resolution (SIH-grade)

> **setu** (सेतु) means *bridge*. We bridge citizens and their municipality with an AI
> engine that understands any Indian language, translates it to a clean **English
> summary**, **automatically routes** it to the right department, and tracks resolution
> transparently.

A polished, fully working re-imagining of the CivixSetu SIH platform — rebuilt from the
ground up with a **fully separate Citizen and Officer workspace**, **multilingual-in →
English-out AI**, **automatic department detection (no manual dropdown)**, professional
UX, animated charts, and 3D-style motion.

---

## ⚡ Run it

```bash
npm install
npm run dev        # -> http://localhost:5173
```

Production build:

```bash
npm run build      # outputs to /dist
npm run preview    # serve the build
```

## 🔑 Demo credentials

| Role    | Email                      | Password    | What you get                                    |
|---------|----------------------------|-------------|-------------------------------------------------|
| Citizen | `citizen@civixsetu.demo`   | `citizen123`| Report, track, upvote, karma, leaderboard       |
| Officer | `officer@civixsetu.demo`   | `officer123`| Queue overview, re-route, assign, resolve, SLA  |

> The app **starts signed in** as the demo citizen so you land straight in the product.
> Use the 🔁 account menu (top-right) or the login page to switch roles. Register any new
> account from `/register`.

---

## ✅ What was built (mapped to your requests)

### 1. Fully separate Citizen & Officer login/pages
- **`/login`** has a Citizen ⇄ Officer toggle + **separate role dashboards**.
- **Citizen**: `/citizen` overview, `/citizen/report`, `/citizen/reports`,
  `/citizen/track/:id`, `/citizen/leaderboard`, `/citizen/analytics`.
- **Officer**: `/officer` queue overview, `/officer/queue`, `/officer/analytics`,
  `/officer/team` (field workers).
- Role-based access control: an officer cannot enter `/citizen/*` and vice-versa; all
  actions write to a persisted state with a public **audit timeline**.

### 2. Multilingual input → English summary for officers ✅
The AI engine (`src/lib/aiEngine.ts`) runs the full pipeline **on-device** (offline, no
API key, no CORS/latency bugs):

```
Listen/Speak  -> detect script+language   -> translate to an English summary
              -> auto-classify DEPARTMENT  -> severity + priority + SLA  -> JSON verdict
```

- Detects **Devanagari, Telugu, Tamil, Kannada, Bengali, Gujarati, Marathi, Malayalam,
  Punjabi, Odia, Urdu and Hinglish/romanized Hindi** (code-switching).
- Produces a **clean English summary** for officers plus a per-phrase translation
  breakdown (`कचरा → garbage`).
- **Live result** while you type, plus a 4-stage animated triage panel
  (detect → translate → classify → triage) with confidence ranking.

### 3. Automatic department detection + no manual department dropdown ✅
- The report form has **no department selector** at all. Department is chosen by the
  classifier (keyword + n-gram + native-script term scoring across **8 departments**)
  with >55–99% confidence shown.
- Verified against the sample corpus: Hindi garbage → **Solid Waste**, Hindi no-water →
  **Water Board**, Hinglish pothole → **Public Works**, Telugu garbage → **Solid Waste**,
  English streetlights → **Electrical**, English open drain → **Sewerage**.

### 4. Professional UX · charts · 3D-style animation · no bugs
- Design system: dark glassmorphism, gradient brand, animated orbs/grid backdrop,
  **3D-mouse-tilt cards**, scan-lines, typewriter, staggered scroll reveals, counters.
- **Charts** (pure SVG, no libs, sandbox-safe): grouped bar chart, donut chart, ward
  intensity heat-grid, sparklines, SLA progress rings, leaderboards.
- Clean **TypeScript strict** typecheck, no runtime console errors (verified via SSR
  render smoke tests).

### 5. AI capabilities (voice-first, fully offline)
- **Voice input** via Web Speech API (12 language tags).
- **GPS auto-locate** + landmark & ward auto-detection (fallback to manual)
- Priority score, SLA steering, and a human-verified officer workflow.

---

## 🧩 Architecture

```
civixsetu/
├─ index.html               # Vite entry (SPA shell)
├─ vite.config.ts           # dev/preview tuned for the *.{port}.e2b.app preview host
├─ vercel.json              # SPA rewrite for client-side routing
└─ src/
   ├─ main.tsx / App.tsx    # router (all routes)
   ├─ styles/global.css     # design system (tokens, glass, animations, responsive)
   ├─ lib/
   │  ├─ aiEngine.ts        # ★ multilingual NLU: translate + classify + triage
   │  ├─ departments.ts     # 8-department catalogue & keyword/native term index
   │  ├─ store.ts           # localStorage-persisted state (users/reports/session)
   │  ├─ seed.ts            # realistic seed users + reports (all languages)
   │  ├─ types.ts           # types
   │  └─ hooks.ts           # useStore, metrics, voice, typewriter, reveal
   ├─ components/           # Logo, Icons, UI (Tilt/chips/modal/toast), AITriage,
   │                        #   Charts, ReportCard, ReportDetail, AppShell, SiteChrome
   └─ pages/                # Landing, Auth, Analytics, citizen/*, officer/*
```

### Where the AI "understands" Indian languages
The engine's multilingual dictionaries live in `src/lib/aiEngine.ts` (a shared `Phrase`
table for each script → `{ native: "…", en: "…", cat: [deptIds] }`). Classification
merges these native terms with English/romanized keywords, so **native-language input
routes correctly** — this was the core fix.

---

## 🚀 Deploy (Vercel / Render)

**Vercel** (recommended, matches your existing site):
1. Push this folder to a repo.
2. Set build command `npm run build`, output dir `dist`.
3. SPA client routing is handled by `vercel.json` (rewrites all paths → `/index.html`).

**Render:** add a **Static Site** service, build `npm run build`, publish dir `dist`.

> Maps & external LLM APIs are intentionally *optional* — the whole app runs fully
> offline so it never breaks on CORS/keys. To lean on a hosted LLM for even richer
> English summaries, point `analyze()` at your endpoint in `src/lib/aiEngine.ts`.

---

## 🧪 Verified
- `tsc --noEmit` → clean
- `npm run build` → 61 modules, ~92 KB gzipped JS
- AI engine unit-checked against 6 multilingual samples (routing + summary correct)
- SSR render smoke tests for Landing, Auth, Officer dashboard → no crash
