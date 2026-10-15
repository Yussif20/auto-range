import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPartSlugs, getServices } from "@/lib/data/catalog";
import { absoluteUrl } from "@/lib/seo";

const STATIC_PATHS = ["", "/services", "/parts", "/book", "/about", "/contact", "/privacy"];

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  return {
    url: absoluteUrl(`/${routing.defaultLocale}${path}`),
    changeFrequency,
    priority,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(`/${l}${path}`)])),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, parts] = await Promise.all([getServices(), getPartSlugs()]);
  return [
    ...STATIC_PATHS.map((p) => entry(p, p === "" ? 1 : 0.7, "weekly")),
    ...services.map((s) => entry(`/services/${s.slug}`, 0.8, "monthly")),
    ...parts.map((p) => entry(`/parts/${p.slug}`, 0.6, "weekly")),
  ];
}
