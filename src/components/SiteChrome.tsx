import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { IconMenu, IconX } from "./Icons";
import { cls } from "../lib/format";
import { useCurrentUser } from "../lib/hooks";
import { store } from "../lib/store";

const LINKS: [string, string][] = [
  ["#feature", "Platform"], ["#departments", "Departments"], ["#live", "Live Reports"],
  ["#analytics", "Analytics"], ["#story", "Impact"],
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const user = useCurrentUser();
  const go = (h: string) => { document.querySelector(h)?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };
  const dash = () => { setOpen(false); nav(user?.role === "officer" ? "/officer" : "/citizen"); };
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link className="brand" to="/"><Logo size={34} /><span>Civix<span style={{ color: "var(--primary)" }}>Setu</span></span></Link>

        <nav className="nav-links">
          <div className="nav-desktop row gap-1">
            {LINKS.map(([h, t]) => (<a key={h} href={h} className="nav-link" onClick={(e) => { e.preventDefault(); go(h); }}>{t}</a>))}
          </div>
          <span className="right" />
          {user ? (
            <button className="btn btn-primary btn-sm nav-cta" onClick={dash}>Open dashboard →</button>
          ) : (
            <button className="btn btn-primary btn-sm nav-cta" onClick={() => nav("/login")}>Sign in →</button>
          )}
          <button className="btn btn-ghost btn-sm nav-burger" onClick={() => setOpen(!open)}>{open ? <IconX /> : <IconMenu />}</button>
        </nav>
      </div>
      {open && (
        <div className="nav-mobile" style={{ padding: "12px 24px 22px", display: "grid", gap: 4, borderTop: "1px solid var(--line)" }}>
          {LINKS.map(([h, t]) => (<a key={h} href={h} className="nav-link" onClick={(e) => { e.preventDefault(); go(h); }}>{t}</a>))}
          <button className="nav-link" style={{ textAlign: "left" }} onClick={() => { setOpen(false); nav("/login"); }}>{user ? "Switch role" : "Sign in"}</button>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const nav = useNavigate();
  return (
    <footer style={{ borderTop: "1px solid var(--line)", padding: "54px 0 40px", marginTop: 40 }}>
      <div className="container">
        <div className="g3" style={{ gridTemplateColumns: "1.4fr 1fr 1fr 1fr" }}>
          <div>
            <div className="brand mb-2"><Logo size={30} />Civix<span style={{ color: "var(--primary)" }}>Setu</span></div>
            <p className="faint" style={{ fontSize: 13, maxWidth: 280 }}>The civic operating system that understands every citizen — multilingual in, actionable English out. An SIH-grade student prototype.</p>
          </div>
          {[
            ["Product", [["Platform", "/"], ["Live reports", "/#live"], ["Analytics", "/#analytics"]]],
            ["Access", [["Citizen login", "/login"], ["Officer login", "/login?role=officer"], ["Create account", "/register"]]],
            ["AI", [["Triage engine", "/#feature"], ["12 languages", "/#feature"], ["Routing", "/#departments"]]],
          ].map(([h, items]) => (
            <div key={h as string}>
              <div className="h-md" style={{ fontSize: 14, marginBottom: 14 }}>{h}</div>
              <div style={{ display: "grid", gap: 9 }}>
                {(items as [string, string][]).map(([t, to]) => (
                  <a key={to + t} href={to} className="faint" style={{ fontSize: 13.5 }} onClick={(e) => { if (to.startsWith("/")) { e.preventDefault(); nav(to); } }}>{t}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="divider mt-4" style={{ margin: "28px 0" }} />
        <div className="row-between wrap gap-2">
          <div className="faint" style={{ fontSize: 12.5 }}>© 2026 CivixSetu · Student innovation prototype · Maps & AI are optional integrations</div>
          <div className="row gap-2" style={{ fontSize: 12.5, color: "#64708a" }}>
            <span>26 Departments</span><span>·</span><span>12 interface languages</span><span>·</span><span>Made for India 🇮🇳</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
