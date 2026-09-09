import { useEffect, useMemo, useState } from "react";
import type { Analysis } from "../lib/aiEngine";
import { getDept } from "../lib/departments";
import { cls, pickColor } from "../lib/format";
import { IconCheck, IconSpark, DeptIcon, IconBolt, IconRefresh, IconGlobe, IconPin } from "./Icons";
import { Sev } from "./ui";

const STAGES = [
  { k: "detect", label: "Detecting language", dur: 800 },
  { k: "translate", label: "Translating to English summary", dur: 950 },
  { k: "classify", label: "Classifying department", dur: 900 },
  { k: "triage", label: "Triaging severity & priority", dur: 850 },
] as const;

export function useAIAnalyze(analysis: Analysis) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    setStage(0); setProgress(0); setDone(false);
    let cur = 0, acc = 0;
    const timers: number[] = [];
    STAGES.forEach((s, i) => {
      timers.push(window.setTimeout(() => { setStage(i + 1); }, acc));
      acc += s.dur;
    });
    return () => timers.forEach(clearTimeout);
  }, [analysis]);
  // progress timer
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setDone(true); clearInterval(id); return 100; }
        return Math.min(100, p + 1.4);
      });
    }, 16);
    return () => clearInterval(id);
  }, [done]);
  return { stage, progress, done, total: STAGES.length };
}

/* Full-screen triage molecule shown under the report form */
export function AITriagePanel({ analysis, onReset }: { analysis: Analysis; onReset: () => void }) {
  const { stage, progress, done } = useAIAnalyze(analysis);
  const dpt = getDept(analysis.dept.id);
  const stepDone = (i: number) => stage > i;

  return (
    <div className="card card-glow" style={{ overflow: "hidden", animation: "fadeUp .5s" }}>
      {/* scanning header */}
      <div className="row-between mb-3">
        <div className="row gap-2">
          <div className="kpi ic" style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}><IconSpark size={24} /></div>
          <div>
            <div className="row gap-1"><span className="h-md">Setu AI Triage</span>{done && <span className="chip st-RESOLVED"><IconCheck size={12} /> verdićt ready</span>}</div>
            <div className="faint" style={{ fontSize: 12 }}>Model v2.4 · client-side · <span className="mono">{Math.round(progress)}%</span></div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onReset}><IconRefresh size={15} /> New report</button>
      </div>

      <div style={{ position: "relative", height: 3, borderRadius: 999, background: "rgba(148,163,184,0.16)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: `${progress}%`, background: "var(--grad-brand)", transition: "width .05s linear" }} />
      </div>

      {/* pipeline steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 16 }}>
        {STAGES.map((s, i) => {
          const isActive = stage === i;
          const isDone = stepDone(i);
          const pending = !isActive && !isDone;
          return (
            <div key={s.k} className="card" style={{ padding: "12px 12px", background: isActive ? "rgba(34,211,238,0.07)" : "rgba(16,24,40,0.5)", borderColor: isActive ? "rgba(34,211,238,0.4)" : "var(--line)", position: "relative", overflow: "hidden" }}>
              {isActive && <div className="scanline" />}
              <div className="row gap-1" style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#67e8f9" : isDone ? "#6ee7b7" : "#64708a" }}>
                {isDone ? <IconCheck size={13} /> : isActive ? <IconSpark size={13} /> : <span style={{ opacity: 0.3 }}>●</span>}
                {s.label}
              </div>
              <div className="faint" style={{ fontSize: 10, marginTop: 6 }}>{isDone ? "Done" : isActive ? "Processing…" : "Waiting"}</div>
            </div>
          );
        })}
      </div>

      {/* verdict reveal */}
      {done && (
        <div style={{ marginTop: 22, animation: "fadeUp .5s" }}>
          {/* language + summary */}
          <div className="card" style={{ background: "rgba(16,24,40,0.55)" }}>
            <div className="row gap-2 mb-1">
              <span className="chip st"><IconGlobe size={12} /> {analysis.lang}</span>
              {analysis.isHinglish && <span className="chip st">Code-switched</span>}
              <span className="chip st">{analysis.detectedScripts.join(" + ") || "Latin"}</span>
            </div>
            <label className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>English summary (for officers)</label>
            <p className="h-md mt-1" style={{ lineHeight: 1.4 }}>{analysis.englishSummary}</p>
            {analysis.translations.length > 0 && (
              <div className="mt-2" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {analysis.translations.slice(0, 5).map((t, i) => (
                  <div key={i} className="faint mono" style={{ fontSize: 11.5 }}>︎↳ {t}</div>
                ))}
              </div>
            )}
          </div>

          {/* routing */}
          <div className="g2 mt-2" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
            <TiltVerdict analysis={analysis} dptColor={dpt.color} dptIc={dpt.ic} dptName={dpt.name} />
          </div>
        </div>
      )}
    </div>
  );
}

function TiltVerdict({ analysis, dptColor, dptIc, dptName }: { analysis: Analysis; dptColor: string; dptIc: string; dptName: string }) {
  return (
    <div className="card" style={{ borderLeft: `3px solid ${dptColor}` }}>
      <div className="row gap-2">
        <div className="avatar-chip" style={{ borderRadius: 14, background: `${dptColor}22`, color: dptColor, display: "grid", placeItems: "center" }}><DeptIcon ic={dptIc} size={28} /></div>
        <div>
          <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Routed automatically to</div>
          <div className="h-md">{dptName} <span className="faint" style={{ fontSize: 13, fontWeight: 500 }}>· {Math.round(analysis.dept.confidence * 100)}% confidence</span></div>
          <div className="mt-1" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Sev s={analysis.severity} />
            <span className="chip st">⚡ {analysis.priorityScore}/100 priority</span>
            <span className="chip st">⏱ SLA {analysis.slaDays}h</span>
          </div>
        </div>
      </div>
      {analysis.reasons.length > 0 && (
        <div className="mt-2" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {analysis.reasons.map((r, i) => (
            <div key={i} className="row gap-1" style={{ fontSize: 12.5, color: "#92a0ba" }}><IconCheck size={13} style={{ color: "#6ee7b7", flexShrink: 0 }} /> {r}</div>
          ))}
        </div>
      )}
      {analysis.entities.location && (
        <div className="row gap-1 mt-2" style={{ fontSize: 12.5, color: "#92a0ba" }}><IconPin size={13} style={{ color: "#fbbf24" }} /> {analysis.entities.location}</div>
      )}
    </div>
  );
}

/* ranked department breakdown (for the verdict's "also considered") */
export function DeptRanking({ analysis }: { analysis: Analysis }) {
  const top = analysis.dept.id;
  const others = analysis.departments.filter((d) => d.id !== top).slice(0, 4);
  if (!others.length) return null;
  return (
    <div>
      <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Department classifier · confidence ranking</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {analysis.departments.slice(0, 5).map((d, i) => {
          const dc = getDept(d.id).color;
          const w = Math.round(d.confidence * 100);
          return (
            <div key={d.id} className="row gap-2">
              <span style={{ width: 18, fontSize: 12, color: i === 0 ? "#67e8f9" : "#64708a", fontWeight: 700 }}>{i + 1}</span>
              <DeptIcon ic={getDept(d.id).ic} size={16} style={{ color: dc }} />
              <span style={{ width: 150, fontSize: 12.5, color: "#92a0ba", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{d.name}</span>
              <div className="bar" style={{ flex: 1 }}><span style={{ width: `${w}%`, background: i === 0 ? `linear-gradient(90deg, ${dc}, ${dc})` : "rgba(148,163,184,0.4)" }} /></div>
              <b style={{ width: 40, fontSize: 12, textAlign: "right", color: i === 0 ? "#fff" : "#92a0ba" }}>{w}%</b>
            </div>
          );
        })}
      </div>
    </div>
  );
}
