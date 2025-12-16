import { NextResponse } from "next/server";

export function proxy(req) {
  const token = req?.cookies?.get("current_user")?.value;
  const pathname = req.nextUrl.pathname;

  const user_data = token ? JSON.parse(token) : null;

  const authRoutes = ["/login"]
  if (token && authRoutes.includes(pathname)) {
    if (user_data.role === "user") {
      return NextResponse.redirect(new URL("/", req.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  const publicRoutes = ["/login", "/about-us", "/terms-and-conditions", "/privacy-policy", "/contact-us", "/categories", "/forgot-password", "/reset-password"]

  if (publicRoutes.includes(pathname) || pathname.split("/").includes("user")) {
    return NextResponse.next(); // allow without checking token
  }

  // If token exists & user tries to visit login/signup → redirect
  if (token && (pathname === "/login" || pathname === "/sign-up")) {
    try {
      const user = JSON.parse(token);
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    } catch (error) {
      // Invalid token format
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect admin routes - only allow admin users
  if (pathname.startsWith("/admin/")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const user = JSON.parse(token);
      if (user.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      // Invalid token format
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Allow public access to category offers
  if (pathname.match(/^\/offers\/\d+$/)) {
    return NextResponse.next();
  }

  // Protect shop owner routes - block admin users
  const shopOwnerRoutes = [
    "/dashboard",
    "/branches",
    "/offers",
    "/profile",
    "/promotions",
  ];

  if (shopOwnerRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const user = JSON.parse(token);
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    } catch (error) {
      // Invalid token format
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/about-us",
    "/terms-and-conditions",
    "/privacy-policy",
    "/user/offers/:path*",
    "/user/offer-details/:path*",
    "/categories",
    "/sign-up",
    "/business-details",
    "/admin/:path*",
    "/dashboard",
    "/branches",
    "/offers",
    "/profile",
    "/promotions"
  ],
};
