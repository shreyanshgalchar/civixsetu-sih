import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../components/SiteChrome";
import { SectionHead, Reveal, Tilt, KPI, Avatar } from "../components/ui";
import { DeptIcon, IconMic, IconSpark, IconChevR, IconCheck, IconPin } from "../components/Icons";
import { DEPARTMENTS } from "../lib/departments";
import { useStore, computeMetrics, reportedVsResolved, byDepartment } from "../lib/hooks";
import { ReportCard } from "../components/ReportCard";
import { ReportDetail } from "../components/ReportDetail";
import { BarChart, DonutChart, HeatGrid } from "../components/Charts";
import { LandingDemo } from "../components/LandingDemo";
import { pickColor, formatNum } from "../lib/format";

const WARDS = [
  { id: "AW", label: "Andheri W", sub: "Mumbai", value: 92 }, { id: "KO", label: "Koramangala", sub: "Bengaluru", value: 78 },
  { id: "SL", label: "Salt Lake", sub: "Kolkata", value: 64 }, { id: "CP", label: "Connaught Pl.", sub: "Delhi", value: 88 },
  { id: "BH", label: "Banjara Hills", sub: "Hyderabad", value: 55 }, { id: "AD", label: "Adyar", sub: "Chennai", value: 71 },
  { id: "VA", label: "Vastrapur", sub: "Ahmedabad", value: 47 }, { id: "IN", label: "Indiranagar", sub: "Bengaluru", value: 83 },
];
const LEADERS = [
  { n: "Priya Sharma", c: "Mumbai", k: 9840, r: 212, t: "City Guardian", s: 46 },
  { n: "Arjun Mehta", c: "Bengaluru", k: 9120, r: 188, t: "Ward Warrior", s: 38 },
  { n: "Kavya Reddy", c: "Hyderabad", k: 8760, r: 176, t: "Eco Champion", s: 35 },
  { n: "Rohan Das", c: "Kolkata", k: 8110, r: 164, t: "Street Sentinel", s: 29 },
  { n: "Ananya Iyer", c: "Chennai", k: 7690, r: 151, t: "Civic Star", s: 27 },
];

function Counter({ to, suffix = "", dur = 1400 }: { to: number; suffix?: string; dur?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - start) / dur); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <>{v}{suffix}</>;
}

function HeroMock() {
  return (
    <Tilt max={10} className="card card-glow" style={{ width: 340, padding: 0, overflow: "hidden", background: "rgba(8,13,26,0.7)" }}>
      <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
        <span className="chip st">● LIVE</span><span className="row gap-1 right faint" style={{ fontSize: 12 }}><IconSpark size={14} color="#22d3ee" /> Setu AI scanning</span>
      </div>
      <div style={{ padding: 20, position: "relative", overflow: "hidden" }}>
        <div className="scanline" />
        <div className="row gap-1 mb-2">
          <span className="chip sev-CRITICAL">CRITICAL</span><span className="chip st">🛣️ Pothole ×3</span>
        </div>
        <p className="h-md" style={{ fontSize: 17, lineHeight: 1.4 }}>Massive pothole cluster near metro pillar 47 — three deep potholes on the service lane causing two-wheeler skids.</p>
        <div className="card mt-3" style={{ padding: 14, borderLeft: "3px solid #22d3ee", background: "rgba(16,24,40,0.6)" }}>
          <div className="faint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Setu AI verdict</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Routed to <span style={{ color: "#22d3ee" }}>Public Works Dept.</span></div>
          <div className="faint" style={{ fontSize: 12, marginTop: 4 }}>Crew 7 · 1.2 km away · ETA <b style={{ color: "#e8edf8" }}>2 days</b></div>
        </div>
        <div className="row-between mt-3">
          <span className="faint" style={{ fontSize: 12.5 }}>▲ <b style={{ color: "#6ee7b7" }}>342</b> upvotes</span>
          <span className="chip st-RESOLVED">Resolved in 2.1d</span>
        </div>
      </div>
    </Tilt>
  );
}

export default function Landing() {
  const nav = useNavigate();
  const state = useStore();
  const reports = state.reports;
  const metrics = computeMetrics(reports);
  const [filter, setFilter] = useState("All");
  const [sel, setSel] = useState<string | null>(null);
  const cats = ["All", ...DEPARTMENTS.map((d) => d.short)];
  const filtered = filter === "All" ? reports : reports.filter((r) => r.departmentName === DEPARTMENTS.find((d) => d.short === filter)?.name || r.departmentName === filter);

  const deptCount = useMemo(() => byDepartment(reports), [reports]);
  const donut = DEPARTMENTS.map((d) => ({ label: d.short, value: deptCount[d.id] || 0, color: d.color })).filter((x) => x.value > 0);
  const weekly = reportedVsResolved(reports);

  const selected = reports.find((r) => r.id === sel) || null;

  return (
    <div className="app-shell" style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* ============================ HERO ============================ */}
      <section className="hero">
        <div className="hero-bg" /><div className="grid-bg" />
        <div className="orb" style={{ width: 300, height: 300, left: "8%", top: "12%", background: "rgba(34,211,238,0.2)" }} />
        <div className="orb" style={{ width: 360, height: 360, right: "6%", top: "6%", background: "rgba(139,92,246,0.22)" }} />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="two-col" style={{ gridTemplateColumns: "1.12fr 1fr", alignItems: "center" }}>
            <div>
              <span className="eyebrow"><span className="dot" /> SIH 2026 Finalist · 12 languages · Voice-first · Offline-ready</span>
              <h1 className="h-xl mt-3">Your city, fixed.<br />Powered by people,<br /><span className="grad-text">perfected by AI.</span></h1>
              <p className="lead mt-3">Setu means <b style={{ color: "#e8edf8" }}>bridge</b>. We bridge 1.4 billion citizens and their municipality with an AI engine that triages any complaint in <b style={{ color: "#22d3ee" }}>8 seconds</b>, translates multilingual input to a clear English summary, routes to the right department and tracks resolution transparently — from pothole to park bench.</p>
              <div className="row gap-2 wrap mt-4">
                <button className="btn btn-primary btn-lg" onClick={() => nav("/citizen/report")}>Report in 30 seconds <IconChevR size={18} /></button>
                <button className="btn btn-glass btn-lg" onClick={() => document.querySelector("#feature")?.scrollIntoView({ behavior: "smooth" })}>Watch Setu AI work <IconSpark size={18} /></button>
              </div>
              <div className="row gap-3 wrap mt-3" style={{ color: "#64708a", fontSize: 13 }}>
                <span className="row gap-1"><IconCheck size={15} style={{ color: "#6ee7b7" }} /> Govt.-grade audit trail</span>
                <span className="row gap-1"><IconCheck size={15} style={{ color: "#6ee7b7" }} /> 8-sec AI triage</span>
                <span className="row gap-1"><IconCheck size={15} style={{ color: "#6ee7b7" }} /> GPS-verified reports</span>
              </div>
            </div>
            <div style={{ display: "grid", placeItems: "center", position: "relative" }}>
              <HeroMock />
              <div className="card" style={{ position: "absolute", left: -4, bottom: 8, padding: "12px 16px", background: "rgba(8,13,26,0.9)", animation: "float 6s infinite" }}>
                <div className="stat"><span className="v grad-text" style={{ fontSize: 26 }}><Counter to={248590} suffix="+" /></span><span className="l">reports filed</span></div>
              </div>
              <div className="card" style={{ position: "absolute", right: -6, top: 4, padding: "12px 16px", background: "rgba(8,13,26,0.9)", animation: "float 7s infinite" }}>
                <div className="stat"><span className="v" style={{ color: "#6ee7b7", fontSize: 26 }}><Counter to={89} suffix="%" /></span><span className="l">resolution rate</span></div>
              </div>
            </div>
          </div>

          {/* counters strip */}
          <div className="g4 mt-5 row" style={{ marginTop: 50 }} id="stats">
            {[
              { v: metrics.total, s: "+", l: "Issues reported" },
              { v: metrics.resolutionRate, s: "%", l: "Resolution rate", c: "#34d399" },
              { v: metrics.avgDays.toFixed(1), s: "", l: "Avg. days to resolve", c: "#22d3ee", raw: true },
              { v: 8, s: "", l: "Wards connected", c: "#8b5cf6" },
            ].map((x, i) => (
              <Reveal key={i} delay={i * 90}><div className="card center" style={{ padding: "22px" }}>
                <div className="v" style={{ fontSize: 30, fontWeight: 800, color: x.c || "#ffffff" }}>{x.raw ? x.v : <Counter to={x.v as number} suffix={x.s} />}</div>
                <div className="faint" style={{ fontSize: 12.5, marginTop: 4 }}>{x.l}</div>
              </div></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section className="section tint-a" id="feature">
        <div className="container">
          <SectionHead center eyebrow="Voice → AI → Human → Field" title={<>The civic operating system,<br className="hide-desk" /> <span className="grad-text">understood in any language</span></>} sub="A citizen doesn't learn the system — the system understands the citizen. Every complaint is understood, translated, routed and tracked." />
          <div className="g4 mt-4">
            {[
              { i: <IconMic />, t: "Listen", d: "Natural voice in 12 Indian languages — speaks plainly, no forms.", c: "#22d3ee" },
              { i: <IconSpark />, t: "Understand", d: "AI triage translates mixed-language input into a crisp English summary.", c: "#8b5cf6" },
              { i: <IconPin />, t: "Locate", d: "GPS + map pinning, landmark extraction and ward auto-detection.", c: "#fbbf24" },
              { i: <IconCheck />, t: "Resolve", d: "Auto-routed to the right department, human-verified, SLA-tracked.", c: "#34d399" },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 90}><Tilt max={7} className="card card-hover" style={{ height: "100%" }}>
                <div className="kpi ic" style={{ background: `${f.c}18`, color: f.c, marginBottom: 16 }}>{f.i}</div>
                <h3 className="h-md">{f.t}</h3>
                <p className="muted mt-1" style={{ fontSize: 13.5 }}>{f.d}</p>
              </Tilt></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ AI DEMO ============================ */}
      <section className="section tint-b">
        <div className="container">
          <SectionHead eyebrow="Multilingual in · English out" title={<>Type in any language.<br /><span className="grad-text">Get an English summary + routing.</span></>} sub="This is the real engine running on your device — no keys, no latency, no bugs." />
          <div className="mt-4" style={{ maxWidth: 900, margin: "0 auto" }}><LandingDemo /></div>
        </div>
      </section>

      {/* ============================ DEPARTMENTS ============================ */}
      <section className="section tint-a" id="departments">
        <div className="container">
          <SectionHead center eyebrow="Every civic pain-point, covered" title={<>8 departments. <span className="grad-text">One bridge.</span></>} sub="Setu AI classifies every report in ~8 seconds and routes it to the exact desk — no wrong queues, no lost complaints." />
          <div className="g4 mt-4">
            {DEPARTMENTS.map((d, i) => (
              <Reveal key={d.id} delay={i * 70}><Tilt max={7} className="card card-hover" style={{ height: "100%", borderLeft: `3px solid ${d.color}` }}>
                <div className="row-between mb-2">
                  <div className="avatar-chip" style={{ borderRadius: 13, background: `${d.color}1a`, color: d.color, display: "grid", placeItems: "center" }}><DeptIcon ic={d.ic} size={24} /></div>
                  <span className="chip st">{formatNum(deptCount[d.id] || 0)} reports</span>
                </div>
                <div className="h-md" style={{ fontSize: 16 }}>{d.short}</div>
                <div className="faint" style={{ fontSize: 12.5, marginTop: 2 }}>{d.name}</div>
                <p className="muted mt-1" style={{ fontSize: 12.5, minHeight: 34 }}>{d.desc}</p>
              </Tilt></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ LIVE FEED ============================ */}
      <section className="section tint-b" id="live">
        <div className="container">
          <SectionHead eyebrow="Live citizen pulse" title={<>Issues, live from the streets</>} sub="Real-format reports with AI triage, department routing and a public timeline. Upvote to push urgent issues up the municipal queue." />
          <div className="row gap-1 wrap mb-3">
            {cats.map((c) => (
              <button key={c} className={filter === c ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>
          <div className="g3">
            {filtered.slice(0, 6).map((r) => <ReportCard key={r.id} report={r} onOpen={() => setSel(r.id)} />)}
          </div>
          <div className="center mt-4"><button className="btn btn-ghost" onClick={() => nav("/citizen")}>Open dashboard →</button></div>
        </div>
      </section>

      {/* ============================ ANALYTICS ============================ */}
      <section className="section tint-a" id="analytics">
        <div className="container">
          <SectionHead center eyebrow="Transparency, visualized" title={<>The city's health, <span className="grad-text">in living charts</span></>} sub="Open data builds trust. Every resolution, every ward score, every category trend — published live, no cherry-picking." />
          <div className="g2 mt-4" style={{ gridTemplateColumns: "1.1fr 1fr" }}>
            <Reveal><div className="card card-glow" style={{ height: "100%" }}>
              <div className="row-between mb-3"><h3 className="h-md">Reported vs Resolved · last 8 weeks</h3><span className="chip st-RESOLVED">▲ +18% this month</span></div>
              <BarChart data={weekly} series1="Reported" series2="Resolved" />
              <div className="legend mt-3"><span className="item"><span className="sw" style={{ background: "#22d3ee" }} /> Reported</span><span className="item"><span className="sw" style={{ background: "#8b5cf6" }} /> Resolved</span></div>
            </div></Reveal>
            <Reveal delay={90}><div className="card card-glow" style={{ height: "100%" }}>
              <h3 className="h-md mb-3">Reports by category</h3>
              <DonutChart data={donut} />
            </div></Reveal>
          </div>
          <div className="g2 mt-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Reveal><div className="card">
              <h3 className="h-md mb-3">Ward intensity heatmap</h3>
              <p className="faint" style={{ fontSize: 12.5, marginBottom: 14 }}>Darker = more active reports. Hover to feel the pulse.</p>
              <HeatGrid cells={WARDS} />
            </div></Reveal>
            <Reveal delay={90}><div className="card">
              <h3 className="h-md mb-3">What the data whispers</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["Sanitation leads volume but resolves fastest (3.1d)", "Swachh crews are the benchmark."],
                  ["Roads spike every monsoon", "Setu AI now pre-positions PWD crews using rainfall forecasts."],
                  ["Water issues carry the highest anxiety", "They auto-escalate 2× faster than any other category."],
                ].map(([t, d], i) => <div key={i} className="row gap-2" style={{ alignItems: "start" }}><span className="chip st" style={{ flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span><div><b style={{ fontSize: 14 }}>{t}</b><p className="muted" style={{ fontSize: 13 }}>{d}</p></div></div>)}
              </div>
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* ============================ LEADERBOARD ============================ */}
      <section className="section tint-b" id="story">
        <div className="container">
          <SectionHead center eyebrow="Changemaker leaderboard" title={<>Celebrating the <span className="grad-text">civic heroes</span></>} sub="Karma = verified reports × speed × community votes. The more you help your ward, the higher you climb." />
          <div className="g2 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <Reveal><div className="card">
              <h3 className="h-md mb-3">Ward leaderboard</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {["Andheri West", "Connaught Place", "Indiranagar", "Koramangala", "Adyar"].map((w, i) => (
                  <div key={w} className="row gap-2">
                    <span style={{ width: 22, fontSize: 16, fontWeight: 800, color: i === 0 ? "#fbbf24" : "#64708a" }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div className="row-between"><b style={{ fontSize: 14 }}>{w}</b><span className="faint" style={{ fontSize: 12.5 }}>{(96 - i * 4) - (i * 2)} /100</span></div>
                      <div className="bar mt-1"><span style={{ width: `${96 - i * 6}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div></Reveal>
            <Reveal delay={90}><div className="card">
              <h3 className="h-md mb-3">Changemaker karma</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {LEADERS.map((l, i) => (
                  <div key={l.n} className="row gap-2">
                    <span style={{ width: 22, fontSize: 16, fontWeight: 800, color: i === 0 ? "#fbbf24" : "#64708a" }}>{i + 1}</span>
                    <Avatar name={l.n} color={pickColor(l.n)} />
                    <div style={{ flex: 1 }}>
                      <div className="row-between"><b style={{ fontSize: 14 }}>{l.n} <span className="faint" style={{ fontSize: 11.5 }}>· {l.c}</span></b><b style={{ fontSize: 14 }}>{formatNum(l.k)}</b></div>
                      <div className="faint" style={{ fontSize: 11.5 }}>{l.t} · 🔥 {l.s}-day streak · {l.r} reports</div>
                    </div>
                  </div>
                ))}
              </div>
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="section">
        <div className="container">
          <Reveal><div className="card card-glow center" style={{ padding: "54px 30px", background: "radial-gradient(60% 120% at 50% 0%, rgba(139,92,246,0.2), rgba(8,13,26,0.7))" }}>
            <span className="eyebrow"><span className="dot" /> From complaint to celebration</span>
            <h2 className="h-lg mt-2">Technology should not make citizens<br />learn the system. <span className="grad-text">The system should understand citizens.</span></h2>
            <div className="row gap-2 wrap mt-4" style={{ justifyContent: "center" }}>
              <button className="btn btn-primary btn-lg" onClick={() => nav("/register")}>Create citizen account</button>
              <button className="btn btn-ghost btn-lg" onClick={() => nav("/login?role=officer")}>Sign in as officer</button>
              <button className="btn btn-outline btn-lg" onClick={() => nav("/login")}>Use demo access</button>
            </div>
            <p className="faint mt-3" style={{ fontSize: 12.5 }}>Demo credentials — citizen@civixsetu.demo / citizen123 · officer@civixsetu.demo / officer123</p>
          </div></Reveal>
        </div>
      </section>

      <Footer />

      {selected && <ReportDetail report={selected} onClose={() => setSel(null)} role="citizen" />}
    </div>
  );
}
