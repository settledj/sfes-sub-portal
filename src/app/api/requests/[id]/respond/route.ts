import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { respondToRequest } from "@/lib/respondToRequest";
import { serializeRequest } from "@/lib/serialize";

// Substitute (or admin, acting on their behalf) accepts/declines a pending request.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["substitute", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { accept } = await req.json();

  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  if (check.session.user.role === "substitute") {
    const sub = await prisma.substitute.findUnique({ where: { id: existing.subId } });
    if (sub?.email !== check.session.user.email) {
      return NextResponse.json({ error: "Not your request." }, { status: 403 });
    }
  }

  const updated = await respondToRequest(id, accept);
  if (!updated) return NextResponse.json({ error: "Request is no longer pending." }, { status: 409 });

  return NextResponse.json(serializeRequest(updated));
}
