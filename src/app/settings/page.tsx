"use client";
import { useState } from "react";
import SettingsSidebar from "@/components/global/SettingsSidebar";
import ChangePassword from "@/components/global/ChangePassword";
import Header from "@/components/global/header";
import AccountInformation from "@/components/global/AccountInformation";
import Subscription from "@/components/global/Subscription";
import Notifications from "@/components/global/Notificatons";
import DeleteAccount from "@/components/global/DeleteAccount";
import TermsandConditions from "@/components/global/TermsandConditions";
import PrivacyPolicy from "@/components/global/PrivacyPolicy";
import OnboardingPage from "../(auth)/onboarding/page";
import AppWalkthrough from "@/components/global/AppWalkthrough";
import Badges from "@/components/global/Badges";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Account Information");

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          <main className="flex-1 w-full">
            {activeTab === "Change Password" ? (
              <ChangePassword />
            ) : activeTab === "Account Information" ? (
              <AccountInformation />
            ) : activeTab === "Subscription" ? (
              <Subscription />
            ) : activeTab === "Notifications" ? (
              <Notifications />
            ) : activeTab === "App Walkthrough" ? (
              <AppWalkthrough />
            ) : activeTab === "Delete Account" ? (
              <DeleteAccount />
            ) : activeTab === "Terms & Condition" ? (
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