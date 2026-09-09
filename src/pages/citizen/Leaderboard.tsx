import { PageTitle } from "../../components/AppShell";
import { Avatar, Reveal } from "../../components/ui";
import { IconFlame, IconBolt } from "../../components/Icons";
import { useStore } from "../../lib/hooks";
import { pickColor, formatNum } from "../../lib/format";

const LEADERS = [
  { n: "Priya Sharma", c: "Mumbai", k: 9840, r: 212, t: "City Guardian", s: 46 },
  { n: "Arjun Mehta", c: "Bengaluru", k: 9120, r: 188, t: "Ward Warrior", s: 38 },
  { n: "Kavya Reddy", c: "Hyderabad", k: 8760, r: 176, t: "Eco Champion", s: 35 },
  { n: "Rohan Das", c: "Kolkata", k: 8110, r: 164, t: "Street Sentinel", s: 29 },
  { n: "Ananya Iyer", c: "Chennai", k: 7690, r: 151, t: "Civic Star", s: 27 },
  { n: "Vikram Singh", c: "Delhi", k: 7340, r: 143, t: "Mohalla Hero", s: 24 },
];

export default function Leaderboard() {
  const state = useStore();
  return (
    <div>
      <PageTitle eyebrow="Changemaker leaderboard" title="Civic Heroes" sub="Karma = verified reports × speed × community votes. The more you help your ward, the higher you climb." />
      <div className="card card-glow" style={{ maxWidth: 760 }}>
        {LEADERS.map((l, i) => (
          <Reveal key={l.n} delay={i * 60}><div className="row gap-2" style={{ padding: "16px 4px", borderTop: i ? "1px solid var(--line)" : "none" }}>
            <span style={{ width: 30, fontSize: 22, fontWeight: 800, color: i === 0 ? "#fbbf24" : "#64708a" }}>{i + 1}</span>
            <Avatar name={l.n} color={pickColor(l.n)} />
            <div style={{ flex: 1 }}>
              <div className="row-between"><b style={{ fontSize: 15 }}>{l.n} <span className="faint" style={{ fontSize: 12 }}>· {l.c}</span></b><b style={{ fontSize: 16 }}>{formatNum(l.k)}</b></div>
              <div className="row gap-1 wrap faint" style={{ fontSize: 12 }}><span className="row gap-1"><IconFlame size={12} style={{ color: "#fb923c" }} /> {l.s}-day streak</span><span>·</span><span className="row gap-1"><IconBolt size={12} style={{ color: "#fbbf24" }} /> {l.r} reports</span><span>·</span><span>{l.t}</span></div>
            </div>
            <div className="bar" style={{ width: 120, alignSelf: "center" }}><span style={{ width: `${(l.k / LEADERS[0].k) * 100}%` }} /></div>
          </div></Reveal>
        ))}
        <p className="faint center mt-2" style={{ fontSize: 12 }}>{state.users.length} citizens registered · karma rewards verified reports</p>
      </div>
    </div>
  );
}
