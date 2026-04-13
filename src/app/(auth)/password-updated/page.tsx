"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";

export default function PasswordUpdatedPage() {
  const { clearAuthFlow, _hasHydrated } = useAuthStore();

  // Clear flow on unmount
  useEffect(() => {
    return () => {
      clearAuthFlow();
    };
  }, [clearAuthFlow]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[32em] animate-in fade-in zoom-in duration-700 bg-white p-10 rounded-lg">
      <div className="flex flex-col items-center justify-between min-h-[60vh] md:min-h-0 md:justify-center text-center px-4 md:px-0">
        
        <div className="flex flex-col items-center mt-12 md:mt-0">
          {/* Success Shield Icon */}
          <div className="mb-4 relative ">
            <Image
              src="/images/success-icon.png"
              alt="Success"
              width={100}
              height={100}
              className=""              
            />
          </div>

          {/* Title - Bold and Tracking Tight */}
          <h1 className="mb-4 text-3xl md:text-4xl font-[900] text-black tracking-tight">
            Password Updated!
          </h1>

          {/* Subtitle - Gray and clean */}
          <p className="text-[13px] md:text-base font-medium text-gray-500 leading-relaxed">
            Your new password has been updated successfully.<br />
            Back to Login Page.
          </p>
        </div>

        {/* Login Button - Positioned at bottom on mobile like screenshot */}
        <div className="w-full  md:mt-16 pb-10 md:pb-0 px-4 md:px-0">
          <Link href="/login" className="w-full">
            <Button className="w-full h-14 md:h-16 rounded-full bg-[#DEE7FF] text-[#3B54F0] font-bold text-lg hover:bg-[#D0DCFF] active:scale-[0.98] transition-all border-none">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
