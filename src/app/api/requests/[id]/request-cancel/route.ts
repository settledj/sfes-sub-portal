import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, teacherOwnsBooking, subOwnsBooking } from "@/lib/authz";
import { logNotification } from "@/lib/notify";
import { serializeRequest } from "@/lib/serialize";
import { getAppUrl } from "@/lib/appUrl";
import { dkToDate, prettyDate } from "@/lib/dates";
import { cancellationRequestedEmail } from "@/lib/emailTemplates";

const roleLabel = { teacher: "Teacher", substitute: "Substitute" } as const;

// A teacher or substitute asks to cancel a pending or confirmed booking —
// unlike an admin, they can't cancel it outright. The booking stays exactly
// as it is until an admin approves (see /approve-cancel) or denies (see
// /deny-cancel) the request.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["teacher", "substitute"]);
  if (check instanceof NextResponse) return check;
  const { session } = check;
  const role = session.user.role as "teacher" | "substitute";

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  const owns = role === "teacher" ? await teacherOwnsBooking(session, existing.teacherId) : await subOwnsBooking(session, existing.subId);
  if (!owns) return NextResponse.json({ error: "Not your booking." }, { status: 403 });

  if (existing.status === "cancelled" || existing.status === "declined") {
    return NextResponse.json({ error: "This booking is already settled." }, { status: 400 });
  }
  if (existing.cancelRequestedAt) return NextResponse.json(serializeRequest(existing));

  const updated = await prisma.request.update({
    where: { id },
    data: { cancelRequestedAt: new Date(), cancelRequestedBy: role },
  });

  const [sub, teacher] = await Promise.all([
    prisma.substitute.findUnique({ where: { id: existing.subId } }),
    prisma.teacher.findUnique({ where: { id: existing.teacherId } }),
  ]);
  const requesterName = role === "teacher" ? existing.teacherName || teacher?.name || "A teacher" : sub?.name || "A substitute";
  const otherName = role === "teacher" ? sub?.name || "the substitute" : existing.teacherName || "the teacher";
  const when = prettyDate(dkToDate(existing.dk));

  const admins = await prisma.admin.findMany();
  await Promise.all(
    admins.map((admin) => {
      const content = cancellationRequestedEmail({
        adminName: admin.name,
        requesterRoleLabel: roleLabel[role],
        requesterName,
        otherName,
        dateLabel: when,
        portalUrl: `${getAppUrl()}/stfrancishouston/admin`,
      });
      return logNotification(prisma, {
        event: "cancellation_requested_admin",
        toName: admin.name,
        toEmail: admin.email,
        toPhone: admin.phone,
        subject: content.subject,
        body: content.text,
        html: content.html,
        enabled: admin.notifyBookingUpdates,
      });
    })
  );

  return NextResponse.json(serializeRequest(updated));
}
