 "use client";
 
 import { useEffect, useRef, useState } from "react";
 import { Button } from "@/components/ui/button";
 import Link from "next/link";
 import Image from "next/image";
 import { useRouter, useSearchParams } from "next/navigation";
 
 export default function OtpVerificationPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const mode = searchParams.get("mode") ?? "reset";

  useEffect(() => {
    if (canResend) return;

    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, canResend]);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (digit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    // TODO: verify `code` with backend

    if (code.length === otp.length) {
      const query = email ? `?email=${encodeURIComponent(email)}` : "";

      if (mode === "signup") {
        router.push(`/create-profile${query}`);
      } else {
        router.push(`/create-password${query}`);
      }
    }
  };

  const handleResend = () => {
    // TODO: call API to resend OTP here
    setTimeLeft(30);
    setCanResend(false);
  };

  return (
    <div className="w-full max-w-[32em]">
      <div className="rounded-2xl h-[40em] bg-white p-[4em] shadow-xl">
        {/* Icon */}
        <div className="flex justify-center">
          <Image
            src="/images/warning.png"
            alt="OTP Verification"
            width={80}
            height={80}
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-extrabold text-gray-900 text-center pt-4">
          Verification
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-sm text-gray-600 text-center">
          Enter the OTP sent to{" "}
          <span className="font-semibold">
            {email ?? "your email"}
          </span>
          .
        </p>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* OTP Input Boxes */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-3">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-14 w-14 rounded-2xl border border-gray-200 bg-gray-50 text-center text-xl font-semibold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              ))}
            </div>
          </div>

          {/* Resend + Info */}
          <div className="flex items-center justify-center text-xs text-gray-500">
            {!canResend ? (
              <span>
                Didn&apos;t get link?{" "}
                <span className="font-semibold text-gray-700">
                  00:{timeLeft.toString().padStart(2, "0")}
                </span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Resend Link
              </button>
            )}
          </div>

          {/* Verify Button */}
          <Button
            type="submit"
            className="w-full mt-3 bg-gradient-to-r rounded-full from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 h-12 font-medium mb-4 shadow-lg shadow-blue-400"
          >
            Verify &amp; Continue
          </Button>

          {/* Back to login */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


