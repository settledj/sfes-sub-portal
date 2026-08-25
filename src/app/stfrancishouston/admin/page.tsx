import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { C } from "@/lib/constants";
import { PortalHeader } from "@/components/PortalHeader";
import { AdminPortalClient } from "@/components/admin/AdminPortalClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/stfrancishouston/signin");
  if (session.user.role !== "admin") redirect("/stfrancishouston");

  const admin = await prisma.admin.findFirst({ where: { email: { equals: session.user.email, mode: "insensitive" } } });
  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream }}>
        <p className="text-sm max-w-sm text-center" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Your email is approved for admin access, but there&apos;s no matching admin record yet. Add one with this
          same email address directly in the database (there&apos;s no bootstrap UI for the very first admin).
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <PortalHeader subtitle="Admin" />
      <main className="max-w-6xl mx-auto px-5 py-6">
        <AdminPortalClient adminId={admin.id} adminName={admin.name} />
      </main>
    </div>
  );
}
