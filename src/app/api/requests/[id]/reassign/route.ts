import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, teacherOwnsBooking } from "@/lib/authz";
import { serializeRequest } from "@/lib/serialize";

// Teacher (or admin) swaps in a different sub for the same date — e.g. the original
// sub cancelled. Thin wrapper around the same slot-move logic as /reschedule.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { subId: newSubId } = await req.json();

  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (!(await teacherOwnsBooking(check.session, existing.teacherId))) {
    return NextResponse.json({ error: "Not your booking." }, { status: 403 });
  }
  if (newSubId === existing.subId) return NextResponse.json(serializeRequest(existing));

  const oldSub = await prisma.substitute.findUnique({ where: { id: existing.subId } });
  if (oldSub) {
    const availability = { ...(oldSub.availability as Record<string, string>) };
    delete availability[existing.dk];
    await prisma.substitute.update({ where: { id: oldSub.id }, data: { availability } });
  }

  const newSub = await prisma.substitute.findUnique({ where: { id: newSubId } });
  if (newSub) {
    const availability = { ...(newSub.availability as Record<string, string>), [existing.dk]: "booked" };
    await prisma.substitute.update({ where: { id: newSub.id }, data: { availability } });
  }

  const updated = await prisma.request.update({ where: { id }, data: { subId: newSubId } });
  return NextResponse.json(serializeRequest(updated));
}
