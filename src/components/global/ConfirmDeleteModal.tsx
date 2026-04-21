"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, Loader2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: ConfirmDeleteModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[400px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-7">

          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div className="w-11 h-11 rounded-[14px] bg-red-50 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors disabled:opacity-40"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Text */}
          <h2 className="text-[17px] font-medium text-gray-900 mb-2 leading-snug">
            {title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2.5">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isLoading ? "Deleting..." : "Delete permanently"}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;