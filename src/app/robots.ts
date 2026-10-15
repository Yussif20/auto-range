import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
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
