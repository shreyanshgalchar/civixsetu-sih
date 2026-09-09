import type { AppState, Report, ReportStatus, TimelineEvent, User } from "./types";
import { SEED_USERS, seedReports } from "./seed";
import { analyze } from "./aiEngine";
import { getDept, DEPT_PHOTOS } from "./departments";

const KEY = "civixsetu.state.v2";

let state: AppState = load();
const listeners = new Set<() => void>();

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.reports)) return parsed;
    }
  } catch { /* ignore */ }
  return {
    users: SEED_USERS,
    reports: seedReports(),
    sessionId: "u-citizen", // start signed in as demo citizen for instant preview
    analytics: { lastTrained: Date.now(), modelVersion: "SetuAI · v2.4 (offline)", accuracy: 96.8 },
  };
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

function emit() { listeners.forEach((l) => l()); }

export function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function getState() { return state; }

function uid(p: string) { return p + Math.random().toString(36).slice(2, 10); }

/* -------------------------------- AUTH ------------------------------ */
export const store = {
  login(email: string, password: string): { ok: boolean; user?: User; error?: string } {
    const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return { ok: false, error: "No account found with this email." };
    if (u.password !== password) return { ok: false, error: "Incorrect password. Check demo credentials." };
    state = { ...state, sessionId: u.id };
    persist(); emit();
    return { ok: true, user: u };
  },
  loginDemo(role: "citizen" | "officer") {
    const email = role === "citizen" ? "citizen@civixsetu.demo" : "officer@civixsetu.demo";
    const pw = role === "citizen" ? "citizen123" : "officer123";
    this.login(email, pw);
  },
  logout() { state = { ...state, sessionId: null }; persist(); emit(); },
  currentUser(): User | null {
    return state.users.find((u) => u.id === state.sessionId) || null;
  },
  register(name: string, email: string, password: string, role: Role, departmentId?: string): { ok: boolean; user?: User; error?: string } {
    if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()))
      return { ok: false, error: "Email already registered. Try signing in." };
    const u: User = {
      id: uid("u"), name, email: email.trim(), password, role,
      ward: "Banjara Hills", city: "Hyderabad", departmentId, designation: role === "officer" ? "Field Officer" : undefined,
      karma: 0, streak: 0, verifiedCount: 0, created: Date.now(),
      avatarColor: ["#22d3ee", "#34d399", "#8b5cf6", "#fbbf24", "#fb7185"][Math.floor(Math.random() * 5)],
    };
    state = { ...state, users: [...state.users, u], sessionId: u.id };
    persist(); emit();
    return { ok: true, user: u };
  },

  /* ------------------------------ REPORTS --------------------------- */
  createReport(input: {
    originalText: string;
    location: string; landmark: string; ward: string; city: string;
    photo?: string[]; audio?: string;
    lat?: number; lng?: number;
  }): Report {
    const me = this.currentUser()!;
    const a = analyze(input.originalText);
    const now = Date.now();
    const deptId = a.dept.id;
    const dpt = getDept(deptId);
    const seq = 90413 + state.reports.length;
    const report: Report = {
      id: `CX-${seq}`,
      citizenId: me.id,
      citizenName: me.name,
      originalText: input.originalText.trim(),
      lang: a.lang, langCode: a.langCode,
      englishSummary: a.englishSummary,
      translations: a.translations,
      departmentId: deptId, departmentName: dpt.name,
      status: "REPORTED",
      severity: a.severity, urgency: a.urgency, priorityScore: a.priorityScore,
      slaDays: dpt.slaDays,
      aiConfidence: Math.round(a.dept.confidence * 100),
      location: input.location, landmark: input.landmark,
      ward: input.ward, city: input.city,
      lat: input.lat, lng: input.lng,
      photos: input.photo || [], audio: input.audio,
      // illustrative featured photo for this department's issue
      photo: DEPT_PHOTOS[deptId]?.[state.reports.length % DEPT_PHOTOS[deptId].length],
      extraPhotos: (DEPT_PHOTOS[deptId] || []).slice(1, 2),
      upvotes: 0,
      created: now, updated: now,
      timeline: [
        { id: uid("t"), ts: now, actor: me.name, type: "submit", title: "Report submitted" },
        { id: uid("t"), ts: now + 6000, actor: "Setu AI", type: "ai", title: `AI triage · routed to ${dpt.name}`, note: `Confidence ${Math.round(a.dept.confidence * 100)}% · ${a.lang}` },
      ],
    };
    state = { ...state, reports: [report, ...state.reports] };
    persist(); emit();
    return report;
  },

  updateReportStatus(id: string, status: ReportStatus, opts?: { note?: string; actor?: string; resolution?: string; officerId?: string; assignTo?: string }) {
    const me = this.currentUser();
    const actor = opts?.actor || me?.name || "Officer";
    state = {
      ...state,
      reports: state.reports.map((r) => {
        if (r.id !== id) return r;
        const ev: TimelineEvent = {
          id: uid("t"), ts: Date.now(), actor,
          type: status === "RESOLVED" ? "resolve" : status === "REJECTED" ? "reject" : status === "IN_PROGRESS" ? "assign" : "update",
          title: status === "RESOLVED" ? "Marked resolved" : status === "REJECTED" ? "Rejected / closed" : status === "IN_PROGRESS" ? `Assigned to ${opts?.assignTo || "crew"}` : "Status updated",
          note: opts?.note,
        };
        return {
          ...r, status,
          updated: Date.now(),
          resolvedAt: status === "RESOLVED" ? Date.now() : r.resolvedAt,
          assignedTo: status === "IN_PROGRESS" ? (opts?.assignTo || r.assignedTo) : r.assignedTo,
          assignedOfficerId: opts?.officerId ? opts.officerId : r.assignedOfficerId,
          resolvedBy: status === "RESOLVED" ? actor : r.resolvedBy,
          resolution: opts?.resolution || r.resolution,
          timeline: [...r.timeline, ev],
        };
      }),
    };
    persist(); emit();
  },

  addTimeline(id: string, title: string, note: string) {
    const me = this.currentUser();
    state = {
      ...state,
      reports: state.reports.map((r) => r.id !== id ? r : {
        ...r, updated: Date.now(),
        timeline: [...r.timeline, { id: uid("t"), ts: Date.now(), actor: me?.name || "Officer", type: "note", title, note }],
      }),
    };
    persist(); emit();
  },

  upvote(id: string) {
    state = { ...state, reports: state.reports.map((r) => r.id === id ? { ...r, upvotes: r.upvotes + 1, updated: Date.now() } : r) };
    persist(); emit();
  },

  deleteReport(id: string) {
    state = { ...state, reports: state.reports.filter((r) => r.id !== id) };
    persist(); emit();
  },

  rateResolution(id: string, rating: number) {
    state = { ...state, reports: state.reports.map((r) => r.id === id ? { ...r, citizenRating: rating } : r) };
    persist(); emit();
  },

  setAssignNote(id: string, note: string) {
    state = { ...state, reports: state.reports.map((r) => r.id === id ? { ...r, assignNote: note } : r) };
    persist(); emit();
  },

  /* HelpBot feedback + insights are kept in a lightweight, durable log */
  addBotFeedback(q: string, a: string, liked: boolean) {
    const log = botFeedbackLog();
    log.unshift({ q, a, liked, ts: Date.now() });
    try { localStorage.setItem(KEY_BOT, JSON.stringify(log.slice(0, 200))); } catch { /* ignore */ }
    emit();
  },

  reset() {
    localStorage.removeItem(KEY);
    state = { users: SEED_USERS, reports: seedReports(), sessionId: "u-citizen", analytics: { lastTrained: Date.now(), modelVersion: "SetuAI · v2.4 (offline)", accuracy: 96.8 } };
    emit();
  },

  /* --------------------------- ANALYTICS ---------------------------- */
  analyticsSnapshot() { return state.analytics; },
};

import type { Role } from "./types";
export { Role };

/* --------- HelpBot feedback log (durable, stored separately) --------- */
const KEY_BOT = "civixsetu.bot.v1";
export interface BotFeedback { q: string; a: string; liked: boolean; ts: number }
export function botFeedbackLog(): BotFeedback[] {
  try { return JSON.parse(localStorage.getItem(KEY_BOT) || "[]"); } catch { return []; }
}
