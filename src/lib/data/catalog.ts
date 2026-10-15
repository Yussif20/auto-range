import type { Prisma, StockStatus } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

// Admin mutations revalidate these tags.
export const CATALOG_TAG = "catalog";
export const CONTENT_TAG = "content";

export const PARTS_PAGE_SIZE = 12;

export async function getModels() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  return db.vehicleModel.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getServices() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  return db.service.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getService(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  return db.service.findFirst({ where: { slug, active: true } });
}

export async function getCategories() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("days");
  return db.partCategory.findMany({ orderBy: { sortOrder: "asc" } });
}

const partCardSelect = {
  id: true,
  slug: true,
  nameAr: true,
  nameEn: true,
  oemNumber: true,
  price: true,
  stock: true,
  images: true,
  category: { select: { slug: true, icon: true, nameAr: true, nameEn: true } },
} satisfies Prisma.PartSelect;

export type PartCard = Prisma.PartGetPayload<{ select: typeof partCardSelect }>;

export async function getFeaturedParts(limit = 8) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.part.findMany({
    where: { active: true, featured: true },
    select: partCardSelect,
    orderBy: { updatedAt: "desc" },
    take: limit,
  });
}

export type PartFilters = {
  q?: string;
  model?: string;
  category?: string;
  inStock?: boolean;
  page?: number;
};

const AVAILABLE: StockStatus[] = ["IN_STOCK", "LOW_STOCK"];

export async function searchParts(filters: PartFilters) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");

  const q = filters.q?.trim();
  const where: Prisma.PartWhereInput = {
    active: true,
    ...(filters.category && { category: { slug: filters.category } }),
    ...(filters.model && {
      compatibilities: { some: { model: { slug: filters.model } } },
    }),
    ...(filters.inStock && { stock: { in: AVAILABLE } }),
    ...(q && {
      OR: [
        { nameAr: { contains: q, mode: "insensitive" } },
        { nameEn: { contains: q, mode: "insensitive" } },
        { oemNumber: { contains: q.replace(/\s+/g, ""), mode: "insensitive" } },
      ],
    }),
  };

  const page = Math.max(1, filters.page ?? 1);
  const [total, items] = await db.$transaction([
    db.part.count({ where }),
    db.part.findMany({
      where,
      select: partCardSelect,
      orderBy: [{ featured: "desc" }, { nameEn: "asc" }],
      skip: (page - 1) * PARTS_PAGE_SIZE,
      take: PARTS_PAGE_SIZE,
    }),
  ]);

  return { items, total, page, pages: Math.max(1, Math.ceil(total / PARTS_PAGE_SIZE)) };
}

export async function getPart(slug: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.part.findFirst({
    where: { slug, active: true },
    include: {
      category: true,
      compatibilities: {
        include: { model: true },
        orderBy: { model: { sortOrder: "asc" } },
      },
    },
  });
}

export async function getRelatedParts(categoryId: string, excludeId: string) {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.part.findMany({
    where: { active: true, categoryId, id: { not: excludeId } },
    select: partCardSelect,
    take: 4,
  });
}

export async function getPartSlugs() {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("hours");
  return db.part.findMany({ where: { active: true }, select: { slug: true } });
}

export async function getReviews() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return db.review.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

export async function getFaqs() {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("days");
  return db.faq.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}
