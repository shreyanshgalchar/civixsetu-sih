import { PageTitle } from "../../components/AppShell";
import { Avatar, Reveal, StatusBadge, Sev } from "../../components/ui";
import { IconShield, IconGrid, IconClock, IconSpark } from "../../components/Icons";
import { useStore, useCurrentUser } from "../../lib/hooks";
import { getDept } from "../../lib/departments";
import { pickColor } from "../../lib/format";
import { Ring } from "../../components/Charts";

const TEAM = [
  { n: "Satish Kumar", r: "Sanitary Inspector", d: "sanitation", load: 12, open: 5 },
  { n: "Farhan Ali", r: "Line Superintendent", d: "streetlights", load: 8, open: 3 },
  { n: "Lakshmi Nair", r: "Water Works Engineer", d: "water", load: 9, open: 4 },
  { n: "Amol Patil", r: "Field Crew Lead", d: "roads", load: 14, open: 6 },
];

export default function Team() {
  const user = useCurrentUser()!;
  const state = useStore();
  const dpt = getDept(user.departmentId || "roads");
  const assigned = state.reports.filter((r) => r.assignedOfficerId === user.id);
  return (
    <div>
      <PageTitle eyebrow="Officer workspace" title="My Team" sub={`Network of field workers under the ${dpt.name}. Coordinate, dispatch and track field action.`} />
      <div className="g4">
        <div className="card"><div className="row gap-2"><div className="kpi ic" style={{ background: "rgba(139,92,246,0.14)", color: "#c4b5fd" }}><IconShield size={24} /></div><div><div className="v" style={{ fontSize: 20 }}>{TEAM.length + 1}</div><div className="l">Active field workers</div></div></div></div>
        <div className="card"><div className="row gap-2"><div className="kpi ic" style={{ background: "rgba(34,211,238,0.14)", color: "#22d3ee" }}><IconGrid size={24} /></div><div><div className="v" style={{ fontSize: 20 }}>{assigned.length}</div><div className="l">Reports assigned to you</div></div></div></div>
        <div className="card"><div className="row gap-2"><div className="kpi ic" style={{ background: "rgba(52,211,153,0.14)", color: "#34d399" }}><IconClock size={24} /></div><div><div className="v" style={{ fontSize: 20 }}>{TEAM.reduce((s, t) => s + t.open, 0)}</div><div className="l">Open assignments</div></div></div></div>
        <div className="card"><div className="row gap-2"><div className="kpi ic" style={{ background: "rgba(244,63,94,0.12)", color: "#fb7185" }}><IconSpark size={24} /></div><div><div className="v" style={{ fontSize: 20 }}>{state.analytics.accuracy}%</div><div className="l">AI routing accuracy</div></div></div></div>
      </div>

      <div className="card card-glow mt-4" style={{ maxWidth: 820 }}>
        <h3 className="h-md mb-2">Field workers by department</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {TEAM.map((t, i) => {
            const d = getDept(t.d);
            return (
              <Reveal key={t.n} delay={i * 60}><div className="row gap-2" style={{ padding: "14px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <Avatar name={t.n} color={pickColor(t.n)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{t.n} <span className="faint" style={{ fontSize: 12 }}>· {t.r}</span></div>
                  <div className="faint" style={{ fontSize: 12 }}>{d.name}</div>
                  <div className="row gap-1 wrap mt-1"><span className="chip st"><IconGrid size={12} /> {t.load} active</span><span className="chip st"><IconClock size={12} /> {t.open} open</span></div>
                </div>
                <div style={{ textAlign: "center" }}><Ring pct={Math.round((t.load / Math.max(1, t.load + t.open)) * 100)} size={64} color={d.color} /></div>
              </div></Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
