import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cls, initials, avColor } from "../lib/format";
import type { Severity, ReportStatus } from "../lib/types";
import { IconX } from "./Icons";

/* --------------------------- 3D Tilt card --------------------------- */
export function Tilt({ children, max = 8, className, style }: {
  children: ReactNode; max?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0, glow: "0deg" });
  const onMove = (e: MouseEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * max, ry: px * max, glow: `${Math.atan2(py, px) * 60}deg` });
  };
  const reset = () => setT({ rx: 0, ry: 0, glow: "0deg" });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={reset}
      className={cls("tilt", className)} style={{ ...style, transform: `perspective(900px) rotateX(${t.rx}deg) rotateY(${t.ry}deg)` }}>
      <div className="tilt-inner" style={{ transform: "translateZ(24px)", height: "100%" }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
        background: `conic-gradient(from ${t.glow}, rgba(34,211,238,0), rgba(34,211,238,0.12), transparent 30%)` }} />
    </div>
  );
}

/* --------------------------- Chips / badges --------------------------- */
export function Sev({ s }: { s: Severity }) {
  const map: Record<Severity, string> = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" };
  return <span className={cls("chip", `sev-${s}`)}>{map[s]}</span>;
}
export function StatusBadge({ s }: { s: ReportStatus }) {
  const map: Record<ReportStatus, string> = {
    REPORTED: "Reported", AI_VERIFIED: "AI Verified", IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved", REJECTED: "Rejected",
  };
  return <span className={cls("chip", `st-${s}`)}>{map[s]}</span>;
}

/* --------------------------- Avatar --------------------------- */
export function Avatar({ name, size = "md", color }: { name: string; size?: "sm" | "md"; color?: string }) {
  const bg = color || avColor(name);
  return <div className={cls("avatar", "a-" + size)} style={{ background: `linear-gradient(135deg, ${bg}, #063)` }}>{initials(name)}</div>;
}

/* --------------------------- Section heading --------------------------- */
export function SectionHead({ eyebrow, title, sub, center }: { eyebrow: string; title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className={cls("mb-4", center && "center")} style={{ maxWidth: 720 }}>
      <span className="eyebrow"><span className="dot" />{eyebrow}</span>
      <h2 className="h-lg mt-2">{title}</h2>
      {sub && <p className="lead mt-2">{sub}</p>}
    </div>
  );
}

/* --------------------------- KPI tile --------------------------- */
export function KPI({ icon, value, label, color = "#22d3ee", sub }: { icon: ReactNode; value: string; label: string; color?: string; sub?: string }) {
  return (
    <div className="card card-hover anim-up">
      <div className="kpi">
        <div className="ic" style={{ background: `rgba(0,0,0,0.25)`, color }}>{icon}</div>
        <div>
          <div className="v">{value}</div>
          <div className="l">{label}</div>
          {sub && <div className="l faint" style={{ fontSize: 11 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Toast system --------------------------- */
export interface Toast { id: number; text: string; kind?: "ok" | "err" }
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = (text: string, kind: "ok" | "err" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  };
  const node = (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={cls("toast", t.kind === "err" && "err")}>
          <div className="row gap-1"><span style={{ color: t.kind === "err" ? "#fb7185" : "#6ee7b7" }}>{t.kind === "err" ? "✕" : "✓"}</span><span style={{ fontSize: 14 }}>{t.text}</span></div>
        </div>
      ))}
    </div>
  );
  return { push, node };
}

/* --------------------------- Modal --------------------------- */
export function Modal({ open, onClose, title, children, width = 560 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(3,7,16,0.66)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 20, animation: "fadeIn .2s" }}>
      <div onClick={(e) => e.stopPropagation()} className="card card-glow anim-pop" style={{ width: "100%", maxWidth: width, maxHeight: "88vh", overflow: "auto", background: "rgba(12,18,34,0.96)" }}>
        <div className="row-between mb-3">
          <h3 className="h-md">{title}</h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><IconX size={17} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* --------------------------- Reveal on scroll --------------------------- */
export function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
