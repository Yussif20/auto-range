// Creates an admin, or resets the password of an existing one.
//   Local:       npm run admin:create
//   Production:  npm run admin:create:prod   (reads .env.production.local from `vercel env pull`)
// Asks for the email and password (hidden) unless ADMIN_EMAIL / ADMIN_PASSWORD are set.
// The password is never printed.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline";

function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    // Echo nothing while the password is typed.
    (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = (s: string) => {
      if (s.startsWith(question)) process.stdout.write(question);
    };
  }
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    }),
  );
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? (await ask("Admin email: "))).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("That email doesn't look valid.");

  const password = process.env.ADMIN_PASSWORD ?? (await ask("Password (10+ characters, hidden): ", true));
  if (password.length < 10) throw new Error("Use at least 10 characters.");
  if (!process.env.ADMIN_PASSWORD && password !== (await ask("Repeat password: ", true))) {
    throw new Error("Passwords don't match.");
  }

  const host = (process.env.DATABASE_URL ?? "").replace(/.*@([^/:]+).*/, "$1");
  console.log(`Database host: ${host}`);

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.adminUser.upsert({
      where: { email },
      create: { email, name: process.env.ADMIN_NAME?.trim() || "Admin", passwordHash },
      update: { passwordHash },
    });
    console.log(`Admin ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
