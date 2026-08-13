// Dev convenience: change which role an already-allowlisted email signs in as.
// Usage: npx tsx prisma/setAllowedRole.ts you@example.com teacher|substitute|admin
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [, , email, role] = process.argv;
  if (!email || !["teacher", "substitute", "admin"].includes(role || "")) {
    console.error("Usage: npx tsx prisma/setAllowedRole.ts you@example.com teacher|substitute|admin");
    process.exit(1);
  }
  const updated = await prisma.allowedUser.update({
    where: { email: email.toLowerCase() },
    data: { role: role as "teacher" | "substitute" | "admin" },
  });
  console.log(`✔ ${updated.email} can now sign in as: ${updated.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
