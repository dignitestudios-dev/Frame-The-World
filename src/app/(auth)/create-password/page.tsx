"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPasswordSchema, CreatePasswordFormData } from "@/schemas/Auth";
import { useMutation } from "@tanstack/react-query";
import { updatePasswordApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/apiError";

export default function CreatePasswordPage() {
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const router = useRouter();
  const { resetToken, authEmail, clearAuthFlow } = useAuthStore();

  // Redirect if no reset token
  useEffect(() => {
    if (!resetToken) {
      router.replace("/forget-password");
    }
  }, [resetToken, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreatePasswordFormData>({
    resolver: zodResolver(createPasswordSchema),
    mode: "onChange",
  });


  const { mutate, isPending } = useMutation({
    mutationFn: updatePasswordApi,
    onSuccess: (data) => {
      setToastMessage(data?.message || "Password updated successfully!");
      setToastType("success");
      setToastOpen(true);
      clearAuthFlow();
      router.push("/password-updated");
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const onSubmit = (data: CreatePasswordFormData) => {
    if (!resetToken) {
      setToastMessage("Reset token not found. Please start over.");
      setToastType("error");
      setToastOpen(true);
      return;
    }
    mutate({ resetToken, password: data.password });
  };

  if (!resetToken) return null;

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

      <div className="rounded-2xl h-[40em] bg-white p-[4em] shadow-xl relative">
        {/* Back arrow */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mt-4">
          <Image
            src="/images/warning.png"
            alt="Create Password"
            width={80}
            height={80}
          />
        </div>

        {/* Title */}
        <h1 className="mb-2 text-2xl font-extrabold text-gray-900 text-center pt-4">
          Create Password
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-sm text-gray-600 text-center">
          Enter your new password to reset your account.
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              className="w-full"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              Must be at least 8 characters long.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              className="w-full"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !isValid}
            className={`w-full mt-4 h-12 font-medium mb-4 transition-all ${
              isPending || !isValid 
                ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500" 
                : "gradient-bg text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-400"
            }`}
          >

            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
