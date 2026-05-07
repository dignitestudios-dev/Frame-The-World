/** Routes where the sticky create bar must not appear (login, signup, onboarding). */
export const AUTH_ROUTE_PREFIXES = [
  "/login",
  "/signup",
  "/forget-password",
  "/create-password",
  "/otp-verification",
  "/password-updated",
  "/verify-credentials",
  "/create-profile",
  "/category-preference",
  "/onboarding",
  "/subscription",
  "/review-plan",
  "/setup-completed",
] as const;

export function isAuthRoute(pathname: string): boolean {
  const path = pathname.split("?")[0];
  return AUTH_ROUTE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}
