import "server-only";
import { db } from "@/lib/db";
import type { SiteSettings } from "@/lib/data/settings";

// The workshop runs on Cairo time regardless of where the server is.
const TIME_ZONE = "Africa/Cairo";
// Same-day slots must start at least this far from now.
const LEAD_MINUTES = 60;

export type SlotAvailability = { slot: string; remaining: number; past: boolean };

function cairoNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const toMinutes = (slot: string) => {
  const [h, m] = slot.split(":").map(Number);
  return h * 60 + m;
};

/** ISO date string (YYYY-MM-DD) -> Date at UTC midnight, matching the @db.Date column. */
export const isoToDate = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

function addDays(iso: string, days: number) {
  const d = isoToDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Bookable dates from today, skipping closed weekdays. */
export function bookableDates(settings: SiteSettings) {
  const { date: today } = cairoNow();
  const dates: string[] = [];
  for (let i = 0; i <= settings.bookingDaysAhead; i++) {
    const iso = addDays(today, i);
    if (!settings.closedWeekdays.includes(isoToDate(iso).getUTCDay())) dates.push(iso);
  }
  return dates;
}

export function isBookableDate(iso: string, settings: SiteSettings) {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso) && bookableDates(settings).includes(iso);
}

export async function slotAvailability(iso: string, settings: SiteSettings): Promise<SlotAvailability[]> {
  const booked = await db.booking.groupBy({
    by: ["slot"],
    where: { date: isoToDate(iso), status: { not: "CANCELLED" } },
    _count: true,
  });
  const taken = new Map(booked.map((b) => [b.slot, b._count]));
  const now = cairoNow();

  return settings.slots.map((slot) => ({
    slot,
    remaining: Math.max(0, settings.slotCapacity - (taken.get(slot) ?? 0)),
    past: iso === now.date && toMinutes(slot) < now.minutes + LEAD_MINUTES,
  }));
}

/** Normalised digits for comparing phone numbers typed as +20 10..., 010..., etc. */
export const phoneKey = (phone: string) => phone.replace(/\D/g, "").slice(-10);
