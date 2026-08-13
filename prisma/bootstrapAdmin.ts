// One-time bootstrap for the very first admin — everyone after this can be
// added through Admin > Access once someone can sign in to use it.
// Usage: npx tsx prisma/bootstrapAdmin.ts you@example.com "Your Name" ["(555) 555-5555"]
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [, , email, name, phone = ""] = process.argv;
  if (!email || !name) {
    console.error('Usage: npx tsx prisma/bootstrapAdmin.ts you@example.com "Your Name" ["phone"]');
    process.exit(1);
  }
  const normalizedEmail = email.toLowerCase();

  await prisma.allowedUser.upsert({
    where: { email: normalizedEmail },
    update: { role: "admin" },
    create: { email: normalizedEmail, role: "admin" },
  });

  const admin = await prisma.admin.upsert({
    where: { email: normalizedEmail },
    update: { name, phone },
    create: { email: normalizedEmail, name, phone },
  });

  console.log(`✔ ${admin.name} <${admin.email}> can now sign in and will land on the Admin portal.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
