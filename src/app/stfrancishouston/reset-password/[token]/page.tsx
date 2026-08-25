import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { resetPassword } from "@/lib/passwordSetup";
import { C } from "@/lib/constants";
import { SchoolLogo } from "@/components/shared/SchoolLogo";

const errorMessages: Record<string, string> = {
  Mismatch: "Those passwords don't match.",
  TooShort: "Password must be at least 8 characters.",
};

// Public, no-login landing page for the "Reset password" link in the forgot-
// password email. The token itself (unguessable, single-use, 1-hour expiry)
// is the authorization here — see src/lib/passwordSetup.ts.
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const allowed = await prisma.allowedUser.findUnique({ where: { resetToken: token } });
  const valid = Boolean(allowed?.resetTokenExpiresAt && allowed.resetTokenExpiresAt > new Date());

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.cream, fontFamily: "PT Serif, serif" }}>
      <div className="max-w-sm w-full">
        <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#E3E5EA" }}>
          <div className="flex justify-center mb-4">
            <SchoolLogo height={40} />
          </div>

          {!valid ? (
            <>
              <p className="text-center font-bold text-lg" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                This link isn&apos;t valid
              </p>
              <p className="text-center text-sm mt-2" style={{ color: C.grey }}>
                It&apos;s expired or has already been used. Request a new one from the sign-in page.
              </p>
              <a
                href="/stfrancishouston/signin?forgot=1"
                className="block text-center w-full py-2.5 rounded-lg text-sm font-semibold text-white mt-4"
                style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
              >
                Request a new link
              </a>
            </>
          ) : (
            <>
              <p className="text-center font-bold text-lg" style={{ color: C.navy, fontFamily: "Barlow, sans-serif" }}>
                Set a new password
              </p>
              <p className="text-center text-xs mb-5" style={{ color: C.grey, fontFamily: "PT Serif, serif" }}>
                For {allowed!.email}
              </p>

              {error && (
                <p className="text-xs mb-3 text-center" style={{ color: C.red, fontFamily: "PT Serif, serif" }}>
                  {errorMessages[error] || "Something went wrong. Try again."}
                </p>
              )}

              <form
                action={async (formData) => {
                  "use server";
                  const password = String(formData.get("password") || "");
                  const confirmPassword = String(formData.get("confirmPassword") || "");

                  if (password !== confirmPassword) {
                    redirect(`/reset-password/${token}?error=Mismatch`);
                  }
                  const result = await resetPassword(token, password);
                  if (!result.ok) {
                    redirect(`/reset-password/${token}?error=${result.error}`);
                  }
                  await signIn("credentials", { email: result.email, password, redirectTo: "/stfrancishouston" });
                }}
              >
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
                  className="w-full text-sm rounded-lg border p-2.5 outline-none mb-4"
                  style={{ borderColor: "#D9DCE3", color: "#3F4552", fontFamily: "Barlow, sans-serif" }}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                  style={{ backgroundColor: C.navy, fontFamily: "Barlow, sans-serif" }}
                >
                  Set password &amp; sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
