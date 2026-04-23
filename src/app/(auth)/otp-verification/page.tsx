"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import {
  verifyEmailApi,
  verifyOtpApi,
  resendEmailVerificationOtpApi,
  forgotPasswordApi,
} from "@/services/authApi";
import { getApiErrorMessage } from "@/lib/apiError";

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const { authEmail, otpMode, setResetToken, login, _hasHydrated } = useAuthStore();

  const code = otp.join("");
  const isCodeValid = code.length === 5;

  // Redirect if no email in store
  useEffect(() => {
    if (_hasHydrated && !authEmail) {
      router.replace("/login");
    }
  }, [_hasHydrated, authEmail, router]);

  // Masonry background images
  const bgImages = [
    "https://images.unsplash.com/photo-1500835595353-b0ad2e58b8df?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493246507139-91e8bef99c02?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1433086566211-3729e28f32da?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&auto=format&fit=crop",
  ];

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

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 5);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 5; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 4);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmailApi,
    onSuccess: (data) => {
      setToastMessage(data?.message || "Email verified successfully!");
      setToastType("success");
      setToastOpen(true);
      if (data?.data?.token || data?.token) {
        login({
          user: data?.data?.user || data?.user,
          token: data?.data?.token || data?.token,
        });
      }
      setTimeout(() => {
        router.push("/create-profile");
      }, 1000);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data) => {
      setToastMessage(data?.message || "OTP verified successfully!");
      setToastType("success");
      setToastOpen(true);
      if (data?.data?.resetToken || data?.resetToken) {
        setResetToken(data?.data?.resetToken || data?.resetToken);
      }
      setTimeout(() => {
        router.push("/create-password");
      }, 1000);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => {
      if (otpMode === "signup") {
        return resendEmailVerificationOtpApi({ email: authEmail! });
      }
      return forgotPasswordApi({ email: authEmail! });
    },
    onSuccess: (data) => {
      setToastMessage(data?.message || "OTP resent successfully!");
      setToastType("success");
      setToastOpen(true);
      setTimeLeft(30);
      setCanResend(false);
      setOtp(["", "", "", "", ""]);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const isPending = verifyEmailMutation.isPending || verifyOtpMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCodeValid) return;
    if (!authEmail) return;

    if (otpMode === "signup") {
      verifyEmailMutation.mutate({ email: authEmail, otp: code });
    } else {
      verifyOtpMutation.mutate({ email: authEmail, otp: code });
    }
  };

  if (!_hasHydrated || !authEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-end overflow-hidden p-6">
      {/* Background Masonry Grid */}
      <div className="absolute inset-0 -z-10 grid grid-cols-3 gap-2 opacity-10 blur-[1px] scale-110">
        {bgImages.map((src, i) => (
          <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-xl grayscale">
            <img src={src} alt="Travel bg" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <div className="relative w-full max-w-[32em] rounded-[2.5rem] bg-white p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div className="flex justify-center mb-8">
          <div className="relative h-20 w-20">
            <Image src="/images/warning.png" alt="Verify" fill className="object-contain" />
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-xs font-medium text-gray-400 px-8">
            Enter the OTP sent to your email <span className="font-bold text-gray-900">{authEmail}</span>
          </p>
        </div>

        <form className="space-y-10" onSubmit={handleSubmit}>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((value, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="h-14 w-full rounded-2xl bg-[#f4f4f4] border-none text-center text-xl font-black text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            {!canResend ? (
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Didn't get a code? <span className="text-gray-900">00:{timeLeft.toString().padStart(2, "0")}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline disabled:opacity-50"
              >
                {resendMutation.isPending ? "Sending..." : "Resend Otp"}
              </button>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !isCodeValid}
            className={`w-full h-14 rounded-full font-bold text-base transition-all shadow-xl tracking-tight ${isPending || !isCodeValid
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 shadow-blue-200"
              }`}
          >
            {isPending ? "Verifying..." : "Verify & Continue"}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
