import { useState } from "react";
import type { Report } from "../lib/types";
import { getDept } from "../lib/departments";
import { Avatar, Modal, Sev, StatusBadge } from "./ui";
import { DeptIcon, IconPin, IconClock, IconGlobe, IconCheck, IconTarget, IconUsers } from "./Icons";
import { hoursAgo, pickColor, formatNum } from "../lib/format";

export function ReportDetail({ report, onClose, role, onAction }: {
  report: Report; onClose: () => void; role?: "citizen" | "officer";
  onAction?: (status: "IN_PROGRESS" | "RESOLVED" | "REJECTED", note: string) => void;
}) {
  const dpt = getDept(report.departmentId);
  const [note, setNote] = useState("");
  const [act, setAct] = useState<"IN_PROGRESS" | "RESOLVED" | "REJECTED" | null>(null);
  const timeline = [...report.timeline].sort((a, b) => a.ts - b.ts);

  const submit = (k: "IN_PROGRESS" | "RESOLVED" | "REJECTED") => {
    onAction?.(k, note || undefined as any);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={report.id} width={820}>
      <div className="g2" style={{ gridTemplateColumns: "1.25fr 1fr", gap: 24 }}>
        <div>
          <div className="row gap-1 wrap mb-2"><StatusBadge s={report.status} /><Sev s={report.severity} /><span className="chip st"><IconClock size={12} /> SLA {report.slaDays}h</span></div>
          <h2 style={{ fontSize: 22, lineHeight: 1.3 }}>{report.englishSummary}</h2>

          <div className="row gap-1 mt-2 faint" style={{ fontSize: 13 }}><IconPin size={14} style={{ color: "#fbbf24" }} /> {report.location || report.landmark} · {report.ward}, {report.city}</div>

          <div className="divider my" style={{ margin: "18px 0" }} />

          {/* original text */}
          <label className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Original citizen input</label>
          <p className="muted mt-1" style={{ fontStyle: "italic", fontSize: 14 }}>“{report.originalText}”</p>
          <div className="row gap-1 mt-1"><span className="chip st"><IconGlobe size={12} /> {report.lang}</span><span className="chip st">{report.langCode}</span></div>
          {report.translations.length > 0 && (
            <div className="mt-1" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {report.translations.slice(0, 6).map((t, i) => <div key={i} className="faint mono" style={{ fontSize: 12 }}>↳ {t}</div>)}
            </div>
          )}

          {/* department */}
          <div className="card mt-3" style={{ padding: 16, borderLeft: `3px solid ${dpt.color}` }}>
            <div className="row gap-2">
              <div className="avatar-chip" style={{ borderRadius: 12, background: `${dpt.color}22`, color: dpt.color, display: "grid", placeItems: "center" }}><DeptIcon ic={dpt.ic} size={26} /></div>
              <div>
                <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Assigned department</div>
                <div style={{ fontWeight: 700 }}>{report.departmentName} <span className="faint" style={{ fontSize: 12, fontWeight: 500 }}>· {report.aiConfidence}% AI</span></div>
                <div className="mt-1 row gap-1 wrap"><span className="chip st">⚡ {report.priorityScore}/100 priority</span><span className="chip st"><IconTarget size={12} /> urgency {report.urgency}</span></div>
              </div>
            </div>
          </div>

          {/* resolution */}
          {report.resolution && (
            <div className="card mt-2" style={{ padding: 16, background: "rgba(52,211,153,0.07)", borderColor: "rgba(52,211,153,0.26)" }}>
              <div className="row gap-1 mb-1" style={{ fontWeight: 700, color: "#6ee7b7", fontSize: 13 }}><IconCheck size={15} /> Resolution</div>
              <p className="muted" style={{ fontSize: 13.5 }}>{report.resolution}</p>
            </div>
          )}
        </div>

        {/* right column: meta + timeline */}
        <div>
          <div className="card" style={{ padding: 16 }}>
            <div className="row gap-2">
              <Avatar name={report.citizenName} color={pickColor(report.citizenName)} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{report.citizenName}</div>
                <div className="faint" style={{ fontSize: 12 }}>Citizen reporter</div>
              </div>
              <span className="row gap-1 right" style={{ color: "#6ee7b7", fontWeight: 700 }}><IconUsers size={14} /> {formatNum(report.upvotes)}</span>
            </div>
            {report.assignedTo && <><div className="divider" style={{ margin: "12px 0" }} /><div className="faint" style={{ fontSize: 12 }}>Assigned to <b style={{ color: "#e8edf8" }}>{report.assignedTo}</b></div></>}
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Public timeline</div>
            <div className="timeline">
              {timeline.map((e) => (
                <div key={e.id} className="tl-item">
                  <span className={`tl-dot ${e.type === "ai" ? "pulse" : ""}`} style={{ borderColor: e.type === "resolve" ? "#34d399" : e.type === "ai" ? "#22d3ee" : e.type === "reject" ? "#f43f5e" : "#64708a" }} />
                  <div className="row-between">
                    <b style={{ fontSize: 13 }}>{e.title}</b>
                    <span className="faint" style={{ fontSize: 11 }}>{hoursAgo(e.ts)}</span>
                  </div>
                  <div className="faint" style={{ fontSize: 12 }}>{e.actor} · {e.type}</div>
                  {e.note && <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{e.note}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* officer action */}
          {role === "officer" && report.status !== "RESOLVED" && (
            <div className="card mt-3" style={{ padding: 16 }}>
              <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Officer action</div>
              {!act ? (
                <div className="row gap-1 wrap">
                  <button className="btn btn-outline btn-sm" onClick={() => setAct("IN_PROGRESS")}>Start work</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setAct("RESOLVED")} style={{ borderColor: "rgba(52,211,153,0.4)", color: "#6ee7b7" }}>Resolve</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setAct("REJECTED")}>Reject</button>
                </div>
              ) : (
                <div>
                  <div className="field"><label>Note / resolution text</label><textarea className="textarea" rows={3} value={note} placeholder="Add a human-verified note (shown publicly)…" onChange={(e) => setNote(e.target.value)} /></div>
                  <div className="row gap-1">
                    <button className="btn btn-primary btn-sm" onClick={() => submit(act)}>Confirm {act === "RESOLVED" ? "resolve" : act === "REJECTED" ? "reject" : "assign"}</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAct(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
