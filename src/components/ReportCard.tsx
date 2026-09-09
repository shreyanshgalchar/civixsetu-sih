import { useState } from "react";
import type { Report } from "../lib/types";
import { getDept, deptPhoto } from "../lib/departments";
import { Avatar, Sev, StatusBadge, Tilt } from "./ui";
import { DeptIcon, IconPin, IconClock, IconChevR, IconCamera, IconBolt } from "./Icons";
import { hoursAgo, formatNum, pickColor, assetUrl } from "../lib/format";

export function ReportCard({ report, onOpen, compact, small }: { report: Report; onOpen?: () => void; compact?: boolean; small?: boolean }) {
  const dpt = getDept(report.departmentId);
  const [img, setImg] = useState(true);
  const photo = assetUrl(deptPhoto(report.departmentId, report.created));
  return (
    <Tilt max={6} className="card card-hover" style={{ height: "100%", padding: 0, overflow: "hidden" }}>
      <div onClick={onOpen} style={{ cursor: onOpen ? "pointer" : "default", display: "flex", flexDirection: "column", height: "100%" }}>
        {/* photo cover */}
        <div style={{ position: "relative", height: small ? 130 : 156, overflow: "hidden", background: "linear-gradient(135deg, rgba(16,24,40,0.8), rgba(8,13,26,0.8))" }}>
          {img ? (
            <img src={photo} alt={dpt.short} loading="lazy" onError={() => setImg(false)}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s cubic-bezier(.2,.8,.2,1)", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: dpt.color }}><DeptIcon ic={dpt.ic} size={40} /></div>
          )}
          {/* hover zoom */}
          <style>{`.cover-zoom:hover img{transform:scale(1.08)}`}</style>
          <div className="cover-zoom" style={{ position: "absolute", inset: 0 }} />
          {/* gradient + badges */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,11,21,0.15), transparent 40%, rgba(7,11,21,0.82))" }} />
          <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 7 }}>
            <span className={`chip ${report.severity === "CRITICAL" ? "sev-CRITICAL" : report.severity === "HIGH" ? "sev-HIGH" : "sev-MEDIUM"}`}>{report.severity}</span>
            <span className="chip st">⚡ {report.priorityScore}</span>
          </div>
          <div style={{ position: "absolute", top: 12, right: 12 }}><StatusBadge s={report.status} /></div>
          {/* dept + photo tag at bottom of cover */}
          <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <div className="avatar-chip" style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(7,11,21,0.7)", color: dpt.color, display: "grid", placeItems: "center", backdropFilter: "blur(6px)" }}><DeptIcon ic={dpt.ic} size={16} /></div>
            <span style={{ fontSize: 12.5, fontWeight: 700, textShadow: "0 1px 6px rgba(0,0,0,.6)" }}>{dpt.short}</span>
            <span className="right" style={{ fontSize: 11, color: "rgba(232,237,248,0.85)", display: "flex", alignItems: "center", gap: 4 }}><IconCamera size={12} /> {report.photos.length > 0 ? `${report.photos.length} photo` : "Stock ref"}</span>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "16px 16px 16px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{report.englishSummary}</h3>
          <div className="row gap-1 faint" style={{ fontSize: 12.5 }}>
            <IconPin size={13} style={{ color: "#fbbf24", flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{report.location || report.landmark || "Location pending"}</span>
          </div>

          {!compact && (
            <div className="row gap-1 wrap" style={{ fontSize: 12 }}>
              <span className="chip st"><IconBolt size={11} /> AI {report.aiConfidence}%</span>
              <span className="chip st"><IconClock size={11} /> {report.status === "RESOLVED" ? "closed" : `SLA ${report.slaDays}d`}</span>
              <span className="chip st">▲ {formatNum(report.upvotes)}</span>
            </div>
          )}

          <div style={{ marginTop: "auto" }} className="row-between wrap gap-1">
            <div className="row gap-1 faint" style={{ fontSize: 11.5 }}>
              <Avatar name={report.citizenName} size="sm" color={pickColor(report.citizenName)} />
              <span>{report.citizenName.split(" ")[0]}</span>
            </div>
            <span className="faint" style={{ fontSize: 11.5 }}>{hoursAgo(report.created)}</span>
          </div>

          {onOpen && <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={onOpen}>View timeline <IconChevR size={14} /></button>}
        </div>
      </div>
    </Tilt>
  );
}
