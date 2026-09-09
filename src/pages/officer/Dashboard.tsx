import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/AppShell";
import { Avatar, KPI, Reveal, Sev, StatusBadge } from "../../components/ui";
import { ReportDetail } from "../../components/ReportDetail";
import { IconGrid, IconCheck, IconClock, IconAlert, IconChevR, IconSearch, IconBolt, IconShield, IconSpark } from "../../components/Icons";
import { useStore, useCurrentUser, computeMetrics } from "../../lib/hooks";
import { getDept } from "../../lib/departments";
import { store } from "../../lib/store";
import { formatNum, hoursAgo, pickColor } from "../../lib/format";
import { Sparkline } from "../../components/Charts";

const spark = [40, 36, 42, 38, 45, 41, 48, 44, 50, 47, 52, 49];

export default function OfficerDashboard() {
  const user = useCurrentUser()!;
  const nav = useNavigate();
  const state = useStore();
  const m = computeMetrics(state.reports);
  const mine = state.reports.filter((r) => (user.departmentId ? r.departmentId === user.departmentId : true));
  const pending = mine.filter((r) => r.status === "REPORTED" || r.status === "AI_VERIFIED");
  const inProgress = mine.filter((r) => r.status === "IN_PROGRESS");
  const resolved = mine.filter((r) => r.status === "RESOLVED");
  const [sel, setSel] = useState<string | null>(null);

  // SLA risk: priority score high & not assigned
  const queue = [...pending].sort((a, b) => b.priorityScore - a.priorityScore);
  const slaRisk = queue.filter((r) => r.priorityScore >= 70).length;

  const assignedTo = (r: typeof mine[number]) => r.assignedTo;
  const selected = state.reports.find((r) => r.id === sel) || null;

  return (
    <div>
      <PageTitle eyebrow="Officer workspace" title={<>Queue Overview, <span className="grad-text">{user.name.split(" ")[0]}</span> 🛡️</>} sub={user.designation ? `${user.designation} · ${getDept(user.departmentId || "roads").name}` : "Review & resolve the municipal queue."} right={<button className="btn btn-outline" onClick={() => nav("/officer/team")}><IconShield size={16} /> My team</button>} />

      {/* KPIs */}
      <div className="g4">
        <KPI icon={<IconGrid />} value={String(pending.length)} label="Pending triage" color="#22d3ee" />
        <KPI icon={<IconClock />} value={String(inProgress.length)} label="In progress" color="#fbbf24" />
        <KPI icon={<IconCheck />} value={String(resolved.length)} label="Resolved" color="#34d399" />
        <KPI icon={<IconAlert />} value={String(slaRisk)} label="SLA breach risk" color="#fb7185" />
      </div>

      <div className="g2 mt-4" style={{ gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
        {/* priority queue */}
        <Reveal><div className="card card-glow" style={{ height: "100%" }}>
          <div className="row-between mb-3">
            <h3 className="h-md">Priority queue <span className="faint" style={{ fontSize: 13, fontWeight: 500 }}>· auto-routed by Setu AI</span></h3>
            <button className="btn btn-ghost btn-sm" onClick={() => nav("/officer/queue")}>View all <IconChevR size={14} /></button>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {queue.slice(0, 6).map((r) => {
              const d = getDept(r.departmentId);
              return (
                <button key={r.id} className="card card-hover row" style={{ width: "100%", textAlign: "left", gap: 14, padding: 14 }} onClick={() => setSel(r.id)}>
                  <span style={{ position: "relative", display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 11, background: r.priorityScore >= 70 ? "rgba(244,63,94,0.14)" : d.color + "1c", color: r.priorityScore >= 70 ? "#fb7185" : d.color, flexShrink: 0 }}><IconBolt size={18} /></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row gap-1 wrap"><span className="mono faint" style={{ fontSize: 11 }}>{r.id}</span><Sev s={r.severity} /><StatusBadge s={r.status} /><span className="faint" style={{ fontSize: 11 }}>{hoursAgo(r.created)}</span></div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.englishSummary}</div>
                    <div className="faint" style={{ fontSize: 11.5 }}>{d.short} · {r.location || r.landmark}{assignedTo(r) ? ` · → ${assignedTo(r)}` : ""}</div>
                  </div>
                  <span className="chip st" style={{ flexShrink: 0 }}>⚡ {r.priorityScore}</span>
                </button>
              );
            })}
            {queue.length === 0 && <div className="center muted" style={{ padding: "30px" }}>Queue is clear 🎉 No pending reports.</div>}
          </div>
        </div></Reveal>

        {/* right column */}
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <Reveal delay={70}><div className="card">
            <div className="row-between mb-1"><span className="faint" style={{ fontSize: 12 }}>Compliance velocity</span><span className="chip st-RESOLVED">▲ on track</span></div>
            <Sparkline data={spark} color="#34d399" w={280} h={64} />
            <div className="row-between mt-2"><span className="faint" style={{ fontSize: 12.5 }}>Across your department</span><b style={{ fontSize: 13 }}>{m.resolutionRate}% resolved</b></div>
          </div></Reveal>
          <Reveal delay={120}><div className="card" style={{ background: "radial-gradient(80% 140% at 20% 0%, rgba(34,211,238,0.14), rgba(8,13,26,0.5))" }}>
            <div className="row gap-2"><div className="kpi ic" style={{ background: "rgba(34,211,238,0.14)", color: "#22d3ee" }}><IconSpark size={24} /></div><div><div className="h-md" style={{ fontSize: 16 }}>Setu AI assist</div><div className="faint" style={{ fontSize: 12.5 }}>Recommends priority, dept & crew based on <b style={{ color: "#e8edf8" }}>{state.analytics.accuracy}%</b> routing accuracy</div></div></div>
            <div className="divider" style={{ margin: "14px 0" }} />
            <div className="row gap-1 wrap"><span className="chip st">English summaries</span><span className="chip st">Auto-verification</span><span className="chip st">SLA alerts</span></div>
          </div></Reveal>
        </div>
      </div>

      {selected && <ReportDetail report={selected} role="officer" onClose={() => setSel(null)} onAction={(st, note) => { store.updateReportStatus(selected.id, st, { note: note as any, assignTo: selected.assignedTo || user.name, actor: user.name }); }} />}
    </div>
  );
}
