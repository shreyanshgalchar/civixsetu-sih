import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { IconMic, IconSpark, IconShield, IconCheck, IconChevR, IconSliders } from "../components/Icons";
import { store } from "../lib/store";
import { useToast } from "../components/ui";
import { DEPARTMENTS } from "../lib/departments";

type Mode = "citizen" | "officer" | "register";

export default function Auth() {
  const nav = useNavigate();
  const [qp] = useSearchParams();
  const [mode, setMode] = useState<Mode>(() => {
    if (qp.get("role") === "officer") return "officer";
    if (qp.get("mode") === "register") return "register";
    return "citizen";
  });
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [dept, setDept] = useState("roads");
  const [keep, setKeep] = useState(true);
  const [err, setErr] = useState("");
  const { push, node } = useToast();

  useEffect(() => {
    if (store.currentUser()) {
      const u = store.currentUser()!;
      nav(u.role === "officer" ? "/officer" : "/citizen", { replace: true });
    }
  }, [nav]);

  const submit = () => {
    setErr("");
    if (mode === "register") {
      if (!name || !email || pass.length < 6) { setErr("Fill name, email and a password of 6+ characters."); return; }
      const role = (document.getElementById("ro") as HTMLSelectElement)?.value === "officer" ? "officer" : "citizen";
      const res = store.register(name, email, pass, role, role === "officer" ? dept : undefined);
      if (!res.ok) { setErr(res.error || "Registration failed."); return; }
      push("Account created · welcome to CivixSetu!");
      nav(role === "officer" ? "/officer" : "/citizen");
    } else {
      const res = store.login(email, pass);
      if (!res.ok) { setErr(res.error!); return; }
      push(`Signed in as ${res.user!.name}`);
      nav(res.user!.role === "officer" ? "/officer" : "/citizen");
    }
  };

  const demo = (r: "citizen" | "officer") => {
    store.login(r === "citizen" ? "citizen@civixsetu.demo" : "officer@civixsetu.demo", r === "citizen" ? "citizen123" : "officer123");
    push(`Demo ${r} signed in`);
    nav(r === "officer" ? "/officer" : "/citizen");
  };

  const isOfficer = mode === "officer";

  return (
    <div className="app-shell" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
      <div className="app-bg" />
      {/* left brand panel */}
      <div style={{ position: "relative", overflow: "hidden", padding: "52px 44px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 24 }}>
        <div className="hero-bg" /><div className="grid-bg" />
        <div className="orb" style={{ width: 300, height: 300, left: "10%", top: "10%", background: "rgba(34,211,238,0.18)" }} />
        <div className="orb" style={{ width: 320, height: 320, right: "0%", bottom: "8%", background: "rgba(139,92,246,0.2)" }} />
        <button className="brand" style={{ position: "relative", zIndex: 2, background: "none" }} onClick={() => nav("/")}><Logo size={34} /><span>Civix<span style={{ color: "var(--primary)" }}>Setu</span></span></button>
        <div style={{ position: "relative", zIndex: 2 }}>
          <span className="eyebrow"><span className="dot" /> Secure role-based access</span>
          <h1 className="h-lg mt-3" style={{ maxWidth: 520 }}>{isOfficer ? "The command desk for " : "Every citizen deserves "}<span className="grad-text">{isOfficer ? "every civic operation." : "a working city."}</span></h1>
          <p className="lead mt-3" style={{ maxWidth: 480 }}>{isOfficer ? "Review the queue, verify AI-verified reports, assign crews and track SLA compliance — all in one protected workspace." : "Report any civic problem in any language, automatically routed to the right department, and track it from complaint to celebration."}</p>
          <div className="mt-4" style={{ display: "grid", gap: 14, maxWidth: 420 }}>
            {[
              ["Separate Citizen & Officer workspaces", "Role-based access with an audit trail."],
              ["Complaint history saved on the server", "Every case persists and is fully traceable."],
              ["AI assists decisions; humans verify", "Assistive intelligence, authorized human action."],
            ].map(([t, d], i) => (
              <div key={i} className="row gap-2" style={{ alignItems: "flex-start" }}>
                <span className="kpi ic" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(52,211,153,0.14)", color: "#6ee7b7", flexShrink: 0 }}><IconCheck size={18} /></span>
                <div><b style={{ fontSize: 14 }}>{t}</b><div className="faint" style={{ fontSize: 12.5 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="row gap-2 wrap" style={{ position: "relative", zIndex: 2, color: "#64708a", fontSize: 12.5 }}>
          <span><IconShield size={13} style={{ marginRight: 4, color: "#c4b5fd" }} /> 26 Departments</span>
          <span>50+ Field workers</span><span>180+ Services</span><span>99.9% Workflow goal</span>
        </div>
      </div>

      {/* right auth panel */}
      <div className="center" style={{ display: "grid", placeItems: "center", padding: "40px 24px", position: "relative", zIndex: 2 }}>
        <div className="card card-glow" style={{ width: "100%", maxWidth: 440, padding: 34, textAlign: "left" }}>
          <div className="row gap-1" style={{ marginBottom: 8 }}><IconSpark size={18} style={{ color: "#22d3ee" }} /><span className="faint" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Welcome to CivixSetu</span></div>
          <h2 className="h-md" style={{ fontSize: 26 }}>{mode === "register" ? "Create your account" : isOfficer ? "Officer Login" : "Citizen Login"}</h2>
          <p className="muted mt-1" style={{ fontSize: 13.5 }}>{mode === "register" ? "Join your city's civic resolution network." : isOfficer ? "Review & resolve the municipal queue." : "Report, track and earn karma."}</p>

          {/* role tabs */}
          <div className="card" style={{ padding: 6, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "rgba(7,11,21,0.5)", margin: "22px 0" }}>
            {(["citizen", "officer"] as const).map((r) => (
              <button key={r} onClick={() => setMode(r)} className={!isOfficer && r === "citizen" || isOfficer && r === "officer" ? "btn btn-primary" + (r === "officer" ? " btn-sm" : "") : "btn btn-ghost"} style={{ padding: "11px 10px" }}>
                {r === "citizen" ? <span className="row gap-1" style={{ fontWeight: 700 }}><IconMic size={15} /> Citizen</span> : <span className="row gap-1" style={{ fontWeight: 700 }}><IconShield size={15} /> Officer</span>}
              </button>
            ))}
          </div>

          <div className="field"><label>Email address</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isOfficer ? "officer@civixsetu.demo" : "citizen@civixsetu.demo"} autoComplete="email" /></div>
          {mode === "register" && <div className="field"><label>Full name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aarav Sharma" /></div>}
          <div className="field"><label>Password</label><input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" autoComplete="current-password" /></div>

          {mode === "register" && (
            <>
              <div className="field"><label>Register as</label>
                <select id="ro" className="select" defaultValue="citizen"><option value="citizen">Citizen</option><option value="officer">Officer</option></select>
              </div>
              <div className="field"><label>Department (for officers)</label><select className="select" value={dept} onChange={(e) => setDept(e.target.value)}><option value="">Auto-detect (recommended)…</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            </>
          )}

          <div className="checkbox-row mt-1"><input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} /> Keep me signed in</div>
          {err && <div className="card mt-2" style={{ padding: "10px 12px", background: "rgba(244,63,94,0.1)", borderColor: "rgba(244,63,94,0.3)", color: "#fb7185", fontSize: 13 }}>{err}</div>}

          <button className="btn btn-primary btn-lg btn-block mt-3" onClick={submit}>{mode === "register" ? "Create account" : "Sign in securely"} <IconChevR size={18} /></button>

          <div className="row-between mt-3" style={{ fontSize: 13 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => demo("citizen")}>⚡ Demo citizen</button>
            <button className="btn btn-ghost btn-sm" onClick={() => demo("officer")}>⚡ Demo officer</button>
          </div>

          <div className="divider" style={{ margin: "18px 0" }} />
          <p className="faint" style={{ fontSize: 12.5, textAlign: "center" }}>Demo citizen — <span className="mono">citizen@civixsetu.demo / citizen123</span><br />Demo officer — <span className="mono">officer@civixsetu.demo / officer123</span></p>
        </div>
      </div>
      {node}
    </div>
  );
}
