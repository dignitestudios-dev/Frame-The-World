"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Trash, Loader2, X } from "lucide-react";

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[380px] bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
              <Trash className="w-6 h-6" />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            {description}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {isLoading ? "Deleting..." : "Confirm Delete"}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
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
