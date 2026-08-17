// Shared accept/decline logic — used by both the authenticated portal route
// (src/app/api/requests/[id]/respond/route.ts) and the no-login, token-based
// email route (src/app/api/requests/respond-token/[token]/route.ts), so the
// two paths can never drift out of sync.
import { prisma } from "./prisma";
import { logNotification } from "./notify";
import { dkToDate, prettyDate } from "./dates";
import { requestAcceptedEmail, requestDeclinedEmail } from "./emailTemplates";
import { buildCalendarLinks } from "./calendarLinks";

export async function respondToRequest(id: string, accept: boolean) {
  const existing = await prisma.request.findUnique({ where: { id } });
  // Already responded to (or gone) — no-op rather than re-processing, so a
  // reused/stale email link can't double-book or re-notify.
  if (!existing || existing.status !== "pending") return null;

  const updated = await prisma.request.update({
    where: { id },
    data: { status: accept ? "accepted" : "declined", respondToken: null },
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
    const dateLabel = prettyDate(dkToDate(existing.dk));
    const subName = sub ? sub.name : "Your substitute";

    const content = accept
      ? requestAcceptedEmail({
          teacherName: teacher.name,
          subName,
          dateLabel,
          calendarLinks: buildCalendarLinks(
            existing.id,
            existing.dk,
            `Substitute — ${existing.subject || teacher.name}`,
            `${subName} covering for ${teacher.name}${existing.subject ? ` (${existing.subject})` : ""}.`
          ),
        })
      : requestDeclinedEmail({ teacherName: teacher.name, subName, dateLabel });

    await logNotification(prisma, {
      event: accept ? "request_accepted" : "request_declined",
      toName: teacher.name,
      toEmail: teacher.email,
      toPhone: teacher.phone,
      subject: content.subject,
      body: content.text,
      html: content.html,
    });
  }

  return updated;
}
