import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

// Set NEXT_PUBLIC_SITE_URL in production (e.g. https://autorange.example).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** Canonical + hreflang links for a path that exists in every locale ("" for home). */
export function localeAlternates(path: string, locale: string): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, `/${l}${path}`]),
  );
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;
