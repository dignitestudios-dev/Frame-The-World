"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import GuestAccessModal from "../components/global/GuestAccessModal";
import { useAuthStore } from "@/store/authStore";

interface GuestModalContextType {
  openGuestModal: () => void;
  closeGuestModal: () => void;
  executeWithCheck: (action: () => void) => void;
}

const GuestModalContext = createContext<GuestModalContextType | undefined>(undefined);

export const GuestModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isGuest = useAuthStore((state) => state.isGuest);

  const openGuestModal = () => setIsOpen(true);
  const closeGuestModal = () => setIsOpen(false);

  const executeWithCheck = (action: () => void) => {
    if (isGuest) {
      openGuestModal();
    } else {
      action();
    }
  };

  return (
    <GuestModalContext.Provider value={{ openGuestModal, closeGuestModal, executeWithCheck }}>
      {children}
      <GuestAccessModal isOpen={isOpen} onClose={closeGuestModal} />
    </GuestModalContext.Provider>
  );
};

export const useGuestModal = () => {
  const context = useContext(GuestModalContext);
  if (context === undefined) {
    throw new Error("useGuestModal must be used within a GuestModalProvider");
  }
  return context;
};
