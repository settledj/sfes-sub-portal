import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeTeacher } from "@/lib/serialize";
import { C } from "@/lib/constants";
import { PortalHeader } from "@/components/PortalHeader";
import { TeacherPortalClient } from "@/components/teacher/TeacherPortalClient";

export default async function TeacherPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/stfrancishouston/signin");
  if (session.user.role !== "teacher") redirect("/stfrancishouston");

  const teacher = await prisma.teacher.findFirst({ where: { email: { equals: session.user.email, mode: "insensitive" } } });
  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream }}>
        <p className="text-sm max-w-sm text-center" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Your email is approved for teacher access, but there&apos;s no matching teacher record yet. Ask an admin to
          add one with this same email address.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <PortalHeader subtitle="Teacher" />
      <main className="max-w-6xl mx-auto px-5 py-6">
        <TeacherPortalClient teacher={serializeTeacher(teacher)} />
      </main>
    </div>
  );
}
