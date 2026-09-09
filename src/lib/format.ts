export function cls(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

export function formatNum(n: number): string {
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export function hoursAgo(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export function daysBetween(a: number, b: number): number {
  return Math.round((b - a) / 86400000);
}

export function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
}

export function avColor(name: string): string {
  const colors = ["#22d3ee", "#34d399", "#8b5cf6", "#fbbf24", "#fb7185", "#38bdf8", "#a3e635", "#c084fc"];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
}

export function pickColor(seed: string): string {
  const colors = ["#22d3ee", "#34d399", "#8b5cf6", "#fbbf24", "#fb7185", "#38bdf8", "#a3e635", "#c084fc", "#f472b6"];
  let h = 0;
  for (const c of seed) h = (h * 33 + c.charCodeAt(0)) | 0;
  return colors[Math.abs(h) % colors.length];
}

// Resolve an app asset to an absolute URL (works whether served from / or a subdir).
export function assetUrl(p?: string): string | undefined {
  if (!p) return undefined;
  if (/^https?:/.test(p)) return p;
  // Vite copies /public/* to the site root; base is '/' so '/assets/...' is correct.
  return p;
}
