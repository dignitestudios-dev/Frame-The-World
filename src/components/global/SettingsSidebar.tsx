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
    <div className="w-90 h-[785px] space-y-3 bg-gray-200/50 rounded-3xl p-6">
      {menuItems.map((item) => (
        <div
          key={item}
          onClick={() => setActiveTab(item)}
          className={`group flex cursor-pointer items-center justify-between rounded-full px-6 py-4 transition-all duration-300 
            ${
              activeTab === item
                ? "bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }
          `}
        >
          <span className="text-[15px] font-semibold">{item}</span>
          <ChevronRight 
            className={`h-5 w-5 transition-colors ${
                activeTab === item ? "text-white" : "text-[#4F6EF7]"
            }`} 
          />
        </div>
      ))}
    </div>
  );
}