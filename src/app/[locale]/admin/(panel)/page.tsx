import { CalendarCheck, ClipboardList, Inbox, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { BookingBadge, EmptyState, PageHeader } from "@/components/admin/ui";
import { UpcomingChart } from "@/components/admin/upcoming-chart";
import { Link } from "@/i18n/navigation";
import { bookableDates, isoToDate } from "@/lib/booking";
import { getSettings } from "@/lib/data/settings";
import { db } from "@/lib/db";
import { formatDay, formatSlot } from "@/lib/format-date";
import { localized } from "@/lib/i18n-field";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("dashboard") };
}

export default async function DashboardPage() {
  await adminPage();
  const [t, locale, settings] = await Promise.all([
    getTranslations("admin.dashboard"),
    getLocale(),
    getSettings(),
  ]);
  const days = bookableDates(settings).slice(0, 14);
  const today = days[0];
  const active = { not: "CANCELLED" as const };

  const [newBookings, inWorkshop, newRequests, newMessages, todays, upcoming] = await Promise.all([
    db.booking.count({ where: { status: "NEW" } }),
    db.booking.count({ where: { status: { in: ["IN_PROGRESS", "READY"] } } }),
    db.partRequest.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { status: "NEW" } }),
    db.booking.findMany({
      where: { date: isoToDate(today), status: active },
      include: { model: true },
      orderBy: { slot: "asc" },
    }),
    db.booking.groupBy({
      by: ["date"],
      where: { date: { gte: isoToDate(days[0]), lte: isoToDate(days.at(-1)!) }, status: active },
      _count: true,
    }),
  ]);

  const perDay = new Map(upcoming.map((u) => [u.date.toISOString().slice(0, 10), u._count]));
  const capacity = settings.slotCapacity * settings.slots.length;

  const tiles = [
    { label: t("tiles.newBookings"), value: newBookings, icon: CalendarCheck, href: "/admin/bookings?status=NEW" },
    { label: t("tiles.inWorkshop"), value: inWorkshop, icon: Wrench, href: "/admin/bookings?status=IN_PROGRESS" },
    { label: t("tiles.newRequests"), value: newRequests, icon: ClipboardList, href: "/admin/requests" },
    { label: t("tiles.newMessages"), value: newMessages, icon: Inbox, href: "/admin/messages" },
  ] as const;

  return (
    <>
      <PageHeader title={t("title")} lead={formatDay(today, locale)} />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(({ label, value, icon: TileIcon, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-ink/25"
            >
              <TileIcon className="size-5 text-muted" />
              <span>
                <span className="block font-display text-3xl font-bold tabular-nums">{value}</span>
                <span className="mt-1 block text-sm text-muted">{label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="font-bold">{t("upcoming.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("upcoming.lead", { capacity })}</p>
          <UpcomingChart
            data={days.map((d) => ({
              date: d,
              label: formatDay(d, locale, { weekday: "short", month: undefined }),
              full: formatDay(d, locale),
              count: perDay.get(d) ?? 0,
            }))}
            capacity={capacity}
          />
        </section>

        <section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{t("today.title")}</h2>
            <Link href="/admin/bookings" className="text-sm text-muted hover:text-ink">
              {t("today.all")}
            </Link>
          </div>
          {todays.length === 0 ? (
            <div className="mt-4">
              <EmptyState>{t("today.empty")}</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {todays.map((b) => (
                <li key={b.id}>
                  <Link href={`/admin/bookings/${b.id}`} className="flex items-center gap-3 py-3 hover:text-brand-text">
                    <span className="w-16 shrink-0 text-sm text-muted tabular-nums">{formatSlot(b.slot, locale)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{b.name}</span>
                      <span className="block truncate text-xs text-muted">
                        {localized(b.model, "name", locale)} · {b.year}
                      </span>
                    </span>
                    <BookingBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
