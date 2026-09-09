import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTitle } from "../../components/AppShell";
import { ReportCard } from "../../components/ReportCard";
import { ReportDetail } from "../../components/ReportDetail";
import { IconSliders, IconSearch } from "../../components/Icons";
import { useStore, useCurrentUser } from "../../lib/hooks";
import { DEPARTMENTS } from "../../lib/departments";
import { store } from "../../lib/store";

const FILT = ["All", "RESOLVED", "IN_PROGRESS", "REPORTED", "AI_VERIFIED", "REJECTED"] as const;

export default function MyReports() {
  const nav = useNavigate();
  const user = useCurrentUser()!;
  const state = useStore();
  const [f, setF] = useState<string>("All");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [cat, setCat] = useState("All");

  const mine = state.reports.filter((r) => r.citizenId === user.id);
  const filtered = mine
    .filter((r) => (f === "All" || r.status === f))
    .filter((r) => cat === "All" || r.departmentId === cat)
    .filter((r) => (q ? (r.id + r.englishSummary + r.location + r.departmentName).toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => b.created - a.created);

  const selected = mine.find((r) => r.id === sel) || null;

  return (
    <div>
      <PageTitle eyebrow="My history" title="My Reports" sub={`${mine.length} reports on file — all traceable with a public timeline.`} right={<button className="btn btn-primary" onClick={() => nav("/citizen/report")}>+ New report</button>} />

      <div className="row gap-1 wrap mb-3">
        {FILT.map((x) => <button key={x} className={f === x ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={() => setF(x)}>{x.replace("_", " ")}</button>)}
      </div>
      <div className="row gap-2 wrap mb-3">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}><IconSearch size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#64708a" }} /><input className="input" style={{ paddingLeft: 38 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my reports…" /></div>
        <select className="select" style={{ width: 200 }} value={cat} onChange={(e) => setCat(e.target.value)}><option value="All">All departments</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.short}</option>)}</select>
      </div>

      {filtered.length === 0 ? (
        <div className="card center" style={{ padding: "44px 20px" }}><p className="muted">No reports match your filters.</p></div>
      ) : (
        <div className="g3">
          {filtered.map((r) => <ReportCard key={r.id} report={r} onOpen={() => setSel(r.id)} />)}
        </div>
      )}

      {selected && <ReportDetail report={selected} role="citizen" onClose={() => setSel(null)} />}
    </div>
  );
}
