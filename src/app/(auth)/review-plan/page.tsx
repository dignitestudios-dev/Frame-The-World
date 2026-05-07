"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import {
  getPlansApi,
  purchaseSubscriptionApi,
  SubscriptionPlan,
} from "@/services/subscriptionApi";
import { getApiErrorMessage } from "@/lib/apiError";

const getPriceSuffix = (durationDays: number): string => {
  if (durationDays === 30) return "/mo";
  if (durationDays === 365) return "/year";
  if (durationDays === 7) return "/week";
  if (durationDays > 0) return `/${durationDays}d`;
  return "";
};

const getCurrencySymbol = (currency: string): string => {
  switch (currency?.toUpperCase()) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "PKR":
      return "Rs";
    default:
      return currency || "$";
  }
};

const formatPrice = (price: number): string => {
  return Number.isInteger(price) ? price.toFixed(2) : price.toString();
};

function ReviewPlanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get("plan");

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("error");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getPlansApi,
    staleTime: 5 * 60 * 1000,
  });

  const plan = useMemo<SubscriptionPlan | undefined>(() => {
    const plans = data?.data?.plans ?? [];
    if (planKey) {
      const matched = plans.find((p) => p.key === planKey);
      if (matched) return matched;
    }
    return plans[0];
  }, [data, planKey]);

  const { mutate: purchase, isPending: isPurchasing } = useMutation({
    mutationFn: purchaseSubscriptionApi,
    onSuccess: (response) => {
      const checkoutUrl = response?.data?.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setToastMessage("Checkout URL not received. Please try again.");
        setToastType("error");
        setToastOpen(true);
      }
    },
    onError: (err) => {
      setToastMessage(getApiErrorMessage(err));
      setToastType("error");
      setToastOpen(true);
    },
  });

  const handlePay = () => {
    if (!plan?._id || isPurchasing) return;
    purchase(plan._id);
  };

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />
      <div className="relative rounded-2xl bg-white p-[2.5em] pt-6 shadow-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <h1 className="mt-2 mb-6 text-center text-2xl font-extrabold text-gray-900">
          Review Your Plan
        </h1>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-red-500">{getApiErrorMessage(error)}</p>
            <Button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Retry
            </Button>
          </div>
        ) : !plan ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-gray-500">Plan not found.</p>
            <Button
              type="button"
              onClick={() => router.push("/subscription")}
              className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              Choose a Plan
            </Button>
          </div>
        ) : (
          <>
            {/* Plan Card */}
            <div className="mb-6 w-full rounded-3xl border border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 px-8 py-8 text-left shadow-sm">
              <div className="mb-3 text-center font-semibold text-gray-800 capitalize">
                {plan.label}
              </div>
              <div className="mb-4 flex items-baseline justify-center gap-1">
                <span className="text-xl font-semibold">
                  {getCurrencySymbol(plan.currency)}
                </span>
                <span className="text-4xl font-extrabold">
                  {formatPrice(plan.displayPrice)}
                </span>
                <span className="text-sm text-gray-500">
                  {getPriceSuffix(plan.durationDays)}
                </span>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {(plan.details ?? []).map((feature, idx) => (
                  <li
                    key={`${plan._id}-feature-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Check className="h-3 w-3" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subtotal */}
            <div className="bg-[#6cabdf4a] rounded-2xl p-3 mb-2">
              <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>
                  {getCurrencySymbol(plan.currency)}{" "}
                  {formatPrice(plan.displayPrice)}
                </span>
              </div>
              <div className="mb-2 flex items-center justify-between text-sm font-semibold text-blue-600">
                <span>Total</span>
                <span>
                  {getCurrencySymbol(plan.currency)}{" "}
                  {formatPrice(plan.displayPrice)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handlePay}
              disabled={isPurchasing || !plan?._id}
              className={`mt-2 w-full rounded-full h-12 font-medium text-white shadow-lg shadow-blue-300 transition ${
                isPurchasing || !plan?._id
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-500 hover:to-blue-800"
              }`}
            >
              {isPurchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Redirecting to checkout...
                </span>
              ) : (
                "Pay Now"
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReviewPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ReviewPlanContent />
    </Suspense>
  );
}
