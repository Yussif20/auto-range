import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PasswordForm } from "@/components/admin/password-form";
import { PageHeader } from "@/components/admin/ui";
import { adminPage } from "@/lib/auth/session";

// Session-gated: allowed to block on navigation (see the panel layout).
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.nav");
  return { title: t("account") };
}

export default async function AccountPage() {
  const [t, admin] = await Promise.all([getTranslations("admin.account"), adminPage()]);
  return (
    <>
      <PageHeader title={t("title")} lead={admin.email} />
      <PasswordForm />
    </>
  );
}
