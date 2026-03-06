"use client";

import { ArrowLeft, Check, Pencil } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ReviewPlanPage() {
  const router = useRouter();
  // const searchParams = useSearchParams();
  // const plan = searchParams.get("plan") ?? "monthly";
    const plan = "monthly";

  // const method = searchParams.get("method") ?? "google-pay";
  const method = "google-pay";

  const isMonthly = plan === "monthly";
  const price = isMonthly ? "49.99" : "499.99";
  const suffix = isMonthly ? "/mo" : "/year";

  const handlePay = () => {
    // TODO: trigger payment
    router.push("/setup-completed");
  };

  return (
    <div className="w-full max-w-[32em]">
      <div className="relative rounded-2xl bg-white p-[2.5em] pt-6 shadow-xl">
        {/* Back arrow */}
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Title */}
        <h1 className="mt-2 mb-6 text-center text-2xl font-extrabold text-gray-900">
          Review Plan
        </h1>

        {/* Plan Card */}
        <div className="mb-6 w-full rounded-3xl border border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 px-8 py-8 text-left shadow-sm">
          <div className="mb-3 text-center font-semibold text-gray-800 capitalize">
            {isMonthly ? "Monthly" : "Annual"}
          </div>
          <div className="mb-4 flex items-baseline justify-center gap-1">
            <span className="text-xl font-semibold">$</span>
            <span className="text-4xl font-extrabold">{price}</span>
            <span className="text-sm text-gray-500">{suffix}</span>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            {[1, 2, 3].map((i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
                <span>Lorem ipsum dolor sit amet</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Payment method summary */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Payment Method
          </span>
          <button
            type="button"
            onClick={() => router.push(`/payment-method?plan=${plan}`)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Pencil className="h-3 w-3" />
            <span>Edit</span>
          </button>
        </div>
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src={
                method === "google-pay"
                  ? "/images/GooglePay.png"
                  : "/images/ApplePay.png"
              }
              alt={method === "google-pay" ? "Google Pay" : "Apple Pay"}
              width={30}
              height={30}
              className="object-contain"
            />
            <span className="text-sm text-gray-700">•••• •••• •••• 482</span>
          </div>
          <span className="rounded bg-white px-2 py-1 text-[10px] shadow-sm">
            {method === "google-pay" ? "GPay" : " Pay"}
          </span>
        </div>

        {/* Subtotal */}
        <div className="bg-[#6cabdf4a] rounded-2xl p-3 mb-2">
        <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>$ {price}</span>
        </div>  
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-blue-600">
          <span>Subtotal</span>
          <span>$ {price}</span>
        </div>
        </div>

        <Button
          type="button"
          onClick={handlePay}
          className="mt-2 w-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700 text-white hover:from-blue-500 hover:to-blue-800 h-12 font-medium shadow-lg shadow-blue-300"
        >
          Pay Now
        </Button>
      </div>
    </div>
  );
}


