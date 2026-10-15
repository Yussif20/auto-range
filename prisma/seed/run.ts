import { type BookingStatus, type PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { referenceCode } from "../../src/lib/codes";
import { categories, modelImages, models, partDescription, parts, serviceImages, services } from "./catalog";
import { faqs, reviews, settings as baseSettings } from "./content";

export const DEMO_FLAG = "DEMO_DATABASE";
export const DEMO_ADMIN_EMAIL = "demo@example.com";

export type SeedOptions = {
  /** Sample bookings, a part request and messages. */
  sampleData: boolean;
  /** Public demo: invalid contact numbers, demo admin, DEMO_DATABASE marker. */
  demo?: boolean;
  /** First real admin (local dev). */
  admin?: { email: string; password: string };
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Sample customers get numbers in the unassigned +20 0… range, so a click
// on WhatsApp or Call can never reach a real person.
const fakePhone = (n: number) => `+2000000${String(n).padStart(5, "0")}`;

/** Wipes the catalog, content and activity tables, then fills them again. Keeps admins and flags. */
export async function runSeed(prisma: PrismaClient, options: SeedOptions) {
  const settings = options.demo
    ? { ...baseSettings, phone: "+200000000000", whatsapp: "", email: "hello@example.com" }
    : baseSettings;

  const daysFromToday = (n: number) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + n);
    return d;
  };
  // Keeps sample bookings off the workshop's closed days.
  const openDay = (n: number) => {
    const step = n < 0 ? -1 : 1;
    let d = daysFromToday(n);
    while (settings.closedWeekdays.includes(d.getUTCDay())) d = daysFromToday((n += step));
    return d;
  };

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

  const modelIds = new Map<string, string>();
  for (const [i, m] of models.entries()) {
    const row = await prisma.vehicleModel.create({ data: { ...m, image: modelImages[m.slug] ?? null, sortOrder: i } });
    modelIds.set(m.slug, row.id);
  }

  const serviceRows = await Promise.all(
    services.map((s, i) =>
      prisma.service.create({ data: { ...s, image: serviceImages[s.slug] ?? null, sortOrder: i } }),
    ),
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
        oemNumber: `LR${String(100000 + (((i + 1) * 7919) % 900000)).padStart(6, "0")}`,
        price: p.price,
        stock: p.stock ?? "IN_STOCK",
        featured: p.featured ?? false,
        images: [],
        categoryId: categoryIds.get(p.cat)!,
        compatibilities: { create: p.models.map((slug) => ({ modelId: modelIds.get(slug)! })) },
      },
    });
  }

  await prisma.review.createMany({ data: reviews });
  await prisma.faq.createMany({ data: faqs.map((f, i) => ({ ...f, sortOrder: i })) });
  await prisma.settings.upsert({ where: { id: 1 }, create: { id: 1, ...settings }, update: settings });

  let sampleCount = 0;
  if (options.sampleData) {
    const flow: BookingStatus[] = ["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DONE"];
    const sample: { day: number; slot: string; status: BookingStatus; model: string; services: number[]; name: string }[] = [
      { day: -6, slot: "10:00", status: "DONE", model: "range-rover-sport", services: [0], name: "Ahmed Samir" },
      { day: -2, slot: "12:00", status: "READY", model: "defender", services: [2, 4], name: "Karim Hassan" },
      { day: 0, slot: "09:00", status: "IN_PROGRESS", model: "range-rover", services: [1, 2], name: "Mona Khaled" },
      { day: 0, slot: "11:00", status: "CONFIRMED", model: "range-rover-velar", services: [5], name: "Omar Fathy" },
      { day: 1, slot: "10:00", status: "NEW", model: "discovery", services: [0, 6], name: "Nour Emad" },
      { day: 3, slot: "14:00", status: "CANCELLED", model: "range-rover-evoque", services: [7], name: "Youssef Adel" },
    ];

    for (const [i, b] of sample.entries()) {
      const reached = b.status === "CANCELLED" ? ["NEW", "CANCELLED"] : flow.slice(0, flow.indexOf(b.status) + 1);
      await prisma.booking.create({
        data: {
          code: referenceCode("AR"),
          modelId: modelIds.get(b.model)!,
          year: 2018 + i,
          name: b.name,
          phone: fakePhone(i),
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
            phone: fakePhone(100 + upcoming),
            date,
            slot,
            status,
            services: { create: [{ serviceId: serviceRows[rand(serviceRows.length)].id }] },
            events: {
              create: (status === "CONFIRMED" ? ["NEW", "CONFIRMED"] : ["NEW"]).map((s) => ({ status: s as BookingStatus })),
            },
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
        phone: fakePhone(900),
        note: "Range Rover Sport 2019, VIN available on request.",
        items: { create: filters.map((p, i) => ({ partId: p.id, quantity: i + 1 })) },
      },
    });
    await prisma.contactMessage.createMany({
      data: [
        {
          name: "Yara Adel",
          phone: fakePhone(901),
          subject: "Air suspension warning",
          body: "My Velar shows a suspension fault after parking overnight. Can you check it this week?",
        },
        {
          name: "Hany Rizk",
          phone: fakePhone(902),
          email: "hany@example.com",
          body: "Do you install aftermarket tow bars on the Defender 110?",
        },
      ],
    });
    sampleCount = sample.length + upcoming;
  }

  if (options.demo) {
    // The one-click demo account. Its password is random and never used.
    await prisma.adminUser.upsert({
      where: { email: DEMO_ADMIN_EMAIL },
      create: {
        email: DEMO_ADMIN_EMAIL,
        name: "Demo",
        passwordHash: await bcrypt.hash(randomBytes(24).toString("base64"), 10),
      },
      update: {},
    });
    await prisma.appFlag.upsert({ where: { key: DEMO_FLAG }, create: { key: DEMO_FLAG }, update: {} });
  }

  if (options.admin) {
    await prisma.adminUser.upsert({
      where: { email: options.admin.email },
      create: { email: options.admin.email, name: "Admin", passwordHash: await bcrypt.hash(options.admin.password, 12) },
      update: {},
    });
  }

  return { models: models.length, services: services.length, parts: parts.length, sampleBookings: sampleCount };
}
