import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { C } from "@/lib/constants";
import { WolfMark } from "@/components/shared/WolfMark";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const { from, error } = await searchParams;

  // The magic-link callback sometimes lands back on /signin itself rather than
  // the intended redirectTo — if that happened after a successful verification,
  // there's already a valid session here, so just forward on rather than
  // showing the sign-in form again.
  const session = await auth();
  if (session?.user?.email) redirect(from || "/");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <div className="max-w-sm w-full mx-4">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E3E5EA" }}>
          <div className="flex justify-center mb-4">
            <WolfMark size={44} />
          </div>
          <p className="text-center font-bold text-lg" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
            Sign in
          </p>
          <p className="text-center text-xs mb-5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            St. Francis Episcopal School — Substitute Portal. We&apos;ll email you a sign-in link — no password
            needed. Access is limited to approved staff and substitutes.
          </p>

          {error && (
            <p className="text-xs mb-3 text-center" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>
              {error === "AccessDenied"
                ? "That email isn't on the approved list yet. Contact your administrator."
                : "Something went wrong sending your link. Try again."}
            </p>
          )}

          <form
            action={async (formData) => {
              "use server";
              await signIn("resend", formData, { redirectTo: from || "/" });
            }}
          >
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="you@stfrancishouston.org"
              className="w-full text-sm rounded-lg border p-2.5 outline-none mb-3"
              style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
            >
              Send sign-in link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
