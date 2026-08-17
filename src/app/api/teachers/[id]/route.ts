import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { serializeTeacher } from "@/lib/serialize";

// Teacher-editable fields: photo (via EditableAvatar) and their own notification preferences.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;

  if (check.session.user.role === "teacher") {
    const target = await prisma.teacher.findUnique({ where: { id: Number(id) } });
    if (target?.email !== check.session.user.email) {
      return NextResponse.json({ error: "Not your profile." }, { status: 403 });
    }
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["photo", "notifyBookingUpdates", "notifyMessages"]) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.teacher.update({ where: { id: Number(id) }, data });
  return NextResponse.json(serializeTeacher(updated));
}
