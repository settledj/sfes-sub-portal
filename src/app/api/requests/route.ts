import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { logNotification } from "@/lib/notify";
import { serializeRequest } from "@/lib/serialize";
import { dkToDate, prettyDate } from "@/lib/dates";

// Teacher sends a request (starts pending) — payload: {subId, dk, teacherId, teacherName, subject, grade, notes}.
// Admin creates a manual booking (confirmed immediately) — same payload plus source: "admin".
export async function POST(req: Request) {
  const payload = await req.json();
  const isAdmin = payload.source === "admin";

  const check = await requireRole(isAdmin ? ["admin"] : ["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { subId, dk, teacherId, teacherName, subject = "", grade = "", notes = "" } = payload;

  const sub = await prisma.substitute.findUnique({ where: { id: subId } });
  if (!sub) return NextResponse.json({ error: "Substitute not found." }, { status: 404 });

  if (!isAdmin) {
    const clash = await prisma.request.findFirst({
      where: { subId, dk, status: { not: "cancelled" } },
    });
    if (clash) return NextResponse.json({ error: "This date already has a request on it." }, { status: 409 });
  }

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
    },
  });

  if (isAdmin) {
    const availability = { ...(sub.availability as Record<string, string>), [dk]: "booked" };
    await prisma.substitute.update({ where: { id: subId }, data: { availability } });
    await logNotification(prisma, {
      event: "admin_booked",
      toName: sub.name,
      toEmail: sub.email,
      toPhone: sub.phone,
      subject: "You've been booked",
      body: `The office booked you for ${teacherName || "a class"} on ${prettyDate(dkToDate(dk))}${subject ? ` (${subject})` : ""}.`,
    });
  } else {
    await logNotification(prisma, {
      event: "request_sent",
      toName: sub.name,
      toEmail: sub.email,
      toPhone: sub.phone,
      subject: "New substitute request",
      body: `${teacherName || "A teacher"} requested you to sub on ${prettyDate(dkToDate(dk))}${subject ? ` for ${subject}` : ""}${grade ? ` (${grade})` : ""}. Log in to accept or decline.`,
    });
  }

  return NextResponse.json(serializeRequest(created), { status: 201 });
}
