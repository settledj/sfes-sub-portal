import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, dkToDate } from "@/lib/dates";

function icsDate(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function icsTimestamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

// Downloadable .ics for a booking — linked from confirmation emails. Request
// ids are unguessable cuids, so no auth gate beyond that (same posture as a
// typical "share link"). All-day event since bookings have no time-of-day field.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const [sub, teacher] = await Promise.all([
    prisma.substitute.findUnique({ where: { id: request.subId } }),
    prisma.teacher.findUnique({ where: { id: request.teacherId } }),
  ]);

  const start = dkToDate(request.dk);
  const end = addDays(start, 1);
  const title = `Substitute — ${request.subject || teacher?.name || "Class"}`;
  const details = `${sub ? sub.name : "Substitute"} covering for ${teacher ? teacher.name : "teacher"}${request.subject ? ` (${request.subject})` : ""}.`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//St. Francis Sub Portal//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${request.id}@subme.app`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART;VALUE=DATE:${icsDate(start)}`,
    `DTEND;VALUE=DATE:${icsDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(details)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="booking-${request.id}.ics"`,
    },
  });
}
