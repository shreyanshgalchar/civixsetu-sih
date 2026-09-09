// Lightweight inline SVG icon set (24px, stroke-based). No external deps.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = ({ size = 18, ...p }: P) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const, ...p,
});

export const IconHome = (p: P) => (<svg {...base(p)}><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>);
export const IconMegaphone = (p: P) => (<svg {...base(p)}><path d="M3 11v2a2 2 0 0 0 2 2h2l2 6h2l-1-6h3l3 6h2l-2.2-7.6"/><path d="M21 12a5 5 0 0 0-5-5H9a4 4 0 0 0-4 4v2"/></svg>);
export const IconGrid = (p: P) => (<svg {...base(p)}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>);
export const IconBar = (p: P) => (<svg {...base(p)}><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>);
export const IconUsers = (p: P) => (<svg {...base(p)}><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5a3 3 0 0 1 0 6"/><path d="M18 14a5 5 0 0 1 3 6"/></svg>);
export const IconShield = (p: P) => (<svg {...base(p)}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/></svg>);
export const IconLayers = (p: P) => (<svg {...base(p)}><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5" opacity="0.5"/></svg>);
export const IconSearch = (p: P) => (<svg {...base(p)}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.2-4.2"/></svg>);
export const IconMic = (p: P) => (<svg {...base(p)}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/></svg>);
export const IconPhn = (p: P) => (<svg {...base(p)}><path d="M5 4h4l1.5 4L8 9.5A11 11 0 0 0 14.5 16l1.5-2.5 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>);
export const IconStop = (p: P) => (<svg {...base(p)}><rect x="6" y="6" width="12" height="12" rx="2"/></svg>);
export const IconPin = (p: P) => (<svg {...base(p)}><path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2"/></svg>);
export const IconCamera = (p: P) => (<svg {...base(p)}><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1"/><circle cx="12" cy="13.5" r="3.2"/></svg>);
export const IconSend = (p: P) => (<svg {...base(p)}><path d="M4 12 20 4l-4 16-4-6-8 2z"/><path d="M12 10 6 16"/></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="M20 6 9 17l-5-5"/></svg>);
export const IconX = (p: P) => (<svg {...base(p)}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>);
export const IconClock = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
export const IconAlert = (p: P) => (<svg {...base(p)}><path d="M12 3 2.5 20h19z"/><path d="M12 9v5"/><path d="M12 17h.01"/></svg>);
export const IconTrend = (p: P) => (<svg {...base(p)}><path d="M3 17 9 11l4 4 7-7"/><path d="M15 8h5v5"/></svg>);
export const IconSpark = (p: P) => (<svg {...base(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/><circle cx="12" cy="12" r="3"/></svg>);
export const IconUpload = (p: P) => (<svg {...base(p)}><path d="M12 16V4"/><path d="m6 10 6-6 6 6"/><path d="M4 20h16"/></svg>);
export const IconChevR = (p: P) => (<svg {...base(p)}><path d="m9 6 6 6-6 6"/></svg>);
export const IconChevD = (p: P) => (<svg {...base(p)}><path d="m6 9 6 6 6-6"/></svg>);
export const IconMenu = (p: P) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
export const IconLogout = (p: P) => (<svg {...base(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>);
export const IconGlobe = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/></svg>);
export const IconBolt = (p: P) => (<svg {...base(p)}><path d="M13 2 3 14h6l-1 8 10-12h-6z"/></svg>);
export const IconRefresh = (p: P) => (<svg {...base(p)}><path d="M20 6v5h-5"/><path d="M20 11a8 8 0 1 0 2 5"/></svg>);
export const IconCircleCheck = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2L15.5 9.5"/></svg>);
export const IconTarget = (p: P) => (<svg {...base(p)}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>);
export const IconSliders = (p: P) => (<svg {...base(p)}><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2" fill="#070b15"/><circle cx="15" cy="12" r="2" fill="#070b15"/><circle cx="7" cy="18" r="2" fill="#070b15"/></svg>);
export const IconFlame = (p: P) => (<svg {...base(p)}><path d="M12 3c.5 3-2 4.5-2 7a4 4 0 0 0 8 0c0-1.5-.5-2.5-1.5-3.5 0 2-2 2.5-2 2.5 1-2 0-4-2.5-6z"/><path d="M12 21a6 6 0 0 0 6-6c0-1-.3-2-.8-2.9M12 21a6 6 0 0 1-6-6c0-2 .8-3.8 2.1-5.1"/></svg>);
export const IconStar = (p: P) => (<svg {...base(p)} fill="currentColor"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" fill="none"/></svg>);
export const IconHeart = (p: P) => (<svg {...base(p)}><path d="M12 20s-7-4.4-9-9c-1.1-2.7.5-6 3.6-6C9 5 11 7 12 8c1-1 3-3 5.4-3 3.1 0 4.7 3.3 3.6 6-2 4.6-9 9-9 9z"/></svg>);

/* department icons keyed by the ic field */
export const DeptIcon = ({ ic, ...p }: P & { ic: string }) => {
  const map: Record<string, (q: P) => JSX.Element> = {
    roads: IconLayers, trash: IconMegaphone, bulb: IconBolt, water: IconPhn,
    drain: IconSearch, tree: IconHome, traffic: IconBolt, beast: IconUsers,
  };
  const C = map[ic] || IconLayers;
  return <C {...p} />;
};
