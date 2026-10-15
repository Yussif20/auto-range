"use server";

import { Prisma } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import { isBookableDate, isoToDate, type SlotAvailability, slotAvailability } from "@/lib/booking";
import { referenceCode } from "@/lib/codes";
import { formatDay, formatSlot } from "@/lib/format-date";
import { getSettings } from "@/lib/data/settings";
import { db } from "@/lib/db";
import { localized } from "@/lib/i18n-field";
import { phoneSchema } from "@/lib/validation";
import { whatsappLink } from "@/lib/whatsapp";

export async function getSlots(date: string): Promise<SlotAvailability[]> {
  const settings = await getSettings();
  if (!isBookableDate(date, settings)) return [];
  return slotAvailability(date, settings);
}

const bookingSchema = z.object({
  locale: z.enum(routing.locales),
  modelId: z.string().min(1),
  year: z.number().int().min(1990).max(2100),
  serviceIds: z.array(z.string().min(1)).min(1).max(8),
  date: z.string(),
  slot: z.string(),
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  notes: z.string().trim().max(500).optional(),
  website: z.string().max(0).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;

export type BookingResult =
  | { ok: true; code: string; whatsappUrl: string }
  | { ok: false; error: "invalid" | "invalidPhone" | "invalidName" | "slotFull" | "dateUnavailable" | "server" };

class SlotFullError extends Error {}

export async function createBooking(input: BookingInput): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ok: false, error: field === "phone" ? "invalidPhone" : field === "name" ? "invalidName" : "invalid" };
  }
  const data = parsed.data;

  try {
    const settings = await getSettings();
    if (!isBookableDate(data.date, settings)) return { ok: false, error: "dateUnavailable" };
    if (!settings.slots.includes(data.slot)) return { ok: false, error: "invalid" };

    const [model, services] = await Promise.all([
      db.vehicleModel.findUnique({ where: { id: data.modelId } }),
      db.service.findMany({ where: { id: { in: data.serviceIds }, active: true } }),
    ]);
    const maxYear = new Date().getUTCFullYear() + 1;
    if (!model || data.year < model.yearFrom || data.year > (model.yearTo ?? maxYear) || services.length === 0) {
      return { ok: false, error: "invalid" };
    }

    const availability = await slotAvailability(data.date, settings);
    const slot = availability.find((s) => s.slot === data.slot);
    if (!slot || slot.past) return { ok: false, error: "dateUnavailable" };

    const code = referenceCode("AR");
    const date = isoToDate(data.date);
    await db.$transaction(async (tx) => {
      // Serialise bookings for the same slot so two people can't take the last place.
      await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${`${data.date} ${data.slot}`}))`);
      const taken = await tx.booking.count({
        where: { date, slot: data.slot, status: { not: "CANCELLED" } },
      });
      if (taken >= settings.slotCapacity) throw new SlotFullError();
      await tx.booking.create({
        data: {
          code,
          modelId: model.id,
          year: data.year,
          name: data.name,
          phone: data.phone,
          date,
          slot: data.slot,
          notes: data.notes || null,
          locale: data.locale,
          services: { create: services.map((s) => ({ serviceId: s.id })) },
          events: { create: { status: "NEW" } },
        },
      });
    });

    const t = await getTranslations({ locale: data.locale, namespace: "book.message" });
    const message = [
      t("intro", { code }),
      "",
      t("car", { model: localized(model, "name", data.locale), year: data.year }),
      t("services", {
        services: services.map((s) => localized(s, "title", data.locale)).join(data.locale === "ar" ? "، " : ", "),
      }),
      t("when", { date: formatDay(data.date, data.locale), slot: formatSlot(data.slot, data.locale) }),
      t("name", { name: data.name }),
      t("phone", { phone: data.phone }),
      ...(data.notes ? [t("notes", { notes: data.notes })] : []),
    ].join("\n");

    return { ok: true, code, whatsappUrl: whatsappLink(settings.whatsapp, message) };
  } catch (error) {
    if (error instanceof SlotFullError) return { ok: false, error: "slotFull" };
    console.error("createBooking failed", error);
    return { ok: false, error: "server" };
  }
}
