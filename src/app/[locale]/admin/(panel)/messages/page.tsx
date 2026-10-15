import { MessageStatus } from "@prisma/client";
import { Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { setMessageStatus } from "@/app/actions/admin/bookings";
import { InboxFilter } from "@/components/admin/inbox-filter";
import { SubmitButton } from "@/components/admin/submit-button";
import { EmptyState, InboxBadge, PageHeader } from "@/components/admin/ui";
import { buttonClass } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format-date";
import { whatsappLink } from "@/lib/whatsapp";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("messages") };
}

export default async function MessagesPage({ searchParams }: PageProps<"/[locale]/admin/messages">) {
  await adminPage();
  const sp = await searchParams;
  const status = Object.values(MessageStatus).find((s) => s === sp.status);
  const [t, locale, messages] = await Promise.all([
    getTranslations("admin.messages"),
    getLocale(),
    db.contactMessage.findMany({
      where: status ? { status } : { status: { not: "ARCHIVED" } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <>
      <PageHeader title={t("title")} lead={t("lead")} />
      <InboxFilter base="/admin/messages" statuses={Object.values(MessageStatus)} current={status} />

      {messages.length === 0 ? (
        <EmptyState>{t("empty")}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-3">
                    <span className="font-semibold">{m.name}</span>
                    <InboxBadge status={m.status} />
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    <span dir="ltr">{m.phone}</span>
                    {m.email && <span className="ms-3">{m.email}</span>}
                  </p>
                </div>
                <span className="text-xs text-muted">{formatDateTime(m.createdAt.toISOString(), locale)}</span>
              </div>
              {m.subject && <p className="mt-4 font-semibold">{m.subject}</p>}
              <p className="mt-2 leading-7 whitespace-pre-line">{m.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={whatsappLink(m.phone)} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
                  <MessageCircle className="size-4 text-[#25D366]" />
                  {t("whatsapp")}
                </a>
                {m.email && (
                  <a href={`mailto:${m.email}`} className={buttonClass("outline")}>
                    <Mail className="size-4" />
                    {t("email")}
                  </a>
                )}
                {(["REPLIED", "ARCHIVED"] as const)
                  .filter((s) => s !== m.status)
                  .map((s) => (
                    <form key={s} action={setMessageStatus.bind(null, m.id, s)}>
                      <SubmitButton variant="outline">{t(`mark.${s}`)}</SubmitButton>
                    </form>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
