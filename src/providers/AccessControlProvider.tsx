"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import GuestAccessModal from "../components/global/GuestAccessModal";
import PendingProfileModal from "../components/global/PendingProfileModal";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/ui/toast";

interface AccessControlContextType {
  openGuestModal: () => void;
  closeGuestModal: () => void;
  openPendingModal: () => void;
  closePendingModal: () => void;
  executeWithCheck: (action: () => void, config?: { isPendingAllowed?: boolean }) => void;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type: "success" | "error" }>({
    open: false,
    message: "",
    type: "success",
  });
  
  const { isGuest, user } = useAuthStore();

  const openGuestModal = () => setIsGuestOpen(true);
  const closeGuestModal = () => setIsGuestOpen(false);

  const openPendingModal = () => setIsPendingOpen(true);
  const closePendingModal = () => setIsPendingOpen(false);

  const executeWithCheck = (action: () => void, config?: { isPendingAllowed?: boolean }) => {
    // 1. Check Guest Status
    if (isGuest) {
      openGuestModal();
      return;
    }

    // 2. Check "not-provided" Status
    // if (user?.identityStatus === "not-provided") {
    //     router.push("/settings");
    //     setToast({ 
    //         open: true, 
    //         message: "Please provide your IATA or CLIA number. Profile verification is required to access all features.", 
    //         type: "error" 
    //     });
    //     return;
    // }

    // 3. Check Pending Status
    const isPending = user?.identityStatus === "pending";
    if (isPending && !config?.isPendingAllowed) {
      openPendingModal();
      return;
    }

    // 4. Execute approved action
    action();
  };

  return (
    <AccessControlContext.Provider 
      value={{ 
        openGuestModal, 
        closeGuestModal, 
        openPendingModal, 
        closePendingModal, 
        executeWithCheck 
      }}
    >
      {children}
      <GuestAccessModal isOpen={isGuestOpen} onClose={closeGuestModal} />
      <PendingProfileModal isOpen={isPendingOpen} onClose={closePendingModal} />
      <Toast 
        open={toast.open} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast(prev => ({ ...prev, open: false }))} 
      />
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error("useAccessControl must be used within an AccessControlProvider");
  }
  return context;
};

// Maintain backward compatibility for now if needed
export const useGuestModal = useAccessControl;
