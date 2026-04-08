"use client";
import { ChevronRight } from "lucide-react";

const menuItems = [
  "Account Information",
  "Change Password",
  "Subscription",
  "Notifications",
  "App Walkthrough",
  "Delete Account",
  "Terms & Condition",
  "Privacy Policy",
];

export default function SettingsSidebar({ activeTab, setActiveTab }: any) {
  return (
    <div className="w-full md:w-90 h-auto md:h-[785px] flex md:flex-col gap-3 bg-gray-200/50 rounded-2xl md:rounded-3xl p-4 md:p-6 overflow-x-auto md:overflow-visible scrollbar-hidden">
      {menuItems.map((item) => (
        <div
          key={item}
          onClick={() => setActiveTab(item)}
          className={`group flex flex-shrink-0 cursor-pointer items-center justify-between rounded-full px-5 md:px-6 py-2.5 md:py-4 transition-all duration-300 
            ${
              activeTab === item
                ? "bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white shadow-md shadow-[#3B54F0]/20"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 md:border-none"
            }
          `}
        >
          <span className="text-sm md:text-[15px] font-semibold whitespace-nowrap">{item}</span>
          <ChevronRight 
            className={`hidden md:block h-5 w-5 transition-colors ${
                activeTab === item ? "text-white" : "text-[#4F6EF7]"
            }`} 
          />
        </div>
      ))}
    </div>
  );
}