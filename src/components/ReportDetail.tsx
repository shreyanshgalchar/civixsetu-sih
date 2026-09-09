import { useState } from "react";
import type { Report } from "../lib/types";
import { getDept, deptPhoto } from "../lib/departments";
import { Avatar, Modal, Sev, StatusBadge } from "./ui";
import { DeptIcon, IconPin, IconClock, IconGlobe, IconCheck, IconUsers, IconCamera, IconSpark, IconStar } from "./Icons";
import { hoursAgo, pickColor, formatNum, assetUrl } from "../lib/format";
import { store } from "../lib/store";
import { DEPARTMENTS } from "../lib/departments";

export function ReportDetail({ report, onClose, role, onAction }: {
  report: Report; onClose: () => void; role?: "citizen" | "officer";
  onAction?: (status: "IN_PROGRESS" | "RESOLVED" | "REJECTED", note: string) => void;
}) {
  const dpt = getDept(report.departmentId);
  const [note, setNote] = useState("");
  const [act, setAct] = useState<"IN_PROGRESS" | "RESOLVED" | "REJECTED" | null>(null);
  const [assignTo, setAssignTo] = useState(report.assignedTo || "");
  const [escalate, setEscalate] = useState("");
  const [gallery] = useState(() => {
    const photos: string[] = [];
    const hero = assetUrl(report.photo || deptPhoto(report.departmentId, report.created));
    if (hero) photos.push(hero);
    (report.extraPhotos || []).forEach((p) => { const u = assetUrl(p); if (u) photos.push(u); });
    (report.photos || []).forEach((p) => photos.push(p));
    return photos;
  });
  const timeline = [...report.timeline].sort((a, b) => a.ts - b.ts);
  const submit = (k: "IN_PROGRESS" | "RESOLVED" | "REJECTED") => {
    onAction?.(k, note || undefined as any);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={report.id} width={880}>
      {/* photo hero */}
      {gallery.length > 0 && (
        <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative", height: 220 }}>
          <img src={gallery[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(7,11,21,0.85))" }} />
          <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="avatar-chip" style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(7,11,21,0.65)", color: dpt.color, display: "grid", placeItems: "center" }}><DeptIcon ic={dpt.ic} size={18} /></div>
            <b style={{ textShadow: "0 1px 8px rgba(0,0,0,.7)" }}>{report.departmentName}</b>
            <span className="right faint" style={{ fontSize: 11.5, display: "flex", alignItems: "center", gap: 5 }}><IconCamera size={13} /> {gallery.length} photo{gallery.length > 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      <div className="g2" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
        <div>
          <div className="row gap-1 wrap mb-2"><StatusBadge s={report.status} /><Sev s={report.severity} /><span className="chip st"><IconClock size={12} /> SLA {report.slaDays}h</span><span className="chip st"><IconSpark size={12} /> AI {report.aiConfidence}%</span></div>
          <h2 style={{ fontSize: 22, lineHeight: 1.3 }}>{report.englishSummary}</h2>

          <div className="row gap-1 mt-2 faint" style={{ fontSize: 13 }}><IconPin size={14} style={{ color: "#fbbf24" }} /> {report.location || report.landmark} · {report.ward}, {report.city}</div>

          <div className="divider" style={{ margin: "18px 0" }} />

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
                <div style={{ fontWeight: 700 }}>{report.departmentName}</div>
                <div className="mt-1 row gap-1 wrap"><span className="chip st">⚡ {report.priorityScore}/100</span><span className="chip st">urgency {report.urgency}</span><span className="chip st">confidence {report.aiConfidence}%</span></div>
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

        {/* right column */}
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
            {report.assignedTo && <div className="divider" style={{ margin: "12px 0" }} />}
            {report.assignedTo && <div className="faint" style={{ fontSize: 12 }}>Assigned to <b style={{ color: "#e8edf8" }}>{report.assignedTo}</b></div>}
            {report.citizenRating && <div className="divider" style={{ margin: "12px 0" }} />}
            {report.citizenRating && <div className="faint row gap-1" style={{ fontSize: 12 }}>Citizen rating <span style={{ color: "#fbbf24" }}>{"★".repeat(report.citizenRating)}{"☆".repeat(5 - report.citizenRating)}</span></div>}
          </div>

          {/* timeline */}
          <div style={{ marginTop: 16 }}>
            <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Public timeline</div>
            <div className="timeline">
              {timeline.map((e) => (
                <div key={e.id} className="tl-item">
                  <span className={`tl-dot ${e.type === "ai" ? "pulse" : ""}`} style={{ borderColor: e.type === "resolve" ? "#34d399" : e.type === "ai" ? "#22d3ee" : e.type === "reject" ? "#f43f5e" : "#64708a" }} />
                  <div className="row-between"><b style={{ fontSize: 13 }}>{e.title}</b><span className="faint" style={{ fontSize: 11 }}>{hoursAgo(e.ts)}</span></div>
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
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="field" style={{ margin: 0 }}><label>Assign to crew / officer</label>
                    <select className="select" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
                      <option value="">Select team member…</option>
                      {["Meera Iyer", "Satish Kumar", "Farhan Ali", "Lakshmi Nair", "Amol Patil"].map((o) => <option key={o} value={o}>{o}</option>)}
                    </select></div>
                  <div className="row gap-1 wrap">
                    <button className="btn btn-outline btn-sm" onClick={() => setAct("IN_PROGRESS")}>Start work</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setAct("RESOLVED")} style={{ borderColor: "rgba(52,211,153,0.4)", color: "#6ee7b7" }}>Resolve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setAct("REJECTED")}>Reject</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div className="field" style={{ margin: 0 }}><label>Note / resolution</label><textarea className="textarea" rows={3} value={note} placeholder="Add a human-verified note (shown publicly)…" onChange={(e) => setNote(e.target.value)} /></div>
                  <div className="field" style={{ margin: 0 }}><label>Escalation / SLA note (internal)</label><input className="input" value={escalate} placeholder="e.g. escalated to supervisor, parts ordered" onChange={(e) => setEscalate(e.target.value)} /></div>
                  <div className="row gap-1">
                    <button className="btn btn-primary btn-sm" onClick={() => { if (assignTo) store.updateReportStatus(report.id, "IN_PROGRESS", { assignTo, actor: "You" }); if (escalate) store.setAssignNote(report.id, escalate); submit(act); }}>Confirm {act === "RESOLVED" ? "resolve" : act === "REJECTED" ? "reject" : "assign"}</button>
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

/* ----- inline "rate your resolution" control (used on citizen track page) ----- */
export function RateResolution({ report }: { report: Report }) {
  const [r, setR] = useState(report.citizenRating || 0);
  const [saved, setSaved] = useState(!!report.citizenRating);
  return (
    <div className="row gap-1 wrap" style={{ alignItems: "center" }}>
      <span className="faint" style={{ fontSize: 12.5 }}>How was it resolved?</span>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0, color: n <= r ? "#fbbf24" : "#64708a" }} onClick={() => { setR(n); setSaved(false); }}><IconStar size={18} /></button>
      ))}
      {saved ? <span className="chip st-RESOLVED">Thanks! ★{r}</span> : <button className="btn btn-primary btn-sm" disabled={!r} onClick={() => { store.rateResolution(report.id, r); setSaved(true); }}>Submit</button>}
    </div>
  );
}
