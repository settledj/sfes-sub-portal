import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  if (session.user.role === "teacher") redirect("/teacher");
  if (session.user.role === "substitute") redirect("/sub");
  if (session.user.role === "admin") redirect("/admin");

  redirect("/signin?error=AccessDenied");
}
