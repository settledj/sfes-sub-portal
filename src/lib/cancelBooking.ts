import { prisma } from "./prisma";
import { logNotification } from "./notify";
import { dkToDate, prettyDate } from "./dates";
import { bookingCancelledEmail } from "./emailTemplates";
import type { Request as DbRequest } from "@prisma/client";

// The actual mechanics of cancelling a booking — frees the sub's day back up
// and notifies both sides. Shared by the admin-instant /cancel route and the
// /approve-cancel route (a teacher/sub's request, once an admin signs off).
export async function finalizeCancellation(existing: DbRequest) {
  const updated = await prisma.request.update({
    where: { id: existing.id },
    data: { status: "cancelled", respondToken: null, cancelRequestedAt: null, cancelRequestedBy: null },
  });

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
      (() => {
        const content = bookingCancelledEmail({ toName: sub.name, otherName: existing.teacherName, dateLabel: when, perspective: "sub" });
        return logNotification(prisma, {
          event: "booking_cancelled",
          toName: sub.name,
          toEmail: sub.email,
          toPhone: sub.phone,
          subject: content.subject,
          body: content.text,
          html: content.html,
          enabled: sub.notifyBookingUpdates,
        });
      })(),
    teacher &&
      (() => {
        const content = bookingCancelledEmail({ toName: teacher.name, otherName: sub?.name ?? "", dateLabel: when, perspective: "teacher" });
        return logNotification(prisma, {
          event: "booking_cancelled",
          toName: teacher.name,
          toEmail: teacher.email,
          toPhone: teacher.phone,
          subject: content.subject,
          body: content.text,
          html: content.html,
          enabled: teacher.notifyBookingUpdates,
        });
      })(),
  ]);

  return updated;
}
