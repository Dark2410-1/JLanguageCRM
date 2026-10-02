import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "neo-tokyo-ultra-secret-key-jlanguage";
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  const path = req.nextUrl.pathname;

  // Protect all routes except login, register, api, static files
  const isPublicPath = path === "/login" || path === "/register" || path.startsWith("/api") || path.startsWith("/forgot-password") || path.startsWith("/reset-password");
  
  if (!sessionCookie) {
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, encodedKey, {
      algorithms: ["HS256"],
    });

    const role = payload.role as string;

    // Redirect authenticated users away from login/register
    if (isPublicPath && !path.startsWith("/api")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // RBAC: /crm/* and /admin/* are only for teacher or admin
    if (path.startsWith("/crm") || path.startsWith("/admin")) {
      if (role !== "teacher" && role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // All good
    return NextResponse.next();
  } catch (error) {
    // Invalid token
    if (!isPublicPath) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("session");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
