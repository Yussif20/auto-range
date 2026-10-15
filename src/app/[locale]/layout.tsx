import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { pickClientMessages } from "@/i18n/client-messages";
import { routing } from "@/i18n/routing";
import { isDemo } from "@/lib/demo";
import { SITE_URL } from "@/lib/seo";
import "../globals.css";

const alexandria = Alexandria({
  variable: "--font-alexandria",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const plex = IBM_Plex_Sans_Arabic({
  variable: "--font-plex",
  subsets: ["arabic", "latin"],
  // Body copy uses regular and semibold; headings use Alexandria (variable).
  weight: ["400", "600"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getTranslations("meta"), rootLocale()]);
  const brand = t("title").split("|")[0].trim();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s | ${brand}` },
    description: t("description"),
    applicationName: brand,
    openGraph: {
      type: "website",
      siteName: brand,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_EG",
    },
    twitter: { card: "summary_large_image" },
    ...(isDemo() && { robots: { index: false, follow: false } }),
    formatDetection: { telephone: false },
  };
}

// Root layout: document, fonts and translations. The public site and the
// admin each add their own chrome in (site)/layout.tsx and admin/layout.tsx.
export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();
  // Public pages only ship what Client Components use; admin/layout.tsx adds the rest.
  const publicMessages = pickClientMessages(await getMessages());

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
