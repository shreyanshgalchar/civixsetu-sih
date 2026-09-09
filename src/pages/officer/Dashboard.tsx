import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/AppShell";
import { KPI, Reveal, Sev, StatusBadge } from "../../components/ui";
import { ReportDetail } from "../../components/ReportDetail";
import { IconGrid, IconCheck, IconClock, IconAlert, IconChevR, IconBolt, IconShield, IconSpark, IconSearch, IconRefresh, IconLayers, IconTrend } from "../../components/Icons";
import { useStore, useCurrentUser, computeMetrics, reportedVsResolved } from "../../lib/hooks";
import { getDept, deptPhoto } from "../../lib/departments";
import { store } from "../../lib/store";
import { formatNum, hoursAgo, assetUrl } from "../../lib/format";
import { Sparkline, BarChart, Ring } from "../../components/Charts";
import { DEPARTMENTS } from "../../lib/departments";

const spark = [40, 36, 42, 38, 45, 41, 48, 44, 50, 47, 52, 49];

export default function OfficerDashboard() {
  const user = useCurrentUser()!;
  const nav = useNavigate();
  const state = useStore();
  const m = computeMetrics(state.reports);
  const deptId = user.departmentId || "roads";
  const mine = state.reports.filter((r) => r.departmentId === deptId);
  const pending = mine.filter((r) => r.status === "REPORTED" || r.status === "AI_VERIFIED");
  const inProgress = mine.filter((r) => r.status === "IN_PROGRESS");
  const resolved = mine.filter((r) => r.status === "RESOLVED");
  const [sel, setSel] = useState<string | null>(null);

  const queue = [...pending].sort((a, b) => b.priorityScore - a.priorityScore);
  const slaRisk = queue.filter((r) => r.priorityScore >= 70).length;
  const oldCases = queue.filter((r) => Date.now() - r.created > r.slaDays * 86400000).length;

  // department health per dept
  const deptHealth = useMemo(() => DEPARTMENTS.map((d) => {
    const list = state.reports.filter((r) => r.departmentId === d.id);
    const res = list.filter((r) => r.status === "RESOLVED").length;
    const rate = list.length ? Math.round((res / list.length) * 100) : 100;
    return { ...d, total: list.length, rate };
  }).sort((a, b) => b.rate - a.rate), [state.reports]);

  const weekly = reportedVsResolved(state.reports);
  const selected = state.reports.find((r) => r.id === sel) || null;
  const aiRecs = useMemo(() => {
    return queue.slice(0, 3).map((r) => {
      const d = getDept(r.departmentId);
      const crewNear = ["Crew 7", "Crew 3", "Crew 12"][Math.floor(Math.random() * 3)];
      return { report: r, d, crewNear };
    });
  }, [queue]);

  return (
    <div>
      <PageTitle eyebrow="Officer workspace · command desk" title={<>Briefing, <span className="grad-text">{user.name.split(" ")[0]}</span> 🛡️</>} sub={user.designation ? `${user.designation} · ${getDept(deptId).name}` : "Review & resolve the municipal queue."} right={<button className="btn btn-outline" onClick={() => nav("/officer/team")}><IconShield size={16} /> My team</button>} />

      {/* morning briefing strip */}
      <div className="card glass-strong shimmer-border mb-3 row-between wrap gap-3" style={{ padding: "16px 20px" }}>
        <div className="row gap-2">
          <div className="kpi ic" style={{ background: "rgba(34,211,238,0.14)", color: "#22d3ee" }}><IconSpark size={24} /></div>
          <div>
            <div className="h-md" style={{ fontSize: 16 }}>Morning briefing · {getDept(deptId).name}</div>
            <div className="faint" style={{ fontSize: 13 }}>{pending.length} awaiting triage · {inProgress.length} in the field · {slaRisk} at SLA breach risk · {oldCases} overdue</div>
          </div>
        </div>
        <div className="row gap-2 wrap">
          <span className="chip st-RESOLVED">▲ {m.resolutionRate}% resolution</span>
          <span className="chip" style={{ background: "rgba(52,211,153,0.14)", color: "#6ee7b7" }}><IconCheck size={12} /> {resolved.length} resolved</span>
          <button className="btn btn-primary btn-sm" onClick={() => nav("/officer/queue")}>Open queue</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="g4">
        <KPI icon={<IconGrid />} value={String(pending.length)} label="Pending triage" color="#22d3ee" />
        <KPI icon={<IconClock />} value={String(inProgress.length)} label="In the field" color="#fbbf24" />
        <KPI icon={<IconCheck />} value={String(m.resolutionRate) + "%"} label="Resolution rate" color="#34d399" sub={`${resolved.length} of ${mine.length} closed`} />
        <KPI icon={<IconAlert />} value={String(slaRisk)} label="SLA breach risk" color="#fb7185" sub={`${oldCases} overdue`} />
      </div>

      <div className="g2 mt-4" style={{ gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>
        {/* priority queue */}
        <Reveal><div className="card card-glow" style={{ height: "100%" }}>
          <div className="row-between mb-3">
            <h3 className="h-md">Priority queue <span className="faint" style={{ fontSize: 13, fontWeight: 500 }}>· Setu AI routed</span></h3>
            <button className="btn btn-ghost btn-sm" onClick={() => nav("/officer/queue")}>View all <IconChevR size={14} /></button>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {queue.slice(0, 6).map((r) => {
              const d = getDept(r.departmentId);
              return (
                <button key={r.id} className="card card-hover row" style={{ width: "100%", textAlign: "left", gap: 12, padding: 10 }} onClick={() => setSel(r.id)}>
                  <div style={{ position: "relative", width: 58, height: 48, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <img src={assetUrl(deptPhoto(r.departmentId, r.created))} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 22, background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }} />
                    <div style={{ position: "absolute", top: 3, left: 5, fontSize: 9, fontWeight: 700, color: d.color, textShadow: "0 1px 4px #000" }}>{d.code}</div>
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="row gap-1 wrap" style={{ fontSize: 11 }}><span className="mono faint">{r.id}</span><Sev s={r.severity} /><StatusBadge s={r.status} /><span className="faint">{hoursAgo(r.created)}</span></div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.englishSummary}</div>
                    <div className="faint" style={{ fontSize: 11.5 }}>{d.short} · {r.location || r.landmark}{r.assignedTo ? ` · → ${r.assignedTo}` : ""}</div>
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
            <Sparkline data={spark} color="#34d399" w={280} h={60} />
            <div className="row-between mt-2"><span className="faint" style={{ fontSize: 12.5 }}>Your department</span><b style={{ fontSize: 13 }}>{m.resolutionRate}% resolved</b></div>
          </div></Reveal>

          {/* AI recommendations */}
          <Reveal delay={100}><div className="card" style={{ background: "radial-gradient(80% 140% at 20% 0%, rgba(139,92,246,0.14), rgba(8,13,26,0.5))" }}>
            <div className="row gap-2 mb-2"><div className="kpi ic" style={{ background: "rgba(139,92,246,0.16)", color: "#c4b5fd" }}><IconSpark size={22} /></div><div><div className="h-md" style={{ fontSize: 15 }}>Setu AI recommendations</div><div className="faint" style={{ fontSize: 12 }}>Ranked by priority + proximity</div></div></div>
            <div style={{ display: "grid", gap: 10 }}>
              {aiRecs.length ? aiRecs.map((a, i) => (
                <button key={a.report.id} className="row gap-2" style={{ width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--line)" }} onClick={() => setSel(a.report.id)}>
                  <span className="chip st" style={{ flexShrink: 0 }}>#{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.report.englishSummary}</div>
                    <div className="faint" style={{ fontSize: 11 }}>Dispatch <b style={{ color: "#e8edf8" }}>{a.crewNear}</b> · {a.d.short} · ETA {a.report.slaDays}d</div>
                  </div>
                </button>
              )) : <div className="faint" style={{ fontSize: 12.5 }}>No active recommendations — queue is clear.</div>}
            </div>
          </div></Reveal>
        </div>
      </div>

      {/* department health + weekly */}
      <div className="g2 mt-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Reveal><div className="card">
          <div className="row-between mb-2"><h3 className="h-md">Department health</h3><span className="chip st">live</span></div>
          {deptHealth.slice(0, 6).map((d) => (
            <div key={d.id} className="row gap-2" style={{ padding: "6px 0" }}>
              <span style={{ width: 150, fontSize: 12.5, color: "#92a0ba" }}>{d.short}</span>
              <div className="bar" style={{ flex: 1 }}><span style={{ width: `${d.rate}%`, background: d.rate > 80 ? "#34d399" : d.rate > 60 ? "#fbbf24" : "#fb7185" }} /></div>
              <b style={{ width: 56, fontSize: 12, textAlign: "right" }}>{d.rate}%<span className="faint" style={{ fontWeight: 400 }}> · {d.total}</span></b>
            </div>
          ))}
        </div></Reveal>
        <Reveal delay={80}><div className="card">
          <div className="row-between mb-2"><h3 className="h-md">City reported vs resolved</h3><span className="chip st-RESOLVED">▲ +{m.resolutionRate}%</span></div>
          <BarChart data={weekly} series1="Reported" series2="Resolved" h={190} />
        </div></Reveal>
      </div>

      {/* SLA risk table */}
      {slaRisk > 0 && (
        <Reveal><div className="card mt-2" style={{ background: "rgba(244,63,94,0.06)", borderColor: "rgba(244,63,94,0.26)" }}>
          <div className="row-between mb-2"><h3 className="h-md" style={{ fontSize: 16 }}><IconAlert size={16} style={{ color: "#fb7185", marginRight: 6 }} /> SLA breach risk</h3><button className="btn btn-danger btn-sm" onClick={() => nav("/officer/queue")}>Review now</button></div>
          <div style={{ display: "grid", gap: 8 }}>
            {queue.filter((r) => r.priorityScore >= 70).slice(0, 4).map((r) => {
              const elapsed = (Date.now() - r.created) / 86400000;
              const over = elapsed > r.slaDays;
              return (
                <div key={r.id} className="row gap-2" style={{ padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
                  <span className="mono faint" style={{ fontSize: 11 }}>{r.id}</span>
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{r.englishSummary}</div><div className="faint" style={{ fontSize: 11.5 }}>{r.departmentName} · {hoursAgo(r.created)}</div></div>
                  <span className="chip" style={{ background: over ? "rgba(244,63,94,0.18)" : "rgba(245,158,11,0.16)", color: over ? "#fb7185" : "#fbbf24" }}>{over ? "OVERDUE" : `${(r.slaDays - elapsed).toFixed(1)}d left`}</span>
                </div>
              );
            })}
          </div>
        </div></Reveal>
      )}

      {selected && <ReportDetail report={selected} role="officer" onClose={() => setSel(null)} onAction={(st, note) => { store.updateReportStatus(selected.id, st, { note: note as any, assignTo: selected.assignedTo || user.name, actor: user.name }); }} />}
    </div>
  );
}
