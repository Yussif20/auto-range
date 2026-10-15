"use server";

import { BookingStatus, MessageStatus, RequestStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function setBookingStatus(id: string, status: BookingStatus) {
  await requireAdmin();
  const next = z.enum(BookingStatus).parse(status);
  await db.$transaction(async (tx) => {
    const current = await tx.booking.findUniqueOrThrow({ where: { id }, select: { status: true } });
    if (current.status === next) return;
    await tx.booking.update({ where: { id }, data: { status: next } });
    // Each change is logged so the public tracking timeline can show when it happened.
    await tx.bookingEvent.create({ data: { bookingId: id, status: next } });
  });
  revalidatePath("/[locale]/admin", "layout");
}

export async function saveBookingNote(id: string, form: FormData) {
  await requireAdmin();
  const note = z.string().trim().max(2000).parse(form.get("adminNote") ?? "");
  await db.booking.update({ where: { id }, data: { adminNote: note || null } });
  revalidatePath("/[locale]/admin", "layout");
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  await requireAdmin();
  await db.partRequest.update({ where: { id }, data: { status: z.enum(RequestStatus).parse(status) } });
  revalidatePath("/[locale]/admin", "layout");
}

export async function setMessageStatus(id: string, status: MessageStatus) {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { status: z.enum(MessageStatus).parse(status) } });
  revalidatePath("/[locale]/admin", "layout");
}
