// Field definitions for the generic admin editor. Plain data only: this file is
// shared by the server action (parsing) and the client form (rendering).

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "lines" | "slug" | "models";
export type OptionSource = "categories" | "icons" | "stock" | "lines";

export type Field = {
  name: string;
  type: FieldType;
  required?: boolean;
  ltr?: boolean;
  wide?: boolean;
  options?: OptionSource;
  min?: number;
  max?: number;
  /** For slugs: the field to derive from when left empty. */
  from?: string;
};

export const ICON_KEYS = [
  "wrench", "cpu", "gauge", "cog", "zap", "disc", "snowflake", "sparkles",
  "filter", "thermometer", "car", "armchair",
] as const;

const text = (name: string, extra: Partial<Field> = {}): Field => ({ name, type: "text", ...extra });
const area = (name: string, extra: Partial<Field> = {}): Field => ({ name, type: "textarea", ...extra });
const num = (name: string, extra: Partial<Field> = {}): Field => ({ name, type: "number", ...extra });
const flag = (name: string): Field => ({ name, type: "checkbox" });

export const resources = {
  parts: {
    fields: [
      text("nameAr", { required: true }),
      text("nameEn", { required: true }),
      { name: "slug", type: "slug", ltr: true, from: "nameEn" },
      { name: "categoryId", type: "select", options: "categories", required: true },
      { name: "stock", type: "select", options: "stock", required: true },
      num("price", { min: 0 }),
      text("brand", { required: true, ltr: true }),
      area("descAr", { required: true }),
      area("descEn", { required: true }),
      { name: "images", type: "lines", ltr: true, wide: true },
      { name: "models", type: "models", wide: true },
      flag("featured"),
      flag("active"),
    ],
  },
  categories: {
    fields: [
      text("nameAr", { required: true }),
      text("nameEn", { required: true }),
      { name: "slug", type: "slug", ltr: true, from: "nameEn" },
      { name: "icon", type: "select", options: "icons", required: true },
      num("sortOrder", { min: 0 }),
    ],
  },
  services: {
    fields: [
      text("titleAr", { required: true }),
      text("titleEn", { required: true }),
      { name: "slug", type: "slug", ltr: true, from: "titleEn" },
      { name: "icon", type: "select", options: "icons", required: true },
      area("summaryAr", { required: true }),
      area("summaryEn", { required: true }),
      area("bodyAr", { required: true }),
      area("bodyEn", { required: true }),
      num("priceFrom", { min: 0 }),
      num("durationHr", { min: 1, max: 240 }),
      text("image", { ltr: true }),
      num("sortOrder", { min: 0 }),
      flag("active"),
    ],
  },
  models: {
    fields: [
      text("nameAr", { required: true }),
      text("nameEn", { required: true }),
      { name: "slug", type: "slug", ltr: true, from: "nameEn" },
      { name: "line", type: "select", options: "lines", required: true },
      num("yearFrom", { required: true, min: 1970, max: 2100 }),
      num("yearTo", { min: 1970, max: 2100 }),
      text("image", { ltr: true }),
      num("sortOrder", { min: 0 }),
    ],
  },
  reviews: {
    fields: [
      text("author", { required: true }),
      num("rating", { required: true, min: 1, max: 5 }),
      text("carAr", { required: true }),
      text("carEn", { required: true }),
      area("bodyAr", { required: true }),
      area("bodyEn", { required: true }),
      flag("published"),
    ],
  },
  faqs: {
    fields: [
      text("questionAr", { required: true }),
      text("questionEn", { required: true }),
      area("answerAr", { required: true }),
      area("answerEn", { required: true }),
      num("sortOrder", { min: 0 }),
      flag("published"),
    ],
  },
} satisfies Record<string, { fields: Field[] }>;

export type ResourceKey = keyof typeof resources;
export const RESOURCE_KEYS = Object.keys(resources) as ResourceKey[];

export function isResource(value: string): value is ResourceKey {
  return value in resources;
}

export type FormErrors = Partial<Record<string, "required" | "invalid" | "taken" | "inUse">>;
export type SaveState =
  | { errors?: FormErrors; error?: "server" | "demo"; values?: Record<string, string | string[]> }
  | undefined;
