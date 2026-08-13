import { NextResponse } from "next/server";
import { auth } from "./auth";
import type { AllowedRole } from "@prisma/client";

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
