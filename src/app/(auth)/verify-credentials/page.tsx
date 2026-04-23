"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyCredentialsSchema, VerifyCredentialsFormData } from "@/schemas/Auth";
import { useMutation } from "@tanstack/react-query";
import { verifyIdentityApi } from "@/services/authApi";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/lib/apiError";

export default function VerifyCredentialsPage() {
  const router = useRouter();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const { authEmail } = useAuthStore();

  const [showErrorModal, setShowErrorModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<VerifyCredentialsFormData>({
    resolver: zodResolver(verifyCredentialsSchema),
    mode: "onChange",
  });


  const { mutate, isPending } = useMutation({
    mutationFn: verifyIdentityApi,
    onSuccess: (data) => {
      setToastMessage(data?.message || "Credentials verified successfully!");
      setToastType("success");
      setToastOpen(true);
      setTimeout(() => {
        router.push("/subscription");
      }, 1000);
    },
    onError: (error) => {
      setToastMessage(getApiErrorMessage(error));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const onSubmit = (data: VerifyCredentialsFormData) => {
    if (data.iata && data.clia) {
      setShowErrorModal(true);
      return;
    }

    if (data.iata) {
      mutate({ iata: data.iata });
    } else if (data.clia) {
      mutate({ clia: data.clia });
    }
  };

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
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
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input
              id="iata"
              type="text"
              placeholder="IATA number"
              maxLength={8}
              className="w-full rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-300"
              {...register("iata", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
                },
              })}
            />
            {errors.iata && (
              <p className="text-red-500 text-xs mt-1">{errors.iata.message}</p>
            )}
          </div>

          <div className="flex items-center justify-center text-xs text-gray-400">
            <span className="px-2">Or</span>
          </div>

          <Input
            id="clia"
            type="text"
            placeholder="CLIA number"
            maxLength={8}
            className="w-full rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-300"
            {...register("clia", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
              },
            })}
          />

          <Button
            type="submit"
            disabled={isPending || !isValid}
            className={`w-full mt-4 h-12 rounded-full font-medium transition-all shadow-lg ${isPending || !isValid
              ? "bg-gray-300 cursor-not-allowed shadow-none text-gray-500"
              : "bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-500 hover:to-blue-800 shadow-blue-300"
              }`}
          >

            {isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              "Verify"
            )}
          </Button>
          <div className="mt-4 flex gap-2 items-start bg-transparent">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#5D92F3] text-white shadow-sm">
                <span className="text-[11px] font-black italic">i</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              CLIA verification is processed manually and will be sent to the admin for approval.
              Please ensure the information provided is accurate, as incorrect details may lead to
              rejection.
            </p>
          </div>
          {/* Terms and Conditions */}
          {/* <div className="text-sm text-gray-600 mb-6 mt-6 text-center">
            I accept the{" "}
            <Link href="https://www.frametheworld.org/terms-condition" target="_blank" className="text-blue-600 hover:underline">
              Terms of Services
            </Link>{" "}
            and{" "}
            <Link href="https://www.frametheworld.org/privacy-policy" target="_blank" className="text-blue-600 hover:underline">
              Privacy policy
            </Link>
          </div> */}
        </form>
      </div>

      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-[300px] overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex h-32 items-center justify-center bg-[#E5ECEF]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
                <span className="text-4xl font-serif italic text-white leading-none pb-1">i</span>
              </div>
            </div>
            <div className="p-6 text-center">
              <h2 className="mb-2 text-xl font-bold text-gray-900">Error</h2>
              <p className="mb-6 text-sm text-gray-500">
                Please enter only one: either IATA or CLIA.
              </p>
              <Button
                onClick={() => setShowErrorModal(false)}
                className="w-full h-12 rounded-full bg-blue-600 font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
