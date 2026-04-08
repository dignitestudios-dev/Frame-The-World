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
import { signinApi, socialAuthApi } from "@/services/authApi";
import { getApiErrorMessage } from "@/lib/apiError";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const login = useAuthStore((state) => state.login);
  const setGuest = useAuthStore((state) => state.setGuest);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });


  const { mutate, isPending } = useMutation({
    mutationFn: signinApi,
    onSuccess: (data) => {
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;
      
      login({ user, token });
      setToastMessage(data?.message || "Login successful");
      setToastType("success");
      setToastOpen(true);

      setTimeout(() => {
        if (user?.isProfileCompleted) {
          router.push("/home");
        } else {
          useAuthStore.getState().setAuthEmail(user?.email);
          useAuthStore.getState().setOtpMode("signup");
          router.push("/otp-verification");
        }
      }, 1000);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const { mutate: socialLoginMutate, isPending: isSocialPending } = useMutation({
    mutationFn: socialAuthApi,
    onSuccess: (data) => {
      const user = data.data?.user || data.user;
      const token = data.data?.token || data.token;
      
      login({ user, token });
      setToastMessage(data?.message || "Login successful");
      setToastType("success");
      setToastOpen(true);

      setTimeout(() => {
        if (user?.isProfileCompleted) {
          router.push("/home");
        } else {
          // Social auth users skip email OTP verification
          router.push("/verify-credentials");
        }
      }, 1000);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      socialLoginMutate({ method: "google", idToken });
    } catch (error: any) {
      setToastMessage(error.message || "Google login failed");
      setToastType("error");
      setToastOpen(true);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      const idToken = await result.user.getIdToken();
      socialLoginMutate({ method: "apple", idToken });
    } catch (error: any) {
      setToastMessage(error.message || "Apple login failed");
      setToastType("error");
      setToastOpen(true);
    }
  };

  const onSubmit = (data: LoginFormData) => {
    mutate({ email: data.email, password: data.password });
  };

  const handleGuestMode = () => {
    setGuest(true);
    router.push("/home");
  };

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
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

          <Button
            type="submit"
            disabled={isPending || !isValid}
            className={`w-full mt-3 h-12 font-medium mb-4 text-white transition-all ${
              isPending || !isValid 
                ? "bg-gray-300 cursor-not-allowed" 
                : "gradient-bg hover:shadow-lg shadow-blue-200"
            }`}
          >

            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
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
              onClick={handleGoogleLogin}
              disabled={isSocialPending}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-slate-200 shadow-sm transition-colors ${isSocialPending ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
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
              onClick={handleAppleLogin}
              disabled={isSocialPending}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-slate-200 shadow-sm transition-colors ${isSocialPending ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
              aria-label="Login with Apple"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <button
              type="button"
              onClick={handleGuestMode}
              className="text-gray-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-2 group"
            >
              Continue as Guest
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
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
