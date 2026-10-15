"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { changePassword } from "@/app/actions/admin/auth";
import { inputClass, labelClass } from "./form-styles";
import { SubmitButton } from "./submit-button";

export function PasswordForm() {
  const t = useTranslations("admin.account");
  const [state, action] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="max-w-md space-y-4 rounded-xl border border-line bg-surface p-6">
      <h2 className="font-bold">{t("changePassword")}</h2>
      {(["current", "next", "confirm"] as const).map((name) => (
        <label key={name} className="block">
          <span className={labelClass}>{t(name)}</span>
          <input
            name={name}
            type="password"
            required
            minLength={name === "current" ? 1 : 10}
            autoComplete={name === "current" ? "current-password" : "new-password"}
            dir="ltr"
            className={inputClass}
          />
        </label>
      ))}
      {state?.error && (
        <p role="alert" className="text-sm text-brand-hover">
          {t(`errors.${state.error}`)}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" />
          {t("changed")}
        </p>
      )}
      <SubmitButton>{t("save")}</SubmitButton>
    </form>
  );
}
