"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Trash2, X, UserCircle2 } from "lucide-react";
import MoveToStorageModal from "../global/MoveToStorageModal";

interface PostOptionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  postId?: string;
  onSuccess?: () => void;
}

const PostOptionsMenu: React.FC<PostOptionsMenuProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  postId,
  onSuccess,
}) => {
  const [isMoveToStorageOpen, setIsMoveToStorageOpen] = useState(false);

  useEffect(() => {
    if (isOpen || isMoveToStorageOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMoveToStorageOpen]);

  if (!isOpen && !isMoveToStorageOpen) return null;

  const options = [
    {
      icon: <UserCircle2 className="w-5 h-5 text-blue-500" />,
      title: "Move to Personal Storage",
      desc: "Save before posting.",
      iconBg: "bg-blue-50",
      action: () => {
        if (postId) {
          setIsMoveToStorageOpen(true);
        } else {
          console.warn("No postId provided to PostOptionsMenu");
        }
      },
      danger: false,
    },
    {
      icon: <Trash2 className="w-5 h-5 text-red-500" />,
      title: "Delete Post",
      desc: "Remove this post permanently",
      iconBg: "bg-red-50",
      action: () => {
        onDelete();
        onClose();
      },
      danger: true,
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
            className="w-full max-w-[360px] bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#E9EFFF] py-4 px-5 flex items-center justify-between border-b border-white/50">
              <h3 className="text-md font-semibold text-gray-700">Post Options</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-white/60 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Options */}
            <div className="p-3 flex flex-col gap-1">
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={opt.action}
                  className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-left border border-transparent hover:border-gray-100"
                >
                  <div
                    className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center ${opt.iconBg} border border-white`}
                  >
                    {opt.icon}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`font-bold text-[14px] leading-tight ${opt.danger ? "text-red-600" : "text-gray-900"}`}
                    >
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
            onClose();
          }}
          postId={postId}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
};

export default PostOptionsMenu;
