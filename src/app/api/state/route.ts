import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAnySession } from "@/lib/authz";
import { serializeSub, serializeTeacher, serializeAdmin, serializeRequest, serializeNotification } from "@/lib/serialize";

export async function GET() {
  const check = await requireAnySession();
  if (check instanceof NextResponse) return check;

  const [subs, teachers, admins, requests, notifications] = await Promise.all([
    prisma.substitute.findMany({ orderBy: { id: "asc" } }),
    prisma.teacher.findMany({ orderBy: { id: "asc" } }),
    prisma.admin.findMany({ orderBy: { id: "asc" } }),
    prisma.request.findMany({ orderBy: { dk: "asc" } }),
    prisma.notification.findMany({ orderBy: { timestamp: "desc" } }),
  ]);

  return NextResponse.json({
    subs: subs.map(serializeSub),
    teachers: teachers.map(serializeTeacher),
    admins: admins.map(serializeAdmin),
    requests: requests.map(serializeRequest),
    notifications: notifications.map(serializeNotification),
  });
}
