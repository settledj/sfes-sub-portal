import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnySession, teacherOwnsBooking, subOwnsBooking, type Session } from "@/lib/authz";
import { serializeMessage } from "@/lib/serialize";

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
  const { error } = await loadAuthorized(id, check.session);
  if (error) return error;

  const { body } = await req.json();
  const text = String(body || "").trim();
  if (!text) return NextResponse.json({ error: "Message can't be empty." }, { status: 400 });

  const { role, email } = check.session.user;
  if (!role || !email) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const senderName =
    role === "teacher"
      ? (await prisma.teacher.findUnique({ where: { email } }))?.name
      : role === "substitute"
      ? (await prisma.substitute.findUnique({ where: { email } }))?.name
      : (await prisma.admin.findUnique({ where: { email } }))?.name;

  const message = await prisma.message.create({
    data: { requestId: id, senderRole: role, senderName: senderName || email, body: text },
  });

  return NextResponse.json(serializeMessage(message), { status: 201 });
}
