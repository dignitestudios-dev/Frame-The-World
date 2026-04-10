"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function PasswordUpdatedPage() {
  const { authEmail, clearAuthFlow, _hasHydrated } = useAuthStore();

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
    <div className="w-full max-w-[32em] animate-in fade-in zoom-in duration-500">
      <div className="rounded-[2.5rem] bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col items-center">
        {/* Success Icon with Animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-green-100 rounded-full scale-150 opacity-20 animate-ping"></div>
          <div className="relative h-20 w-20 flex items-center justify-center bg-green-50 rounded-full">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-3xl font-black text-gray-900 tracking-tight">
          Success!
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-sm font-medium text-gray-500 leading-relaxed px-4">
          Your password has been updated
          {authEmail ? (
            <>
              {" "}for <span className="text-gray-900 font-bold">{authEmail}</span>.
            </>
          ) : (
            " successfully."
          )}
          {" "}You can now use your new password to log in.
        </p>

        {/* Login Button */}
        <Link href="/login" className="w-full">
          <Button className="w-full h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-base hover:opacity-90 transition-all shadow-xl shadow-blue-100">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
