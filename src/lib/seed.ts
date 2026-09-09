import type { User, Report, ReportStatus, Severity, TimelineEvent } from "./types";
import { getDept } from "./departments";
import { analyze } from "./aiEngine";

const now = Date.now();
const H = 3600000;
const D = 86400000;

function uid(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 9);
}

function tl(...ev: TimelineEvent[]) {
  return ev.sort((a, b) => a.ts - b.ts);
}

export const SEED_USERS: User[] = [
  {
    id: "u-citizen", name: "Aarav Sharma", email: "citizen@civixsetu.demo", password: "citizen123",
    role: "citizen", city: "Hyderabad", ward: "Banjara Hills", karma: 9840, streak: 46, verifiedCount: 212, created: now - 90 * D, avatarColor: "#22d3ee",
  },
  {
    id: "u-cit2", name: "Kavya Reddy", email: "kavya@demo.in", password: "demo123",
    role: "citizen", city: "Hyderabad", ward: "Hitech City", karma: 8760, streak: 35, verifiedCount: 176, created: now - 60 * D, avatarColor: "#8b5cf6",
  },
  {
    id: "u-cit3", name: "Arjun Mehta", email: "arjun@demo.in", password: "demo123",
    role: "citizen", city: "Bengaluru", ward: "Indiranagar", karma: 9120, streak: 38, verifiedCount: 188, created: now - 45 * D, avatarColor: "#34d399",
  },
  {
    id: "u-cit4", name: "Rohan Das", email: "rohan@demo.in", password: "demo123",
    role: "citizen", city: "Kolkata", ward: "Park Street", karma: 8110, streak: 29, verifiedCount: 164, created: now - 40 * D, avatarColor: "#fb7185",
  },
  {
    id: "u-off-pwd", name: "Meera Iyer", email: "officer@civixsetu.demo", password: "officer123",
    role: "officer", departmentId: "roads", designation: "Ward Engineer", ward: "Banjara Hills", city: "Hyderabad", karma: 0, streak: 0, verifiedCount: 0, created: now - 200 * D, avatarColor: "#38bdf8",
  },
  {
    id: "u-off-swm", name: "Satish Kumar", email: "satish@civixsetu.demo", password: "officer123",
    role: "officer", departmentId: "sanitation", designation: "Sanitary Inspector", ward: "Hitech City", city: "Hyderabad", karma: 0, streak: 0, verifiedCount: 0, created: now - 180 * D, avatarColor: "#a3e635",
  },
  {
    id: "u-off-elec", name: "Farhan Ali", email: "farhan@civixsetu.demo", password: "officer123",
    role: "officer", departmentId: "streetlights", designation: "Line Superintendent", ward: "Gachibowli", city: "Hyderabad", karma: 0, streak: 0, verifiedCount: 0, created: now - 165 * D, avatarColor: "#fbbf24",
  },
  {
    id: "u-off-water", name: "Lakshmi Nair", email: "lakshmi@civixsetu.demo", password: "officer123",
    role: "officer", departmentId: "water", designation: "Water Works Engineer", ward: "Kukatpally", city: "Hyderabad", karma: 0, streak: 0, verifiedCount: 0, created: now - 150 * D, avatarColor: "#38bdf8",
  },
];

interface S {
  citizenId: string;
  citizenName: string;
  text: string;
  status: ReportStatus;
  severity: Severity;
  ward: string;
  city: string;
  hours: number;
  votes: number;
  location: string;
  landmark: string;
  upvotes: number;
}

const RAW: S[] = [
  { citizenId: "u-citizen", citizenName: "Aarav Sharma", text: "Massive pothole cluster near metro pillar 47. Three deep potholes (approx 2ft wide) on the service lane causing two-wheeler skids every morning. Waterlogging makes them invisible after rain.", status: "IN_PROGRESS", severity: "CRITICAL", ward: "Banjara Hills", city: "Hyderabad", hours: 9, votes: 342, location: "Linking Road, near Metro Pillar 47", landmark: "Metro Pillar 47", upvotes: 342 },
  { citizenId: "u-cit2", citizenName: "Kavya Reddy", text: "सफाई ठेकेदार तीन दिन से कचरा नहीं उठा रहा। कूड़ा फुटपाथ पर बह रहा है, स्कूल के गेट तक बदबू आ रही है। कृपया जल्द कार्रवाई करें।", status: "AI_VERIFIED", severity: "HIGH", ward: "Hitech City", city: "Hyderabad", hours: 14, votes: 287, location: "5th Block bus stop", landmark: "5th Block bus stop", upvotes: 287 },
  { citizenId: "u-cit3", citizenName: "Arjun Mehta", text: "Entire lane pitch dark — 6 consecutive LED streetlights non-functional for a week. Women commuters feel unsafe after 8pm. Pole IDs KL-221 to KL-226.", status: "RESOLVED", severity: "HIGH", ward: "Indiranagar", city: "Bengaluru", hours: 30, votes: 415, location: "Rose Garden Lane", landmark: "Rose Garden Lane", upvotes: 415 },
  { citizenId: "u-cit4", citizenName: "Rohan Das", text: "पानी की आपूर्ति लगातार तीन दिन से बंद है। 80 से अधिक घरों में सोमवार से नगर निगम का पानी नहीं आया है। बुजुर्ग सबसे ज्यादा प्रभावित हैं।", status: "IN_PROGRESS", severity: "CRITICAL", ward: "Park Street", city: "Kolkata", hours: 26, votes: 521, location: "Gandhi Nagar, Block C", landmark: "Gandhi Nagar Block C", upvotes: 521 },
  { citizenId: "u-cit2", citizenName: "Kavya Reddy", text: "Open drain without cover near primary school. 2-metre open drain section with broken slab cover, right on the school walking route. Accident waiting to happen during rains.", status: "AI_VERIFIED", severity: "HIGH", ward: "Hitech City", city: "Hyderabad", hours: 22, votes: 198, location: "School Road junction", landmark: "Primary School", upvotes: 198 },
  { citizenId: "u-cit3", citizenName: "Arjun Mehta", text: "Park transformed in 5 days — thank you! Broken benches + dead lawn reported last week. Horticulture team replanted, repainted and added solar lamps. Kids are back every evening!", status: "RESOLVED", severity: "MEDIUM", ward: "Indiranagar", city: "Bengaluru", hours: 48, votes: 634, location: "Nehru Park, Gate 2", landmark: "Nehru Park", upvotes: 634 },
  { citizenId: "u-cit4", citizenName: "Rohan Das", text: "Sewage overflow contaminating drinking line? Foul-smelling water seeping near the drinking water standpost. Possible cross-contamination — needs urgent quality testing.", status: "REPORTED", severity: "CRITICAL", ward: "Park Street", city: "Kolkata", hours: 5, votes: 176, location: "Market Road, Standpost 9", landmark: "Standpost 9", upvotes: 176 },
  { citizenId: "u-citizen", citizenName: "Aarav Sharma", text: "पेड़ तूफान से गिर गया, 100ft रोड का फुटपाथ पूरी तरह बंद। राहगीरों को तेज़ रफ्तार लेन पर जाना पड़ता है।", status: "REPORTED", severity: "MEDIUM", ward: "Banjara Hills", city: "Hyderabad", hours: 3, votes: 143, location: "100ft Road, near cafe strip", landmark: "Cafe strip", upvotes: 143 },
  { citizenId: "u-cit2", citizenName: "Kavya Reddy", text: "Street dog crying in pain near the temple gate. Looks injured — limping badly, needs help.", status: "REPORTED", severity: "MEDIUM", ward: "Hitech City", city: "Hyderabad", hours: 7, votes: 88, location: "Hanuman Temple Gate", landmark: "Hanuman Temple", upvotes: 88 },
  { citizenId: "u-cit3", citizenName: "Arjun Mehta", text: "Traffic signal at Silk Board junction not working for 3 days. Heavy congestion morning and evening. School buses stuck for 30+ minutes.", status: "IN_PROGRESS", severity: "HIGH", ward: "Indiranagar", city: "Bengaluru", hours: 40, votes: 240, location: "Silk Board Junction", landmark: "Silk Board", upvotes: 240 },
];

function buildReport(s: S, idx: number): Report {
  const dpt = getDeptFromText(s.text);
  const analysis = analyze(s.text);
  const created = now - s.hours * H;
  const deptSLA = getDept(dpt).slaDays;
  let status = s.status;
  let resolvedAt: number | undefined;
  let resolution: string | undefined;
  if (status === "RESOLVED") {
    resolvedAt = created + deptSLA * D;
    resolution = s.text.includes("Park transformed") || s.text.includes("streetlights") || s.text.includes("पार्क")
      ? "Field inspection completed. Crew redeployed and the issue was resolved and verified within the SLA." : "Crew completed repairs and the report was closed after verification.";
  }
  const assigned = status === "RESOLVED" || status === "IN_PROGRESS" ? "Meera Iyer" : undefined;

  const timeline: TimelineEvent[] = [
    { id: uid("t"), ts: created, actor: s.citizenName, type: "submit", title: "Report submitted" },
    { id: uid("t"), ts: created + 8_000, actor: "Setu AI", type: "ai", title: `AI triage · routed to ${getDept(dpt).name}`, note: `Confidence ${Math.round(analysis.dept.confidence * 100)}% · ${analysis.lang}` },
  ];
  if (assigned) timeline.push({ id: uid("t"), ts: created + 30 * 60000, actor: "Setu AI", type: "assign", title: `Assigned to ${assigned}` });
  if (status === "IN_PROGRESS") timeline.push({ id: uid("t"), ts: now - 2 * H, actor: assigned || "Crew", type: "update", title: "Crew on ground", note: "Crew dispatched and working on site." });
  if (status === "RESOLVED" && resolvedAt) timeline.push({ id: uid("t"), ts: resolvedAt, actor: assigned || "Officer", type: "resolve", title: "Resolved", note: resolution });

  return {
    id: `CX-${String(90412 - idx).padStart(5, "0")}`,
    citizenId: s.citizenId,
    citizenName: s.citizenName,
    originalText: s.text,
    lang: analysis.lang,
    langCode: analysis.langCode,
    englishSummary: analysis.englishSummary,
    translations: analysis.translations,
    departmentId: dpt,
    departmentName: getDept(dpt).name,
    status, severity: s.severity,
    urgency: analysis.urgency, priorityScore: analysis.priorityScore,
    slaDays: deptSLA,
    aiConfidence: Math.round(analysis.dept.confidence * 100),
    location: s.location, landmark: s.landmark,
    ward: s.ward, city: s.city,
    lat: 17.4 + Math.random() * 0.4, lng: 78.4 + Math.random() * 0.4,
    photos: [],
    upvotes: s.upvotes + (Math.random() * 200 | 0),
    assignedTo: assigned,
    resolvedBy: assigned,
    resolution,
    created, updated: now, resolvedAt,
    timeline: tl(...timeline),
  };
}

import { scoreDepartments } from "./aiEngine";
function getDeptFromText(text: string): string {
  return scoreDepartments(text)[0].id;
}

export function seedReports(): Report[] {
  return RAW.map(buildReport);
}
