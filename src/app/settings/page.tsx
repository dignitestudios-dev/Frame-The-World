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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Change Password");

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />
      <div className="max-w-[1280px] mx-auto px-8 py-10">
        <div className="flex gap-10 items-start">
          <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="flex-1">
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
             ): activeTab === "Delete Account" ? (
               <DeleteAccount />
             ) : activeTab === "Terms & Condition" ? (
               <TermsandConditions />
             ): activeTab === "Privacy Policy" ? (
               <PrivacyPolicy />
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