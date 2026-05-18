import { NextResponse } from "next/server";
import { roleHomePath } from "@/types/roles";

const protectedRoutes = {
  "/admin": "admin",
  "/instructor": "instructor",
  "/student": "student",
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const routeRole = Object.entries(protectedRoutes).find(([route]) => pathname.startsWith(route));

  if (!routeRole) {
    return NextResponse.next();
  }

  const [, requiredRole] = routeRole;
  const userRole = request.cookies.get("session_role")?.value;

  if (!userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userRole !== requiredRole) {
    const fallback = roleHomePath[userRole] || "/login";
    return NextResponse.redirect(new URL(fallback, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/student/:path*"],
};
