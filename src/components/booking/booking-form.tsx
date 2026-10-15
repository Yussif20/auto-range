"use client";

import clsx from "clsx";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { createBooking, getSlots } from "@/app/actions/booking";
import { buttonClass } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import type { SlotAvailability } from "@/lib/booking";
import { formatPrice } from "@/lib/format";
import { formatDay, formatSlot } from "@/lib/format-date";

type Model = { id: string; name: string; yearFrom: number; yearTo: number };
type Service = { id: string; icon: string; title: string; priceFrom: number | null };

const STEPS = ["car", "services", "time"] as const;

const field =
  "w-full rounded-md border border-line bg-bg px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

export function BookingForm({
  models,
  services,
  dates,
  initialServiceIds,
}: {
  models: Model[];
  services: Service[];
  dates: string[];
  initialServiceIds: string[];
}) {
  const t = useTranslations("book");
  const locale = useLocale();
  const [step, setStep] = useState(0);
  const [modelId, setModelId] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [serviceIds, setServiceIds] = useState<string[]>(initialServiceIds);
  const [date, setDate] = useState(dates[0] ?? "");
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<SlotAvailability[] | null>(null);
  const [loadingSlots, startSlots] = useTransition();
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; whatsappUrl: string } | null>(null);

  const model = models.find((m) => m.id === modelId);
  const years = model
    ? Array.from({ length: model.yearTo - model.yearFrom + 1 }, (_, i) => model.yearTo - i)
    : [];

  const loadSlots = (day: string) =>
    startSlots(async () => {
      setSlots(await getSlots(day));
    });

  const canContinue = [Boolean(modelId && year), serviceIds.length > 0, true][step];

  const toggleService = (id: string) =>
    setServiceIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!slot) {
      setError("noSlot");
      return;
    }
    const form = new FormData(e.currentTarget);
    setError(null);
    startSubmit(async () => {
      const result = await createBooking({
        locale: locale as "ar" | "en",
        modelId,
        year: Number(year),
        serviceIds,
        date,
        slot,
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        notes: String(form.get("notes") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      if (result.ok) {
        setDone({ code: result.code, whatsappUrl: result.whatsappUrl });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setError(result.error);
      if (result.error === "slotFull" || result.error === "dateUnavailable") {
        setSlot("");
        loadSlots(date);
      }
    });
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-surface p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto size-16 text-success" />
        <h2 className="mt-6 text-2xl font-bold">{t("done.title")}</h2>
        <p className="mt-3 leading-8 text-muted">{t("done.body")}</p>
        <p className="mt-6 text-sm text-muted">{t("done.codeLabel")}</p>
        <p className="mt-2 inline-block rounded-md border border-line bg-bg px-5 py-2.5 font-mono text-2xl tracking-widest" dir="ltr">
          {done.code}
        </p>
        <p className="mt-4 text-sm text-ink">
          {formatDay(date, locale)} · {formatSlot(slot, locale)}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
            {t("done.whatsapp")}
          </a>
          <Link href={{ pathname: "/track", query: { code: done.code } }} className={buttonClass("outline", "lg")}>
            {t("done.track")}
          </Link>
        </div>
      </div>
    );
  }

  const selectedServices = services.filter((s) => serviceIds.includes(s.id));

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit} className="rounded-xl border border-line bg-surface">
        <ol className="flex border-b border-line">
          {STEPS.map((key, i) => (
            <li key={key} className="flex-1">
              <button
                type="button"
                disabled={i > step}
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={clsx(
                  "flex w-full items-center gap-2.5 px-4 py-4 text-start text-sm transition-colors",
                  i === step ? "text-ink" : i < step ? "text-muted hover:text-ink" : "text-muted/50",
                )}
              >
                <span
                  className={clsx(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-bold",
                    i < step ? "border-brand bg-brand text-white" : i === step ? "border-brand text-brand" : "border-line",
                  )}
                >
                  {i < step ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{t(`steps.${key}`)}</span>
              </button>
              <div className={clsx("h-0.5", i <= step ? "bg-brand" : "bg-transparent")} />
            </li>
          ))}
        </ol>

        <div className="p-5 sm:p-8">
          {step === 0 && (
            <fieldset>
              <legend className="text-lg font-bold">{t("car.title")}</legend>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {models.map((m) => (
                  <label
                    key={m.id}
                    className={clsx(
                      "cursor-pointer rounded-lg border p-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-hover",
                      modelId === m.id ? "border-brand bg-brand/10 text-ink" : "border-line hover:border-ink/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={m.id}
                      checked={modelId === m.id}
                      onChange={() => {
                        setModelId(m.id);
                        setYear("");
                      }}
                      className="sr-only"
                    />
                    {m.name}
                  </label>
                ))}
              </div>
              <label className="mt-6 block max-w-xs">
                <span className="mb-2 block text-sm text-muted">{t("car.year")}</span>
                <select
                  value={year}
                  disabled={!model}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={field}
                >
                  <option value="">{model ? t("car.chooseYear") : t("car.chooseModelFirst")}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="text-lg font-bold">{t("services.title")}</legend>
              <p className="mt-1 text-sm text-muted">{t("services.hint")}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((s) => {
                  const on = serviceIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={clsx(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-hover",
                        on ? "border-brand bg-brand/10" : "border-line hover:border-ink/30",
                      )}
                    >
                      <input type="checkbox" checked={on} onChange={() => toggleService(s.id)} className="sr-only" />
                      <span className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-bg text-brand">
                        <Icon name={s.icon} className="size-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{s.title}</span>
                        {s.priceFrom != null && (
                          <span className="text-xs text-muted">
                            {t("services.from", { price: formatPrice(s.priceFrom, locale) })}
                          </span>
                        )}
                      </span>
                      <span
                        className={clsx(
                          "grid size-5 place-items-center rounded border",
                          on ? "border-brand bg-brand text-white" : "border-line",
                        )}
                      >
                        {on && <Check className="size-3.5" />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <fieldset>
                <legend className="text-lg font-bold">{t("time.title")}</legend>
                <div className="-mx-1 mt-5 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
                  {dates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDate(d);
                        setSlot("");
                        loadSlots(d);
                      }}
                      aria-pressed={date === d}
                      className={clsx(
                        "flex w-20 shrink-0 snap-start flex-col items-center rounded-lg border py-3 text-sm transition-colors",
                        date === d ? "border-brand bg-brand text-white" : "border-line hover:border-ink/30",
                      )}
                    >
                      <span className={clsx("text-xs", date === d ? "text-white/80" : "text-muted")}>
                        {formatDay(d, locale, { weekday: "short", day: undefined, month: undefined })}
                      </span>
                      <span className="mt-1 font-display text-xl font-bold tabular-nums">
                        {formatDay(d, locale, { weekday: undefined, month: undefined })}
                      </span>
                      <span className={clsx("text-xs", date === d ? "text-white/80" : "text-muted")}>
                        {formatDay(d, locale, { weekday: undefined, day: undefined, month: "short" })}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-5" aria-live="polite" aria-busy={loadingSlots}>
                  {loadingSlots || !slots ? (
                    <p className="flex items-center gap-2 text-sm text-muted">
                      <Loader2 className="size-4 animate-spin" />
                      {t("time.loading")}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {slots.map((s) => {
                        const unavailable = s.remaining === 0 || s.past;
                        return (
                          <button
                            key={s.slot}
                            type="button"
                            disabled={unavailable}
                            onClick={() => setSlot(s.slot)}
                            aria-pressed={slot === s.slot}
                            className={clsx(
                              "rounded-md border px-2 py-2.5 text-sm tabular-nums transition-colors",
                              slot === s.slot
                                ? "border-brand bg-brand text-white"
                                : unavailable
                                  ? "cursor-not-allowed border-line text-muted/40 line-through"
                                  : "border-line hover:border-ink/30",
                            )}
                          >
                            {formatSlot(s.slot, locale)}
                            {!unavailable && s.remaining === 1 && slot !== s.slot && (
                              <span className="block text-[0.65rem] text-warning">{t("time.lastPlace")}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </fieldset>

              <fieldset className="grid gap-4 sm:grid-cols-2">
                <legend className="mb-4 text-lg font-bold">{t("contact.title")}</legend>
                <label className="block">
                  <span className="mb-2 block text-sm text-muted">{t("contact.name")}</span>
                  <input name="name" required minLength={2} autoComplete="name" className={field} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm text-muted">{t("contact.phone")}</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="01xxxxxxxxx"
                    className={`${field} rtl:text-end`}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm text-muted">{t("contact.notes")}</span>
                  <textarea name="notes" rows={3} className={field} />
                </label>
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              </fieldset>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-6 rounded-md border border-brand/40 bg-brand/10 px-4 py-3 text-sm text-ink">
              {t(`errors.${error}`)}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className={buttonClass("ghost")}>
                <ChevronRight className="size-4 ltr:rotate-180" />
                {t("back")}
              </button>
            ) : (
              <span />
            )}
            {step < 2 ? (
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => {
                  if (step === 1) loadSlots(date);
                  setStep(step + 1);
                }}
                className={buttonClass("primary", "lg")}
              >
                {t("next")}
                <ChevronLeft className="size-4 ltr:rotate-180" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className={buttonClass("primary", "lg")}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {t("confirm")}
              </button>
            )}
          </div>
        </div>
      </form>

      <aside className="h-fit rounded-xl border border-line bg-surface p-6 lg:sticky lg:top-24">
        <h2 className="font-bold">{t("summary.title")}</h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-muted">{t("summary.car")}</dt>
            <dd className="mt-1 font-medium">{model ? `${model.name}${year ? ` · ${year}` : ""}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("summary.services")}</dt>
            <dd className="mt-1 font-medium">
              {selectedServices.length ? (
                <ul className="space-y-1">
                  {selectedServices.map((s) => (
                    <li key={s.id}>{s.title}</li>
                  ))}
                </ul>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t("summary.when")}</dt>
            <dd className="mt-1 font-medium">
              {step === 2 && slot ? `${formatDay(date, locale)} · ${formatSlot(slot, locale)}` : "—"}
            </dd>
          </div>
        </dl>
        <p className="mt-6 border-t border-line pt-4 text-xs leading-6 text-muted">{t("summary.note")}</p>
      </aside>
    </div>
  );
}
