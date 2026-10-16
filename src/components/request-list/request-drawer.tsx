"use client";

import { CheckCircle2, Minus, Plus, Trash2, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { submitPartRequest } from "@/app/actions/part-request";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { requestList, useRequestList } from "./store";

type Status =
  | { kind: "idle" }
  | { kind: "error"; error: string }
  | { kind: "sent"; code: string; whatsappUrl: string };

const field =
  "w-full rounded-md border border-line bg-bg px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none";

export function RequestDrawer() {
  const t = useTranslations("requestList");
  const locale = useLocale();
  const { items, open } = useRequestList();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && requestList.setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const close = () => {
    requestList.setOpen(false);
    if (status.kind === "sent") setStatus({ kind: "idle" });
  };

  // onSubmit (not a form action) so React doesn't reset the fields when validation fails.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    // Open the tab synchronously so pop-up blockers allow it, then point it at WhatsApp.
    const waTab = window.open("", "_blank");
    if (waTab) waTab.opener = null;
    startTransition(async () => {
      const result = await submitPartRequest({
        locale: locale as "ar" | "en",
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        note: String(form.get("note") ?? ""),
        website: String(form.get("website") ?? ""),
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      });
      if (!result.ok) {
        waTab?.close();
        setStatus({ kind: "error", error: result.error });
        return;
      }
      if (waTab) waTab.location.href = result.whatsappUrl;
      requestList.clear();
      setStatus({ kind: "sent", code: result.code, whatsappUrl: result.whatsappUrl });
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t("close")}
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col border-s border-line bg-surface shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="request-title" className="text-lg font-bold">
            {t("title")}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="grid size-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        {status.kind === "sent" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <CheckCircle2 className="size-14 text-success" />
            <p className="text-lg font-bold">{t("sentTitle")}</p>
            <p className="text-sm leading-7 text-muted">{t("sentBody")}</p>
            <p className="rounded-md border border-line bg-bg px-4 py-2 font-mono text-lg tracking-widest" dir="ltr">
              {status.code}
            </p>
            <a href={status.whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
              {t("openWhatsapp")}
            </a>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-muted">{t("empty")}</p>
            <Link href="/parts" onClick={close} className={buttonClass("outline")}>
              {t("browse")}
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/parts/${item.slug}`}
                      onClick={close}
                      className="line-clamp-2 text-sm font-medium text-ink hover:text-brand-text"
                    >
                      {locale === "ar" ? item.nameAr : item.nameEn}
                    </Link>
                  </div>
                  <div className="flex items-center rounded-md border border-line">
                    <button
                      type="button"
                      onClick={() => requestList.setQty(item.id, item.qty - 1)}
                      aria-label={t("decrease")}
                      className="grid size-8 place-items-center text-muted hover:text-ink"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => requestList.setQty(item.id, item.qty + 1)}
                      aria-label={t("increase")}
                      className="grid size-8 place-items-center text-muted hover:text-ink"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => requestList.remove(item.id)}
                    aria-label={t("remove")}
                    className="grid size-8 place-items-center rounded-md text-muted hover:text-brand-text"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-line bg-surface-2/40 px-5 py-5">
              <p className="text-xs leading-6 text-muted">{t("hint")}</p>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="sr-only">{t("name")}</span>
                  <input name="name" autoComplete="name" placeholder={t("name")} className={field} />
                </label>
                <label className="block">
                  <span className="sr-only">{t("phone")}</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    dir="ltr"
                    placeholder={t("phone")}
                    aria-invalid={status.kind === "error" && status.error === "invalidPhone"}
                    className={`${field} rtl:text-end`}
                  />
                </label>
              </div>
              <label className="block">
                <span className="sr-only">{t("note")}</span>
                <textarea name="note" rows={2} placeholder={t("note")} className={field} />
              </label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              {status.kind === "error" && (
                <p role="alert" className="text-sm text-brand-text">
                  {t(`errors.${status.error}`)}
                </p>
              )}
              <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
                {pending ? t("sending") : t("send")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
