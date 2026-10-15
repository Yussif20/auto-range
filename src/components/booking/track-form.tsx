"use client";

import type { BookingStatus } from "@prisma/client";
import clsx from "clsx";
import { Check, Loader2, Search, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { type TrackedBooking, trackBooking } from "@/app/actions/tracking";
import { buttonClass } from "@/components/ui/button";
import { formatDateTime, formatDay, formatSlot } from "@/lib/format-date";

const FLOW: BookingStatus[] = ["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DONE"];

const field =
  "w-full rounded-md border border-line bg-bg px-3.5 py-3 text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

export function TrackForm({ initialCode }: { initialCode: string }) {
  const t = useTranslations("track");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<TrackedBooking | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      const result = await trackBooking({
        code: String(form.get("code") ?? ""),
        phone: String(form.get("phone") ?? ""),
      });
      if (result.ok) setBooking(result.booking);
      else {
        setBooking(null);
        setError(result.error);
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_1fr]">
      <form onSubmit={onSubmit} className="h-fit space-y-4 rounded-xl border border-line bg-surface p-6">
        <label className="block">
          <span className="mb-2 block text-sm text-muted">{t("code")}</span>
          <input
            name="code"
            required
            defaultValue={initialCode}
            dir="ltr"
            autoCapitalize="characters"
            placeholder="AR-XXXXX"
            className={`${field} font-mono tracking-widest uppercase rtl:text-end`}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-muted">{t("phone")}</span>
          <input
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            dir="ltr"
            className={`${field} rtl:text-end`}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-brand-text">
            {t(`errors.${error}`)}
          </p>
        )}
        <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
          {t("submit")}
        </button>
        <p className="text-xs leading-6 text-muted">{t("hint")}</p>
      </form>

      <div aria-live="polite">
        {booking ? (
          <BookingStatusCard booking={booking} />
        ) : (
          <div className="grid h-full min-h-48 place-items-center rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">
            {t("empty")}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingStatusCard({ booking }: { booking: TrackedBooking }) {
  const t = useTranslations("track");
  const tStatus = useTranslations("bookingStatus");
  const locale = useLocale();
  const ar = locale === "ar";
  const cancelled = booking.status === "CANCELLED";
  const reachedAt = new Map(booking.events.map((e) => [e.status, e.at]));
  const currentIndex = FLOW.indexOf(booking.status);

  return (
    <article className="rounded-xl border border-line bg-surface p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{t("booking")}</p>
          <p className="mt-1 font-mono text-xl tracking-widest" dir="ltr">
            {booking.code}
          </p>
        </div>
        <span
          className={clsx(
            "rounded-full px-3 py-1.5 text-sm font-semibold",
            cancelled ? "bg-brand/15 text-brand-text" : booking.status === "READY" ? "bg-success/15 text-success" : "bg-surface-2 text-ink",
          )}
        >
          {tStatus(booking.status)}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 border-y border-line py-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">{t("car")}</dt>
          <dd className="mt-1 font-medium">
            {ar ? booking.model.nameAr : booking.model.nameEn} · {booking.year}
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t("when")}</dt>
          <dd className="mt-1 font-medium">
            {formatDay(booking.date, locale)} · {formatSlot(booking.slot, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t("services")}</dt>
          <dd className="mt-1 font-medium">
            {booking.services.map((s) => (ar ? s.titleAr : s.titleEn)).join(ar ? "، " : ", ")}
          </dd>
        </div>
      </dl>

      {cancelled ? (
        <p className="mt-6 flex items-center gap-3 text-sm">
          <XCircle className="size-5 text-brand-text" />
          {t("cancelled")}
        </p>
      ) : (
        <ol className="mt-8 space-y-0">
          {FLOW.map((status, i) => {
            const done = i <= currentIndex;
            const current = i === currentIndex;
            const at = reachedAt.get(status);
            return (
              <li key={status} className="relative flex gap-4 pb-8 last:pb-0">
                {i < FLOW.length - 1 && (
                  <span
                    className={clsx("absolute start-[0.9rem] top-8 bottom-0 w-0.5", i < currentIndex ? "bg-brand" : "bg-line")}
                  />
                )}
                <span
                  className={clsx(
                    "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-2",
                    done ? "border-brand bg-brand text-white" : "border-line bg-bg text-muted",
                    current && "ring-4 ring-brand/25",
                  )}
                >
                  {done ? <Check className="size-4" /> : <span className="text-xs">{i + 1}</span>}
                </span>
                <div className="pt-1">
                  <p className={clsx("font-semibold", !done && "text-muted")}>{tStatus(status)}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {at ? formatDateTime(at, locale) : t(`steps.${status}`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
