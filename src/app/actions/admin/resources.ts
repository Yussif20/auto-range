"use server";

import { Prisma, StockStatus, VehicleLine } from "@prisma/client";
import { updateTag } from "next/cache";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { type FormErrors, ICON_KEYS, isResource, type ResourceKey, resources, type SaveState } from "@/lib/admin/resources";
import { formValues } from "@/lib/admin/form-values";
import { requireAdmin } from "@/lib/auth/session";
import { CATALOG_TAG, CONTENT_TAG } from "@/lib/data/catalog";
import { db } from "@/lib/db";
import { isDemo } from "@/lib/demo";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

const SELECT_VALUES: Record<string, readonly string[]> = {
  icons: ICON_KEYS,
  stock: Object.values(StockStatus),
  lines: Object.values(VehicleLine),
};

/** Reads and validates a form using the resource's field config. */
function parse(resource: ResourceKey, form: FormData) {
  const data: Record<string, unknown> = {};
  const errors: FormErrors = {};

  for (const field of resources[resource].fields) {
    const raw = String(form.get(field.name) ?? "").trim();
    switch (field.type) {
      case "checkbox":
        data[field.name] = form.get(field.name) === "on";
        break;
      case "number": {
        if (raw === "") {
          if (field.required) errors[field.name] = "required";
          data[field.name] = null;
          break;
        }
        const n = Number(raw);
        const max = "max" in field ? field.max : undefined;
        const min = "min" in field ? field.min : undefined;
        if (!Number.isInteger(n) || (min != null && n < min) || (max != null && n > max)) errors[field.name] = "invalid";
        data[field.name] = n;
        break;
      }
      case "lines": {
        const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        // Absolute https URLs or files served from /public (e.g. /images/parts/x.webp).
        if (lines.some((l) => !/^(https:\/\/|\/)\S+$/.test(l))) errors[field.name] = "invalid";
        data[field.name] = lines;
        break;
      }
      case "models":
        data[field.name] = form.getAll(field.name).map(String);
        break;
      case "slug": {
        const source = "from" in field && field.from ? String(form.get(field.from) ?? "") : "";
        const slug = slugify(raw || source);
        if (!slug) errors[field.name] = "required";
        data[field.name] = slug;
        break;
      }
      case "select": {
        const allowed = "options" in field && field.options ? SELECT_VALUES[field.options] : undefined;
        if (!raw && "required" in field && field.required) errors[field.name] = "required";
        else if (allowed && raw && !allowed.includes(raw)) errors[field.name] = "invalid";
        data[field.name] = raw;
        break;
      }
      default:
        if (!raw && "required" in field && field.required) errors[field.name] = "required";
        else if (raw.length > (field.type === "textarea" ? 5000 : 200)) errors[field.name] = "invalid";
        data[field.name] = raw || (field.type === "text" && !("required" in field && field.required) ? null : raw);
    }
  }
  if (resource === "models" && data.yearTo != null && (data.yearTo as number) < (data.yearFrom as number)) {
    errors.yearTo = "invalid";
  }
  return { data, errors };
}

const tagFor = (resource: ResourceKey) => (resource === "reviews" || resource === "faqs" ? CONTENT_TAG : CATALOG_TAG);

async function write(resource: ResourceKey, id: string | null, data: Record<string, unknown>) {
  switch (resource) {
    case "parts": {
      const { models, ...part } = data as Prisma.PartUncheckedCreateInput & { models: string[] };
      const compat = { create: models.map((modelId) => ({ modelId })) };
      return id
        ? db.part.update({ where: { id }, data: { ...part, compatibilities: { deleteMany: {}, ...compat } } })
        : db.part.create({ data: { ...part, compatibilities: compat } });
    }
    case "categories": {
      const d = data as Prisma.PartCategoryCreateInput;
      return id ? db.partCategory.update({ where: { id }, data: d }) : db.partCategory.create({ data: d });
    }
    case "services": {
      const d = data as Prisma.ServiceCreateInput;
      return id ? db.service.update({ where: { id }, data: d }) : db.service.create({ data: d });
    }
    case "models": {
      const d = data as Prisma.VehicleModelCreateInput;
      return id ? db.vehicleModel.update({ where: { id }, data: d }) : db.vehicleModel.create({ data: d });
    }
    case "reviews": {
      const d = data as Prisma.ReviewCreateInput;
      return id ? db.review.update({ where: { id }, data: d }) : db.review.create({ data: d });
    }
    case "faqs": {
      const d = data as Prisma.FaqCreateInput;
      return id ? db.faq.update({ where: { id }, data: d }) : db.faq.create({ data: d });
    }
  }
}

export async function saveResource(
  resource: string,
  id: string | null,
  _prev: SaveState,
  form: FormData,
): Promise<SaveState> {
  await requireAdmin();
  if (!isResource(resource)) return { error: "server" };

  const { data, errors } = parse(resource, form);
  const echo = () => formValues(form, ["models"]);
  if (Object.keys(errors).length) return { errors, values: echo() };

  try {
    await write(resource, id, data);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = String((error.meta?.target as string[] | undefined)?.[0] ?? "slug");
      return { errors: { [target]: "taken" }, values: echo() };
    }
    console.error("saveResource failed", resource, error);
    return { error: "server", values: echo() };
  }

  updateTag(tagFor(resource));
  redirect({ href: { pathname: `/admin/${resource}`, query: { saved: "1" } }, locale: await getLocale() });
}

export async function deleteResource(resource: string, id: string): Promise<SaveState> {
  await requireAdmin();
  // Deleting is off on the public demo; edits are allowed and reset nightly.
  if (isDemo()) return { error: "demo" };
  if (!isResource(resource)) return { error: "server" };

  // Records still referenced elsewhere are hidden instead of deleted, or refused.
  try {
    switch (resource) {
      case "parts": {
        const used = await db.partRequestItem.count({ where: { partId: id } });
        if (used) await db.part.update({ where: { id }, data: { active: false } });
        else await db.part.delete({ where: { id } });
        break;
      }
      case "categories":
        if (await db.part.count({ where: { categoryId: id } })) return { errors: { _: "inUse" } };
        await db.partCategory.delete({ where: { id } });
        break;
      case "services":
        if (await db.bookingService.count({ where: { serviceId: id } })) {
          await db.service.update({ where: { id }, data: { active: false } });
        } else await db.service.delete({ where: { id } });
        break;
      case "models":
        if (await db.booking.count({ where: { modelId: id } })) return { errors: { _: "inUse" } };
        await db.vehicleModel.delete({ where: { id } });
        break;
      case "reviews":
        await db.review.delete({ where: { id } });
        break;
      case "faqs":
        await db.faq.delete({ where: { id } });
        break;
    }
  } catch (error) {
    console.error("deleteResource failed", resource, error);
    return { error: "server" };
  }

  updateTag(tagFor(resource));
  redirect({ href: { pathname: `/admin/${resource}`, query: { deleted: "1" } }, locale: await getLocale() });
}
