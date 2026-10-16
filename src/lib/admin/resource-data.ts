import "server-only";
import type { ResourceKey } from "@/lib/admin/resources";
import { db } from "@/lib/db";

export const ADMIN_PAGE_SIZE = 30;

/** Rows for the list screen. Search applies where it makes sense. */
export async function listRows(resource: ResourceKey, q: string, page: number) {
  const skip = (page - 1) * ADMIN_PAGE_SIZE;
  const take = ADMIN_PAGE_SIZE;
  const contains = (field: string) => ({ [field]: { contains: q, mode: "insensitive" as const } });

  switch (resource) {
    case "parts": {
      const where = q ? { OR: [contains("nameAr"), contains("nameEn")] } : {};
      const [total, rows] = await Promise.all([
        db.part.count({ where }),
        db.part.findMany({ where, include: { category: true }, orderBy: { updatedAt: "desc" }, skip, take }),
      ]);
      return { total, rows: rows.map((r) => ({ kind: "parts" as const, ...r })) };
    }
    case "categories": {
      const rows = await db.partCategory.findMany({
        include: { _count: { select: { parts: true } } },
        orderBy: { sortOrder: "asc" },
      });
      return { total: rows.length, rows: rows.map((r) => ({ kind: "categories" as const, ...r })) };
    }
    case "services": {
      const rows = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
      return { total: rows.length, rows: rows.map((r) => ({ kind: "services" as const, ...r })) };
    }
    case "models": {
      const rows = await db.vehicleModel.findMany({
        include: { _count: { select: { compatibilities: true } } },
        orderBy: { sortOrder: "asc" },
      });
      return { total: rows.length, rows: rows.map((r) => ({ kind: "models" as const, ...r })) };
    }
    case "reviews": {
      const rows = await db.review.findMany({ orderBy: { createdAt: "desc" } });
      return { total: rows.length, rows: rows.map((r) => ({ kind: "reviews" as const, ...r })) };
    }
    case "faqs": {
      const rows = await db.faq.findMany({ orderBy: { sortOrder: "asc" } });
      return { total: rows.length, rows: rows.map((r) => ({ kind: "faqs" as const, ...r })) };
    }
  }
}

export type ListRow = Awaited<ReturnType<typeof listRows>>["rows"][number];

/** Current values for the edit form, flattened to what the inputs expect. */
export async function loadRecord(resource: ResourceKey, id: string): Promise<Record<string, unknown> | null> {
  switch (resource) {
    case "parts": {
      const part = await db.part.findUnique({ where: { id }, include: { compatibilities: true } });
      if (!part) return null;
      const { compatibilities, ...rest } = part;
      return { ...rest, models: compatibilities.map((c) => c.modelId) };
    }
    case "categories":
      return db.partCategory.findUnique({ where: { id } });
    case "services":
      return db.service.findUnique({ where: { id } });
    case "models":
      return db.vehicleModel.findUnique({ where: { id } });
    case "reviews":
      return db.review.findUnique({ where: { id } });
    case "faqs":
      return db.faq.findUnique({ where: { id } });
  }
}

/** Defaults for a new record. */
export const NEW_DEFAULTS: Record<ResourceKey, Record<string, unknown>> = {
  parts: { brand: "Genuine Land Rover", stock: "IN_STOCK", active: true, models: [] },
  categories: { icon: "wrench", sortOrder: 0 },
  services: { icon: "wrench", active: true, sortOrder: 0 },
  models: { line: "RANGE_ROVER", sortOrder: 0 },
  reviews: { rating: 5, published: true },
  faqs: { sortOrder: 0, published: true },
};

export async function formOptions() {
  const [categories, models] = await Promise.all([
    db.partCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    db.vehicleModel.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return {
    categories: categories.map((c) => ({ value: c.id, labelAr: c.nameAr, labelEn: c.nameEn })),
    models: models.map((m) => ({ value: m.id, labelAr: m.nameAr, labelEn: m.nameEn })),
  };
}

export type FormOptions = Awaited<ReturnType<typeof formOptions>>;
