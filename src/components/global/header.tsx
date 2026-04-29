"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart3, Globe, Lock, Pin, Sparkles, Settings, LogOut, ChevronRight, FileText, Frame, FolderPlus, CloudCog } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationModal from "./notification-modal";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { logoutApi } from "@/services/authApi";
import { useAccessControl } from "@/providers/AccessControlProvider";

export default function Header({ title, subtitle }: { title?: string, subtitle?: string }) {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isFrameType, setIsFrameType] = useState<"public" | "private" | "personal" | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const { executeWithCheck } = useAccessControl();

  const { mutate: logoutMutate } = useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      logout();
      router.push("/login");
      setIsMenuOpen(false);
    },
  });

  const handleLogout = () => {
    logoutMutate();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        megaMenuRef.current &&
        !megaMenuRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isNotificationOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isNotificationOpen]);

  const sidebarItems = [
    { icon: Home, label: "Home", hasArrow: false, route: "/home", title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: BarChart3, label: "Leader Board", hasArrow: false, route: "/Leaderboard", title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Globe, label: "Public frames", hasArrow: true, route: "/Profile?tab=frames&visibility=public", func: () => setIsFrameType("public"), title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Lock, label: "Private frames", hasArrow: true, route: "/Profile?tab=frames&visibility=private", func: () => setIsFrameType("private"), title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Pin, label: "Personal Storage", hasArrow: true, route: "/Profile?tab=space", func: () => setIsFrameType("personal"), title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Sparkles, label: "AI Content generator", hasArrow: false, route: "/AiGenerator", title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Settings, label: "Settings", hasArrow: false, title: "Create Post", subtitle: "Shared with everyone.", route: "/settings" },
    {
      icon: LogOut,
      label: "Logout",
      hasArrow: false,
      isDestructive: true,
      title: "Create Post",
      subtitle: "Shared with everyone.",
      func: handleLogout
    },
  ];


  const contentCards = [
    { image: "/images/icons/one.png", title: "Create Post", subtitle: "Shared with everyone.", color: "bg-blue-100", route: "/Createdpost" },
    { image: "/images/icons/two.png", title: "Create Frames", subtitle: "Shared with everyone.", color: "bg-purple-100", route: "/CreateFrames" },
    { image: "/images/icons/three.png", title: "Create Personal Storage", subtitle: "Save before posting.", color: "bg-blue-100", route: "/CreatePersonalStorage" },
  ];
  const handleCardClick = (route: string) => {
    // Content cards like "Create Post" are restricted for pending users
    executeWithCheck(() => {
      router.push(route);
      setIsMenuOpen(false);
    }, { isPendingAllowed: false });
  };
  const frames = [
    {
      id: 1,
      image: "/images/1.jpg", // Replace with your image URL
      name: "Frame name here",
    },
    {
      id: 2,
      image: "/images/2.jpg", // Replace with your image URL
      name: "Frame name here",
    },
    {
      id: 3,
      image: "/images/3.jpg", // Replace with your image URL
      name: "Frame name here",
    },
    {
      id: 4,
      image: "/images/4.jpg", // Replace with your image URL
      name: "Frame name here",
    },
    {
      id: 3,
      image: "/images/3.jpg", // Replace with your image URL
      name: "Frame name here",
    },
    {
      id: 1,
      image: "/images/5.jpg", // Replace with your image URL
      name: "Frame name here",
    },
    {
      id: 2,
      image: "/images/1.jpg", // Replace with your image URL
      name: "Frame name here",
    },

  ];
  const pathname = usePathname();

  const activeItem = sidebarItems.find(
    (item) => item.route?.toLowerCase() === pathname.toLowerCase()
  );

  const headerTitle = activeItem?.label || "Dashboard";
  const headerSubtitle = activeItem?.subtitle || "";
  console.log(user, "user---response")
  return (
    <>
      {/* Backdrop Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 md:px-8 py-3 md:py-4 transition-all">
        <div className="flex items-center justify-between max-w-[1440px] mx-auto">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-3 md:gap-4 relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="cursor-pointer active:scale-95 transition-transform"
            >
              <Image
                src="/images/menu.png"
                alt="Menu"
                height={40}
                width={40}
                className="md:w-[50px] md:h-[50px]"
              />
            </button>

            <div className="overflow-hidden">
              <h1 className="text-lg md:text-xl font-[800] text-gray-900 truncate">
                {title || headerTitle}
              </h1>
              <p className="text-[12px] md:text-[14px] text-black xs:block truncate">
                {subtitle || headerSubtitle}
              </p>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center gap-8 md:gap-12">
            {/* User profile with level badge */}
            <div className="flex items-center gap-2">
              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => executeWithCheck(() => router.push("/Profile"), { isPendingAllowed: true })}
              >
                <div className="relative">
                  <Image
                    src={user?.profilePicture?.location || user?.profilePicture || "/images/person.png"}
                    alt="User"
                    width={36}
                    height={36}
                    className="rounded-full cursor-pointer object-cover h-[36px] md:w-[40px] md:h-[40px] border border-gray-100"
                  />
                </div>
                <span className="font-semibold text-xs md:text-sm text-gray-900 hidden sm:block truncate max-w-[100px]">
                  {user?.name || "User"}
                </span>
              </div>

              {/* Level Badge - Hide on tiny screens */}
              {/* <div className="relative">
                <Image
                  src="/images/awarrd.png"
                  alt="Award"
                  width={30}
                  height={30}
                  className="rounded-full md:w-[36px] md:h-[36px]"
                />
              </div> */}
            </div>
            <div className="flex items-center gap-6" >


              {/* Search button */}
              <button
                onClick={() => router.push("/search")}
                className="active:scale-90 transition-transform"
              >
                <Image
                  src="/images/search.png"
                  alt="Search"
                  height={40}
                  width={40}
                  className="md:w-[50px] md:h-[50px]"
                />
              </button>

              {/* Bell button */}
              <button
                onClick={() => executeWithCheck(() => setIsNotificationOpen(!isNotificationOpen), { isPendingAllowed: false })}
                className="cursor-pointer active:scale-90 transition-transform"
              >
                <Image
                  src="/images/notifaction.png"
                  alt="Notification"
                  height={40}
                  width={40}
                  className="md:w-[50px] md:h-[50px]"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          ref={megaMenuRef}
          className="fixed md:sticky top-16 md:top-20 left-0 right-0 z-[60] bg-white rounded-b-3xl shadow-2xl border-b border-gray-200 animate-[slideDown_0.3s_ease-out] overflow-y-auto max-h-[90vh] md:max-h-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col md:flex-row min-h-auto md:h-[32em]">
            {/* Left Sidebar */}
            <div className="w-full md:w-[20em] bg-gray-50 md:rounded-bl-3xl border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto scrollbar-hidden shrink-0">
              <div className="p-4 md:p-6 space-y-1 md:space-y-2">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    if (item.label === "Logout") {
                      if (item.func) item.func();
                      return;
                    }
                    if (item.label === "Home" || item.label === "Leader Board") {
                      if (item.route) {
                        router.push(item.route);
                        setIsMenuOpen(false);
                      }
                      return;
                    }
                    executeWithCheck(() => {
                      if (item.route) {
                        router.push(item.route);
                        setIsMenuOpen(false);
                      }
                      if (item.func) item.func();
                    }, { isPendingAllowed: item.label === "Settings" || item.label === "Home" });
                  };

                  return (
                    <button
                      key={index}
                      onClick={handleClick}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl hover:bg-gray-100 transition-all ${item.isDestructive ? "bg-red-50/50 hover:bg-red-100" : ""
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-5 w-5 ${item.isDestructive ? "text-red-500" : "text-blue-600"}`}
                        />
                        <span className={`font-semibold text-sm ${item.isDestructive ? "text-red-600" : "text-gray-900"}`}>
                          {item.label}
                        </span>
                      </div>
                      {item.hasArrow && (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white md:rounded-br-3xl overflow-hidden min-h-[300px]">
              <div className="w-full p-4 md:p-7 flex flex-col h-full">
                {/* Top Action Cards */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    {contentCards.map((card, index) => {
                      return (
                        <button
                          onClick={() => handleCardClick(card.route)}
                          key={index}
                          className="flex-1 bg-[#FAFAFA] rounded-xl sm:rounded-full p-2 items-center shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 group"
                        >
                          <div className="flex items-center text-left gap-3  sm:gap-1">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                              <Image
                                src={card.image}
                                alt={card.title}
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                            </div>
                            <div className="pr-2 ml-2">
                              <h3 className="font-bold text-gray-900 text-xs md:text-sm">{card.title}</h3>
                              <p className="text-[10px] md:text-[12px] text-gray-500 line-clamp-1">{card.subtitle}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Profile Picture (visible on Desktop/Tablet) */}
                  <div className="hidden md:flex shrink-0 items-center justify-center">
                    <Image
                      src={user?.profilePicture?.location || user?.profilePicture || "/images/person.png"}
                      alt="User"
                      width={50}
                      height={50}
                      className="rounded-full border-[3px] border-blue-600 object-cover h-[50px] w-[50px]"
                    />
                  </div>
                </div>

                {/* Main Dynamic Content Area */}
                <div className="flex-1 flex flex-col justify-center">
                  {isFrameType ? (
                    <div className="flex flex-col items-center gap-4 py-4">
                      {/* Horizontally scrollable frames preview on mobile */}
                      <div className="w-full overflow-x-auto scrollbar-hidden pb-2">
                        <div className="flex md:justify-center items-center gap-4 md:gap-6 px-4 md:px-0">
                          {frames.map((frame, idx) => (
                            <div key={`${frame.id}-${idx}`} className="shrink-0 flex flex-col items-center">
                              <div className={`relative ${isFrameType === 'personal' ? 'w-[100px] h-[100px] md:w-[120px] md:h-[120px]' : 'w-[80px] h-[80px] md:w-[100px] md:h-[100px]'} rounded-[20px] md:rounded-[24px] overflow-hidden shadow-md group`}>
                                <Image
                                  src={frame.image}
                                  alt={frame.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                                {isFrameType === "personal" && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-10 h-10 md:w-14 md:h-14 backdrop-blur-md rounded-full bg-white/20 flex items-center justify-center">
                                      <Image src="/images/solarlock.png" alt="Lock" width={20} height={20} className="md:w-6 md:h-6" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="mt-2 text-[10px] md:text-xs text-center text-black font-medium truncate w-[80px] md:w-[100px]">
                                {frame.name}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const tab = isFrameType === "personal" ? "space" : "frames";
                          const visibility = isFrameType === "private" ? "private" : "public";
                          const route = tab === "space" ? "/Profile?tab=space" : `/Profile?tab=frames&visibility=${visibility}`;
                          router.push(route);
                          setIsMenuOpen(false);
                          setIsFrameType(null);
                        }}
                        className="px-8 py-2 text-sm font-semibold bg-[#F5F5F5] hover:bg-gray-200 transition-colors rounded-full"
                      >
                        See All
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center min-h-[200px]">
                      <div className="relative w-full max-w-full px-6">
                        <Image
                          src="/images/menuimage.png"
                          alt="Menu Preview"
                          height={1000}
                          width={1000}
                          className="object-contain w-full drop-shadow-2xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </>
  );
}
