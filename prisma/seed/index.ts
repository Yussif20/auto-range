import { type BookingStatus, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { referenceCode } from "../../src/lib/codes";
import { categories, models, partDescription, parts, services } from "./catalog";
import { faqs, reviews, settings } from "./content";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const daysFromToday = (n: number) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
};

async function reset() {
  // Children first. Dev data only: refuses to run against production.
  await prisma.$transaction([
    prisma.bookingEvent.deleteMany(),
    prisma.bookingService.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.partRequestItem.deleteMany(),
    prisma.partRequest.deleteMany(),
    prisma.partCompatibility.deleteMany(),
    prisma.part.deleteMany(),
    prisma.partCategory.deleteMany(),
    prisma.service.deleteMany(),
    prisma.vehicleModel.deleteMany(),
    prisma.review.deleteMany(),
    prisma.galleryItem.deleteMany(),
    prisma.faq.deleteMany(),
  ]);
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_FORCE !== "1") {
    throw new Error("Refusing to reset a production database (set SEED_FORCE=1).");
  }
  await reset();

  const modelIds = new Map<string, string>();
  for (const [i, m] of models.entries()) {
    const row = await prisma.vehicleModel.create({ data: { ...m, sortOrder: i } });
    modelIds.set(m.slug, row.id);
  }

  const serviceRows = await Promise.all(
    services.map((s, i) => prisma.service.create({ data: { ...s, sortOrder: i } })),
  );

  const categoryIds = new Map<string, string>();
  for (const [i, c] of categories.entries()) {
    const row = await prisma.partCategory.create({ data: { ...c, sortOrder: i } });
    categoryIds.set(c.slug, row.id);
  }

  for (const [i, p] of parts.entries()) {
    const desc = partDescription(p.cat);
    await prisma.part.create({
      data: {
        slug: slugify(p.nameEn),
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        descAr: desc.ar,
        descEn: desc.en,
        oemNumber: `LR${String(100000 + ((i + 1) * 7919) % 900000).padStart(6, "0")}`,
        price: p.price,
        stock: p.stock ?? "IN_STOCK",
        featured: p.featured ?? false,
        images: [],
        categoryId: categoryIds.get(p.cat)!,
        compatibilities: {
          create: p.models.map((slug) => ({ modelId: modelIds.get(slug)! })),
        },
      },
    });
  }

  await prisma.review.createMany({ data: reviews });
  await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...settings },
    update: settings,
  });

  // A spread of bookings so the admin dashboard and tracking page have data.
  const sample: { day: number; slot: string; status: BookingStatus; model: string; services: number[] }[] = [
    { day: -6, slot: "10:00", status: "DONE", model: "range-rover-sport", services: [0] },
    { day: -2, slot: "12:00", status: "READY", model: "defender", services: [2, 4] },
    { day: 0, slot: "09:00", status: "IN_PROGRESS", model: "range-rover", services: [1, 2] },
    { day: 0, slot: "11:00", status: "CONFIRMED", model: "range-rover-velar", services: [5] },
    { day: 1, slot: "10:00", status: "NEW", model: "discovery", services: [0, 6] },
    { day: 3, slot: "14:00", status: "CANCELLED", model: "range-rover-evoque", services: [7] },
  ];
  const flow: BookingStatus[] = ["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DONE"];
  const names = ["Ahmed Samir", "Karim Hassan", "Mona Khaled", "Omar Fathy", "Nour Emad", "Youssef Adel"];

  for (const [i, b] of sample.entries()) {
    const reached = b.status === "CANCELLED" ? ["NEW", "CANCELLED"] : flow.slice(0, flow.indexOf(b.status) + 1);
    await prisma.booking.create({
      data: {
        code: referenceCode("AR"),
        modelId: modelIds.get(b.model)!,
        year: 2018 + i,
        name: names[i],
        phone: `+2010000000${String(i).padStart(2, "0")}`,
        date: daysFromToday(b.day),
        slot: b.slot,
        status: b.status,
        services: { create: b.services.map((idx) => ({ serviceId: serviceRows[idx].id })) },
        events: { create: reached.map((status) => ({ status: status as BookingStatus })) },
      },
    });
  }

  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      create: { email, name: "Admin", passwordHash: await bcrypt.hash(password, 12) },
      update: {},
    });
  }

  console.log(
    `Seeded ${models.length} models, ${services.length} services, ${parts.length} parts, ${sample.length} bookings${email ? ", admin user" : ""}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
