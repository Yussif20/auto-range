"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createSession, deleteSession, requireAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { isDemo } from "@/lib/demo";
import { DEMO_ADMIN_EMAIL } from "../../../../prisma/seed/run";

// Compared against when the email is unknown, so timing doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("timing-equaliser", 12);

const loginSchema = z.object({
  locale: z.enum(routing.locales),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});

export type LoginState = { error?: "invalid"; email?: string } | undefined;

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  const email = String(form.get("email") ?? "").slice(0, 200);
  if (!parsed.success) return { error: "invalid", email };
  const { locale, password } = parsed.data;

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { error: "invalid", email };

  await createSession(user.id);
  redirect({ href: "/admin", locale });
}

// Public demo only: signs in as the shared demo account without a password.
export async function demoLogin(locale: string) {
  if (!isDemo()) return;
  const user = await db.adminUser.findUnique({ where: { email: DEMO_ADMIN_EMAIL } });
  if (!user) return;
  await createSession(user.id);
  redirect({ href: "/admin", locale: routing.locales.includes(locale as "ar" | "en") ? locale : routing.defaultLocale });
}

export async function logout(locale: string) {
  await deleteSession();
  redirect({ href: "/admin/login", locale });
}

const passwordSchema = z
  .object({
    current: z.string().min(1),
    next: z.string().min(10).max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"] });

export type PasswordState = { ok?: true; error?: "current" | "short" | "mismatch" | "demo" } | undefined;

export async function changePassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const admin = await requireAdmin();
  if (isDemo()) return { error: "demo" };
  const parsed = passwordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.path[0] === "confirm" ? "mismatch" : "short" };
  }
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(parsed.data.current, user.passwordHash))) return { error: "current" };

  await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.next, 12) },
  });
  return { ok: true };
}
