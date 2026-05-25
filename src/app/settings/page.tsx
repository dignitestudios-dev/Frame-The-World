"use client";
import { JSX, useState } from "react";
import SettingsSidebar from "@/components/global/SettingsSidebar";
import ChangePassword from "@/components/global/ChangePassword";
import Header from "@/components/global/header";
import AccountInformation from "@/components/global/AccountInformation";
import Subscription from "@/components/global/Subscription";

import DeleteAccount from "@/components/global/DeleteAccount";
import TermsandConditions from "@/components/global/TermsandConditions";
import PrivacyPolicy from "@/components/global/PrivacyPolicy";
import OnboardingPage from "../(auth)/onboarding/page";
import AppWalkthrough from "@/components/global/AppWalkthrough";
import Badges from "@/components/global/Badges";
import CategoryPreferences from "@/components/global/CategoryPreferences";
import BlockedUsers from "@/components/global/BlockedUsers";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Account Information");
  
  const tabComponents: Record<string, JSX.Element> = {
    "Change Password": <ChangePassword />,
    "Set Password": <ChangePassword />,
    "Account Information": <AccountInformation />,
    "Category Preferences": <CategoryPreferences />,
    "Subscription": <Subscription />,

    "App Walkthrough": <AppWalkthrough />,
    "Delete Account": <DeleteAccount />,
    "Terms of Services": <TermsandConditions />,
    "Privacy Policy": <PrivacyPolicy />,
    "Badges": <Badges />,
  };
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 w-full max-w-[800px] mx-auto">
            {activeTab == "Change Password " || activeTab == "Set Password " ? (
              <ChangePassword />
            ) : activeTab === "Account Information" ? (
              <AccountInformation />
            ) : activeTab === "Category Preferences" ? (
              <CategoryPreferences />
            ) : activeTab === "Subscription" ? (
              <Subscription />

            ) : activeTab === "Blocked Users" ? (
              <BlockedUsers />
            ) : activeTab === "App Walkthrough" ? (
              <AppWalkthrough />
            ) : activeTab === "Delete Account" ? (
              <DeleteAccount />
            ) : activeTab === "Terms of Services" ? (
              <TermsandConditions />
            ) : activeTab === "Privacy Policy" ? (
              <PrivacyPolicy />
            ) : activeTab === "Badges" ? (
              <Badges />
            ) : (
              <div className="bg-white p-20 rounded-[32px] text-center font-bold text-gray-300">
                {activeTab} Content
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}