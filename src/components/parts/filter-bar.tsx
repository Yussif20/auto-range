"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import { useLocale, useTranslations } from "next-intl";

type Option = { slug: string; label: string };

const control =
  "h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-none";

// A GET form: filters live in the URL, so results are shareable and crawlable.
export function FilterBar({
  models,
  categories,
  values,
}: {
  models: Option[];
  categories: Option[];
  values: { q: string; model: string; category: string; inStock: boolean };
}) {
  const t = useTranslations("parts.filters");
  const locale = useLocale();
  const submit = (e: React.ChangeEvent<HTMLElement>) =>
    (e.currentTarget as HTMLInputElement).form?.requestSubmit();

  return (
    <Form
      action={`/${locale}/parts`}
      className="grid gap-3 rounded-lg border border-line bg-surface/60 p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
    >
      <label className="relative block sm:col-span-2 lg:col-span-1">
        <span className="sr-only">{t("search")}</span>
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          name="q"
          defaultValue={values.q}
          placeholder={t("searchPlaceholder")}
          className={`${control} ps-9`}
        />
      </label>
      <label className="block">
        <span className="sr-only">{t("model")}</span>
        <select name="model" defaultValue={values.model} onChange={submit} className={control}>
          <option value="">{t("allModels")}</option>
          {models.map((m) => (
            <option key={m.slug} value={m.slug}>
              {m.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="sr-only">{t("category")}</span>
        <select name="category" defaultValue={values.category} onChange={submit} className={control}>
          <option value="">{t("allCategories")}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm whitespace-nowrap text-ink">
        <input
          type="checkbox"
          name="inStock"
          value="1"
          defaultChecked={values.inStock}
          onChange={submit}
          className="size-4 accent-[var(--red-600)]"
        />
        {t("inStock")}
      </label>
    </Form>
  );
}
