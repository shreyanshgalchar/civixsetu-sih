import { useSyncExternalStore, useCallback, useEffect, useRef, useState } from "react";
import { subscribe, getState, store, type Role as _Role } from "./store";
import type { AppState, Report, User } from "./types";
import type { Analysis } from "./aiEngine";

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useCurrentUser(): User | null {
  const state = useStore();
  return state.users.find((u) => u.id === state.sessionId) || null;
}

/* ------------------- computed analytics selectors ------------------- */
export function computeMetrics(reports: Report[]) {
  const total = reports.length;
  const resolved = reports.filter((r) => r.status === "RESOLVED").length;
  const inProgress = reports.filter((r) => r.status === "IN_PROGRESS").length;
  const aiVerified = reports.filter((r) => r.status === "AI_VERIFIED").length;
  const reported = reports.filter((r) => r.status === "REPORTED").length;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
  const critical = reports.filter((r) => r.severity === "CRITICAL").length;
  const high = reports.filter((r) => r.severity === "HIGH").length;
  const totalUpvotes = reports.reduce((s, r) => s + r.upvotes, 0);
  const avgDays = (() => {
    const r = reports.filter((x) => x.resolvedAt);
    if (!r.length) return 0;
    return r.reduce((s, x) => s + Math.max(0, (x.resolvedAt! - x.created) / 86400000), 0) / r.length;
  })();
  return { total, resolved, inProgress, aiVerified, reported, resolutionRate, critical, high, totalUpvotes, avgDays };
}

export function byDepartment(reports: Report[]) {
  const map: Record<string, number> = {};
  reports.forEach((r) => { map[r.departmentId] = (map[r.departmentId] || 0) + 1; });
  return map;
}

export function reportedVsResolved(reports: Report[]) {
  // last 8 week buckets
  const latest = Math.max(...reports.map((r) => r.created), Date.now());
  const week = 7 * 86400000;
  const buckets: { label: string; a: number; b: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const start = latest - (i + 1) * week;
    const end = latest - i * week;
    buckets.push({
      label: `W${7 - i}`,
      a: reports.filter((r) => r.created >= start && r.created < end).length,
      b: reports.filter((r) => r.resolvedAt && r.resolvedAt >= start && r.resolvedAt < end).length,
    });
  }
  return buckets;
}

/* ------------------------ voice hooks (Web Speech) ----------------- */
export function useSpeech() {
  const [supported] = useState(() => typeof window !== "undefined" && "webkitSpeechRecognition" in window);
  const recRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");

  const start = useCallback((lang: string, onFinal: (text: string) => void) => {
    if (!supported) return;
    try {
      const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = lang;
      rec.onresult = (e: any) => {
        let inter = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) final += res[0].transcript;
          else inter += res[0].transcript;
        }
        setInterim(inter);
        if (final) onFinal(final);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
      recRef.current = rec;
      setListening(true);
    } catch { /* ignore */ }
  }, [supported]);

  const stop = useCallback(() => { recRef.current?.stop(); setListening(false); }, []);
  useEffect(() => () => recRef.current?.stop(), []);
  return { supported, listening, interim, start, stop };
}

/* ------------------------ typewriter hook -------------------------- */
export function useTypewriter(text: string, speed = 18) {
  const [out, setOut] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setOut(""); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { out, done };
}

/* --------------------- scroll reveal hook -------------------------- */
export function useReveal() {
  const refs = useRef<HTMLElement[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); });
    }, { threshold: 0.12 });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const setRef = useCallback((el: HTMLElement | null) => { if (el && !refs.current.includes(el)) refs.current.push(el); }, []);
  return setRef;
}
