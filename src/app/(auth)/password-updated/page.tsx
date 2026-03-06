"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function PasswordUpdatedPage() {
  // const searchParams = useSearchParams();
  const email = "undenifined";

  return (
    <div className="w-full max-w-[32em]">
      <div className="rounded-2xl h-[40em] bg-white p-[4em] shadow-xl flex flex-col items-center justify-center text-center">
        {/* Icon */}
        <div className="mb-4">
          <Image
            src="/images/warning.png"
            alt="Password Updated"
            width={80}
            height={80}
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-extrabold text-gray-900">
          Password Updated!
        </h1>

        {/* Subtitle */}
        <p className="mb-6 text-sm text-gray-600">
          Your new password has been updated successfully
          {email ? (
            <>
              {" "}
              for{" "}
              <span className="font-semibold">
                {email}
              </span>
              .
            </>
          ) : (
            "."
          )}{" "}
          Go back and login with your new password!
        </p>

        {/* Login Button */}
        <Link href="/login" className="w-full">
          <Button className="w-full bg-gradient-to-r rounded-full from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 h-12 font-medium shadow-lg shadow-blue-400">
            Login
          </Button>
        </Link>
      </div>
    </div>
  );
}


