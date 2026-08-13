import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { serializeRequest } from "@/lib/serialize";

// Teacher (or admin) saves lesson plan / schedule / attendance / notes onto an existing booking.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["teacher", "admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { lessonPlan, schedule, attendance, notes } = await req.json();

  const updated = await prisma.request.update({
    where: { id },
    data: { lessonPlan, schedule, attendance, notes },
  });

  return NextResponse.json(serializeRequest(updated));
}
