import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import { Alexandria, IBM_Plex_Sans_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { ContactDock } from "@/components/layout/contact-dock";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
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

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${alexandria.variable} ${plex.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer year={await currentYear()} />
          <ContactDock />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
