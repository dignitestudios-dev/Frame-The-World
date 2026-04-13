"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { Button } from "../ui/button";

interface PendingProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PendingProfileModal = ({ isOpen, onClose }: PendingProfileModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[380px] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-center">
        
        {/* Header - Light Blue/Lavender */}
        <div className="h-44 bg-[#E9F0FF] flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-[#FF4D4C] flex items-center justify-center shadow-lg shadow-red-200">
            <Info className="w-12 h-12 text-white stroke-[3px]" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pb-10">
          <h2 className="text-2xl font-[900] text-black mb-3 tracking-tight">
            Verification Pending!
          </h2>
          <p className="text-gray-500 text-[15px] font-medium leading-relaxed mb-10 px-2">
            Your account is pending verification. Please wait for approval before accessing full features.
          </p>

          <Button
            onClick={onClose}
            className="w-full h-16 bg-gradient-to-r from-[#4A8AFF] to-[#0101FF] text-white font-black text-lg rounded-full hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all border-none shadow-lg shadow-blue-300"
          >
            OK
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PendingProfileModal;
