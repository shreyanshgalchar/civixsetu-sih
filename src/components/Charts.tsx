import { useState } from "react";

/* ------------------------------ Bar chart ------------------------------ */
export function BarChart({
  data, series1, series2,
  color1 = "#22d3ee", color2 = "#8b5cf6",
  h = 240,
}: {
  data: { label: string; a: number; b: number }[];
  series1: string; series2: string;
  color1?: string; color2?: string; h?: number;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; idx: number } | null>(null);
  const max = Math.max(1, ...data.map((d) => Math.max(d.a, d.b)));
  const n = data.length;
  const pad = 30;
  const bh = h - 46;
  const bw = 26;

  return (
    <div className="chart-wrap" style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${n * 52 + 20} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={10} x2={n * 52 + 10} y1={pad + bh - bh * g} y2={pad + bh - bh * g}
            stroke="rgba(148,163,184,0.12)" strokeDasharray="3 4" />
        ))}
        {data.map((d, i) => {
          const cxa = i * 52 + 20 + bw / 2;
          const h1 = (d.a / max) * bh;
          const h2 = (d.b / max) * bh;
          const y1 = pad + bh - h1;
          const y2 = pad + bh - h2;
          return (
            <g key={i} onMouseEnter={() => setTip({ x: i * 52 + 26, y: pad + bh - Math.max(h1, h2) - 6, idx: i })}
              onMouseLeave={() => setTip(null)}>
              <rect x={cxa - bw} y={y1} width={bw} height={h1} rx={5}
                fill={color1} opacity={0.9}>
                <animate attributeName="height" from="0" to={h1} dur="0.8s" fill="freeze" />
                <animate attributeName="y" from={pad + bh} to={y1} dur="0.8s" fill="freeze" />
              </rect>
              <rect x={cxa} y={y2} width={bw} height={h2} rx={5} fill={color2} opacity={0.9}>
                <animate attributeName="height" from="0" to={h2} dur="0.8s" fill="freeze" />
                <animate attributeName="y" from={pad + bh} to={y2} dur="0.8s" fill="freeze" />
              </rect>
              <text x={i * 52 + 26} y={h - 10} textAnchor="middle" fontSize="11" fill="#92a0ba">{d.label}</text>
            </g>
          );
        })}
      </svg>
      {tip && (
        <div className="chart-tooltip" style={{ left: tip.x, top: tip.y }}>
          <div><b>{data[tip.idx].label}</b></div>
          <div><span className="c" style={{ background: color1 }} />{series1}: <b>{data[tip.idx].a}</b></div>
          <div><span className="c" style={{ background: color2 }} />{series2}: <b>{data[tip.idx].b}</b></div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Donut chart ------------------------------ */
export function DonutChart({
  data, size = 220,
}: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 78, cxv = 110, cyv = 110, sw = 22;
  const cnv = 2 * Math.PI * r;
  let acc = 0;
  const [active, setActive] = useState(-1);
  const segs = data.map((d, i) => {
    const frac = d.value / total;
    const seg: any = { ...d, dash: frac * cnv, offset: acc * cnv, i };
    acc += frac;
    return seg;
  });

  return (
    <div className="row gap-3 wrap">
      <svg viewBox="0 0 220 220" width={size} height={size} style={{ flexShrink: 0 }}>
        <circle cx={cxv} cy={cyv} r={r} fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth={sw} />
        <g transform={`rotate(-90 ${cxv} ${cyv})`}>
          {segs.map((s) => (
            <circle key={s.i} cx={cxv} cy={cyv} r={r} fill="none"
              stroke={s.color} strokeWidth={active === s.i ? sw + 4 : sw}
              strokeDasharray={`${s.dash} ${cnv - s.dash}`} strokeDashoffset={-s.offset}
              onMouseEnter={() => setActive(s.i)} onMouseLeave={() => setActive(-1)}
              style={{ transition: "stroke-width .2s", cursor: "pointer", filter: active === s.i ? "brightness(1.25)" : "none" }}>
              <animate attributeName="stroke-dasharray" from={`0 ${cnv}`} to={`${s.dash} ${cnv - s.dash}`} dur="0.9s" fill="freeze" />
            </circle>
          ))}
        </g>
        <text x={cxv} y={cyv - 4} textAnchor="middle" fontSize="26" fontWeight="800" fill="#e8edf8">{total}</text>
        <text x={cxv} y={cyv + 18} textAnchor="middle" fontSize="11" fill="#92a0ba">reports</text>
      </svg>
      <div style={{ display: "grid", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i} className="row gap-2" style={{ fontSize: 13 }} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(-1)}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color }} />
            <span style={{ color: "#92a0ba" }}>{d.label}</span>
            <b style={{ marginLeft: "auto" }}>{d.value}</b>
            <span style={{ color: "#64708a", width: 44, textAlign: "right" }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Heatmap (wards) --------------------------- */
export function HeatGrid({ cells }: { cells: { id: string; label: string; sub: string; value: number }[] }) {
  const [act, setAct] = useState(-1);
  const max = Math.max(...cells.map((c) => c.value), 1);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {cells.map((c, i) => {
          const a = c.value / max;
          const bg = `rgba(34,211,238,${0.12 + a * 0.75})`;
          const big = i === act;
          return (
            <button key={c.id} onMouseEnter={() => setAct(i)} onMouseLeave={() => setAct(-1)}
              style={{
                background: bg, border: "1px solid rgba(34,211,238,0.25)", borderRadius: 14, padding: "14px 10px",
                textAlign: "left", color: "#e8edf8", transition: "transform .2s", transform: big ? "translateY(-3px)" : "none",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{c.id}</span>
                <span style={{ fontSize: 13, fontWeight: 800 }}>{c.value}</span>
              </div>
              <div style={{ fontSize: 9.5, color: "rgba(232,237,248,0.7)", marginTop: 3, lineHeight: 1.3 }}>{c.label} · {c.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ Sparkline ------------------------------ */
export function Sparkline({ data, color = "#22d3ee", w = 120, h = 34 }: { data: number[]; color?: string; w?: number; h?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const rng = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1 || 1)) * w},${h - ((v - min) / rng) * (h - 6) - 3}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${pts.split(" ")[0]} L ${pts} L ${w},${h} L 0,${h} Z`} fill={color} opacity="0.12" />
    </svg>
  );
}

/* --------------------------- Progress ring --------------------------- */
export function Ring({ pct, size = 96, color = "#22d3ee", label }: { pct: number; size?: number; color?: string; label?: string }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(148,163,184,0.15)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <animate attributeName="stroke-dasharray" from={`0 ${c}`} to={`${(pct / 100) * c} ${c}`} dur="1s" fill="freeze" />
      </circle>
      <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fontSize={size / 4} fontWeight="800" fill="#e8edf8">{pct}%</text>
      {label && <text x={size / 2} y={size / 2 + size / 7} textAnchor="middle" fontSize={size / 10} fill="#92a0ba">{label}</text>}
    </svg>
  );
}
