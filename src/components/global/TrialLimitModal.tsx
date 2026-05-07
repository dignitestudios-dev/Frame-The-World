"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TRIAL_POST_LIMIT_MESSAGE } from "@/lib/apiError";

const HEADER_GRADIENT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%), #FFFFFF";
const ICON_GRADIENT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%)";
const BUTTON_GRADIENT =
  "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)";

interface TrialLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  description?: string;
}

export default function TrialLimitModal({
  isOpen,
  onClose,
  description = TRIAL_POST_LIMIT_MESSAGE,
}: TrialLimitModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-limit-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[450px] overflow-hidden rounded-[28px] bg-white shadow-[0px_5.625px_49.3594px_rgba(0,0,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative flex h-[136px] flex-col items-center justify-end pb-0 pt-[22px]"
          style={{ background: HEADER_GRADIENT }}
        >
          <div
            className="flex h-[91px] w-[91px] items-center justify-center rounded-full"
            style={{ background: ICON_GRADIENT }}
            aria-hidden
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ background: BUTTON_GRADIENT }}
            >
              <Check className="h-7 w-7 text-white" strokeWidth={2.75} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[5.62px] px-6 pb-6 pt-5 text-center">
          <h2
            id="trial-limit-modal-title"
            className="w-full text-[24px] font-black leading-[38px] tracking-[-0.02em] text-black sm:text-[30px] sm:leading-[46px]"
          >
            Free Trail Ended
          </h2>
          <p className="w-full text-base font-normal leading-[27px] text-[#838383] sm:text-[19.6875px]">
            {description}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-full py-3.5 text-lg font-bold text-white shadow-[0_10px_20px_rgba(59,84,240,0.25)] transition hover:opacity-95"
            style={{ background: BUTTON_GRADIENT }}
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
