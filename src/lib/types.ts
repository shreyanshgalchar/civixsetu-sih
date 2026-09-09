import type { Department } from "./departments";
import type { Severity, Analysis } from "./aiEngine";

export type { Department, Severity, Analysis };

export type Role = "citizen" | "officer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatarColor?: string;
  departmentId?: string;      // for officers
  designation?: string;       // for officers
  ward?: string;
  city?: string;
  karma: number;
  streak: number;             // days
  verifiedCount: number;
  created: number;
}

export type ReportStatus = "REPORTED" | "AI_VERIFIED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export interface TimelineEvent {
  id: string;
  ts: number;
  actor: string;
  type: "submit" | "ai" | "assign" | "update" | "resolve" | "reject" | "note";
  title: string;
  note?: string;
}

export interface Report {
  id: string;                // CX-xxxxx
  citizenId: string;
  citizenName: string;
  originalText: string;
  lang: string;
  langCode: string;
  englishSummary: string;
  translations: string[];
  departmentId: string;
  departmentName: string;
  status: ReportStatus;
  severity: Severity;
  urgency: number;
  priorityScore: number;
  slaDays: number;
  aiConfidence: number;
  location: string;
  landmark: string;
  ward: string;
  city: string;
  lat?: number;
  lng?: number;
  photos: string[];          // data-uri thumbnails
  audio?: string;            // data-uri
  photo?: string;            // featured image url (illustrative)
  extraPhotos?: string[];
  upvotes: number;
  assignNote?: string;       // officer escalation / SLA note
  citizenRating?: number;    // 0-5
  assignedTo?: string;       // officer name
  assignedOfficerId?: string;
  resolvedBy?: string;
  resolution?: string;
  created: number;
  updated: number;
  resolvedAt?: number;
  timeline: TimelineEvent[];
}

export interface AppState {
  users: User[];
  reports: Report[];
  sessionId: string | null;
  analytics: {
    lastTrained: number;
    modelVersion: string;
    accuracy: number;
  };
}

export interface WrappedAnalysis extends Analysis {
  department: Department;
}
