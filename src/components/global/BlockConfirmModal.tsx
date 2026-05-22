"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ShieldAlert, Loader2 } from "lucide-react";

const BLUE_GRADIENT =
  "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)";
const GREEN_GRADIENT =
  "linear-gradient(134.74deg, #CBFE8B 3.24%, #81DE76 111.16%)";
const HEADER_GRADIENT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%), #FFFFFF";

interface BlockConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isUnblocking?: boolean;
}

const BlockConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  isUnblocking = false,
}: BlockConfirmModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const title = isUnblocking ? "Unblock User?" : "Block User?";
  const description = isUnblocking
    ? "Are you sure you want to unblock this user? They will be able to interact with your content and profile."
    : "Are you sure you want to block this user? They won't be able to see your content, profile, or interact with you.";
  const confirmLabel = isUnblocking ? "Unblock User" : "Block User";

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onClose : undefined}
      />

      <div
        className="relative w-full max-w-[380px] overflow-hidden rounded-[28px] bg-white shadow-[0px_5.625px_49.36px_rgba(0,0,0,0.1)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-confirm-title"
      >
        <div
          className="h-[100px] w-full rounded-t-[28px]"
          style={{ background: HEADER_GRADIENT }}
        />

        <div className="absolute left-1/2 top-[18px] flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full border border-[#4A7BEC] bg-[rgba(74, 123, 236, 0.2)]">
          <ShieldAlert
            className="h-9 w-9 text-[#4A7BEC]"
            strokeWidth={2.25}
          />
        </div>

        <div className="flex flex-col items-center gap-1.5 px-6 pb-5 pt-12 text-center">
          <h2
            id="block-confirm-title"
            className="text-[26px] font-black leading-tight tracking-[-0.02em] text-black"
          >
            {title}
          </h2>
          <p className="text-base font-normal leading-relaxed text-[#838383]">
            {description}
          </p>
        </div>

        <div className="flex gap-3 px-4 pb-6">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex h-[52px] flex-1 items-center justify-center rounded-[14px] text-base font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: BLUE_GRADIENT }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              confirmLabel
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-[52px] flex-1 items-center justify-center rounded-[14px] text-base font-medium text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: GREEN_GRADIENT }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BlockConfirmModal;
