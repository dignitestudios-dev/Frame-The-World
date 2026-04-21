"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/schemas/Auth";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/apiError";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const { setAuthEmail, setOtpMode } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });


  const { mutate, isPending } = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (data, variables) => {
      setToastMessage(data?.message || "Recovery code sent to your email!");
      setToastType("success");
      setToastOpen(true);
      setAuthEmail(variables.email);
      setOtpMode("reset");
      setTimeout(() => {
        router.push("/otp-verification");
      }, 1000);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutate({ email: data.email });
  };

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
      <div className="rounded-2xl h-[40em] p-[2em] bg-white flex flex-col shadow-xl">
        <button onClick={() => router.back()}>
          <ArrowLeft size={20} color="#181818" />
        </button>
        <div className="p-[2em]">
          {/* Title */}
          <div className="flex justify-center">
            <Image
              src="/images/warning.png"
              alt="User"
              width={80}
              height={80}
            />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold text-gray-900 text-center pt-4">
            Trouble Logging in?
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-sm text-gray-600 text-center">
            Enter your email and we&apos;ll send you an OTP To Forgot your
            Password
          </p>
          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Enter Your Email"
                className="w-full"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              disabled={isPending || !isValid}
              className={`w-full mt-3 h-12 font-medium mb-4 shadow-lg transition-all ${isPending || !isValid
                  ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
                  : "gradient-bg text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-400"
                }`}
            >

              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}