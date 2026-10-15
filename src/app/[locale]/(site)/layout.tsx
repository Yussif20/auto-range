import { cacheLife } from "next/cache";
import { ContactDock } from "@/components/layout/contact-dock";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { RequestDrawer } from "@/components/request-list/request-drawer";
import { getSettings } from "@/lib/data/settings";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default async function SiteLayout({ children }: LayoutProps<"/[locale]">) {
  const settings = await getSettings();
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer year={await currentYear()} settings={settings} />
      <ContactDock settings={settings} />
      <RequestDrawer />
    </>
  );
}
