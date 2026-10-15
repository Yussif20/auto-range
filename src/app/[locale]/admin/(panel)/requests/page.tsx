import { RequestStatus } from "@prisma/client";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestStatus } from "@/app/actions/admin/bookings";
import { InboxFilter } from "@/components/admin/inbox-filter";
import { SubmitButton } from "@/components/admin/submit-button";
import { EmptyState, InboxBadge, PageHeader } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatDateTime } from "@/lib/format-date";
import { localized } from "@/lib/i18n-field";
import { whatsappLink } from "@/lib/whatsapp";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("requests") };
}

export default async function RequestsPage({ searchParams }: PageProps<"/[locale]/admin/requests">) {
  await adminPage();
  const sp = await searchParams;
  const status = Object.values(RequestStatus).find((s) => s === sp.status);
  const [t, locale, requests] = await Promise.all([
    getTranslations("admin.requests"),
    getLocale(),
    db.partRequest.findMany({
      where: status ? { status } : { status: { in: ["NEW", "CONTACTED"] } },
      include: { items: { include: { part: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <InboxFilter base="/admin/requests" statuses={Object.values(RequestStatus)} current={status} />

      {requests.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => {
            const total = r.items.reduce((sum, i) => sum + (i.part.price ?? 0) * i.quantity, 0);
            const priced = r.items.every((i) => i.part.price != null);
            return (
              <li key={r.id} className="rounded-xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-3">
                      <span className="font-mono text-sm" dir="ltr">
                        {r.code}
                      </span>
                      <InboxBadge status={r.status} />
                    </p>
                    <p className="mt-2 font-semibold">
                      {r.name ?? t("noName")}{" "}
                      <span className="text-sm font-normal text-muted" dir="ltr">
                        {r.phone}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-muted">{formatDateTime(r.createdAt.toISOString(), locale)}</span>
                </div>

                <ul className="mt-4 divide-y divide-line rounded-lg border border-line bg-bg text-sm">
                  {r.items.map((i) => (
                    <li key={i.partId} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <Link href={`/admin/parts/${i.partId}`} className="min-w-0 truncate hover:text-brand-text">
                        {localized(i.part, "name", locale)}{" "}
                        <span className="font-mono text-xs text-muted" dir="ltr">
                          {i.part.oemNumber}
                        </span>
                      </Link>
                      <span className="shrink-0 text-muted tabular-nums">× {i.quantity}</span>
                    </li>
                  ))}
                </ul>
                {r.note && <p className="mt-3 text-sm leading-7 whitespace-pre-line text-muted">{r.note}</p>}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted">
                    {t("estimate")}{" "}
                    <span className="font-semibold text-ink">
                      {formatPrice(total, locale)}
                      {!priced && ` ${t("plusOnRequest")}`}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={whatsappLink(r.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClass("outline")}
                    >
                      <MessageCircle className="size-4 text-[#25D366]" />
                      {t("reply")}
                    </a>
                    {(["CONTACTED", "FULFILLED", "CLOSED"] as const)
                      .filter((s) => s !== r.status)
                      .map((s) => (
                        <form key={s} action={setRequestStatus.bind(null, r.id, s)}>
                          <SubmitButton variant={s === "FULFILLED" ? "primary" : "outline"}>
                            {t(`mark.${s}`)}
                          </SubmitButton>
                        </form>
                      ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
