import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, subOwnsBooking } from "@/lib/authz";
import { serializeRequest } from "@/lib/serialize";

// The substitute's own end-of-day report on a booking — only the substitute
// assigned to it (or an admin, for corrections) may write it. Teachers and
// other substitutes can read it as part of the booking (see /api/state) but
// never write it here.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["substitute", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (!(await subOwnsBooking(check.session, existing.subId))) {
    return NextResponse.json({ error: "Not your booking." }, { status: 403 });
  }

  const { subFeedback } = await req.json();

  const updated = await prisma.request.update({
    where: { id },
    data: { subFeedback: String(subFeedback ?? "") },
  });

  return NextResponse.json(serializeRequest(updated));
}
