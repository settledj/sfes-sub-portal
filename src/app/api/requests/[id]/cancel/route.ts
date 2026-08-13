import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { serializeRequest } from "@/lib/serialize";

// Teacher or admin cancels a pending or confirmed request — frees the date back up.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const updated = await prisma.request.update({ where: { id }, data: { status: "cancelled" } });

  if (existing.status === "accepted") {
    const sub = await prisma.substitute.findUnique({ where: { id: existing.subId } });
    if (sub) {
      const availability = { ...(sub.availability as Record<string, string>) };
      delete availability[existing.dk];
      await prisma.substitute.update({ where: { id: sub.id }, data: { availability } });
    }
  }

  return NextResponse.json(serializeRequest(updated));
}
