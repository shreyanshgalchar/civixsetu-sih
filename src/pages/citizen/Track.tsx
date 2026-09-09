import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageTitle } from "../../components/AppShell";
import { Avatar, Sev, StatusBadge } from "../../components/ui";
import { DeptIcon, IconBolt, IconPin, IconClock, IconGlobe, IconCheck } from "../../components/Icons";
import { useStore } from "../../lib/hooks";
import { store } from "../../lib/store";
import { getDept } from "../../lib/departments";
import { hoursAgo, pickColor, formatNum, daysBetween } from "../../lib/format";
import { Ring, Sparkline } from "../../components/Charts";

export default function Track() {
  const { id } = useParams();
  const nav = useNavigate();
  const state = useStore();
  const rep = state.reports.find((r) => r.id === id);
  const [open, setOpen] = useState(true);

  if (!rep) return <div className="card center" style={{ padding: "60px" }}><h3 className="h-md">Report not found</h3><button className="btn btn-primary mt-3" onClick={() => nav("/citizen/reports")}>Back to my reports</button></div>;

  const d = getDept(rep.departmentId);
  const timeline = [...rep.timeline].sort((a, b) => a.ts - b.ts);
  const progress = rep.status === "RESOLVED" ? 100 : rep.status === "IN_PROGRESS" ? 66 : rep.status === "AI_VERIFIED" ? 40 : 12;
  const elaps = Math.min(100, Math.round(((Date.now() - rep.created) / (rep.slaDays * 86400000)) * 100));

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto" }}>
      <PageTitle eyebrow="Live tracking" title={rep.id} sub={`Reported by ${rep.citizenName} · ${rep.ward}, ${rep.city}`} right={<button className="btn btn-ghost btn-sm" onClick={() => nav("/citizen/reports")}>← Back</button>} />

      <div className="card card-glow mb-3" style={{ padding: 26 }}>
        <div className="row-between wrap gap-2 mb-3">
          <div className="row gap-2">
            <div className="avatar-chip" style={{ borderRadius: 14, background: `${d.color}22`, color: d.color, display: "grid", placeItems: "center" }}><DeptIcon ic={d.ic} size={28} /></div>
            <div>
              <div style={{ fontWeight: 700 }}>{rep.englishSummary}</div>
              <div className="row gap-1 wrap mt-1"><StatusBadge s={rep.status} /><Sev s={rep.severity} /><span className="chip st"><IconClock size={12} /> SLA {rep.slaDays}h</span><span className="chip st"><IconBolt size={12} /> {rep.priorityScore} priority</span></div>
            </div>
          </div>
          <button className={`btn ${rep.upvotes && open ? "btn-primary" : "btn-outline"}`} onClick={() => store.upvote(rep.id)}>▲ Upvote · {formatNum(rep.upvotes)}</button>
        </div>

        <div className="row gap-1 faint mb-3" style={{ fontSize: 13 }}><IconPin size={14} style={{ color: "#fbbf24" }} /> {rep.location || rep.landmark}</div>

        <div className="g2 mt-2" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 24, alignItems: "center" }}>
          {/* progress */}
          <div>
            <div className="row-between mb-1"><span className="faint" style={{ fontSize: 12 }}>Resolution progress</span><b style={{ fontSize: 13 }}>{progress}%</b></div>
            <div className="bar" style={{ height: 12 }}><span style={{ width: `${progress}%` }} /></div>
            <div className="row-between mt-1" style={{ fontSize: 11.5, color: "#64708a" }}>
              <span>Filed {hoursAgo(rep.created)}</span><span>{rep.status === "RESOLVED" ? "Closed" : "SLA timer"}</span>
            </div>
            <div className="row gap-2 wrap mt-3">
              <span className="chip st"><IconClock size={12} /> {rep.status === "RESOLVED" ? `Resolved in ${daysBetween(rep.created, rep.resolvedAt || Date.now())}d` : `${Math.max(0, Math.ceil(rep.slaDays - (Date.now() - rep.created) / 86400000))}d SLA remaining`}</span>
              <span className="chip st"><IconGlobe size={12} /> {rep.lang}</span>
              <span className="chip st"><IconCheck size={12} /> AI {rep.aiConfidence}%</span>
            </div>
          </div>
          <div className="row" style={{ justifyContent: "center" }}>
            <Ring pct={rep.status === "RESOLVED" ? 100 : elaps} size={110} color={d.color} label={rep.status === "RESOLVED" ? "done" : "SLA"} />
          </div>
        </div>
      </div>

      <div className="g2" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* timeline */}
        <div className="card">
          <h3 className="h-md mb-2">Public timeline</h3>
          <div className="timeline">
            {timeline.map((e) => (
              <div key={e.id} className="tl-item">
                <span className={`tl-dot ${e.type === "ai" ? "pulse" : ""}`} style={{ borderColor: e.type === "resolve" ? "#34d399" : e.type === "ai" ? "#22d3ee" : "#64708a" }} />
                <div className="row-between"><b style={{ fontSize: 13.5 }}>{e.title}</b><span className="faint" style={{ fontSize: 11.5 }}>{hoursAgo(e.ts)}</span></div>
                <div className="faint" style={{ fontSize: 12 }}>{e.actor}</div>
                {e.note && <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>{e.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* details */}
        <div className="card">
          <h3 className="h-md mb-2">Details</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <Row k="Report ID" v={<span className="mono">{rep.id}</span>} />
            <Row k="Department" v={rep.departmentName} />
            <Row k="Original input" v={<span style={{ fontStyle: "italic", color: "#92a0ba" }}>“{rep.originalText.slice(0, 120)}{rep.originalText.length > 120 ? "…" : ""}”</span>} />
            <Row k="English summary" v={rep.englishSummary} />
            {rep.translations.length > 0 && <div><div className="faint" style={{ fontSize: 11.5, marginBottom: 4 }}>Translations</div>{rep.translations.slice(0, 5).map((t, i) => <div key={i} className="faint mono" style={{ fontSize: 11.5 }}>↳ {t}</div>)}</div>}
            <Row k="Assigned to" v={rep.assignedTo || "Pending assignment"} />
            {rep.resolution && <Row k="Resolution" v={rep.resolution} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="row-between" style={{ alignItems: "flex-start", gap: 12 }}><span className="faint" style={{ fontSize: 12.5, flexShrink: 0 }}>{k}</span><span style={{ fontSize: 13.5, textAlign: "right" }}>{v}</span></div>;
}
