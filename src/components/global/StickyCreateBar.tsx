"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAccessControl } from "@/providers/AccessControlProvider";
import { useAuthStore } from "@/store/authStore";
import { isAuthRoute } from "@/lib/authRoutes";

const CREATE_ACTIONS = [
  {
    image: "/images/icons/one.png",
    title: "Create Post",
    subtitle: "Shared with everyone.",
    route: "/Createdpost",
    iconClass: "bg-blue-100 border-blue-300",
  },
  {
    image: "/images/icons/two.png",
    title: "Create Frames",
    subtitle: "Shared with everyone.",
    route: "/CreateFrames",
    iconClass: "bg-purple-100 border-purple-300",
  },
  {
    image: "/images/icons/three.png",
    title: "Create Personal Storage",
    subtitle: "Save before posting.",
    route: "/CreatePersonalStorage",
    iconClass: "bg-blue-100 border-blue-300",
  },
] as const;

export default function StickyCreateBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { executeWithCheck } = useAccessControl();
  const { token, isGuest, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) return null;
  if (isAuthRoute(pathname)) return null;
  if (!token && !isGuest) return null;

  const handleClick = (route: string) => {
    executeWithCheck(() => router.push(route), { isPendingAllowed: false });
  };

  return (
    <>
      <div aria-hidden className="h-[84px] shrink-0 md:h-[80px]" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-transparent px-2 pb-2 md:pb-2.5"
        aria-label="Quick create actions"
      >
        <div className="flex w-fit max-w-full items-stretch gap-1 rounded-full border border-gray-100 bg-white px-1.5 py-1.5 shadow-[0_-2px_20px_rgba(0,0,0,0.08)] md:gap-2 md:rounded-8xl md:px-2 md:py-2">
          {CREATE_ACTIONS.map((action) => {
            const isActive = pathname.startsWith(action.route);
            return (
              <button
                key={action.route}
                type="button"
                onClick={() => handleClick(action.route)}
                className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1 transition-all active:scale-[0.98] md:flex-row md:gap-2.5 md:rounded-2xl md:px-2.5 md:py-1.5 md:text-left ${
                  isActive
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border md:h-11 md:w-11 ${action.iconClass}`}
                >
                  <Image
                    src={action.image}
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 text-center md:text-left">
                  <p
                    className={`truncate text-[11px] font-bold leading-tight md:text-sm ${
                      isActive ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {action.title}
                  </p>
                  <p className="line-clamp-2 text-[9px] leading-tight text-gray-500 md:truncate md:text-xs">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
