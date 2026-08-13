import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { logNotification } from "@/lib/notify";
import { serializeRequest } from "@/lib/serialize";
import { dkToDate, prettyDate } from "@/lib/dates";

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

  const updated = await prisma.request.update({
    where: { id },
    data: { status: accept ? "accepted" : "declined" },
  });

  if (accept) {
    const sub = await prisma.substitute.findUnique({ where: { id: existing.subId } });
    if (sub) {
      const availability = { ...(sub.availability as Record<string, string>), [existing.dk]: "booked" };
      await prisma.substitute.update({ where: { id: sub.id }, data: { availability } });
    }
  }

  const sub = await prisma.substitute.findUnique({ where: { id: existing.subId } });
  const teacher = await prisma.teacher.findUnique({ where: { id: existing.teacherId } });
  if (teacher) {
    await logNotification(prisma, {
      event: accept ? "request_accepted" : "request_declined",
      toName: teacher.name,
      toEmail: teacher.email,
      toPhone: teacher.phone,
      subject: accept ? "Substitute confirmed" : "Substitute declined",
      body: `${sub ? sub.name : "Your substitute"} has ${accept ? "confirmed" : "declined"} your request for ${prettyDate(dkToDate(existing.dk))}.`,
    });
  }

  return NextResponse.json(serializeRequest(updated));
}
