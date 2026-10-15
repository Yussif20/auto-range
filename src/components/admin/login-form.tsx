"use client";

import { Loader2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { login } from "@/app/actions/admin/auth";
import { buttonClass } from "@/components/ui/button";
import { inputClass } from "./form-styles";

export function LoginForm() {
  const t = useTranslations("admin.login");
  const locale = useLocale();
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4 rounded-xl border border-line bg-surface p-6">
      <input type="hidden" name="locale" value={locale} />
      <label className="block">
        <span className="mb-2 block text-sm text-muted">{t("email")}</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          dir="ltr"
          defaultValue={state?.email}
          className={inputClass}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm text-muted">{t("password")}</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          dir="ltr"
          className={inputClass}
        />
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-brand-hover">
          {t("invalid")}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {t("submit")}
      </button>
    </form>
  );
}
