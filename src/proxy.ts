import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/utils/auth";
// import { isPlatformInitialized, refreshPlatformState } from './utils/platform';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Define routes before fetching session
  const guestOnlyRoutes = ["/signin", "/signup"];
  const protectedRoutes = ["/dashboard", "/settings"];
  // const bootstrapRoutes = ['/setup', '/setup/verification-success'];

  const isGuestOnlyRoute = guestOnlyRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  // const isBootstrapRoute = bootstrapRoutes.some((route) =>
  //   pathname.startsWith(route)
  // );

  // if (!isPlatformInitialized() && !isBootstrapRoute) {
  //   const initialized = await refreshPlatformState();

  //   if (!initialized) {
  //     return NextResponse.redirect(new URL('/setup', request.url));
  //   }
  // }

  // if (isBootstrapRoute) {
  //   if (isPlatformInitialized()) {
  //     const url = new URL('/', request.url);
  //     return NextResponse.redirect(url);
  //   }
  // }

  if (!isGuestOnlyRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthenticated = !!session?.user;

  if (isGuestOnlyRoute && isAuthenticated) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      const url = new URL("/signin", request.url);
      url.searchParams.set("callbackURL", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
