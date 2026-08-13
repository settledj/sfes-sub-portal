import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { seedDatabase } from "../../../../prisma/seedData";

// Mirrors the prototype's "Reset demo data" header button.
export async function POST() {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  await seedDatabase(prisma);
  return NextResponse.json({ ok: true });
}
