"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

const BLUE_GRADIENT =
  "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)";
const GREEN_GRADIENT =
  "linear-gradient(134.74deg, #CBFE8B 3.24%, #81DE76 111.16%)";
const HEADER_GRADIENT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%), #FFFFFF";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  variant?: "default" | "card";
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  variant = "default",
  confirmLabel = "Delete permanently",
  cancelLabel = "Cancel",
}: ConfirmDeleteModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  if (variant === "card") {
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
          aria-labelledby="confirm-delete-title"
        >
          <div
            className="h-[100px] w-full rounded-t-[28px]"
            style={{ background: HEADER_GRADIENT }}
          />

          <div className="absolute left-1/2 top-[18px] flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full border border-[#EE3131] bg-[rgba(238,49,49,0.2)]">
            <Trash2 className="h-9 w-9 text-[#EE3131]" strokeWidth={2.25} />
          </div>

          <div className="flex flex-col items-center gap-1.5 px-6 pb-5 pt-12 text-center">
            <h2
              id="confirm-delete-title"
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
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative w-full max-w-[400px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl">
        <div className="p-7">
          <div className="mb-5 flex items-start justify-between">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-red-50">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
          </div>

          <h2 className="mb-2 text-[17px] font-medium leading-snug text-gray-900">
            {title}
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-500">
            {description}
          </p>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isLoading ? "Deleting..." : confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-60"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;
