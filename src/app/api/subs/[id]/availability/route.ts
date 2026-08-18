import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, sameEmail } from "@/lib/authz";
import { serializeSub } from "@/lib/serialize";

// A sub sets their own status for one date. Booked dates are managed via request
// responses instead, so this is a no-op if the date is currently booked.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["substitute", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { dk, status } = await req.json();

  const sub = await prisma.substitute.findUnique({ where: { id: Number(id) } });
  if (!sub) return NextResponse.json({ error: "Substitute not found." }, { status: 404 });
  if (check.session.user.role === "substitute" && !sameEmail(sub.email, check.session.user.email)) {
    return NextResponse.json({ error: "Not your calendar." }, { status: 403 });
  }

  const availability = { ...(sub.availability as Record<string, string>) };
  if (availability[dk] === "booked") {
    return NextResponse.json(serializeSub(sub));
  }
  if (status === "available") delete availability[dk];
  else availability[dk] = "unavailable";

  const updated = await prisma.substitute.update({ where: { id: sub.id }, data: { availability } });
  return NextResponse.json(serializeSub(updated));
}
