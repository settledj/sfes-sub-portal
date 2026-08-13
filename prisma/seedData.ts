// Ported from the prototype's buildInitialSubs / buildInitialRequests. Roster
// data itself (names, phones, emails, photos) lives in prisma/roster.local.ts,
// which is gitignored — see prisma/roster.local.example.ts to set it up.
import type { PrismaClient } from "@prisma/client";
import { dateKey } from "../src/lib/dates";
import { initialsOf } from "../src/lib/people";
import { C } from "../src/lib/constants";
import {
  SUBS_DATA,
  TEACHERS_DATA,
  ADMINS_DATA,
  DEMO_BOOKING_DATES,
  DINH_BOOKING_DATES,
  DEMO_SUB_EMAIL,
  DEMO_TEACHER_NAME,
  DEMO_TEACHER_2_NAME,
} from "./roster.local";

// Seed several months of availability so future-dated navigation has real data to show.
function seededAvailability(subIndex: number, startMonth: Date, monthCount = 3): Record<string, "unavailable"> {
  const avail: Record<string, "unavailable"> = {};
  for (let m = 0; m < monthCount; m++) {
    const year = startMonth.getFullYear();
    const month = startMonth.getMonth() + m;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      if (d.getDay() === 0 || d.getDay() === 6) continue; // weekends left unset
      const roll = (subIndex * 7 + day * 3 + m * 11) % 5;
      if (roll === 0) avail[dateKey(d)] = "unavailable";
    }
  }
  return avail;
}

// Wipes and reseeds every table with the demo dataset from roster.local.ts. Used by
// both `prisma db seed` (prisma/seed.ts) and the admin "Reset demo data" API route.
export async function seedDatabase(prisma: PrismaClient) {
  await prisma.notification.deleteMany();
  await prisma.request.deleteMany();
  await prisma.substitute.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();

  const initialMonth = new Date();
  initialMonth.setDate(1);

  const subs = await Promise.all(
    SUBS_DATA.map((s, i) =>
      prisma.substitute.create({
        data: {
          name: s.name,
          initials: initialsOf(s.name),
          phone: s.phone,
          email: s.email,
          division: s.division,
          subjects: s.subjects,
          additionalInfo: s.additionalInfo,
          bio: "", // no fabricated bios for real people — only what's on the actual roster
          hrApproved: s.hrApproved,
          needsApproval: s.needsApproval,
          preferred: false,
          accent: C.navy,
          photo: s.photo || null,
          availability: seededAvailability(i, initialMonth, 3),
        },
      })
    )
  );

  const teachers = await Promise.all(
    TEACHERS_DATA.map((t) =>
      prisma.teacher.create({
        data: {
          name: t.name,
          subject: t.subject,
          room: t.room,
          email: t.email,
          phone: t.phone,
          initials: initialsOf(t.name),
          accent: C.navy,
          photo: t.photo,
        },
      })
    )
  );

  await Promise.all(
    ADMINS_DATA.map((a) => prisma.admin.create({ data: { name: a.name, email: a.email, phone: a.phone } }))
  );

  const demoSub = subs.find((s) => s.email === DEMO_SUB_EMAIL);
  const demoTeacher = teachers.find((t) => t.name === DEMO_TEACHER_NAME);
  const demoTeacher2 = teachers.find((t) => t.name === DEMO_TEACHER_2_NAME);

  if (demoSub && demoTeacher && DEMO_BOOKING_DATES.length > 0) {
    const bookedDates = {
      ...(demoSub.availability as Record<string, string>),
      ...Object.fromEntries(DEMO_BOOKING_DATES.map((d) => [dateKey(d), "booked"])),
      ...(demoTeacher2 ? Object.fromEntries(DINH_BOOKING_DATES.map((d) => [dateKey(d), "booked"])) : {}),
    };
    await prisma.substitute.update({ where: { id: demoSub.id }, data: { availability: bookedDates } });

    await prisma.request.createMany({
      data: DEMO_BOOKING_DATES.map((d) => ({
        subId: demoSub.id,
        teacherId: demoTeacher.id,
        teacherName: demoTeacher.name,
        dk: dateKey(d),
        subject: "Science",
        grade: "6th Grade",
        status: "accepted" as const,
        source: "admin" as const,
      })),
    });

    if (demoTeacher2 && DINH_BOOKING_DATES.length > 0) {
      await prisma.request.createMany({
        data: DINH_BOOKING_DATES.map((d) => ({
          subId: demoSub.id,
          teacherId: demoTeacher2.id,
          teacherName: demoTeacher2.name,
          dk: dateKey(d),
          subject: "History",
          grade: "5th Grade",
          status: "accepted" as const,
          source: "admin" as const,
        })),
      });
    }
  }

  console.log(`Seeded ${subs.length} substitutes, ${teachers.length} teachers, ${ADMINS_DATA.length} admin(s).`);
}
