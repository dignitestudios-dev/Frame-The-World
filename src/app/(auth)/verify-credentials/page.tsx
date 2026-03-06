"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyCredentialsPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const email = searchParams.get("email");
  const email = "email";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: send IATA/CLIA to backend for verification

    // const queryEmail = email ? `&email=${encodeURIComponent(email)}` : "";
    // router.push(`/otp-verification?mode=signup${queryEmail}`);
        router.push(`/otp-verification?mode=signup`);

  };

  return (
    <div className="w-full max-w-[32em]">
      <div className="relative rounded-2xl bg-white p-[4em] shadow-xl">
        {/* Back arrow */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 cursor-pointer" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mt-2 mb-4">
          <Image
            src="/images/warning.png"
            alt="Verify credentials"
            width={72}
            height={72}
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-extrabold text-gray-900 text-center">
          Verify Your Travel Credentials
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-sm text-gray-600 text-center">
          Enter your IATA or CLIA number to confirm your professional status and
          unlock access.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            id="iata"
            type="text"
            placeholder="IATA number"
            className="w-full rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-300"
          />

          <div className="flex items-center justify-center text-xs text-gray-400">
            <span className="px-2">Or</span>
          </div>

          <Input
            id="clia"
            type="text"
            placeholder="CLIA number"
            className="w-full rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-300"
          />

          <Button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-500 hover:to-blue-800 h-12 rounded-full font-medium shadow-lg shadow-blue-300"
          >
            Verify
          </Button>

         {/* Terms and Conditions */}
          <div className="text-sm text-gray-600 mb-6 mt-6 text-center">
            I accept the{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Terms & conditions
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Privacy policy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


