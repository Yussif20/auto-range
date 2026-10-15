// Deletes one booking by code (with its services and status history).
// Usage: BOOKING_CODE=AR-XXXXX npx tsx scripts/delete-booking.ts
import { PrismaClient } from "@prisma/client";

const code = process.env.BOOKING_CODE?.trim().toUpperCase();
if (!code || !/^AR-[A-Z0-9]{4,8}$/.test(code)) {
  console.error("Set BOOKING_CODE, e.g. AR-AB12C.");
  process.exit(1);
}

const prisma = new PrismaClient();
prisma.booking
  .delete({ where: { code } })
  .then((b) => console.log(`Deleted ${b.code} (${b.name})`))
  .catch((e) => {
    console.error(e.code === "P2025" ? `No booking ${code}` : e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
