import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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
