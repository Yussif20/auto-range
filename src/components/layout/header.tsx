"use client";

import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { RequestListButton } from "@/components/request-list/request-list-button";
import { bookNav, mainNav } from "@/config/nav";
import { Link, usePathname } from "@/i18n/navigation";

export function Header() {
  const t = useTranslations("nav");
  const tActions = useTranslations("actions");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const otherLocale = locale === "ar" ? "en" : "ar";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,border-color,padding] duration-300 ${
          scrolled || open
            ? "border-b border-line bg-bg/90 py-2 backdrop-blur-md"
            : "border-b border-transparent py-4"
        }`}
      >
        <div className="container-x flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/" aria-label={t("home")} onClick={() => setOpen(false)} className="shrink-0">
            <Logo />
          </Link>

          <nav aria-label={t("menu")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="relative rounded-md px-3 py-2 text-sm text-muted transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:scale-x-0 after:bg-brand after:transition-transform hover:text-ink hover:after:scale-x-100 aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Below 400px the switch moves into the mobile menu so the header fits. */}
            <Link
              href={pathname}
              locale={otherLocale}
              aria-label={t("switchLocaleLabel")}
              className="hidden rounded-md px-2 py-2 text-sm text-muted transition-colors hover:text-ink min-[400px]:inline-block"
            >
              {t("switchLocale")}
            </Link>
            <RequestListButton />
            <Link
              href={bookNav.href}
              className="hidden rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover sm:inline-block"
            >
              {tActions("book")}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t("close") : t("menu")}
              className="grid size-10 place-items-center rounded-md border border-line text-ink lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[3.75rem] bottom-0 z-50 overflow-y-auto bg-bg lg:hidden"
        >
          <nav aria-label={t("menu")} className="container-x py-6">
            <ul className="divide-y divide-line border-y border-line">
              {[...mainNav, bookNav].map((item, i) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="flex items-center gap-4 py-4 font-display text-xl text-ink aria-[current=page]:text-brand"
                  >
                    <span className="font-sans text-xs text-brand tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={pathname}
              locale={otherLocale}
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex rounded-md border border-line px-4 py-2.5 text-sm text-ink min-[400px]:hidden"
            >
              {t("switchLocale")}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
