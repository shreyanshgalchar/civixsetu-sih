import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/AppShell";
import { Avatar, KPI, Sev, StatusBadge, Reveal } from "../../components/ui";
import { IconMegaphone, IconCheck, IconClock, IconBolt, IconSpark, IconChevR, IconTrend } from "../../components/Icons";
import { useStore, useCurrentUser, computeMetrics } from "../../lib/hooks";
import { formatNum, pickColor } from "../../lib/format";
import { getDept } from "../../lib/departments";
import { Sparkline } from "../../components/Charts";
import { store } from "../../lib/store";

const spark = [12, 18, 14, 22, 19, 26, 24, 31, 27, 35, 30, 40];

export default function CitizenOverview() {
  const user = useCurrentUser()!;
  const nav = useNavigate();
  const state = useStore();
  const mine = state.reports.filter((r) => r.citizenId === user.id);
  const all = computeMetrics(state.reports);
  const myStats = computeMetrics(mine);

  const recent = [...mine].sort((a, b) => b.created - a.created).slice(0, 5);

  return (
    <div>
      <PageTitle eyebrow="Citizen workspace" title={<>Namaste, <span className="grad-text">{user.name.split(" ")[0]}</span> 👋</>} sub="Your city is made of small fixes by people like you. Keep reporting." />
      <div className="row gap-2 wrap mb-3">
        <div className="row gap-2">
          <Avatar name={user.name} color={user.avatarColor} />
          <div>
            <div className="row gap-1"><b>🔥 {user.streak}-day streak</b><span className="chip st">{formatNum(user.karma)} karma</span></div>
            <div className="faint" style={{ fontSize: 12.5 }}>{user.ward}, {user.city} · {user.verifiedCount} verified reports</div>
          </div>
        </div>
        <button className="btn btn-primary right" onClick={() => nav("/citizen/report")}><IconMegaphone size={17} /> New report</button>
      </div>

      {/* KPIs */}
      <div className="g4">
        <KPI icon={<IconMegaphone />} value={String(myStats.total)} label="My reports" color="#22d3ee" />
        <KPI icon={<IconCheck />} value={String(myStats.resolved)} label="Resolved" color="#34d399" />
        <KPI icon={<IconClock />} value={myStats.avgDays.toFixed(1)} label="Avg. days to resolve" color="#fbbf24" />
        <KPI icon={<IconBolt />} value={String(myStats.totalUpvotes)} label="Community votes" color="#8b5cf6" />
      </div>

      {/* hero action */}
      <Reveal><div className="card card-glow mt-4" style={{ padding: "30px", background: "radial-gradient(80% 140% at 10% 10%, rgba(34,211,238,0.16), rgba(8,13,26,0.5))" }}>
        <div className="row-between wrap gap-3">
          <div style={{ maxWidth: 460 }}>
            <div className="row gap-1 mb-2"><IconSpark size={18} color="#22d3ee" /><span className="h-md">Describe it. Setu AI routes it.</span></div>
            <p className="muted" style={{ fontSize: 14 }}>Type in any language — English, हिन्दी, తెలుగు, Hinglish. Setu AI translates to an English summary, auto-detects the department and sets a priority & SLA.</p>
            <div className="row gap-2 wrap mt-3">
              <button className="btn btn-primary" onClick={() => nav("/citizen/report")}><IconMegaphone size={17} /> Start a report</button>
              <button className="btn btn-ghost" onClick={() => nav("/citizen/analytics")}><IconTrend size={16} /> City pulse</button>
            </div>
          </div>
          <div style={{ minWidth: 260 }}>
            <div className="row-between mb-1"><span className="faint" style={{ fontSize: 12 }}>Your contribution trend</span><span className="chip st-RESOLVED">▲ active</span></div>
            <Sparkline data={spark} color="#22d3ee" w={280} h={70} />
          </div>
        </div>
      </div></Reveal>

      {/* recent reports */}
      <div className="row-between mt-4 mb-2">
        <h3 className="h-md">My recent reports</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => nav("/citizen/reports")}>View all <IconChevR size={14} /></button>
      </div>
      {recent.length === 0 ? (
        <div className="card center" style={{ padding: "40px 20px" }}>
          <div className="kpi ic" style={{ margin: "0 auto 12px", background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}><IconMegaphone size={26} /></div>
          <div className="h-md">No reports yet</div>
          <p className="muted" style={{ fontSize: 13.5 }}>Spot a pothole, a dark street or an overflowing bin? File your first report.</p>
          <button className="btn btn-primary mt-3" onClick={() => nav("/citizen/report")}>File a report</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {recent.map((r) => {
            const d = getDept(r.departmentId);
            return (
              <button key={r.id} className="card card-hover row" style={{ width: "100%", textAlign: "left", gap: 16 }} onClick={() => nav(`/citizen/track/${r.id}`)}>
                <div className="avatar-chip" style={{ borderRadius: 12, background: `${d.color}1e`, color: d.color, display: "grid", placeItems: "center", flexShrink: 0 }}><IconBolt size={20} /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="row gap-1 wrap"><span className="mono faint" style={{ fontSize: 11.5 }}>{r.id}</span><Sev s={r.severity} /><StatusBadge s={r.status} /></div>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.englishSummary}</div>
                  <div className="faint" style={{ fontSize: 12 }}>{r.departmentName} · {r.location || r.landmark}</div>
                </div>
                <IconChevR size={18} style={{ color: "#64708a", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
