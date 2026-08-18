import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { finalizeCancellation } from "@/lib/cancelBooking";
import { serializeRequest } from "@/lib/serialize";

// Admin approves a teacher/sub's pending cancellation request — actually
// cancels the booking (frees availability, notifies both sides) via the same
// logic the admin-instant /cancel route uses.
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (!existing.cancelRequestedAt) return NextResponse.json({ error: "No cancellation request is pending on this booking." }, { status: 400 });

  const updated = await finalizeCancellation(existing);
  return NextResponse.json(serializeRequest(updated));
}
