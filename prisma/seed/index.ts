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

// Moves a date off the workshop's closed days (away from today), so sample
// bookings never land on a day customers can't book.
const openDay = (n: number) => {
  const step = n < 0 ? -1 : 1;
  let d = daysFromToday(n);
  while (settings.closedWeekdays.includes(d.getUTCDay())) d = daysFromToday((n += step));
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
    prisma.contactMessage.deleteMany(),
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
        date: openDay(b.day),
        slot: b.slot,
        status: b.status,
        services: { create: b.services.map((idx) => ({ serviceId: serviceRows[idx].id })) },
        events: { create: reached.map((status) => ({ status: status as BookingStatus })) },
      },
    });
  }

  // Two weeks of upcoming appointments so the dashboard chart has a realistic shape.
  // A fixed-seed generator keeps every reseed identical.
  let seed = 7;
  const rand = (n: number) => {
    seed = (seed * 48271) % 2147483647;
    return seed % n;
  };
  const firstNames = ["Hassan", "Sara", "Mostafa", "Laila", "Tarek", "Dina", "Amr", "Rana", "Sherif", "Hala", "Ziad", "Nada"];
  const lastNames = ["Ali", "Mahmoud", "Ibrahim", "Fouad", "Nabil", "Saleh", "Gamal", "Lotfy"];
  let upcoming = 0;
  for (let day = 1; day <= 14; day++) {
    const date = daysFromToday(day);
    if (settings.closedWeekdays.includes(date.getUTCDay())) continue;
    const slots = [...settings.slots].sort(() => rand(3) - 1).slice(0, 2 + rand(6));
    for (const slot of slots) {
      const status: BookingStatus = day <= 3 && rand(3) > 0 ? "CONFIRMED" : "NEW";
      const model = models[rand(models.length)];
      await prisma.booking.create({
        data: {
          code: referenceCode("AR"),
          modelId: modelIds.get(model.slug)!,
          year: Math.max(model.yearFrom, 2015 + rand(10)),
          name: `${firstNames[rand(firstNames.length)]} ${lastNames[rand(lastNames.length)]}`,
          phone: `+20100${String(1000000 + upcoming).padStart(7, "0")}`,
          date,
          slot,
          status,
          services: { create: [{ serviceId: serviceRows[rand(serviceRows.length)].id }] },
          events: { create: (status === "CONFIRMED" ? ["NEW", "CONFIRMED"] : ["NEW"]).map((s) => ({ status: s as BookingStatus })) },
        },
      });
      upcoming++;
    }
  }

  // A couple of inbox items so the admin screens aren't empty in demos.
  const filters = await prisma.part.findMany({ where: { category: { slug: "filters" } }, take: 3 });
  await prisma.partRequest.create({
    data: {
      code: referenceCode("PR"),
      name: "Khaled Mansour",
      phone: "+201000002001",
      note: "Range Rover Sport 2019, VIN available on request.",
      items: { create: filters.map((p, i) => ({ partId: p.id, quantity: i + 1 })) },
    },
  });
  await prisma.contactMessage.createMany({
    data: [
      { name: "Yara Adel", phone: "+201000003001", subject: "Air suspension warning", body: "My Velar shows a suspension fault after parking overnight. Can you check it this week?" },
      { name: "Hany Rizk", phone: "+201000003002", email: "hany@example.com", body: "Do you install aftermarket tow bars on the Defender 110?" },
    ],
  });

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
    `Seeded ${models.length} models, ${services.length} services, ${parts.length} parts, ${sample.length + upcoming} bookings${email ? ", admin user" : ""}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
