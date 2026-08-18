import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { logNotification } from "@/lib/notify";
import { serializeRequest } from "@/lib/serialize";
import { dkToDate, prettyDate } from "@/lib/dates";
import { cancellationDeniedEmail } from "@/lib/emailTemplates";

// Admin denies a teacher/sub's cancellation request — the booking stands
// exactly as it was, and the person who asked to cancel is notified.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (!existing.cancelRequestedAt) return NextResponse.json({ error: "No cancellation request is pending on this booking." }, { status: 400 });

  const updated = await prisma.request.update({
    where: { id },
    data: { cancelRequestedAt: null, cancelRequestedBy: null },
  });

  const [sub, teacher] = await Promise.all([
    prisma.substitute.findUnique({ where: { id: existing.subId } }),
    prisma.teacher.findUnique({ where: { id: existing.teacherId } }),
  ]);
  const when = prettyDate(dkToDate(existing.dk));

  if (existing.cancelRequestedBy === "teacher" && teacher) {
    const content = cancellationDeniedEmail({ toName: teacher.name, otherName: sub?.name || "the substitute", dateLabel: when });
    await logNotification(prisma, {
      event: "cancellation_denied",
      toName: teacher.name,
      toEmail: teacher.email,
      toPhone: teacher.phone,
      subject: content.subject,
      body: content.text,
      html: content.html,
      enabled: teacher.notifyBookingUpdates,
    });
  } else if (existing.cancelRequestedBy === "substitute" && sub) {
    const content = cancellationDeniedEmail({ toName: sub.name, otherName: existing.teacherName || "the teacher", dateLabel: when });
    await logNotification(prisma, {
      event: "cancellation_denied",
      toName: sub.name,
      toEmail: sub.email,
      toPhone: sub.phone,
      subject: content.subject,
      body: content.text,
      html: content.html,
      enabled: sub.notifyBookingUpdates,
    });
  }

  return NextResponse.json(serializeRequest(updated));
}
