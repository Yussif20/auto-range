"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { phoneSchema } from "@/lib/validation";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneSchema,
  email: z.union([z.literal(""), z.email().max(120)]).optional(),
  subject: z.string().trim().max(120).optional(),
  body: z.string().trim().min(5).max(2000),
  website: z.string().max(0).optional(),
});

export type ContactInput = z.input<typeof schema>;
export type ContactResult = { ok: true } | { ok: false; field?: string; error: "invalid" | "server" };

export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid", field: String(parsed.error.issues[0]?.path[0] ?? "") };
  }
  const { name, phone, email, subject, body } = parsed.data;
  try {
    await db.contactMessage.create({
      data: { name, phone, email: email || null, subject: subject || null, body },
    });
    return { ok: true };
  } catch (error) {
    console.error("sendContactMessage failed", error);
    return { ok: false, error: "server" };
  }
}
