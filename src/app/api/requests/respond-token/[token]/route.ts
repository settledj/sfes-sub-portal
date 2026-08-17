import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { respondToRequest } from "@/lib/respondToRequest";
import { serializeRequest } from "@/lib/serialize";

// No-login accept/decline from the notification email — see
// src/app/respond/[token]/page.tsx. The token itself (unguessable, single-use,
// cleared on response) is the authorization here in place of a session.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { accept } = await req.json();

  const existing = await prisma.request.findUnique({ where: { respondToken: token } });
  if (!existing) return NextResponse.json({ error: "This link has expired or was already used." }, { status: 404 });

  const updated = await respondToRequest(existing.id, accept);
  if (!updated) return NextResponse.json({ error: "This link has expired or was already used." }, { status: 409 });

  return NextResponse.json(serializeRequest(updated));
}
