import { NextResponse } from "next/server";
import { auth } from "./auth";
import { prisma } from "./prisma";
import type { AllowedRole } from "@prisma/client";

export type Session = { user: { email?: string | null; role?: AllowedRole | null } };

// Email providers (Google, school domains, etc.) all treat addresses as
// case-insensitive, but a handful of our own Teacher/Substitute/Admin rows
// were entered with mixed case and don't exact-match the session's email —
// silently locking otherwise-legitimate people out. Compare through this
// everywhere an email needs to match a signed-in session's email.
export function sameEmail(a?: string | null, b?: string | null): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

// Every mutating API route calls this first. Returns either an authorized
// session or a Response to return immediately (401/403) — callers do:
//
//   const check = await requireRole(["admin"]);
//   if (check instanceof NextResponse) return check;
//   const { session } = check;
//
export async function requireRole(roles: AllowedRole[]) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!session.user.role || !roles.includes(session.user.role)) {
    return NextResponse.json({ error: "Not authorized for this action." }, { status: 403 });
  }
  return { session };
}

export async function requireAnySession() {
  const session = await auth();
  if (!session?.user?.email || !session.user.role) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return { session };
}

// A signed-in teacher may only act on bookings tied to their own Teacher
// record — admins bypass this (they act on anyone's booking). Returns true
// when the caller may proceed. Call after requireRole(["teacher","admin"]).
export async function teacherOwnsBooking(session: Session, teacherId: number) {
  if (session.user.role !== "teacher") return true;
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  return sameEmail(teacher?.email, session.user.email);
}

// Same idea for substitutes — a substitute may only act on bookings tied to
// their own Substitute record; admins bypass. Call after
// requireRole(["substitute","admin"]).
export async function subOwnsBooking(session: Session, subId: number) {
  if (session.user.role !== "substitute") return true;
  const sub = await prisma.substitute.findUnique({ where: { id: subId } });
  return sameEmail(sub?.email, session.user.email);
}
