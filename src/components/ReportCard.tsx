import { useState } from "react";
import type { Report } from "../lib/types";
import { getDept } from "../lib/departments";
import { Avatar, Sev, StatusBadge, Tilt } from "./ui";
import { DeptIcon, IconPin, IconChevR, IconClock } from "./Icons";
import { hoursAgo, formatNum, pickColor } from "../lib/format";

export function ReportCard({ report, onOpen, compact }: { report: Report; onOpen?: () => void; compact?: boolean }) {
  const dpt = getDept(report.departmentId);
  return (
    <Tilt max={5} className="card card-hover" style={{ height: "100%" }}>
      <div onClick={onOpen} style={{ cursor: onOpen ? "pointer" : "default", display: "grid", gap: 12, height: "100%", alignContent: "start" }}>
        <div className="row-between">
          <div className="row gap-1">
            <div className="avatar-chip" style={{ borderRadius: 12, background: `${dpt.color}22`, color: dpt.color, display: "grid", placeItems: "center" }}><DeptIcon ic={dpt.ic} size={22} /></div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{dpt.short}</div>
              <div className="faint" style={{ fontSize: 11 }}>{report.departmentName}</div>
            </div>
          </div>
          <StatusBadge s={report.status} />
        </div>

        <div className="row gap-1 wrap">
          <Sev s={report.severity} />
          <span className="chip st"><span className="dot" style={{ width: 6, height: 6, background: dpt.color, display: "inline-block", borderRadius: "50%", animation: "pulse 2s infinite" }} /> AI conf {report.aiConfidence}%</span>
          {!compact && <span className="chip st">⚡ {report.priorityScore}</span>}
        </div>

        <h3 style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.35 }}>{report.englishSummary}</h3>

        <div className="row gap-1 faint" style={{ fontSize: 12.5 }}>
          <IconPin size={13} style={{ color: "#fbbf24" }} />{report.location || report.landmark}
        </div>

        {!compact && (
          <div style={{ marginTop: "auto" }} className="row-between wrap gap-1" >
            <div className="row gap-1 faint" style={{ fontSize: 12 }}>
              <Avatar name={report.citizenName} size="sm" color={pickColor(report.citizenName)} />
              <span>{report.citizenName}</span>
            </div>
            <div className="row gap-2 faint" style={{ fontSize: 12 }}>
              <span className="row gap-1">▲ <b style={{ color: "#6ee7b7" }}>{formatNum(report.upvotes)}</b></span>
              <span className="row gap-1"><IconClock size={12} /> {hoursAgo(report.created)}</span>
            </div>
          </div>
        )}

        {onOpen && !compact && (
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={onOpen}>Full timeline <IconChevR size={14} /></button>
        )}
      </div>
    </Tilt>
  );
}
