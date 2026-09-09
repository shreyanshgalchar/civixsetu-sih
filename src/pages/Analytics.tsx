import { useMemo } from "react";
import { PageTitle } from "../components/AppShell";
import { KPI, Reveal } from "../components/ui";
import { IconBar, IconTrend, IconCheck, IconBolt, IconClock, IconSpark } from "../components/Icons";
import { BarChart, DonutChart, HeatGrid, Sparkline } from "../components/Charts";
import { useStore, computeMetrics, reportedVsResolved, byDepartment } from "../lib/hooks";
import { DEPARTMENTS, getDept } from "../lib/departments";
import { formatNum } from "../lib/format";

const WARDS = [
  { id: "AW", label: "Andheri W", sub: "Mumbai", value: 92 }, { id: "KO", label: "Koramangala", sub: "Bengaluru", value: 78 },
  { id: "SL", label: "Salt Lake", sub: "Kolkata", value: 64 }, { id: "CP", label: "Connaught Pl.", sub: "Delhi", value: 88 },
  { id: "BH", label: "Banjara Hills", sub: "Hyderabad", value: 55 }, { id: "AD", label: "Adyar", sub: "Chennai", value: 71 },
  { id: "VA", label: "Vastrapur", sub: "Ahmedabad", value: 47 }, { id: "IN", label: "Indiranagar", sub: "Bengaluru", value: 83 },
];
const spark = [12, 18, 14, 22, 19, 26, 24, 31, 27, 35, 30, 40];

export default function Analytics({ officer = false }: { officer?: boolean }) {
  const state = useStore();
  const reports = state.reports;
  const m = computeMetrics(reports);
  const weekly = reportedVsResolved(reports);
  const deptCount = useMemo(() => byDepartment(reports), [reports]);
  const donut = DEPARTMENTS.map((d) => ({ label: d.short, value: deptCount[d.id] || 0, color: d.color })).filter((x) => x.value > 0);
  const topDept = [...DEPARTMENTS].sort((a, b) => (deptCount[b.id] || 0) - (deptCount[a.id] || 0))[0];

  return (
    <div>
      <PageTitle eyebrow={officer ? "Operations analytics" : "Open data"} title={officer ? "City Performance" : "Public Analytics"} sub="Every resolution, every ward score, every trend — published live, no cherry-picking." />

      <div className="g4">
        <KPI icon={<IconBar />} value={formatNum(m.total)} label="Total reports" color="#22d3ee" />
        <KPI icon={<IconCheck />} value={`${m.resolutionRate}%`} label="Resolution rate" color="#34d399" />
        <KPI icon={<IconClock />} value={m.avgDays.toFixed(1)} label="Avg. days to resolve" color="#fbbf24" />
        <KPI icon={<IconBolt />} value={String(m.critical + m.high)} label="Critical + High active" color="#fb7185" />
      </div>

      <div className="g2 mt-4" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
        <Reveal><div className="card card-glow"><div className="row-between mb-3"><h3 className="h-md">Reported vs Resolved</h3><span className="chip st-RESOLVED">▲ +18%</span></div><BarChart data={weekly} series1="Reported" series2="Resolved" /></div></Reveal>
        <Reveal delay={80}><div className="card card-glow"><h3 className="h-md mb-3">Reports by category</h3><DonutChart data={donut} /></div></Reveal>
      </div>

      <div className="g2 mt-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Reveal><div className="card"><h3 className="h-md mb-2">Ward intensity heatmap</h3><p className="faint mb-2" style={{ fontSize: 12.5 }}>Hover a ward to feel the pulse.</p><HeatGrid cells={WARDS} /></div></Reveal>
        <Reveal delay={80}><div className="card"><h3 className="h-md mb-2">Department leaderboards</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {[...DEPARTMENTS].sort((a, b) => (deptCount[b.id] || 0) - (deptCount[a.id] || 0)).slice(0, 8).map((d, i) => {
              const w = Math.round(((deptCount[d.id] || 0) / m.total) * 100);
              return <div key={d.id} className="row gap-2"><span style={{ width: 16, fontWeight: 800, color: "#64708a", fontSize: 13 }}>{i + 1}</span><span style={{ width: 130, fontSize: 12.5, color: "#92a0ba" }}>{d.short}</span><div className="bar" style={{ flex: 1 }}><span style={{ width: `${w}%`, background: d.color }} /></div><b style={{ width: 34, fontSize: 12, textAlign: "right" }}>{deptCount[d.id] || 0}</b></div>;
            })}
          </div>
        </div></Reveal>
      </div>

      <div className="g2 mt-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <Reveal><div className="card"><h3 className="h-md mb-2">Resolution velocity</h3><Sparkline data={spark} color="#34d399" w={300} h={72} /><p className="faint mt-2" style={{ fontSize: 12.5 }}>{topDept ? `${topDept.name} leads volume with ${deptCount[topDept.id]} reports` : "—"}</p></div></Reveal>
        <Reveal delay={80}><div className="card"><div className="row gap-2"><div className="kpi ic" style={{ background: "rgba(139,92,246,0.14)", color: "#c4b5fd" }}><IconSpark size={24} /></div><div><div className="h-md">AI model health</div><div className="faint" style={{ fontSize: 12.5 }}>{state.analytics.modelVersion} · {state.analytics.accuracy}% routing accuracy</div></div></div>
          <div className="divider" style={{ margin: "14px 0" }} />
          <div className="row gap-1 wrap"><span className="chip st">96.8% accuracy</span><span className="chip st">8s triage</span><span className="chip st">12 languages</span><span className="chip st">Offline</span></div>
        </div></Reveal>
      </div>
    </div>
  );
}
