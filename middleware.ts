import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const path = req.nextUrl.pathname;

  // Allow access to /login page without authentication
  if (path === "/login") {
    return NextResponse.next();
  }

  // Redirect to login if no token and trying to access protected routes
  if (!token && (path.startsWith("/admin") || path.startsWith("/author"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin only area:
  if (path.startsWith("/admin")) {
    if (token?.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Author only area:
  if (path.startsWith("/author")) {
    if (token?.role !== "author") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/author/:path*"],
};
