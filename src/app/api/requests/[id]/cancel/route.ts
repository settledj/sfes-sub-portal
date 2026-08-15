import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, teacherOwnsBooking } from "@/lib/authz";
import { logNotification } from "@/lib/notify";
import { serializeRequest } from "@/lib/serialize";
import { dkToDate, prettyDate } from "@/lib/dates";

// Teacher or admin cancels a pending or confirmed request — frees the date back up
// and notifies both the teacher and substitute that the booking is off.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (!(await teacherOwnsBooking(check.session, existing.teacherId))) {
    return NextResponse.json({ error: "Not your booking." }, { status: 403 });
  }

  const updated = await prisma.request.update({ where: { id }, data: { status: "cancelled" } });

  const [sub, teacher] = await Promise.all([
    prisma.substitute.findUnique({ where: { id: existing.subId } }),
    prisma.teacher.findUnique({ where: { id: existing.teacherId } }),
  ]);

  if (existing.status === "accepted" && sub) {
    const availability = { ...(sub.availability as Record<string, string>) };
    delete availability[existing.dk];
    await prisma.substitute.update({ where: { id: sub.id }, data: { availability } });
  }

  const when = prettyDate(dkToDate(existing.dk));
  await Promise.all([
    sub &&
      logNotification(prisma, {
        event: "booking_cancelled",
        toName: sub.name,
        toEmail: sub.email,
        toPhone: sub.phone,
        subject: "Booking cancelled",
        body: `${existing.teacherName || "The teacher"}'s request for you on ${when} has been cancelled.`,
      }),
    teacher &&
      logNotification(prisma, {
        event: "booking_cancelled",
        toName: teacher.name,
        toEmail: teacher.email,
        toPhone: teacher.phone,
        subject: "Booking cancelled",
        body: `The booking with ${sub ? sub.name : "your substitute"} on ${when} has been cancelled.`,
      }),
  ]);

  return NextResponse.json(serializeRequest(updated));
}
