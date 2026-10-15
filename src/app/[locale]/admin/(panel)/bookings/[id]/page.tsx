import type { BookingStatus } from "@prisma/client";
import { ChevronRight, MessageCircle, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { setBookingStatus, saveBookingNote } from "@/app/actions/admin/bookings";
import { SubmitButton } from "@/components/admin/submit-button";
import { BookingBadge } from "@/components/admin/ui";
import { inputClass } from "@/components/admin/form-styles";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getSettings } from "@/lib/data/settings";
import { db } from "@/lib/db";
import { formatDateTime, formatDay, formatSlot } from "@/lib/format-date";
import { localized } from "@/lib/i18n-field";
import { whatsappLink } from "@/lib/whatsapp";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/admin/bookings/[id]">) {
  await adminPage();
  const { id } = await params;
  const booking = await db.booking.findUnique({ where: { id }, select: { code: true } });
  return { title: booking?.code ?? "—" };
}

// What the owner can move a booking to from each status.
const NEXT: Record<BookingStatus, BookingStatus[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["READY"],
  READY: ["DONE"],
  DONE: [],
  CANCELLED: ["NEW"],
};

export default async function BookingDetailPage({ params }: PageProps<"/[locale]/admin/bookings/[id]">) {
  await adminPage();
  const { id } = await params;
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      model: true,
      services: { include: { service: true } },
      events: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!booking) notFound();

  const [t, tStatus, locale, settings] = await Promise.all([
    getTranslations("admin.booking"),
    getTranslations("bookingStatus"),
    getLocale(),
    getSettings(),
  ]);
  const iso = booking.date.toISOString().slice(0, 10);
  // Message the customer in the language they booked in.
  const tMsg = await getTranslations({ locale: booking.locale, namespace: "admin.booking.messages" });
  const when = `${formatDay(iso, booking.locale)} ${formatSlot(booking.slot, booking.locale)}`;
  const templates = (["confirm", "ready"] as const).map((key) => ({
    key,
    href: whatsappLink(
      booking.phone,
      tMsg(key, { name: booking.name, code: booking.code, when, hours: localized(settings, "hours", booking.locale) }),
    ),
  }));

  return (
    <>
      <Link href="/admin/bookings" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ChevronRight className="size-4 ltr:rotate-180" />
        {t("back")}
      </Link>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-mono text-2xl font-bold tracking-wider" dir="ltr">
          {booking.code}
        </h1>
        <BookingBadge status={booking.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">{t("when")}</dt>
                <dd className="mt-1 font-semibold">
                  {formatDay(iso, locale)} · {formatSlot(booking.slot, locale)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t("car")}</dt>
                <dd className="mt-1 font-semibold">
                  {localized(booking.model, "name", locale)} · {booking.year}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t("customer")}</dt>
                <dd className="mt-1 font-semibold">{booking.name}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("phone")}</dt>
                <dd className="mt-1 flex items-center gap-3 font-semibold">
                  <span dir="ltr">{booking.phone}</span>
                  <a href={`tel:${booking.phone}`} aria-label={t("call")} className="text-muted hover:text-ink">
                    <Phone className="size-4" />
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted">{t("services")}</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {booking.services.map(({ service }) => (
                    <span key={service.id} className="rounded-md border border-line bg-bg px-2.5 py-1">
                      {localized(service, "title", locale)}
                    </span>
                  ))}
                </dd>
              </div>
              {booking.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-muted">{t("customerNotes")}</dt>
                  <dd className="mt-1 leading-7 whitespace-pre-line">{booking.notes}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-bold">{t("adminNote")}</h2>
            <p className="mt-1 text-xs text-muted">{t("adminNoteHint")}</p>
            <form action={saveBookingNote.bind(null, booking.id)} className="mt-4 space-y-3">
              <textarea name="adminNote" rows={4} defaultValue={booking.adminNote ?? ""} className={inputClass} />
              <SubmitButton variant="outline">{t("saveNote")}</SubmitButton>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-bold">{t("status")}</h2>
            {NEXT[booking.status].length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t("finished")}</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {NEXT[booking.status].map((s) => (
                  <form key={s} action={setBookingStatus.bind(null, booking.id, s)}>
                    <SubmitButton variant={s === "CANCELLED" ? "outline" : "primary"}>
                      {t("moveTo", { status: tStatus(s) })}
                    </SubmitButton>
                  </form>
                ))}
              </div>
            )}

            <h3 className="mt-8 text-sm font-semibold text-muted">{t("history")}</h3>
            <ol className="mt-3 space-y-3 text-sm">
              {booking.events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3">
                  <span>{tStatus(e.status)}</span>
                  <span className="text-xs text-muted">{formatDateTime(e.createdAt.toISOString(), locale)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="font-bold">{t("whatsapp")}</h2>
            <p className="mt-1 text-xs text-muted">{t("whatsappHint")}</p>
            <div className="mt-4 flex flex-col gap-2">
              {templates.map(({ key, href }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "md", "justify-start")}>
                  <MessageCircle className="size-4 text-[#25D366]" />
                  {t(`templates.${key}`)}
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
