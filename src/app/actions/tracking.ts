"use server";

import type { BookingStatus } from "@prisma/client";
import { z } from "zod";
import { phoneKey } from "@/lib/booking";
import { db } from "@/lib/db";

const schema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .transform((v) => (v.startsWith("AR-") ? v : `AR-${v}`))
    .pipe(z.string().regex(/^AR-[A-Z0-9]{4,8}$/)),
  phone: z.string().trim().min(6).max(20),
});

export type TrackedBooking = {
  code: string;
  status: BookingStatus;
  date: string;
  slot: string;
  year: number;
  model: { nameAr: string; nameEn: string };
  services: { titleAr: string; titleEn: string }[];
  events: { status: BookingStatus; at: string }[];
};

export type TrackResult = { ok: true; booking: TrackedBooking } | { ok: false; error: "invalid" | "notFound" };

export async function trackBooking(input: { code: string; phone: string }): Promise<TrackResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const booking = await db.booking.findUnique({
    where: { code: parsed.data.code },
    include: {
      model: { select: { nameAr: true, nameEn: true } },
      services: { include: { service: { select: { titleAr: true, titleEn: true } } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  // Same answer for a wrong code and a wrong phone, so codes can't be probed.
  if (!booking || phoneKey(booking.phone) !== phoneKey(parsed.data.phone)) {
    return { ok: false, error: "notFound" };
  }

  return {
    ok: true,
    booking: {
      code: booking.code,
      status: booking.status,
      date: booking.date.toISOString().slice(0, 10),
      slot: booking.slot,
      year: booking.year,
      model: booking.model,
      services: booking.services.map((s) => s.service),
      events: booking.events.map((e) => ({ status: e.status, at: e.createdAt.toISOString() })),
    },
  };
}
