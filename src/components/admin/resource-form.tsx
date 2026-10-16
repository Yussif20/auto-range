"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useState, useTransition } from "react";
import { deleteResource, saveResource } from "@/app/actions/admin/resources";
import { buttonClass } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { FormOptions } from "@/lib/admin/resource-data";
import { type Field, ICON_KEYS, type ResourceKey, resources, type SaveState } from "@/lib/admin/resources";
import { inputClass, labelClass } from "./form-styles";
import { ImageField } from "./image-field";
import { SubmitButton } from "./submit-button";

const STOCK = ["IN_STOCK", "LOW_STOCK", "ON_ORDER", "OUT_OF_STOCK"];
const LINES = ["RANGE_ROVER", "DISCOVERY", "DEFENDER"];

export function ResourceForm({
  resource,
  id,
  values,
  options,
}: {
  resource: ResourceKey;
  id: string | null;
  values: Record<string, unknown>;
  options: FormOptions;
}) {
  const t = useTranslations("admin.resources");
  const tField = useTranslations("admin.fields");
  const tStock = useTranslations("parts.stock");
  const tLine = useTranslations("home.models.lines");
  const locale = useLocale();
  const [state, action] = useActionState(saveResource.bind(null, resource, id), undefined);
  const [deleting, startDelete] = useTransition();
  const [deleteState, setDeleteState] = useState<SaveState>(undefined);

  const label = (o: { labelAr: string; labelEn: string }) => (locale === "ar" ? o.labelAr : o.labelEn);
  // After a failed save, show what was submitted rather than the stored record.
  const echoed = state?.values;
  const current = (name: string): unknown => {
    if (!echoed) return values[name];
    const field = (resources[resource].fields as Field[]).find((f) => f.name === name);
    if (field?.type === "checkbox") return echoed[name] === "on";
    return echoed[name];
  };
  const error = (name: string) => state?.errors?.[name];

  const selectOptions = (field: Field) => {
    switch (field.options) {
      case "categories":
        return options.categories.map((o) => ({ value: o.value, label: label(o) }));
      case "icons":
        return ICON_KEYS.map((k) => ({ value: k, label: k }));
      case "stock":
        return STOCK.map((s) => ({ value: s, label: tStock(s) }));
      case "lines":
        return LINES.map((l) => ({ value: l, label: tLine(l) }));
      default:
        return [];
    }
  };

  const renderInput = (field: Field) => {
    const value = current(field.name);
    const common = {
      id: field.name,
      name: field.name,
      dir: field.ltr ? "ltr" : field.name.endsWith("En") ? "ltr" : field.name.endsWith("Ar") ? "rtl" : undefined,
      "aria-invalid": error(field.name) ? true : undefined,
      "aria-describedby": error(field.name) ? `${field.name}-error` : undefined,
      className: clsx(inputClass, error(field.name) && "border-brand-hover"),
    };

    switch (field.type) {
      case "textarea":
        return <textarea {...common} rows={4} defaultValue={String(value ?? "")} required={field.required} />;
      case "number":
        return (
          <input
            {...common}
            type="number"
            inputMode="numeric"
            dir="ltr"
            min={field.min}
            max={field.max}
            defaultValue={value == null ? "" : String(value)}
            required={field.required}
          />
        );
      case "select":
        return (
          <select {...common} defaultValue={String(value ?? "")} required={field.required}>
            {!field.required && <option value="">—</option>}
            {field.required && !value && <option value="">{t("choose")}</option>}
            {selectOptions(field).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case "images":
      case "image": {
        const urls = (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === "string" && v !== "");
        return (
          <ImageField
            name={field.name}
            folder={resource as "parts" | "services" | "models"}
            multiple={field.type === "images"}
            initial={urls}
            invalid={Boolean(error(field.name))}
          />
        );
      }
      case "checkbox":
        return null;
      case "models": {
        const selected = new Set(Array.isArray(value) ? (value as string[]) : []);
        return (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.models.map((m) => (
              <label key={m.value} className="flex items-center gap-2.5 rounded-md border border-line bg-bg px-3 py-2.5 text-sm">
                <input type="checkbox" name="models" value={m.value} defaultChecked={selected.has(m.value)} className="size-4 accent-[var(--red-600)]" />
                {label(m)}
              </label>
            ))}
          </div>
        );
      }
      default:
        return <input {...common} type="text" defaultValue={String(value ?? "")} required={field.required} />;
    }
  };

  const fields = resources[resource].fields as Field[];
  const checkboxes = fields.filter((f) => f.type === "checkbox");

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 rounded-xl border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6">
        {fields
          .filter((f) => f.type !== "checkbox")
          .map((field) => (
            <div key={field.name} className={clsx(field.wide && "sm:col-span-2")}>
              {field.type === "models" || field.type === "images" || field.type === "image" ? (
                <p className={labelClass}>{tField(field.name)}</p>
              ) : (
                <label htmlFor={field.name} className={labelClass}>
                  {tField(field.name)}
                  {field.required && <span className="text-brand-text"> *</span>}
                </label>
              )}
              {renderInput(field)}
              {field.type === "slug" && <p className="mt-1 text-xs text-muted">{t("slugHint")}</p>}
              {field.type === "images" && <p className="mt-1 text-xs text-muted">{t("imagesHint")}</p>}
              {error(field.name) && (
                <p id={`${field.name}-error`} className="mt-1 text-xs text-brand-text">
                  {t(`errors.${error(field.name)}`)}
                </p>
              )}
            </div>
          ))}
        {checkboxes.length > 0 && (
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            {checkboxes.map((field) => (
              <label key={field.name} className="flex items-center gap-2.5 rounded-md border border-line bg-bg px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  name={field.name}
                  defaultChecked={Boolean(current(field.name))}
                  className="size-4 accent-[var(--red-600)]"
                />
                {tField(field.name)}
              </label>
            ))}
          </div>
        )}
      </div>

      {(state?.error || deleteState?.error || deleteState?.errors?._) && (
        <p role="alert" className="rounded-md border border-brand/40 bg-brand/10 px-4 py-3 text-sm">
          {deleteState?.errors?._
            ? t("errors.inUse")
            : deleteState?.error === "demo"
              ? t("errors.demo")
              : t("errors.server")}
        </p>
      )}
      {state?.errors && <p role="alert" className="text-sm text-brand-text">{t("fixErrors")}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <SubmitButton>{t("save")}</SubmitButton>
          <Link href={`/admin/${resource}`} className={buttonClass("ghost")}>
            {t("cancel")}
          </Link>
        </div>
        {id && (
          <button
            type="button"
            disabled={deleting}
            onClick={() => {
              if (!window.confirm(t("confirmDelete"))) return;
              startDelete(async () => setDeleteState(await deleteResource(resource, id)));
            }}
            className={buttonClass("ghost", "md", "text-brand-text")}
          >
            <Trash2 className="size-4" />
            {t("delete")}
          </button>
        )}
      </div>
    </form>
  );
}
