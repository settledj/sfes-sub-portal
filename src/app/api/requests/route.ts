import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, teacherOwnsBooking } from "@/lib/authz";
import { logNotification } from "@/lib/notify";
import { serializeRequest } from "@/lib/serialize";
import { dkToDate, prettyDate } from "@/lib/dates";
import { getAppUrl } from "@/lib/appUrl";
import { buildCalendarLinks } from "@/lib/calendarLinks";
import { adminBookedEmail, newBookingRequestAdminEmail, requestSentEmail } from "@/lib/emailTemplates";

// Teacher sends a request (starts pending) — payload: {subId, dk, teacherId, teacherName, subject, grade, notes}.
// Admin creates a manual booking (confirmed immediately) — same payload plus source: "admin".
export async function POST(req: Request) {
  const payload = await req.json();
  const isAdmin = payload.source === "admin";

  const check = await requireRole(isAdmin ? ["admin"] : ["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { subId, dk, teacherId, teacherName, subject = "", grade = "", notes = "" } = payload;

  if (!(await teacherOwnsBooking(check.session, teacherId))) {
    return NextResponse.json({ error: "Not your booking." }, { status: 403 });
  }

  const sub = await prisma.substitute.findUnique({ where: { id: subId } });
  if (!sub) return NextResponse.json({ error: "Substitute not found." }, { status: 404 });

  if (!isAdmin) {
    const clash = await prisma.request.findFirst({
      where: { subId, dk, status: { not: "cancelled" } },
    });
    if (clash) return NextResponse.json({ error: "This date already has a request on it." }, { status: 409 });
  }

  const respondToken = isAdmin ? null : randomBytes(24).toString("hex");

  const created = await prisma.request.create({
    data: {
      subId,
      teacherId,
      teacherName,
      dk,
      subject,
      grade,
      notes,
      status: isAdmin ? "accepted" : "pending",
      source: isAdmin ? "admin" : "teacher",
      respondToken,
    },
  });

  const dateLabel = prettyDate(dkToDate(dk));

  if (isAdmin) {
    const availability = { ...(sub.availability as Record<string, string>), [dk]: "booked" };
    await prisma.substitute.update({ where: { id: subId }, data: { availability } });
    const content = adminBookedEmail({
      subName: sub.name,
      teacherName,
      dateLabel,
      subjectLine: subject,
      calendarLinks: buildCalendarLinks(created.id, dk, `Substitute — ${subject || teacherName}`, `${sub.name} covering for ${teacherName}${subject ? ` (${subject})` : ""}.`),
    });
    await logNotification(prisma, {
      event: "admin_booked",
      toName: sub.name,
      toEmail: sub.email,
      toPhone: sub.phone,
      subject: content.subject,
      body: content.text,
      html: content.html,
      enabled: sub.notifyBookingUpdates,
    });
  } else {
    const content = requestSentEmail({
      subName: sub.name,
      teacherName,
      dateLabel,
      subjectLine: subject,
      gradeLine: grade,
      respondUrl: `${getAppUrl()}/respond/${respondToken}`,
    });
    await logNotification(prisma, {
      event: "request_sent",
      toName: sub.name,
      toEmail: sub.email,
      toPhone: sub.phone,
      subject: content.subject,
      body: content.text,
      html: content.html,
      enabled: sub.notifyBookingUpdates,
    });

    const admins = await prisma.admin.findMany();
    await Promise.all(
      admins.map((admin) => {
        const adminContent = newBookingRequestAdminEmail({
          adminName: admin.name,
          teacherName,
          subName: sub.name,
          dateLabel,
          subjectLine: subject,
        });
        return logNotification(prisma, {
          event: "request_sent_admin",
          toName: admin.name,
          toEmail: admin.email,
          toPhone: admin.phone,
          subject: adminContent.subject,
          body: adminContent.text,
          html: adminContent.html,
          enabled: admin.notifyBookingUpdates,
        });
      })
    );
  }

  return NextResponse.json(serializeRequest(created), { status: 201 });
}
