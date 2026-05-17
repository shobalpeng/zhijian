import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "zhijian-session";

const PUBLIC_PATHS = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has(SESSION_COOKIE_NAME);

  // Check if the current path is public
  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  // On public paths: if logged in, redirect to home
  if (isPublicPath && hasSession) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // On protected paths: if not logged in, redirect to login
  if (!isPublicPath && !hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (they handle their own auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt (public assets)
     * - Static files with extensions (.svg, .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|.*\\..*).*)",
  ],
};
