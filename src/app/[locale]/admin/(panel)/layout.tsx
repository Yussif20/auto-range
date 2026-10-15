import { Suspense } from "react";
import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/auth/session";

// Every admin page reads the session, so it renders per request rather than
// from a prefetched shell (Next's recommended opt-out for authenticated areas).
export const instant = false;

// The shell is static; everything under it waits for the session check,
// so no admin data is read before the visitor is verified.
export default function PanelLayout({ children }: LayoutProps<"/[locale]/admin">) {
  return (
    <AdminShell>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl border border-line bg-surface" />}>
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </AdminShell>
  );
}

async function AuthGate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
