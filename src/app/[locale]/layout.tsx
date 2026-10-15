import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { routing } from "@/i18n/routing";
import "../globals.css";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: { default: t("title"), template: `%s | ${t("title").split("|")[0].trim()}` },
    description: t("description"),
  };
}

// Root layout: document, fonts and translations. The public site and the
// admin each add their own chrome in (site)/layout.tsx and admin/layout.tsx.
export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  // Admin strings are only sent to admin pages (admin/layout.tsx adds them).
  const publicMessages = Object.fromEntries(
    Object.entries(await getMessages()).filter(([namespace]) => namespace !== "admin"),
  );

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      className={`${alexandria.variable} ${plex.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={publicMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
