import { BookingStatus, type Prisma } from "@prisma/client";
import clsx from "clsx";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { BookingBadge, EmptyState, PageHeader, tableClass, tableWrap, tdClass, thClass } from "@/components/admin/ui";
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
  return { title: t("bookings") };
}

const PAGE_SIZE = 25;
const WHEN = ["upcoming", "past", "all"] as const;

export default async function BookingsPage({ searchParams }: PageProps<"/[locale]/admin/bookings">) {
  await adminPage();
  const sp = await searchParams;
  const [t, tStatus, locale, settings] = await Promise.all([
    getTranslations("admin.bookings"),
    getTranslations("bookingStatus"),
    getLocale(),
    getSettings(),
  ]);

  const status = Object.values(BookingStatus).find((s) => s === sp.status);
  const when = WHEN.find((w) => w === sp.when) ?? "upcoming";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const today = isoToDate(bookableDates(settings)[0] ?? new Date().toISOString().slice(0, 10));

  const where: Prisma.BookingWhereInput = {
    ...(status && { status }),
    ...(when === "upcoming" && { date: { gte: today } }),
    ...(when === "past" && { date: { lt: today } }),
    ...(q && {
      OR: [
        { code: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q.replace(/\D/g, "") || q } },
      ],
    }),
  };

  const [total, bookings] = await Promise.all([
    db.booking.count({ where }),
    db.booking.findMany({
      where,
      include: { model: true, _count: { select: { services: true } } },
      orderBy: when === "past" ? [{ date: "desc" }, { slot: "desc" }] : [{ date: "asc" }, { slot: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (patch: Record<string, string | undefined>) => {
    const query = Object.fromEntries(
      Object.entries({ status, when, q: q || undefined, ...patch }).filter(([, v]) => v),
    ) as Record<string, string>;
    return { pathname: "/admin/bookings" as const, query };
  };

  const chip = "rounded-full border px-3 py-1.5 text-xs transition-colors";

  return (
    <>
      <PageHeader title={t("title")} lead={t("count", { count: total })} />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {WHEN.map((w) => (
            <Link
              key={w}
              href={href({ when: w, page: undefined })}
              className={clsx(chip, when === w ? "border-brand bg-brand text-white" : "border-line text-muted hover:text-ink")}
            >
              {t(`when.${w}`)}
            </Link>
          ))}
          <span className="mx-1 w-px bg-line" />
          <Link
            href={href({ status: undefined, page: undefined })}
            className={clsx(chip, !status ? "border-ink/40 text-ink" : "border-line text-muted hover:text-ink")}
          >
            {t("allStatuses")}
          </Link>
          {Object.values(BookingStatus).map((s) => (
            <Link
              key={s}
              href={href({ status: s, page: undefined })}
              className={clsx(chip, status === s ? "border-ink/40 text-ink" : "border-line text-muted hover:text-ink")}
            >
              {tStatus(s)}
            </Link>
          ))}
        </div>
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input type="hidden" name="when" value={when} />
          <input
            name="q"
            defaultValue={q}
            placeholder={t("search")}
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm lg:w-64"
          />
        </form>
      </div>

      {bookings.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <div className={tableWrap}>
          <table className={tableClass}>
            <thead className="border-b border-line">
              <tr>
                <th className={thClass}>{t("cols.when")}</th>
                <th className={thClass}>{t("cols.customer")}</th>
                <th className={thClass}>{t("cols.car")}</th>
                <th className={thClass}>{t("cols.code")}</th>
                <th className={thClass}>{t("cols.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {bookings.map((b) => {
                const iso = b.date.toISOString().slice(0, 10);
                return (
                  <tr key={b.id} className="hover:bg-surface-2/60">
                    <td className={tdClass}>
                      <Link href={`/admin/bookings/${b.id}`} className="font-medium hover:text-brand-text">
                        {formatDay(iso, locale, { weekday: "short", month: "short" })}
                      </Link>
                      <span className="block text-xs text-muted tabular-nums">{formatSlot(b.slot, locale)}</span>
                    </td>
                    <td className={tdClass}>
                      {b.name}
                      <span className="block text-xs text-muted" dir="ltr">
                        {b.phone}
                      </span>
                    </td>
                    <td className={tdClass}>
                      {localized(b.model, "name", locale)} · {b.year}
                      <span className="block text-xs text-muted">{t("servicesCount", { count: b._count.services })}</span>
                    </td>
                    <td className={`${tdClass} font-mono text-xs`} dir="ltr">
                      {b.code}
                    </td>
                    <td className={tdClass}>
                      <BookingBadge status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex justify-center gap-2 text-sm">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={href({ page: p > 1 ? String(p) : undefined })}
              aria-current={p === page ? "page" : undefined}
              className={clsx("min-w-9 rounded-md border px-3 py-1.5 text-center", p === page ? "border-brand bg-brand text-white" : "border-line")}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
