"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SetupCompletedPage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-[30em]">
      <div className="flex flex-col h-[43em] items-center justify-center rounded-2xl bg-white p-[3em] pt-10 text-center">
        {/* Icon */}
        <div className="mb-6">
          <Image
            src="/images/best.png"
            alt="Success"
            width={160}
            height={160}
          />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-extrabold text-gray-900">
          Verified &amp;
          Ready to <br /> Frame the
          World!<br></br>
        </h1>

        {/* Subtitle */}
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


