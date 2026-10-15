import "server-only";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "./constants";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters).");
  return new TextEncoder().encode(value);
}

type SessionPayload = { sub: string };

export async function createSession(userId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload.sub ? { sub: payload.sub } : null;
  } catch {
    return null;
  }
}

/** The signed-in admin, or null. Checks the user still exists. */
export async function getAdmin() {
  const session = await readSession();
  if (!session) return null;
  return db.adminUser.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true },
  });
}

/** For admin pages and every admin server action: redirects to login when signed out. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect({ href: "/admin/login", locale: await getLocale() });
  return admin!;
}

/**
 * First line of every admin page. Pages render separately from their layout,
 * so each one checks the session itself rather than trusting the layout.
 */
export async function adminPage() {
  return requireAdmin();
}
