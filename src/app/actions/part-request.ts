"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { routing } from "@/i18n/routing";
import { referenceCode } from "@/lib/codes";
import { getSettings } from "@/lib/data/settings";
import { phoneSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { whatsappLink } from "@/lib/whatsapp";

const inputSchema = z.object({
  locale: z.enum(routing.locales),
  name: z.string().trim().max(80).optional(),
  phone: phoneSchema,
  note: z.string().trim().max(500).optional(),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional(),
  items: z
    .array(z.object({ id: z.string().min(1), qty: z.number().int().min(1).max(99) }))
    .min(1)
    .max(30),
});

export type PartRequestInput = z.input<typeof inputSchema>;

export type PartRequestResult =
  | { ok: true; code: string; whatsappUrl: string }
  | { ok: false; error: "invalidPhone" | "empty" | "invalid" | "server" };

export async function submitPartRequest(input: PartRequestInput): Promise<PartRequestResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ok: false, error: field === "phone" ? "invalidPhone" : field === "items" ? "empty" : "invalid" };
  }
  const { locale, name, phone, note, items } = parsed.data;

  try {
    const parts = await db.part.findMany({
      where: { id: { in: items.map((i) => i.id) }, active: true },
      select: { id: true, nameAr: true, nameEn: true, oemNumber: true },
    });
    if (parts.length === 0) return { ok: false, error: "empty" };
    const qtyById = new Map(items.map((i) => [i.id, i.qty]));

    const code = referenceCode("PR");
    await db.partRequest.create({
      data: {
        code,
        name: name || null,
        phone,
        note: note || null,
        items: { create: parts.map((p) => ({ partId: p.id, quantity: qtyById.get(p.id)! })) },
      },
    });

    const [t, settings] = await Promise.all([
      getTranslations({ locale, namespace: "requestList.message" }),
      getSettings(),
    ]);
    const lines = [
      t("intro", { code }),
      "",
      ...parts.map((p) =>
        t("item", {
          name: locale === "ar" ? p.nameAr : p.nameEn,
          oem: p.oemNumber,
          qty: qtyById.get(p.id)!,
        }),
      ),
      "",
      ...(name ? [t("name", { name })] : []),
      t("phone", { phone }),
      ...(note ? [t("note", { note })] : []),
    ];

    return { ok: true, code, whatsappUrl: whatsappLink(settings.whatsapp, lines.join("\n")) };
  } catch (error) {
    console.error("submitPartRequest failed", error);
    return { ok: false, error: "server" };
  }
}
