"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose: () => void;
};

export function Toast({
  open,
  message,
  type = "success",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open || !message) return null;

  const isError = type === "error";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4">
      <div
        className={`pointer-events-auto flex items-center gap-3 rounded-full px-4 py-2 shadow-lg text-sm font-medium text-white ${
          isError ? "bg-red-500" : "bg-emerald-500"
        }`}
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 rounded-full bg-black/10 p-1 hover:bg-black/20"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}


