import { useState, type ReactNode } from "react";
import { NavLink, Navigate, useNavigate, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { Avatar } from "./ui";
import { useCurrentUser } from "../lib/hooks";
import { store } from "../lib/store";
import { cls } from "../lib/format";
import HelpBot from "./HelpBot";
import {
  IconHome, IconMegaphone, IconBar, IconGrid, IconShield, IconUsers, IconLogout, IconSpark, IconClock, IconSearch,
} from "./Icons";

function NavItem({ to, label, icon, end }: { to: string; label: string; icon: ReactNode; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => cls("nav-link", isActive && "active")} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 15px", border: "none" }}>
      {icon} {label}
    </NavLink>
  );
}

export function AppShell({ role, children }: { role: "citizen" | "officer"; children: ReactNode }) {
  const user = useCurrentUser();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === "officer" ? "/officer" : "/citizen"} replace />;

  const citizen = role === "citizen";
  const items = citizen
    ? [
        { to: "/citizen", label: "Overview", icon: <IconHome />, end: true },
        { to: "/citizen/report", label: "New Report", icon: <IconMegaphone /> },
        { to: "/citizen/reports", label: "My Reports", icon: <IconGrid /> },
        { to: "/citizen/leaderboard", label: "Citizens", icon: <IconUsers /> },
        { to: "/citizen/analytics", label: "Public Analytics", icon: <IconBar /> },
      ]
    : [
        { to: "/officer", label: "Queue Overview", icon: <IconHome />, end: true },
        { to: "/officer/queue", label: "All Reports", icon: <IconGrid /> },
        { to: "/officer/analytics", label: "Analytics", icon: <IconBar /> },
        { to: "/officer/team", label: "My Team", icon: <IconUsers /> },
      ];

  return (
    <div className="app-shell">
      <div className="app-bg" />
      {/* topbar */}
      <header className="nav">
        <div className="container nav-inner" style={{ justifyContent: "space-between" }}>
          <button className="brand" onClick={() => nav("/")} style={{ background: "none" }}><Logo size={32} /><span>Civix<span style={{ color: "var(--primary)" }}>Setu</span></span></button>
          <div className="row gap-2">
            <span className="chip" style={{ background: citizen ? "rgba(34,211,238,0.12)" : "rgba(139,92,246,0.14)", color: citizen ? "#67e8f9" : "#c4b5fd", border: "1px solid rgba(148,163,184,0.2)", letterSpacing: "0.06em" }}>
              {citizen ? <IconSpark size={13} /> : <IconShield size={13} />} {citizen ? "CITIZEN" : "OFFICER"}
            </span>
            <div style={{ position: "relative" }}>
              <button onClick={() => setMenu((m) => !m)} className="row gap-1 btn btn-ghost btn-sm" style={{ padding: "4px 8px 4px 4px" }}>
                <Avatar name={user.name} size="sm" color={user.avatarColor} /><span>{user.name.split(" ")[0]}</span>
              </button>
              {menu && (
                <div className="card card-glow anim-pop" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 230, padding: 12, background: "rgba(12,18,34,0.97)", zIndex: 60 }}>
                  <div className="row gap-1 mb-2">
                    <Avatar name={user.name} size="sm" color={user.avatarColor} />
                    <div style={{ lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{user.name}</div>
                      <div className="faint" style={{ fontSize: 11.5 }}>{user.email}</div>
                    </div>
                  </div>
                  <div className="divider" />
                  <a className="side-menu" style={{ display: "block", paddingTop: 8 }}>
                    {role === "citizen" ? (
                      <button className="nav-link" style={{ width: "100%", textAlign: "left" }} onClick={() => { setMenu(false); nav("/login"); }}>
                        <span className="row gap-1"><IconShield size={15} /> Officer login</span>
                      </button>
                    ) : (
                      <button className="nav-link" style={{ width: "100%", textAlign: "left" }} onClick={() => { setMenu(false); nav("/login"); }}>
                        <span className="row gap-1"><IconMegaphone size={15} /> Citizen login</span>
                      </button>
                    )}
                    <button className="nav-link" style={{ width: "100%", textAlign: "left", color: "#fb7185" }} onClick={() => { store.logout(); nav("/"); }}>
                      <span className="row gap-1"><IconLogout size={15} /> Sign out</span>
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="page-top" style={{ paddingTop: 26 }}>
        <div className="gov-layout">
          <aside className="sidebar">
            <div className="card side-menu nav-block" style={{ padding: 14 }}>
              {items.map((it) => <NavItem key={it.to} {...it} />)}
              <div style={{ marginTop: "auto" }} />
            </div>
            <div className="card" style={{ padding: 16, background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.24)" }}>
              <div className="row gap-1 mb-1"><IconSpark size={15} color="#c4b5fd" /><b style={{ fontSize: 13.5 }}>Setu AI · v2.4</b></div>
              <div className="faint" style={{ fontSize: 12 }}>Offline engine · 96.8% routing accuracy · 12 languages</div>
            </div>
          </aside>
          <main className="anim-page" style={{ minWidth: 0 }}>{children}</main>
        </div>
        <HelpBot onClose={() => {}} />
      </div>
    </div>
  );
}

export function PageTitle({ eyebrow, title, sub, right }: { eyebrow?: string; title: ReactNode; sub?: string; right?: ReactNode }) {
  return (
    <div className="row-between wrap gap-2 mb-3">
      <div>
        {eyebrow && <div className="faint" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{eyebrow}</div>}
        <h1 className="h-lg" style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)" }}>{title}</h1>
        {sub && <p className="lead-sm mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
