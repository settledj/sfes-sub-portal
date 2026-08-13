import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

export async function GET() {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const users = await prisma.allowedUser.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const check = await requireRole(["admin"]);
  if (check instanceof NextResponse) return check;

  const { email, role } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "email and role are required." }, { status: 400 });

  const created = await prisma.allowedUser.create({ data: { email: String(email).toLowerCase(), role } });
  return NextResponse.json(created, { status: 201 });
}
