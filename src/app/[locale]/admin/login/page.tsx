import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/admin/login-form";
import { DemoLogin } from "@/components/admin/demo-login";
import { LogoMark } from "@/components/brand/logo-mark";
import { isDemo } from "@/lib/demo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.login");
  return { title: t("title") };
}

export default async function LoginPage() {
  const t = await getTranslations("admin.login");
  return (
    <main className="hero-glow grid flex-1 place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-12 text-ink" />
          <h1 className="mt-5 text-2xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted">{t("lead")}</p>
        </div>
        {isDemo() && <DemoLogin />}
        <LoginForm />
      </div>
    </main>
  );
}
