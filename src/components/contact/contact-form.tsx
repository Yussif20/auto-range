"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { sendContactMessage } from "@/app/actions/contact";
import { buttonClass } from "@/components/ui/button";

const field =
  "w-full rounded-md border border-line bg-bg px-3.5 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none aria-[invalid=true]:border-brand-hover";

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<{ field?: string; error: string } | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setError(null);
    start(async () => {
      const result = await sendContactMessage({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? ""),
        subject: String(form.get("subject") ?? ""),
        body: String(form.get("body") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      if (result.ok) {
        setSent(true);
        formEl.reset();
      } else setError(result);
    });
  };

  if (sent) {
    return (
      <div className="grid place-items-center rounded-xl border border-line bg-surface p-10 text-center">
        <div>
          <CheckCircle2 className="mx-auto size-14 text-success" />
          <p className="mt-4 text-xl font-bold">{t("sentTitle")}</p>
          <p className="mt-2 text-muted">{t("sentBody")}</p>
          <button type="button" onClick={() => setSent(false)} className={buttonClass("outline", "md", "mt-6")}>
            {t("another")}
          </button>
        </div>
      </div>
    );
  }

  const invalid = (name: string) => error?.field === name || undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-line bg-surface p-6 sm:grid-cols-2 sm:p-8">
      <h2 className="text-xl font-bold sm:col-span-2">{t("title")}</h2>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">{t("name")}</span>
        <input name="name" required minLength={2} autoComplete="name" aria-invalid={invalid("name")} className={field} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">{t("phone")}</span>
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          dir="ltr"
          aria-invalid={invalid("phone")}
          className={`${field} rtl:text-end`}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">{t("email")}</span>
        <input name="email" type="email" autoComplete="email" dir="ltr" aria-invalid={invalid("email")} className={`${field} rtl:text-end`} />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">{t("subject")}</span>
        <input name="subject" className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-2 block text-sm text-muted">{t("body")}</span>
        <textarea name="body" required minLength={5} rows={5} aria-invalid={invalid("body")} className={field} />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      {error && (
        <p role="alert" className="text-sm text-brand-text sm:col-span-2">
          {error.field && ["name", "phone", "email", "body"].includes(error.field)
            ? t(`errors.${error.field}`)
            : t(`errors.${error.error}`)}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={buttonClass("primary", "lg")}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {t("send")}
        </button>
      </div>
    </form>
  );
}
