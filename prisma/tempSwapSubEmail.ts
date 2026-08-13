// Temporarily repoint David Settle's Substitute record + allowlist entry at a
// deliverable inbox (Resend sandbox only sends to the address you signed up
// with), so it can actually be tested without verifying a real domain in Resend.
// Usage: npx tsx prisma/tempSwapSubEmail.ts to    (davidsettle... -> settledj@gmail.com)
//        npx tsx prisma/tempSwapSubEmail.ts back   (settledj@gmail.com -> davidsettle...)
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const REAL_EMAIL = "davidsettle@stfrancishouston.org";
const TEST_EMAIL = "settledj@gmail.com";

async function main() {
  const direction = process.argv[2];
  if (direction !== "to" && direction !== "back") {
    console.error("Usage: npx tsx prisma/tempSwapSubEmail.ts to|back");
    process.exit(1);
  }
  const [from, to] = direction === "to" ? [REAL_EMAIL, TEST_EMAIL] : [TEST_EMAIL, REAL_EMAIL];

  const sub = await prisma.substitute.findUnique({ where: { email: from } });
  if (!sub) {
    console.error(`No substitute found with email ${from}`);
    process.exit(1);
  }
  await prisma.substitute.update({ where: { id: sub.id }, data: { email: to } });

  await prisma.allowedUser.deleteMany({ where: { email: from } });
  await prisma.allowedUser.upsert({
    where: { email: to },
    update: { role: "substitute" },
    create: { email: to, role: "substitute" },
  });

  console.log(`✔ ${sub.name}'s substitute record + allowlist entry moved: ${from} -> ${to}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
