"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { type FormValues, formValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/auth/session";
import { SETTINGS_TAG } from "@/lib/data/settings";
import { db } from "@/lib/db";

const optionalUrl = z.union([z.literal(""), z.url().max(300)]).transform((v) => v || null);
const int = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

const schema = z.object({
  phone: z.string().trim().regex(/^\+?\d[\d\s-]{6,18}$/),
  whatsapp: z.string().trim().transform((v) => v.replace(/\D/g, "")).pipe(z.string().min(8).max(15)),
  email: z.email(),
  addressAr: z.string().trim().min(2).max(200),
  addressEn: z.string().trim().min(2).max(200),
  mapUrl: z.url().max(1000),
  hoursAr: z.string().trim().min(2).max(120),
  hoursEn: z.string().trim().min(2).max(120),
  facebook: optionalUrl,
  instagram: optionalUrl,
  tiktok: optionalUrl,
  youtube: optionalUrl,
  statCustomers: int(0, 10_000_000),
  statYears: int(0, 200),
  statParts: int(0, 10_000_000),
  statRating: z.coerce.number().min(0).max(5),
  slotCapacity: int(1, 50),
  bookingDaysAhead: int(1, 180),
  slots: z
    .string()
    .transform((v) => [...new Set(v.split(/[\s,]+/).filter(Boolean))].sort())
    .pipe(z.array(z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)).min(1).max(48)),
  closedWeekdays: z.array(z.coerce.number().int().min(0).max(6)),
});

export type SettingsState = { ok?: true; errors?: Record<string, true>; values?: FormValues } | undefined;

export async function saveSettings(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  await requireAdmin();
  const input = { ...Object.fromEntries(form), closedWeekdays: form.getAll("closedWeekdays") };
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      errors: Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), true])),
      values: formValues(form, ["closedWeekdays"]),
    };
  }
  await db.settings.update({ where: { id: 1 }, data: parsed.data });
  updateTag(SETTINGS_TAG);
  return { ok: true };
}
