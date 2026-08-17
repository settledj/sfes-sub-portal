import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnySession, teacherOwnsBooking, subOwnsBooking, type Session } from "@/lib/authz";
import { serializeMessage } from "@/lib/serialize";
import { logNotification } from "@/lib/notify";
import { newMessageEmail } from "@/lib/emailTemplates";
import { getAppUrl } from "@/lib/appUrl";
import { dkToDate, prettyDate } from "@/lib/dates";

// Any of the three legitimate participants on a booking — the teacher who
// made it, the substitute assigned to it, or an admin — may read or post to
// its thread. teacherOwnsBooking/subOwnsBooking each no-op (return true) for
// roles they don't apply to, so requiring both to pass is exactly "the
// caller's own role-appropriate ownership check, if any, must succeed."
async function loadAuthorized(id: string, session: Session) {
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return { error: NextResponse.json({ error: "Request not found." }, { status: 404 }) };
  const authorized =
    (await teacherOwnsBooking(session, existing.teacherId)) && (await subOwnsBooking(session, existing.subId));
  if (!authorized) return { error: NextResponse.json({ error: "Not your booking." }, { status: 403 }) };
  return { existing };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAnySession();
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { error } = await loadAuthorized(id, check.session);
  if (error) return error;

  const messages = await prisma.message.findMany({ where: { requestId: id }, orderBy: { createdAt: "asc" } });
  return NextResponse.json(messages.map(serializeMessage));
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAnySession();
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { error, existing } = await loadAuthorized(id, check.session);
  if (error) return error;

  const { body } = await req.json();
  const text = String(body || "").trim();
  if (!text) return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });

  const { role, email } = check.session.user;
  if (!role || !email) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const [teacher, sub] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: existing!.teacherId } }),
    prisma.substitute.findUnique({ where: { id: existing!.subId } }),
  ]);

  const senderName =
    role === "teacher" ? teacher?.name : role === "substitute" ? sub?.name : (await prisma.admin.findUnique({ where: { email } }))?.name;

  const message = await prisma.message.create({
    data: { requestId: id, senderRole: role, senderName: senderName || email, body: text },
  });

  // Notify whoever didn't send it — both, if an admin sent it.
  const dateLabel = prettyDate(dkToDate(existing!.dk));
  const recipients = [];
  if (role !== "teacher" && teacher) recipients.push({ record: teacher, portalPath: "/teacher" });
  if (role !== "substitute" && sub) recipients.push({ record: sub, portalPath: "/sub" });

  await Promise.all(
    recipients.map(({ record, portalPath }) => {
      const content = newMessageEmail({
        toName: record.name,
        senderName: senderName || email,
        dateLabel,
        messageBody: text,
        portalUrl: `${getAppUrl()}${portalPath}`,
      });
      return logNotification(prisma, {
        event: "new_message",
        toName: record.name,
        toEmail: record.email,
        toPhone: record.phone,
        subject: content.subject,
        body: content.text,
        html: content.html,
        enabled: record.notifyMessages,
      });
    })
  );

  return NextResponse.json(serializeMessage(message), { status: 201 });
}
