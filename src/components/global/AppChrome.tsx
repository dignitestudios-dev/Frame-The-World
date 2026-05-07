"use client";

import StickyCreateBar from "@/components/global/StickyCreateBar";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StickyCreateBar />
    </>
  );
}
