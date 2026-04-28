"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

const SuccessModal = ({
  isOpen,
  onClose,
  title,
  description,
}: SuccessModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[340px] bg-white rounded-[28px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Top Header Background */}
        <div className="h-[120px] bg-[#E8EFFF] w-full flex items-center justify-center relative">
          <div className="w-[68px] h-[68px] rounded-full bg-[#D4E2FF] border-[3px] border-[#B8CDFF] flex items-center justify-center">
            <Check className="w-8 h-8 text-[#4F6EF7]" strokeWidth={3} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="text-[20px] capitalize font-bold text-black mb-2">
            {title}
          </h2>
          <p className="text-[15px] text-gray-500 mb-6">
            {description}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#5D92F3] to-[#3B54F0] text-white font-bold text-lg shadow-[0_10px_20px_rgba(59,84,240,0.3)] hover:scale-[1.02] transition-transform"
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SuccessModal;
