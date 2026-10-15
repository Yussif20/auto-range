import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Arabic-first business: "/" always lands on /ar, the switcher handles English.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
