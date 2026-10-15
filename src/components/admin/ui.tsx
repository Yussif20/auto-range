import type { BookingStatus, MessageStatus, RequestStatus } from "@prisma/client";
import clsx from "clsx";
import { useTranslations } from "next-intl";

export function PageHeader({
  title,
  lead,
  actions,
}: {
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {lead && <p className="mt-1.5 text-sm text-muted">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// Every badge carries its label; color only reinforces it.
const bookingTone: Record<BookingStatus, string> = {
  NEW: "bg-warning/15 text-warning",
  CONFIRMED: "bg-surface-2 text-ink",
  IN_PROGRESS: "bg-brand/15 text-brand-text",
  READY: "bg-success/15 text-success",
  DONE: "bg-surface-2 text-muted",
  CANCELLED: "bg-surface-2 text-muted line-through",
};

const requestTone: Record<RequestStatus | MessageStatus, string> = {
  NEW: "bg-warning/15 text-warning",
  CONTACTED: "bg-surface-2 text-ink",
  REPLIED: "bg-surface-2 text-ink",
  FULFILLED: "bg-success/15 text-success",
  CLOSED: "bg-surface-2 text-muted",
  ARCHIVED: "bg-surface-2 text-muted",
};

const badge = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap";

export function BookingBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations("bookingStatus");
  return <span className={clsx(badge, bookingTone[status])}>{t(status)}</span>;
}

export function InboxBadge({ status }: { status: RequestStatus | MessageStatus }) {
  const t = useTranslations("admin.inboxStatus");
  return <span className={clsx(badge, requestTone[status])}>{t(status)}</span>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">{children}</div>
  );
}

export const tableWrap = "overflow-x-auto rounded-xl border border-line bg-surface";
export const tableClass = "w-full min-w-[40rem] text-sm";
export const thClass = "px-4 py-3 text-start text-xs font-medium text-muted";
export const tdClass = "px-4 py-3 align-middle";
