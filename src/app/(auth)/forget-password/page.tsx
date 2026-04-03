"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Type inferred from schema
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgetPasswordPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log("Forgot password email:", data.email);
    // TODO: call your API to send OTP to this email
    router.push(
      `/otp-verification?mode=reset&email=${encodeURIComponent(data.email)}`,
    );
  };

  return (
    <div className="w-full max-w-[32em]">
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
            Enter your email and we&apos;ll send you a code to get back into
            your account.
          </p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Email"
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
              className="w-full mt-3 gradient-bg text-white hover:from-blue-600 hover:to-blue-700 h-12 font-medium mb-4 shadow-lg shadow-blue-400"
            >
              Send Recovery Code
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}