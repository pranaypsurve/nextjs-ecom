import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@/lib/constants";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/products"];

// Admin-only routes
const adminRoutes = ["/admin"];

// Customer-only routes
const customerRoutes = ["/cart", "/checkout", "/orders"];

// Protected routes (require authentication)
const protectedRoutes = ["/profile", "/orders", "/checkout", "/cart"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie (future) or allow client-side check
  // For now, we'll let client-side ProtectedRoute handle it
  // This middleware serves as an additional layer

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, we rely on client-side ProtectedRoute component
  // In production with cookies, we would check token here and redirect
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

