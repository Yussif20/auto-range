// Creates an admin, or resets the password of an existing one.
// Usage (PowerShell):  $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="..."; npm run admin:create
// Usage (bash):        ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run admin:create
// The password is never printed.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "Admin";

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error("Set ADMIN_EMAIL to a valid email.");
  process.exit(1);
}
if (!password || password.length < 10) {
  console.error("Set ADMIN_PASSWORD (at least 10 characters).");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main(adminEmail: string, adminPassword: string) {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const user = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, name, passwordHash },
    update: { passwordHash },
  });
  console.log(`Admin ready: ${user.email}`);
}

main(email, password)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
