"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function CreatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const router = useRouter();
  // const searchParams = useSearchParams();
  // const email = searchParams.get("email");

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      showToast("Password must be at least 8 characters long.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match. Please try again.", "error");
      return;
    }

    // TODO: call API to actually reset password using token/email

    // const query = email ? `?email=${encodeURIComponent(email)}` : "";
    // router.push(`/password-updated${query}`);
        router.push(`/password-updated`);

  };

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
        <form className="space-y-4" onSubmit={handleSubmit}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r rounded-full from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 h-12 font-medium mb-4 shadow-lg shadow-blue-400"
          >
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
}

