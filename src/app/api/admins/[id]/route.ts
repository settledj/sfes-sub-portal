import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, sameEmail } from "@/lib/authz";
import { serializeAdmin } from "@/lib/serialize";

// Admin-editable fields: just their own notification preferences.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;

  const target = await prisma.admin.findUnique({ where: { id: Number(id) } });
  if (!sameEmail(target?.email, check.session.user.email)) {
    return NextResponse.json({ error: "Not your profile." }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["notifyBookingUpdates", "notifyMessages"]) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.admin.update({ where: { id: Number(id) }, data });
  return NextResponse.json(serializeAdmin(updated));
}
