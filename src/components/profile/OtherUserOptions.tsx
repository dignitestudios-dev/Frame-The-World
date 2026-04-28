"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Flag, UserMinus, ShieldAlert } from "lucide-react";
import ReportModal from "@/components/global/ReportModal";

interface OtherUserOptionsProps {
  userId: string;
}

const OtherUserOptions = ({ userId }: OtherUserOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white shadow-sm transition-all active:scale-90"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              setIsReportModalOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-orange-600 hover:bg-orange-50 transition-colors"
          >
            <Flag className="w-4 h-4" />
            Report User
          </button>
          
          <button
            disabled
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 cursor-not-allowed transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            Block User
          </button>
        </div>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        entityId={userId}
        entityType="User"
      />
    </div>
  );
};

export default OtherUserOptions;
