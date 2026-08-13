import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeSub } from "@/lib/serialize";
import { C } from "@/lib/constants";
import { PortalHeader } from "@/components/PortalHeader";
import { SubPortalClient } from "@/components/sub/SubPortalClient";

export default async function SubPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");
  if (session.user.role !== "substitute") redirect("/");

  const sub = await prisma.substitute.findUnique({ where: { email: session.user.email } });
  if (!sub) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream }}>
        <p className="text-sm max-w-sm text-center" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
          Your email is approved for substitute access, but there&apos;s no matching substitute record yet. Ask an
          admin to add one with this same email address.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <PortalHeader subtitle="Substitute" />
      <main className="max-w-6xl mx-auto px-5 py-6">
        <SubPortalClient sub={serializeSub(sub)} />
      </main>
    </div>
  );
}
