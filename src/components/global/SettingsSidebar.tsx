import { ChevronRight } from "lucide-react";
import { useAccessControl } from "@/providers/AccessControlProvider";
import { useAuthStore } from "@/store/authStore";



export default function SettingsSidebar({ activeTab, setActiveTab }: any) {
  const { executeWithCheck } = useAccessControl();
  const { user } = useAuthStore();
  const menuItems = [
    "Account Information",
    "Category Preferences",
    "Subscription",
    "Notifications",
    "Badges",
    "Blocked Users",
    `${user?.isPasswordSet ? "Change Password" : "Set Password"} `,
    "Delete Account",
    "App Walkthrough",
    "Terms of Services",
    "Privacy Policy",
  ];
  const handleTabClick = (item: string) => {
    if (item === "Terms of Services") {
      window.open("https://www.frametheworld.org/terms-of-service", "_blank");
      return;
    }
    if (item === "Privacy Policy") {
      window.open("https://www.frametheworld.org/privacy-policy", "_blank");
      return;
    }


    // Only Account Information and legal docs are allowed for pending users in Settings
    const isAllowedForPending = [
      "Category Preferences",
      "Account Information",
      "Subscription",
      "Blocked Users",
      "Terms of Services",
      "Privacy Policy",
      "Change Password",
      "Set Password",
      "App Walkthrough"
    ].includes(item);
        setActiveTab(item);
  };

  return (
    <div className="w-full md:w-[350px] shrink-0 h-auto flex flex-col gap-4">
      {menuItems.map((item) => (
        <div
          key={item}
          onClick={() => handleTabClick(item)}
          className={`group flex flex-shrink-0 cursor-pointer items-center justify-between rounded-full px-5 md:px-6 py-2.5 md:py-4 transition-all duration-300 
            ${activeTab === item
              ? "bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white shadow-md shadow-[#3B54F0]/20"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 md:border-none"
            }
          `}
        >
          <span className="text-sm md:text-[15px] font-semibold whitespace-nowrap">{item}</span>
          <ChevronRight
            className={`hidden md:block h-5 w-5 transition-colors ${activeTab === item ? "text-white" : "text-[#4F6EF7]"
              }`}
          />
        </div>
      ))}
    </div>
  );
}