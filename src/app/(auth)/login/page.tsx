"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/Auth";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { loginApi } from "@/services/authApi";

export default function LoginPage() {
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const login = useAuthStore((state) => state.login);
  // React Hook Form setup with Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    console.log("Login data:", data);
    // TODO: call your login API here
    setToastMessage("Login successful");
    setToastOpen(true);

    router.push("/home");
    return useMutation({
      mutationFn: loginApi,
      onSuccess: (data) => {
        login(data); // save user + token in zustand
      },
    });
  };

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type="success"
        onClose={() => setToastOpen(false)}
      />
      <div className="rounded-2xl bg-white p-[4em] shadow-xl">
        {/* Title */}
        <h1 className="mb-2 text-3xl font-bold text-gray-900 text-center text-shadow">
          Login
        </h1>

        {/* Subtitle */}
        <p className="mb-8 text-sm text-gray-600 text-center">
          Enter your details to begin your journey. <br></br>{" "}
          <span className="flex  items-baseline justify-center">
            Only
            <img
              src={"/images/check-mark.png"}
              alt="check-mark-icon"
              className="ml-1 w-3.25 h-2.75 mr-1"
            />
            verified travel professionals can contribute.
          </span>
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

          {/* Password */}
          <div>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end -mt-1 mb-2">
            <Link
              href="/forget-password"
              className="text-sm gradient-text font-medium hover:text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full mt-3 gradient-bg text-white hover:from-blue-600 hover:to-blue-700 h-12 font-medium mb-4"
          >
            Login
          </Button>

          {/* Terms and Conditions - NO CHECKBOX */}
          <div className="text-sm font-medium text-[#000000] mb-6 mt-6 text-center">
            I accept the{" "}
            <Link
              href="#"
              className="gradient-text  bg-clip-text text-transparent font-bold hover:underline"
            >
              Terms & conditions
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="gradient-text bg-clip-text text-transparent hover:underline"
            >
              Privacy policy
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-4">
            <div className="relative flex justify-center text-sm">
              <span className="bg-white font-medium text-[15px] px-2 text-[#000000]">
                Or Continue with
              </span>
            </div>
          </div>
          {/* Social Login */}
          <img
            src="/images/border-image.png"
            className="w-48 mx-auto"
            alt="border-image.png"
          />
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              className="flex  h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-slate-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Login with Google"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-slate-200 shadow-sm hover:bg-gray-50 transition-colors"
              aria-label="Login with Apple"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="gradient-text hover:underline font-medium"
            >
              Create now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
