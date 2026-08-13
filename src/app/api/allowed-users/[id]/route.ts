import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  await prisma.allowedUser.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// Set or clear a password for someone without a Google account.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { id } = await params;
  const { password } = await req.json();
  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  await prisma.allowedUser.update({ where: { id }, data: { passwordHash } });
  return NextResponse.json({ ok: true, hasPassword: passwordHash !== null });
}
