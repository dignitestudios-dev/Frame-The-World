"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import GuestAccessModal from "../components/global/GuestAccessModal";
import PendingProfileModal from "../components/global/PendingProfileModal";
import RestrictedActionModal from "../components/global/RestrictedActionModal";
import { useAuthStore } from "@/store/authStore";
import { Toast } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { getCurrentSubscriptionApi } from "@/services/subscriptionApi";
import { isRestrictedSubscriber } from "@/lib/subscriptionAccess";

interface AccessControlContextType {
  openGuestModal: () => void;
  closeGuestModal: () => void;
  openPendingModal: () => void;
  closePendingModal: () => void;
  openRestrictedModal: () => void;
  closeRestrictedModal: () => void;
  executeWithCheck: (
    action: () => void,
    config?: { isPendingAllowed?: boolean; skipSubscriptionCheck?: boolean }
  ) => void;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(
  undefined
);

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isRestrictedOpen, setIsRestrictedOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({
    open: false,
    message: "",
    type: "success",
  });

  const { isGuest, user, token, updateUser } = useAuthStore();

  const subscriptionQuery = useQuery({
    queryKey: ["current-subscription-access"],
    queryFn: getCurrentSubscriptionApi,
    enabled: Boolean(token) && !isGuest,
    staleTime: 60 * 1000,
  });

  const subscriptionData = subscriptionQuery.data?.data;
  const isSubscribed =
    subscriptionData?.isSubscribed ?? user?.isSubscribed ?? false;
  const isOnTrial = subscriptionData?.isOnTrial ?? user?.isOnTrial ?? false;

  const isSubscriptionRestricted = isRestrictedSubscriber(
    isSubscribed,
    isOnTrial
  );

  useEffect(() => {
    if (!subscriptionData) return;
    updateUser({
      isSubscribed: subscriptionData.isSubscribed,
      isOnTrial: subscriptionData.isOnTrial,
    });
  }, [subscriptionData, updateUser]);

  const openGuestModal = () => setIsGuestOpen(true);
  const closeGuestModal = () => setIsGuestOpen(false);

  const openPendingModal = () => setIsPendingOpen(true);
  const closePendingModal = () => setIsPendingOpen(false);

  const openRestrictedModal = () => setIsRestrictedOpen(true);
  const closeRestrictedModal = () => setIsRestrictedOpen(false);

  const executeWithCheck = (
    action: () => void,
    config?: { isPendingAllowed?: boolean; skipSubscriptionCheck?: boolean }
  ) => {
    if (isGuest) {
      openGuestModal();
      return;
    }

    if (
      !config?.skipSubscriptionCheck &&
      token &&
      isSubscriptionRestricted
    ) {
      openRestrictedModal();
      return;
    }

    const isPending = user?.identityStatus === "pending";
    if (isPending && !config?.isPendingAllowed) {
      openPendingModal();
      return;
    }

    action();
  };

  return (
    <AccessControlContext.Provider
      value={{
        openGuestModal,
        closeGuestModal,
        openPendingModal,
        closePendingModal,
        openRestrictedModal,
        closeRestrictedModal,
        executeWithCheck,
      }}
    >
      {children}
      <GuestAccessModal isOpen={isGuestOpen} onClose={closeGuestModal} />
      <PendingProfileModal isOpen={isPendingOpen} onClose={closePendingModal} />
      <RestrictedActionModal
        isOpen={isRestrictedOpen}
        onClose={closeRestrictedModal}
      />
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
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

export const useGuestModal = useAccessControl;
