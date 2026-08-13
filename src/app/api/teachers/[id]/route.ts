import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { serializeTeacher } from "@/lib/serialize";

// Teacher-editable field: photo (via EditableAvatar).
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

  const { photo } = await req.json();

  const updated = await prisma.teacher.update({ where: { id: Number(id) }, data: { photo } });
  return NextResponse.json(serializeTeacher(updated));
}
