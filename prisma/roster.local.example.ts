// Template for prisma/roster.local.ts (gitignored — see Section 5 of the handoff
// doc for why real staff PII shouldn't live in this repo). Copy this file to
// roster.local.ts and either fill in real data or leave the fake sample data
// below for a demo-safe seed.
//
//   cp prisma/roster.local.example.ts prisma/roster.local.ts
//
import type { SubSeed, TeacherSeed, AdminSeed } from "./rosterTypes";

export const SUBS_DATA: SubSeed[] = [
  { name: "Sam Rivera", phone: "(555) 010-1000", email: "sam.rivera@example.com", division: ["PS", "LS"], subjects: [], additionalInfo: "Anytime.", hrApproved: true, needsApproval: false },
  { name: "Jordan Lee", phone: "(555) 010-1001", email: "jordan.lee@example.com", division: ["MS", "US"], subjects: ["Math"], additionalInfo: "Prefers 24hr notice.", hrApproved: true, needsApproval: false },
  { name: "Casey Nguyen", phone: "(555) 010-1002", email: "casey.nguyen@example.com", division: ["PE"], subjects: ["PE"], additionalInfo: "", hrApproved: false, needsApproval: true },
];

export const TEACHERS_DATA: TeacherSeed[] = [
  { name: "Taylor Brooks", subject: "6th Grade Science", room: "Science Lab", email: "taylor.brooks@example.com", phone: "(555) 010-2000" },
  { name: "Morgan Ellis", subject: "8th Grade Math", room: "", email: "morgan.ellis@example.com", phone: "(555) 010-2001" },
];

export const ADMINS_DATA: AdminSeed[] = [{ name: "Alex Chen", email: "alex.chen@example.com", phone: "(555) 010-3000" }];

// A couple of demo bookings so the seeded data isn't empty. Uses the first sub/teacher above.
export const DEMO_BOOKING_DATES = [new Date(2026, 7, 28), new Date(2026, 8, 11)];
export const DINH_BOOKING_DATES: Date[] = [];
export const DEMO_SUB_EMAIL = SUBS_DATA[0].email;
export const DEMO_TEACHER_NAME = TEACHERS_DATA[0].name;
export const DEMO_TEACHER_2_NAME = TEACHERS_DATA[1]?.name ?? "";
