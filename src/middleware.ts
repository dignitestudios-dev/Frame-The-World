import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Define Routes
const PUBLIC_ROUTES = ["/login", "/signup", "/forget-password", "/otp-verification", "/create-password", "/password-updated"];
const ONBOARDING_ROUTES = ["/verify-credentials", "/create-profile", "/category-preference"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isGuest = request.cookies.get("isGuest")?.value === "true";
  const isProfileCompleted = request.cookies.get("isProfileCompleted")?.value === "true";
  const { pathname } = request.nextUrl;

  // 1. Allow public routes to always be accessible
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Guest Logic - Allow guests to visit everything except possibly restricted profile/onboarding areas
  if (isGuest) {
     // If guest tries to access login/signup/onboarding, it's allowed but usually they'd stay on home
     return NextResponse.next();
  }

  // 3. Authentication Check
  if (!token || token === "undefined") {
    // Redirect to login if not a guest and not on a public route
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Onboarding Check (for logged-in users)
  if (!isProfileCompleted) {
    // If not on an onboarding route, redirect to the start of onboarding
    if (!ONBOARDING_ROUTES.includes(pathname)) {
      const isAccessingRestricted = ["/home", "/Profile", "/settings"].some(p => pathname.startsWith(p));
      if (isAccessingRestricted) {
        return NextResponse.redirect(new URL("/create-profile", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
