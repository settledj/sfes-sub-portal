import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

// Never send passwordHash to the client — expose only whether one is set.
function serialize<T extends { passwordHash: string | null }>(u: T) {
  const { passwordHash, ...rest } = u;
  return { ...rest, hasPassword: passwordHash !== null };
}

export async function GET() {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const users = await prisma.allowedUser.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users.map(serialize));
}

export async function POST(req: Request) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { email, role, password } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "email and role are required." }, { status: 400 });

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;

  const created = await prisma.allowedUser.create({
    data: { email: String(email).toLowerCase(), role, passwordHash },
  });
  return NextResponse.json(serialize(created), { status: 201 });
}
