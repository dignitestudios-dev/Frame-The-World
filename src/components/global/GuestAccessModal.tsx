"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface GuestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuestAccessModal = ({ isOpen, onClose }: GuestAccessModalProps) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-shadow">
            Sign in to continue
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            To explore more frames, create your own memories, and access all features, please sign in or create an account.
          </p>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onClose();
                router.push("/login");
              }}
              className="w-full h-12 gradient-bg text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In / Sign Up
            </Button>
            {/* <Button
              onClick={() => {
                onClose();
                router.push("/signup");
              }}
              variant="outline"
              className="w-full h-12 border-2 border-blue-100 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Sign Up
            </Button> */}
            <button
              onClick={onClose}
              className="mt-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
            >
              Maybe later
            </button>

            <div className="mt-6 text-[11px] text-gray-400">
              By continuing, you agree to our{" "}
              <a 
                href="https://www.frametheworld.org/terms-of-service" 
                target="_blank" 
                className="text-blue-500 hover:underline font-medium"
              >
                Terms
              </a>{" "}
              &{" "}
              <a 
                href="https://www.frametheworld.org/privacy-policy" 
                target="_blank" 
                className="text-blue-500 hover:underline font-medium"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GuestAccessModal;
