"use client";

import { ChevronRight } from "lucide-react";
import { useAccessControl } from "@/providers/AccessControlProvider";
import { useAuthStore } from "@/store/authStore";
import { getNotificationSettingsApi, patchNotificationSettingsApi } from "@/services/settingsApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const NOTIF_QUERY_KEY = ["settings", "notifications"] as const;

export default function SettingsSidebar({ activeTab, setActiveTab }: any) {
  const { executeWithCheck } = useAccessControl();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Notification toggle state
  const { data, isLoading: notifLoading } = useQuery({
    queryKey: NOTIF_QUERY_KEY,
    queryFn: getNotificationSettingsApi,
  });

  const notifEnabled = Boolean(data?.data?.notification);

  const mutation = useMutation({
    mutationFn: (next: boolean) => patchNotificationSettingsApi({ notification: next }),
    onSuccess: (res) => {
      queryClient.setQueryData(NOTIF_QUERY_KEY, res);
    },
  });

  const toggleNotification = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mutation.isPending || notifLoading) return;
    mutation.mutate(!notifEnabled);
  };

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
    if (item === "Notifications") {
      // Notifications is handled inline — no tab navigation
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
      "App Walkthrough",
    ].includes(item);
    setActiveTab(item);
  };

  return (
    <div className="w-full md:w-[350px] shrink-0 h-auto flex flex-col gap-4">
      {menuItems.map((item) => {
        // ── Notifications — inline toggle row ──────────────────────────
        if (item === "Notifications") {
          return (
            <div
              key={item}
              className="group flex flex-shrink-0 items-center justify-between rounded-full px-5 md:px-6 py-2.5 md:py-4 bg-white border border-gray-100 md:border-none transition-all duration-300"
            >
              <span className="text-sm md:text-[15px] font-semibold text-gray-600 whitespace-nowrap">
                Notifications
              </span>

              {notifLoading || mutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-[#4F6EF7]" />
              ) : (
                <button
                  type="button"
                  onClick={toggleNotification}
                  aria-pressed={notifEnabled}
                  aria-label={notifEnabled ? "Disable notifications" : "Enable notifications"}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F6EF7] focus-visible:ring-offset-2 ${
                    notifEnabled ? "bg-[#4F6EF7]" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      notifEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>
          );
        }

        // ── Regular tab item ───────────────────────────────────────────
        return (
          <div
            key={item}
            onClick={() => handleTabClick(item)}
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
        );
      })}
    </div>
  );
}