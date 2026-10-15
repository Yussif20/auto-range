"use client";

import clsx from "clsx";
import {
  CalendarCheck,
  Car,
  ClipboardList,
  Cog,
  ExternalLink,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Package,
  Shapes,
  UserRound,
  Wrench,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useState } from "react";
import { logout } from "@/app/actions/admin/auth";
import { LogoMark } from "@/components/brand/logo-mark";
import { Link, usePathname } from "@/i18n/navigation";

const groups = [
  {
    key: "operations",
    items: [
      { href: "/admin", key: "dashboard", icon: LayoutDashboard },
      { href: "/admin/bookings", key: "bookings", icon: CalendarCheck },
      { href: "/admin/requests", key: "requests", icon: ClipboardList },
      { href: "/admin/messages", key: "messages", icon: Inbox },
    ],
  },
  {
    key: "catalog",
    items: [
      { href: "/admin/parts", key: "parts", icon: Package },
      { href: "/admin/categories", key: "categories", icon: Shapes },
      { href: "/admin/services", key: "services", icon: Wrench },
      { href: "/admin/models", key: "models", icon: Car },
    ],
  },
  {
    key: "content",
    items: [
      { href: "/admin/reviews", key: "reviews", icon: MessageSquareQuote },
      { href: "/admin/faqs", key: "faqs", icon: HelpCircle },
    ],
  },
  {
    key: "system",
    items: [
      { href: "/admin/settings", key: "settings", icon: Cog },
      { href: "/admin/account", key: "account", icon: UserRound },
    ],
  },
] as const;

// usePathname() is URL data, so it lives behind its own Suspense boundary;
// the fallback renders the same links without the active highlight.
function PathAwareNav({ onNavigate }: { onNavigate: () => void }) {
  return <NavBody pathname={usePathname()} onNavigate={onNavigate} />;
}

function NavBody({ pathname, onNavigate }: { pathname: string | null; onNavigate: () => void }) {
  const t = useTranslations("admin.nav");
  const locale = useLocale();
  const otherLocale = locale === "ar" ? "en" : "ar";

  const isActive = (href: string) =>
    pathname != null && (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <nav aria-label={t("label")} className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 px-3 text-[0.65rem] font-semibold tracking-[0.2em] text-muted/70 uppercase">
            {t(`groups.${group.key}`)}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ href, key, icon: ItemIcon }) => (
              <li key={key}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={isActive(href) ? "page" : undefined}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-ink aria-[current=page]:bg-brand/10 aria-[current=page]:text-ink"
                >
                  <ItemIcon className="size-4 shrink-0" />
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto space-y-0.5 border-t border-line pt-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          <ExternalLink className="size-4" />
          {t("viewSite")}
        </Link>
        <Link
          href={pathname ?? "/admin"}
          locale={otherLocale}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
        >
          <span className="grid size-4 place-items-center text-[0.6rem] font-bold">{otherLocale.toUpperCase()}</span>
          {t("switchLocale")}
        </Link>
        <form action={logout.bind(null, locale)}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-ink"
          >
            <LogOut className="size-4 rtl:rotate-180" />
            {t("logout")}
          </button>
        </form>
      </div>
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin.nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const nav = (
    <Suspense fallback={<NavBody pathname={null} onNavigate={close} />}>
      <PathAwareNav onNavigate={close} />
    </Suspense>
  );

  return (
    <div className="flex min-h-dvh flex-1">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e border-line bg-surface lg:flex">
        <div className="flex items-center gap-2.5 border-b border-line px-6 py-5">
          <LogoMark className="size-7 text-ink" />
          <span className="font-display text-sm font-bold tracking-[0.15em] uppercase">
            Auto <span className="text-brand">Range</span>
          </span>
        </div>
        {nav}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label={t("close")} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 start-0 flex w-72 flex-col border-e border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <LogoMark className="size-7 text-ink" />
              <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid size-9 place-items-center rounded-md text-muted">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("open")}
            className="grid size-10 place-items-center rounded-md border border-line"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-sm font-bold tracking-[0.15em] uppercase">
            Auto <span className="text-brand">Range</span>
          </span>
        </header>
        <main className={clsx("mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-10")}>{children}</main>
      </div>
    </div>
  );
}
