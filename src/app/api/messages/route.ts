import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnySession } from "@/lib/authz";
import { serializeMessage } from "@/lib/serialize";

// All messages, unfiltered — same pattern as /api/state (broad server fetch,
// role-scoped filtering happens client-side against the already-loaded
// requests list, consistent with how subs/teachers/requests already work).
// Backs the Messages inbox — see src/components/shared/MessagesInboxModal.tsx.
export async function GET() {
  const check = await requireAnySession();
  if (check instanceof NextResponse) return check;

  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(messages.map(serializeMessage));
}
