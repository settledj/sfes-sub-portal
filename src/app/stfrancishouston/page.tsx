import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.email) redirect("/stfrancishouston/signin");

  if (session.user.role === "teacher") redirect("/stfrancishouston/teacher");
  if (session.user.role === "substitute") redirect("/stfrancishouston/sub");
  if (session.user.role === "admin") redirect("/stfrancishouston/admin");

  redirect("/stfrancishouston/signin?error=AccessDenied");
}
