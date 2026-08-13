import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  await prisma.allowedUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
