"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BarChart3, Globe, Lock, Pin, Sparkles, Settings, LogOut, ChevronRight, FileText, Frame, FolderPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import NotificationModal from "./notification-modal";
import { Plus } from "lucide-react";


export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
const [isFrameType, setIsFrameType] = useState<"public" | "private" | "personal" | null>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

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
    { icon: Globe, label: "Public frames", hasArrow: true , func:()=> setIsFrameType("public"), title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Lock, label: "Private frames", hasArrow: true , func:()=> setIsFrameType("private"), title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Pin, label: "Personal Storage", hasArrow: true , func:()=> setIsFrameType("personal"), title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Sparkles, label: "AI Content generator", hasArrow: false, route: "/AiGenerator", title: "Create Post", subtitle: "Shared with everyone.", },
    { icon: Settings, label: "Settings", hasArrow: false, title: "Create Post", subtitle: "Shared with everyone.", route: "/settings" },
    { icon: LogOut, label: "Logout", hasArrow: false, isDestructive: true, title: "Create Post", subtitle: "Shared with everyone.", },
  ];

  const contentCards = [
    { image: "/images/icons/one.png", title: "Create Post", subtitle: "Shared with everyone.", color: "bg-blue-100" ,route: "/CreatedPost" },
    { image: "/images/icons/two.png", title: "Create Frames", subtitle: "Shared with everyone.", color: "bg-purple-100" ,route: "/CreateFrames" },
    { image: "/images/icons/three.png", title: "Create Personal Storage", subtitle: "Save before posting.", color: "bg-blue-100" ,route: "/CreatePersonalStorage" },
  ];
  const handleCardClick = (route: string) => {
  router.push(route);
  setIsMenuOpen(false);
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
const headerSubtitle = activeItem?.subtitle || "Welcome to your dashboard.";
  return (
    <>
      {/* Backdrop Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Title */}
          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="cursor-pointer"
            >
              <Image
                src="/images/menu.png"
                alt="Menu"
                height={50}
                width={50}
              />
            </button>

            <div>
              <h1 className="text-xl font-[800] text-gray-900">
  {headerTitle}
</h1>
<p className="text-[14px] text-black">
  {headerSubtitle}
</p>
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center gap-6">
            {/* User profile with level badge */}
            <div className="flex items-center gap-2">
              <Image
                src="/images/admin.png"
                alt="User"
                width={60}
                height={60}
                className="rounded-full"
              />
              <span className="font-medium text-sm text-gray-900">Leo Denzin</span>
              {/* Level Badge */}
              <div className="relative">
                <Image
                  src="/images/awarrd.png"
                  alt="Award"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
              </div>
            </div>

            {/* Search button */}
            <Link href="/search">
              <Image
                src="/images/search.png"
                alt="Search"
                height={50}
                width={50}
                className="cursor-pointer"
              />
            </Link>

            {/* Bell button */}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="cursor-pointer"
            >
              <Image
                src="/images/notifaction.png"
                alt="Notification"
                height={50}
                width={50}
              />
            </button>
          </div>
        </div>
      </header>

    

      {isMenuOpen && (
        <div 
          ref={megaMenuRef}
          className="sticky top-0 left-0 right-0 z-[60] bg-white rounded-b-3xl shadow-2xl border-b border-gray-200 animate-[slideDown_0.3s_ease-out]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-[30em]">
            {/* Left Sidebar */}


<div className="grid grid-cols-4 ">


            <div className="w-[20em] col-span-1 bg-gray-50 rounded-bl-3xl border-r border-gray-200 overflow-y-auto scrollbar-hidden">
              <div className="p-6 space-y-2">
                {sidebarItems.map((item, index) => {
                  const Icon = item.icon;
                  const handleClick = (e: React.MouseEvent) => {
                    e.stopPropagation(); // Prevent event bubbling
                    if (item.route) {
                      router.push(item.route);
                      setIsMenuOpen(false);
                    }
                    if (item.func) {
                      item.func();
                    }
                    // Menu stays open if no route is defined
                  };
                  
                  return (
                    <button
                      key={index}
                      onClick={handleClick}
                      className={`w-full flex items-center  justify-between px-4 py-3 text-left rounded-xl hover:bg-gray-100 transition-all ${item.isDestructive
                        ? "bg-red-50 hover:bg-red-100"
                        : ""
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-5 w-5 ${item.isDestructive ? "text-red-500" : "text-blue-600"
                            }`}
                        />
                        <span className={`font-medium text-sm ${item.isDestructive ? "text-red-600" : "text-gray-900"
                          }`}>
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


            <div className="w-[68em] col-span-3  flex flex-col items-center justify-center ">

              {/* Right Content Area */}
              <div className="flex-1 p-7 bg-white rounded-br-3xl flex items-start justify-center">
                <div className=" w-full flex items-center justify-center gap-6">
                  {/* Top Cards */}
                  <div className="flex gap-4 flex-1">
                    {contentCards.map((card, index) => {
                      return (
                        <button
                         onClick={() => handleCardClick(card.route)}

                          key={index}
                          className="flex-1 bg-[#FAFAFA] rounded-full p-0 items-center shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                        >
                          <div className="flex items-center text-left gap-0">
                            <div className="w-12 h-12 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center m-2">
                              <Image
                                src={card.image}
                                alt={card.title}
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-[14px] mb-0">{card.title}</h3>
                              <p className="text-[12px] text-gray-500">{card.subtitle}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* User Profile on Right */}
                 
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/admin.png"
                      alt="User"
                      width={70}
                      height={70}
                      className="rounded-full border-7 border-blue-600"
                      />
                  </div>



                </div>
              </div>

               {isFrameType === "public" ? (
               <div className=" flex flex-col justify-center items-center gap-4">
                  <div className="flex justify-center items-center gap-6">

                  {frames.map((frame) => (
                    <div
                    key={frame.id}
                    className="shrink-0 flex flex-col items-center "
                    >
                {/* Image Container */}
                <div className="relative w-[100px] h-[100px] rounded-[22px] overflow-hidden">
                  <Image
                    src={frame.image}
                    alt={frame.name}
                    fill
                    className="object-cover"
                    />
                </div>

                {/* Frame Name */}
                <p className="mt-2 text-xs text-center text-black">
                  {frame.name}
                </p>
              </div>
                  ))}
                  </div>
                  <button
  onClick={() => {
    router.push("/Profile");
    setIsMenuOpen(false);
    setIsFrameType(null);
  }}
  className="w-[90px] text-[16px] font-[500] bg-[#F5F5F5] py-1 rounded-full"
>
  See All
</button>
                </div>
                
              )  : isFrameType === "private" ? (
                <div className=" flex flex-col justify-center items-center gap-4">
                  <div className="flex justify-center items-center gap-6">

                  {frames.map((frame) => (
                    <div
                    key={frame.id}
                    className="shrink-0 flex flex-col items-center "
                    >
                {/* Image Container */}
                <div className="relative w-[100px] h-[100px] rounded-[22px] overflow-hidden">
                  <Image
                    src={frame.image}
                    alt={frame.name}
                    fill
                    className="object-cover"
                    />
                </div>

                {/* Frame Name */}
                <p className="mt-2 text-xs text-center text-black">
                  {frame.name}
                </p>
              </div>
                  ))}
                  </div>
                  <button className="w-[90px] text-[16px] font-[500] text-center bg-[#F5F5F5]  py-1 rounded-full text-black">See All</button>
                </div>

               ): isFrameType === "personal" ? (
                <div className=" flex flex-col justify-center items-center gap-4">
                  <div className="flex justify-center items-center gap-6">

                    {frames.map((frame) => (
              <div
                key={frame.id}
                className="flex-shrink-0 flex flex-col items-center"
              >
                {/* Image Container with Lock */}
                <div className="relative w-[120px] h-[120px] rounded-[24px] overflow-hidden shadow-[0_4px_10px_2px_rgba(0,0,0,0.25)]">
                  <Image
                    src={frame.image}
                    alt={frame.name}
                    fill
                    className="object-cover"
                  />

                  {/* Dark Overlay */}
                 
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      {/* Lock Icon with Plus */}
                      <div className="relative ">
                        <div className="w-[70px] h-[70px] backdrop-blur-2xl rounded-full bg-white/20 flex items-center justify-center">
                          <Image
                            src="/images/solarlock.png"
                            alt="Lock"
                            width={40}
                            height={40}
                            className="object-contain w-10 h-10"
                          />
                       
                          <Plus className="w-3 h-3 text-white stroke-3" />
                       
                        </div>
                      </div>
                    </div>
              
                </div>

                {/* Frame Name */}
                <p className="mt-2 text-xs text-center text-black font-medium">
                  {frame.name}
                </p>
              </div>
            ))}
                  </div>
                  <button  className="w-[90px] text-[16px] font-[500] text-center bg-[#F5F5F5]  py-1 rounded-full text-black">See All</button>
                </div>
               ): (
                <div className="w-full flex justify-center items-center  bottom-0 ">
                  <div className="w-full flex items-center justify-center ">

                <Image
                  src="/images/menuimage.png"
                  alt="Notification"
                  height={860}
                  width={860}
                  />
                
                  </div>
                </div>
              )}

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
