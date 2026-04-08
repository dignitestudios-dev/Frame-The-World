import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Define Routes
const PUBLIC_ROUTES = ["/login", "/signup", "/forget-password"];
const ONBOARDING_ROUTES = ["/verify-credentials", "/create-profile", "/category-preference"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isGuest = request.cookies.get("isGuest")?.value;
  const isProfileCompleted = request.cookies.get("isProfileCompleted")?.value === "true";
  const { pathname } = request.nextUrl;

  // 2. Logic for Guest Users
  if (isGuest) {
    // If guest tries to access login/signup/onboarding, redirect to home
    if (PUBLIC_ROUTES.includes(pathname) || ONBOARDING_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // 3. Logic for Logged In Users
  if (token) {
    // If profile is NOT completed
    if (!isProfileCompleted) {
      // Allow them to stay on onboarding routes
      if (ONBOARDING_ROUTES.includes(pathname)) {
        return NextResponse.next();
      }
      // Redirect from public routes or protected routes to the first step of onboarding
      // Note: In a more complex app, we might check exactly which step they are on.
      // For now, if they aren't on an onboarding route, pick one.
      if (pathname === "/login" || pathname === "/signup" || !ONBOARDING_ROUTES.includes(pathname)) {
        // Only redirect if trying to access restricted areas
        const isAccessingRestricted = ["/home", "/Profile", "/settings", "/login", "/signup"].some(p => pathname.startsWith(p));
        if (isAccessingRestricted) {
          return NextResponse.redirect(new URL("/verify-credentials", request.url));
        }
      }
    } 
    // If profile IS completed
    else {
      // Redirect away from login/signup/onboarding to home
      if (PUBLIC_ROUTES.includes(pathname) || ONBOARDING_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    }
  }

  // 4. Logic for Unauthenticated Users
  if (!token && !isGuest) {
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!isPublic) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// 4. Configure Matcher
// Match all paths except:
// - api routes
// - _next routes (static, image, etc)
// - favicon.ico
// - public images/assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
