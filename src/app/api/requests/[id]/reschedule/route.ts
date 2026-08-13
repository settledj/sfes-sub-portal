import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { serializeRequest } from "@/lib/serialize";

// Admin reschedules a confirmed booking to a new date and/or a different sub.
// Also used by the "reassign" endpoint (same sub swap, unchanged date).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { subId: newSubId, dk: newDk } = await req.json();

  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const sameSlot = existing.subId === newSubId && existing.dk === newDk;

  if (!sameSlot) {
    const oldSub = await prisma.substitute.findUnique({ where: { id: existing.subId } });
    if (oldSub) {
      const availability = { ...(oldSub.availability as Record<string, string>) };
      delete availability[existing.dk];
      await prisma.substitute.update({ where: { id: oldSub.id }, data: { availability } });
    }

    const newSub = await prisma.substitute.findUnique({ where: { id: newSubId } });
    if (newSub) {
      const availability = { ...(newSub.availability as Record<string, string>), [newDk]: "booked" };
      await prisma.substitute.update({ where: { id: newSub.id }, data: { availability } });
    }
  }

  const updated = await prisma.request.update({ where: { id }, data: { subId: newSubId, dk: newDk } });
  return NextResponse.json(serializeRequest(updated));
}
