"use client";

import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RESTRICTED_ACTION_MESSAGE } from "@/lib/subscriptionAccess";

const HEADER_GRADIENT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%), #FFFFFF";
const ICON_GRADIENT =
  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%)";
const PRIMARY_BUTTON_GRADIENT =
  "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)";
const CANCEL_BUTTON_GRADIENT =
  "linear-gradient(134.74deg, #CBFE8B 3.24%, #81DE76 111.16%)";

interface RestrictedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  description?: string;
}

export default function RestrictedActionModal({
  isOpen,
  onClose,
  description = RESTRICTED_ACTION_MESSAGE,
}: RestrictedActionModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleSubscribe = () => {
    onClose();
    router.push("/subscription");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restricted-action-modal-title"
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
              style={{ background: PRIMARY_BUTTON_GRADIENT }}
            >
              <Lock className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-5 text-center">
          <h2
            id="restricted-action-modal-title"
            className="w-full text-[28px] font-black leading-[38px] tracking-[-0.02em] text-black sm:text-[33.75px] sm:leading-[46px]"
          >
            Restricted Action!
          </h2>
          <p className="w-full text-base font-normal leading-[27px] text-[#838383] sm:text-[19.6875px]">
            {description}
          </p>

          <div className="mt-4 flex w-full flex-row items-stretch gap-3">
            <button
              type="button"
              onClick={handleSubscribe}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl px-3 text-[15px] font-semibold text-white shadow-sm transition hover:opacity-95 sm:text-base"
              style={{ background: PRIMARY_BUTTON_GRADIENT }}
            >
              Subscribe Now
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-xl px-3 text-[15px] font-semibold text-black shadow-sm transition hover:opacity-95 sm:text-base"
              style={{ background: CANCEL_BUTTON_GRADIENT }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
