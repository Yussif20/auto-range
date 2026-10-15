"use client";

import clsx from "clsx";
import { CheckCircle2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin/settings";
import { inputClass, labelClass } from "./form-styles";
import { SubmitButton } from "./submit-button";

type Values = {
  phone: string;
  whatsapp: string;
  email: string;
  addressAr: string;
  addressEn: string;
  mapUrl: string;
  hoursAr: string;
  hoursEn: string;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  statCustomers: number;
  statYears: number;
  statParts: number;
  statRating: number;
  slotCapacity: number;
  slots: string[];
  closedWeekdays: number[];
  bookingDaysAhead: number;
};

const sections: { key: string; fields: { name: keyof Values; ltr?: boolean; type?: string; step?: string }[] }[] = [
  {
    key: "contact",
    fields: [
      { name: "phone", ltr: true },
      { name: "whatsapp", ltr: true },
      { name: "email", ltr: true, type: "email" },
      { name: "mapUrl", ltr: true },
      { name: "addressAr" },
      { name: "addressEn", ltr: true },
      { name: "hoursAr" },
      { name: "hoursEn", ltr: true },
    ],
  },
  {
    key: "social",
    fields: [
      { name: "facebook", ltr: true },
      { name: "instagram", ltr: true },
      { name: "tiktok", ltr: true },
      { name: "youtube", ltr: true },
    ],
  },
  {
    key: "stats",
    fields: [
      { name: "statCustomers", type: "number" },
      { name: "statYears", type: "number" },
      { name: "statParts", type: "number" },
      { name: "statRating", type: "number", step: "0.1" },
    ],
  },
  {
    key: "booking",
    fields: [
      { name: "slotCapacity", type: "number" },
      { name: "bookingDaysAhead", type: "number" },
      { name: "slots", ltr: true },
    ],
  },
];

export function SettingsForm({ values }: { values: Values }) {
  const t = useTranslations("admin.settings");
  const locale = useLocale();
  const [state, action] = useActionState(saveSettings, undefined);
  const weekday = (d: number) =>
    new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { weekday: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(2024, 0, 7 + d)),
    );

  return (
    <form action={action} className="space-y-6">
      {sections.map((section) => (
        <fieldset key={section.key} className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <legend className="sr-only">{t(`sections.${section.key}`)}</legend>
          <h2 className="mb-5 font-bold">{t(`sections.${section.key}`)}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {section.fields.map((f) => {
              const value = state?.values ? state.values[f.name] : values[f.name];
              const invalid = state?.errors?.[f.name];
              return (
                <label key={f.name} className={clsx("block", f.name === "slots" && "sm:col-span-2")}>
                  <span className={labelClass}>{t(`fields.${f.name}`)}</span>
                  <input
                    name={f.name}
                    type={f.type ?? "text"}
                    step={f.step}
                    dir={f.ltr || f.type === "number" ? "ltr" : undefined}
                    defaultValue={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
                    aria-invalid={invalid || undefined}
                    className={clsx(inputClass, invalid && "border-brand-hover")}
                  />
                  {invalid && <span className="mt-1 block text-xs text-brand-text">{t("invalid")}</span>}
                  {f.name === "slots" && <span className="mt-1 block text-xs text-muted">{t("slotsHint")}</span>}
                </label>
              );
            })}
          </div>
          {section.key === "booking" && (
            <div className="mt-5">
              <p className={labelClass}>{t("fields.closedWeekdays")}</p>
              <div className="flex flex-wrap gap-2">
                {[6, 0, 1, 2, 3, 4, 5].map((d) => (
                  <label key={d} className="flex items-center gap-2 rounded-md border border-line bg-bg px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      name="closedWeekdays"
                      value={d}
                      defaultChecked={
                        state?.values
                          ? (state.values.closedWeekdays as string[]).includes(String(d))
                          : values.closedWeekdays.includes(d)
                      }
                      className="size-4 accent-[var(--red-600)]"
                    />
                    {weekday(d)}
                  </label>
                ))}
              </div>
            </div>
          )}
          {section.key === "stats" && <p className="mt-4 text-xs text-muted">{t("statsHint")}</p>}
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton>{t("save")}</SubmitButton>
        {state?.ok && (
          <p role="status" className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" />
            {t("saved")}
          </p>
        )}
        {state?.demo && (
          <p role="alert" className="text-sm text-warning">
            {t("demo")}
          </p>
        )}
        {state?.errors && (
          <p role="alert" className="text-sm text-brand-text">
            {t("fixErrors")}
          </p>
        )}
      </div>
    </form>
  );
}
