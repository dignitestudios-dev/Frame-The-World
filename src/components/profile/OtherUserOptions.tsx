"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, Flag, UserMinus, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import ReportModal from "@/components/global/ReportModal";
import BlockConfirmModal from "@/components/global/BlockConfirmModal";
import { toggleBlockUserApi } from "@/services/blocksApi";
import { Toast } from "@/components/ui/toast";

interface OtherUserOptionsProps {
  userId: string;
  isBlocked?: boolean;
  onBlockStatusChange?: (isBlocked: boolean) => void;
}

const OtherUserOptions = ({
  userId,
  isBlocked = false,
  onBlockStatusChange,
}: OtherUserOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [currentBlockStatus, setCurrentBlockStatus] = useState(isBlocked);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
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

  const blockMutation = useMutation({
    mutationFn: () => toggleBlockUserApi(userId),
    onSuccess: () => {
      const newBlockStatus = !currentBlockStatus;
      setCurrentBlockStatus(newBlockStatus);
      onBlockStatusChange?.(newBlockStatus);
      
      setToastMessage(
        newBlockStatus ? "User blocked successfully" : "User unblocked successfully"
      );
      setToastType("success");
      setToastOpen(true);
      setIsBlockConfirmOpen(false);
      setIsOpen(false);
    },
    onError: (error: any) => {
      setToastMessage(
        error?.response?.data?.message || "Failed to update block status"
      );
      setToastType("error");
      setToastOpen(true);
    },
  });

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
            onClick={() => setIsBlockConfirmOpen(true)}
            disabled={blockMutation.isPending}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {blockMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserMinus className="w-4 h-4" />
            )}
            {currentBlockStatus ? "Unblock User" : "Block User"}
          </button>
        </div>
      )}

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        entityId={userId}
        entityType="User"
        supportingEntityId={userId}
        supportingEntityType="User"
      />

      <BlockConfirmModal
        isOpen={isBlockConfirmOpen}
        onClose={() => setIsBlockConfirmOpen(false)}
        onConfirm={() => blockMutation.mutate()}
        isLoading={blockMutation.isPending}
        isUnblocking={currentBlockStatus}
      />

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
};

export default OtherUserOptions;
