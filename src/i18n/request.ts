import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

async function readSegmentLocale(requestLocale: Promise<string | undefined>) {
  // Root params are unavailable in Server Actions and Route Handlers.
  try {
    return await rootLocale();
  } catch {
    return await requestLocale;
  }
}

export default getRequestConfig(async ({ locale: override, requestLocale }) => {
  const candidate = override ?? (await readSegmentLocale(requestLocale));
  const locale = hasLocale(routing.locales, candidate)
    ? candidate
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
