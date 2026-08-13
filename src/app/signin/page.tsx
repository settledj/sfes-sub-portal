import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { createFirstPassword } from "@/lib/passwordSetup";
import { signinUrl } from "@/lib/signinUrl";
import { C } from "@/lib/constants";
import { WolfMark } from "@/components/shared/WolfMark";

const errorMessages: Record<string, string> = {
  AccessDenied: "That account isn't on the approved list yet. Contact your administrator.",
  CredentialsSignin: "Email or password not recognized.",
  Configuration: "Sign-in isn't configured correctly. Contact your administrator.",
  NotAllowed: "That email isn't on the approved list yet. Contact your administrator.",
  AlreadyHasPassword: "This account already has a password. Sign in below, or ask an admin to reset it.",
  TooShort: "Password must be at least 8 characters.",
  Mismatch: "Those passwords don't match.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string; new?: string }>;
}) {
  const { from, error, new: isNew } = await searchParams;

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
            {isNew ? "Create your password" : "Sign in"}
          </p>
          <p className="text-center text-xs mb-5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            St. Francis Episcopal School — Substitute Portal. Access is limited to approved staff and
            substitutes.
          </p>

          {error && (
            <p className="text-xs mb-3 text-center" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>
              {errorMessages[error] || "Something went wrong. Try again."}
            </p>
          )}

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: from || "/" });
            }}
          >
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{ backgroundColor: "white", color: "#3F4552", border: "1.5px solid #D9DCE3", fontFamily: "Barlow, sans-serif" }}
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ backgroundColor: "#E3E5EA" }} />
            <span className="text-xs" style={{ color: C.grey, fontFamily: "Barlow, sans-serif" }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "#E3E5EA" }} />
          </div>

          {isNew ? (
            <form
              action={async (formData) => {
                "use server";
                const email = String(formData.get("email") || "");
                const password = String(formData.get("password") || "");
                const confirmPassword = String(formData.get("confirmPassword") || "");

                if (password !== confirmPassword) {
                  redirect(signinUrl(from, { new: "1", error: "Mismatch" }));
                }
                const result = await createFirstPassword(email, password);
                if (!result.ok) {
                  redirect(signinUrl(from, { new: "1", error: result.error }));
                }
                await signIn("credentials", { email, password, redirectTo: from || "/" });
              }}
            >
              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full text-sm rounded-lg border p-2.5 outline-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
              />
              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                New password
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full text-sm rounded-lg border p-2.5 outline-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
              />
              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Confirm password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={8}
                placeholder="Same as above"
                className="w-full text-sm rounded-lg border p-2.5 outline-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
              >
                Create password &amp; sign in
              </button>
            </form>
          ) : (
            <form
              action={async (formData) => {
                "use server";
                formData.set("redirectTo", from || "/");
                await signIn("credentials", formData);
              }}
            >
              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full text-sm rounded-lg border p-2.5 outline-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
              />
              <label className="text-xs font-semibold block mb-1.5" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full text-sm rounded-lg border p-2.5 outline-none mb-3"
                style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
              >
                Sign in
              </button>
            </form>
          )}

          <p className="text-center text-xs mt-3" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
            {isNew ? (
              <a href={signinUrl(from, {})} style={{ color: C.blue }}>Already have a password? Sign in</a>
            ) : (
              <>No Google account? <a href={signinUrl(from, { new: "1" })} style={{ color: C.blue }}>Create a password</a></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 40.6 16.3 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.7 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}
