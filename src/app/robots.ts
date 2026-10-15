import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { isDemo } from "@/lib/demo";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // The public demo copies the real site; keep it out of search results.
  if (isDemo()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Admin and personal booking lookups have nothing to index.
      disallow: routing.locales.flatMap((l) => [`/${l}/admin`, `/${l}/track`]),
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
