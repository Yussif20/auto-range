import { PrismaClient } from "@prisma/client";
import { runSeed } from "./run";

// CLI entry: `npm run db:seed`. The nightly demo reset calls runSeed() directly.
const prisma = new PrismaClient();

async function main() {
  // The seed wipes data first, so anything that isn't a local database
  // (Neon, production) needs an explicit SEED_FORCE=1.
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "");
  if ((!local || process.env.NODE_ENV === "production") && process.env.SEED_FORCE !== "1") {
    throw new Error("Refusing to reset a non-local database (set SEED_FORCE=1 if you mean it).");
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const result = await runSeed(prisma, {
    sampleData: process.env.SEED_SAMPLE_DATA !== "0",
    demo: process.env.SEED_DEMO === "1",
    admin: email && password ? { email, password } : undefined,
  });

  console.log(
    `Seeded ${result.models} models, ${result.services} services, ${result.parts} parts, ${result.sampleBookings} sample bookings${email ? ", admin user" : ""}${process.env.SEED_DEMO === "1" ? ", demo account + DEMO_DATABASE flag" : ""}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
