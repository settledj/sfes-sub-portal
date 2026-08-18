import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, sameEmail } from "@/lib/authz";
import { serializeSub } from "@/lib/serialize";

// Sub-editable profile fields: bio, subjects, division, additionalInfo, photo,
// phone, plus their own notification preferences.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["substitute", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;

  if (check.session.user.role === "substitute") {
    const target = await prisma.substitute.findUnique({ where: { id: Number(id) } });
    if (!sameEmail(target?.email, check.session.user.email)) {
      return NextResponse.json({ error: "Not your profile." }, { status: 403 });
    }
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ["bio", "subjects", "division", "additionalInfo", "photo", "phone", "preferred", "notifyBookingUpdates", "notifyMessages"]) {
    if (key in body) data[key] = body[key];
  }

  const updated = await prisma.substitute.update({ where: { id: Number(id) }, data });
  return NextResponse.json(serializeSub(updated));
}
