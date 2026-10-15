import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Re-provides the full message set, including the admin strings the root layout leaves out.
export default async function AdminRootLayout({ children }: LayoutProps<"/[locale]/admin">) {
  return <NextIntlClientProvider messages={await getMessages()}>{children}</NextIntlClientProvider>;
}
