"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

function SetupCompletedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  useEffect(() => {
    const status = searchParams.get("status");
    if (!status) return;

    if (status === "success") {
      setToastMessage("Subscription purchased successfully!");
      setToastType("success");
      setToastOpen(true);
    } else if (status === "error") {
      setToastMessage("Payment failed. Please try again.");
      setToastType("error");
      setToastOpen(true);
    }

    // Clean the query param so refresh/back doesn't re-trigger the toast
    router.replace("/setup-completed");
  }, [searchParams, router]);

  return (
    <div className="w-full max-w-[30em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
      <div className="flex flex-col h-[43em] items-center justify-center rounded-2xl bg-white p-[3em] pt-10 text-center">
        <div className="mb-6">
          <Image
            src="/images/best.png"
            alt="Success"
            width={160}
            height={160}
          />
        </div>

        <h1 className="mb-3 text-2xl font-extrabold text-gray-900">
          Verified &amp;
          Ready to <br /> Frame the
          World!<br></br>
        </h1>

        <p className="mb-8 text-sm text-gray-600 ml-[2em] mr-[2em]">
          Welcome aboard, traveler! Your subscription is active and your account is verified. Start exploring, posting, and framing your travel stories now.
        </p>

        <Button
          type="button"
          onClick={() => router.push("/onboarding")}
          className="mt-2 w-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-500 hover:to-blue-800 h-12 font-medium shadow-lg shadow-blue-300"
        >
          Start Framing
        </Button>
      </div>
    </div>
  );
}

export default function SetupCompletedPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full animate-pulse rounded-2xl bg-white" />}>
      <SetupCompletedContent />
    </Suspense>
  );
}
