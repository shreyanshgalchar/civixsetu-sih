import { useMemo, useState } from "react";
import { PageTitle } from "../../components/AppShell";
import { ReportCard } from "../../components/ReportCard";
import { ReportDetail } from "../../components/ReportDetail";
import { IconSearch, IconSliders } from "../../components/Icons";
import { useStore, useCurrentUser } from "../../lib/hooks";
import { DEPARTMENTS } from "../../lib/departments";
import { store } from "../../lib/store";

const STATUS = ["All", "REPORTED", "AI_VERIFIED", "IN_PROGRESS", "RESOLVED", "REJECTED"];
const SEV = ["All", "CRITICAL", "HIGH", "MEDIUM", "LOW"];

export default function Queue() {
  const user = useCurrentUser()!;
  const state = useStore();
  const [status, setStatus] = useState("All");
  const [sev, setSev] = useState("All");
  const [dept, setDept] = useState(user.departmentId || "All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"priority" | "recent" | "upvotes">("priority");
  const [sel, setSel] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = state.reports
      .filter((r) => (status === "All" || r.status === status))
      .filter((r) => (sev === "All" || r.severity === sev))
      .filter((r) => (dept === "All" || r.departmentId === dept))
      .filter((r) => (q ? (r.id + r.englishSummary + r.location + r.citizenName).toLowerCase().includes(q.toLowerCase()) : true));
    list.sort((a, b) => sort === "priority" ? b.priorityScore - a.priorityScore : sort === "recent" ? b.created - a.created : b.upvotes - a.upvotes);
    return list;
  }, [state.reports, status, sev, dept, q, sort]);

  const selected = state.reports.find((r) => r.id === sel) || null;

  return (
    <div>
      <PageTitle eyebrow="Operations" title="All Reports" sub={`${state.reports.length} reports across the network. Review, re-route and close with an audit trail.`} />
      <div className="row gap-2 wrap mb-3">
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}><IconSearch size={16} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#64708a" }} /><input className="input" style={{ paddingLeft: 38 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search ID, summary, location, citizen…" /></div>
        <select className="select" style={{ width: 140 }} value={dept} onChange={(e) => setDept(e.target.value)}><option value="All">All departments</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.short}</option>)}</select>
        <select className="select" style={{ width: 130 }} value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select>
        <select className="select" style={{ width: 120 }} value={sev} onChange={(e) => setSev(e.target.value)}>{SEV.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select className="select" style={{ width: 140 }} value={sort} onChange={(e) => setSort(e.target.value as any)}><option value="priority">⚡ Priority</option><option value="recent">🕐 Recent</option><option value="upvotes">▲ Upvotes</option></select>
      </div>

      {visible.length === 0 ? (
        <div className="card center" style={{ padding: "40px" }}><IconSliders size={26} style={{ margin: "0 auto 10px", color: "#64708a" }} /><p className="muted">No reports match these filters.</p></div>
      ) : (
        <div className="g3">{visible.map((r) => <ReportCard key={r.id} report={r} onOpen={() => setSel(r.id)} />)}</div>
      )}

      {selected && <ReportDetail report={selected} role="officer" onClose={() => setSel(null)} onAction={(st, note) => { store.updateReportStatus(selected.id, st, { note: note as any, assignTo: selected.assignedTo || user.name, actor: user.name }); }} />}
    </div>
  );
}
