// components/OptionsModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Lock, Plus, UserCircle2, XCircle } from "lucide-react";
import MoveToStorageModal from "./MoveToStorageModal";

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  onSuccess?: () => void;
}

const OptionsModal = ({ isOpen, onClose, postId, onSuccess }: OptionsModalProps) => {
  const [isMoveToStorageOpen, setIsMoveToStorageOpen] = useState(false);

  // Prevent background scrolling when modal is active
  useEffect(() => {
    if (isOpen || isMoveToStorageOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, isMoveToStorageOpen]);

  if (!isOpen && !isMoveToStorageOpen) return null;

  const handleMoveToStorage = () => {
    if (!postId) {
      console.warn("No postId provided to OptionsModal");
      return;
    }
    setIsMoveToStorageOpen(true);
  };

  const options = [
    {
      icon: <Lock className="w-5 h-5 text-gray-500" />,
      title: "Move to Frame",
      desc: "Move picture to different frame",
      iconBg: "bg-blue-50/50",
      onClick: () => console.log("Move to Frame"),
    },
    {
      icon: <Plus className="w-6 h-6 text-blue-600" />,
      title: "Create New Frame & Add",
      desc: "Start a new frame for this memory.",
      iconBg: "bg-blue-50",
      onClick: () => console.log("Create New Frame"),
    },
    {
      icon: <UserCircle2 className="w-6 h-6 text-blue-500" />,
      title: "Move to Personal Storage",
      desc: "Save before posting.",
      iconBg: "bg-blue-50",
      onClick: handleMoveToStorage,
    },
    {
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      title: "Delete",
      desc: "Remove from frames permanently",
      iconBg: "bg-red-50",
      onClick: () => console.log("Delete"),
    },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 transition-all"
          onClick={onClose}
        >
          <div 
            className="w-full max-w-[400px] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Light Blue Header */}
            <div className="bg-[#E9EFFF] py-4 text-center border-b border-white/50">
              <h3 className="text-lg font-medium text-gray-700">Options</h3>
            </div>

            {/* List of Options */}
            <div className="p-3 flex flex-col gap-1">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    opt.onClick?.();
                    if (opt.title !== "Move to Personal Storage") {
                      onClose();
                    }
                  }}
                  className="flex items-center border-b pb-3 border-gray-100 gap-4 w-full p-3 hover:bg-gray-50  transition-colors text-left group"
                >
                  <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border border-white ${opt.iconBg}`}>
                    {opt.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-[14px] leading-tight">
                      {opt.title}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {opt.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {postId && (
        <MoveToStorageModal
          isOpen={isMoveToStorageOpen}
          onClose={() => {
            setIsMoveToStorageOpen(false);
            onClose(); // Also close the options modal
          }}
          postId={postId}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default OptionsModal;