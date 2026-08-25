import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getAppUrl } from "./appUrl";
import { logNotification } from "./notify";
import { passwordResetEmail } from "./emailTemplates";

export type CreatePasswordError = "NotAllowed" | "AlreadyHasPassword" | "TooShort";

// Fully self-service, no email verification step — a deliberate choice for
// this prototype stage (see README's auth section for the tradeoff: anyone
// who knows/guesses an allowlisted email could claim it first). Only works
// once per email — refuses to overwrite an existing password, which is what
// actually prevents account takeover after the real person has set theirs.
export async function createFirstPassword(email: string, password: string): Promise<{ ok: true } | { ok: false; error: CreatePasswordError }> {
  const normalized = email.toLowerCase().trim();
  const allowed = await prisma.allowedUser.findUnique({ where: { email: normalized } });

  if (!allowed) return { ok: false, error: "NotAllowed" };
  if (allowed.passwordHash) return { ok: false, error: "AlreadyHasPassword" };
  if (password.length < 8) return { ok: false, error: "TooShort" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.allowedUser.update({ where: { email: normalized }, data: { passwordHash } });
  return { ok: true };
}

// Best-effort display name for the reset email's greeting — falls back to the
// email itself since AllowedUser has no name of its own.
async function displayNameFor(email: string, role: string): Promise<string> {
  if (role === "teacher") return (await prisma.teacher.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }))?.name || email;
  if (role === "substitute") return (await prisma.substitute.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }))?.name || email;
  if (role === "admin") return (await prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } } }))?.name || email;
  return email;
}

// Always resolves the same way regardless of whether the email is on the
// allowlist — deliberately doesn't reveal which emails exist. Works whether
// or not a password was ever set (covers both "forgot it" and "never made
// one"), which is fine since the linked token is what proves ownership.
export async function requestPasswordReset(email: string): Promise<void> {
  const normalized = email.toLowerCase().trim();
  const allowed = await prisma.allowedUser.findUnique({ where: { email: normalized } });
  if (!allowed) return;

  const resetToken = randomBytes(24).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.allowedUser.update({ where: { id: allowed.id }, data: { resetToken, resetTokenExpiresAt } });

  const toName = await displayNameFor(normalized, allowed.role);
  const content = passwordResetEmail({ toName, resetUrl: `${getAppUrl()}/stfrancishouston/reset-password/${resetToken}` });
  await logNotification(prisma, {
    event: "password_reset_requested",
    toName,
    toEmail: normalized,
    toPhone: null,
    subject: content.subject,
    body: content.text,
    html: content.html,
    // Security-critical — always send this regardless of the recipient's
    // notifyBookingUpdates/notifyMessages preferences.
    enabled: true,
  });
}

export type ResetPasswordError = "InvalidOrExpired" | "TooShort";

// Single-use: the token is cleared the moment it's consumed, so a stale
// email link can't be replayed.
export async function resetPassword(token: string, password: string): Promise<{ ok: true; email: string } | { ok: false; error: ResetPasswordError }> {
  const allowed = await prisma.allowedUser.findUnique({ where: { resetToken: token } });
  if (!allowed || !allowed.resetTokenExpiresAt || allowed.resetTokenExpiresAt < new Date()) {
    return { ok: false, error: "InvalidOrExpired" };
  }
  if (password.length < 8) return { ok: false, error: "TooShort" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.allowedUser.update({
    where: { id: allowed.id },
    data: { passwordHash, resetToken: null, resetTokenExpiresAt: null },
  });
  return { ok: true, email: allowed.email };
}
