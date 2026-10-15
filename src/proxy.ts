import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { SESSION_COOKIE } from "./lib/auth/constants";

const intl = createMiddleware(routing);

// Optimistic check only: signed-out visitors go straight to the login page.
// The admin layout and every admin action verify the session for real.
export default function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(ar|en)\/admin(\/.*)?$/);
  if (match && match[2] !== "/login" && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL(`/${match[1]}/admin/login`, request.url));
  }
  return intl(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
