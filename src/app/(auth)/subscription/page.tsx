"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  getPlansApi,
  startSubscriptionTrialApi,
  SubscriptionPlan,
} from "@/services/subscriptionApi";

const getPriceSuffix = (durationDays: number): string => {
  if (durationDays === 30) return "/month";
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

export default function SubscriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error";
  }>({ open: false, message: "", type: "error" });

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getPlansApi,
    staleTime: 5 * 60 * 1000,
  });

  const plans = useMemo<SubscriptionPlan[]>(() => {
    const list = data?.data?.plans ?? [];
    return [...list]
      .filter((plan) => plan.isActive)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [data]);

  // Default-select first plan once loaded
  useEffect(() => {
    if (!selectedPlanKey && plans.length > 0) {
      setSelectedPlanKey(plans[0].key);
    }
  }, [plans, selectedPlanKey]);

  const handleBuy = () => {
    if (!selectedPlanKey) return;
    router.push(`/review-plan?plan=${selectedPlanKey}`);
  };

  const startTrialMutation = useMutation({
    mutationFn: async () => {
      const res = await startSubscriptionTrialApi();
      if (!res.success) {
        throw new Error(res.message || "Could not start free trial.");
      }
      return res;
    },
    onSuccess: () => {
      setIsTrialModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["settings-subscription-current"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      router.push("/home");
    },
    onError: (err) => {
      setToast({
        open: true,
        message: getApiErrorMessage(err),
        type: "error",
      });
    },
  });

  return (
    <div className="w-full max-w-[32em]">
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      {isTrialModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="free-trial-modal-title"
          onClick={() => {
            if (!startTrialMutation.isPending) setIsTrialModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-[380px] overflow-hidden rounded-[22px] bg-white shadow-[0px_4px_36px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient band + icon */}
            <div
              className="relative flex h-[108px] shrink-0 flex-col items-center rounded-t-[22px] pt-4"
              style={{
                background:
                  "linear-gradient(134.74deg, rgba(108, 172, 223, 0.2) 3.24%, rgba(0, 0, 254, 0.2) 139.86%), #FFFFFF",
              }}
            >
              <div
                className="flex h-[68px] w-[68px] items-center justify-center rounded-full border border-[#6CACDF] bg-[rgba(108,172,223,0.22)] shadow-sm"
                aria-hidden
              >
                <Check className="h-8 w-8 text-[#0000FE]" strokeWidth={2.75} />
              </div>
            </div>

            {/* Title + body */}
            <div className="flex flex-col items-center gap-1 px-6 pb-1 pt-0.5 text-center sm:px-8">
              <h2
                id="free-trial-modal-title"
                className="max-w-[320px] text-2xl font-black leading-8 tracking-[-0.02em] text-black sm:text-[26px] sm:leading-9"
              >
                Free Trial
              </h2>
              <p className="max-w-[320px] text-[15px] font-normal leading-[22px] text-[#838383] sm:text-base sm:leading-6">
                Are you sure you want to use free trial? During your trial you can only create and
                download a total of 3 posts.
              </p>
            </div>

            {/* Buttons row */}
            <div className="flex flex-row items-stretch justify-between gap-3 px-4 pb-5 pt-4 sm:px-5">
              <button
                type="button"
                disabled={startTrialMutation.isPending}
                onClick={() => startTrialMutation.mutate()}
                className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center rounded-xl px-4 text-center text-[15px] font-semibold leading-5 text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                style={{
                  background:
                    "linear-gradient(134.74deg, #6CACDF 3.24%, #0000FE 139.86%)",
                }}
              >
                {startTrialMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Use Free Trial"
                )}
              </button>
              <button
                type="button"
                disabled={startTrialMutation.isPending}
                onClick={() => setIsTrialModalOpen(false)}
                className="flex min-h-[48px] min-w-0 flex-1 items-center justify-center rounded-xl px-4 text-center text-[15px] font-semibold leading-5 text-black shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                style={{
                  background:
                    "linear-gradient(134.74deg, #CBFE8B 3.24%, #81DE76 111.16%)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative rounded-2xl bg-white p-[2.5em] pt-6 shadow-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center text-gray-700"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => router.push("/home")}
          className="absolute right-4 top-4 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          Skip
        </button>

        <h1 className="mt-2 mb-2 px-14 text-center text-2xl font-extrabold text-gray-900">
          Select Your Subscription
        </h1>
        <p className="mb-8 text-center text-xs text-gray-500">
          Unlock full access to post, create frames, and store private memories.
          Choose the plan that fits your travel lifestyle.
        </p>

        <div className="overflow-scroll h-[27em] scrollbar-hidden">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : isError ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-red-500">{getApiErrorMessage(error)}</p>
              <Button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
              >
                Retry
              </Button>
            </div>
          ) : plans.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No plans available right now.
            </div>
          ) : (
            plans.map((plan) => {
              const isSelected = selectedPlanKey === plan.key;
              const currencySymbol = getCurrencySymbol(plan.currency);
              const suffix = getPriceSuffix(plan.durationDays);

              return (
                <button
                  key={plan._id}
                  type="button"
                  onClick={() => setSelectedPlanKey(plan.key)}
                  className={`w-full rounded-3xl border px-8 py-8 text-left shadow-sm transition hover:shadow-lg mb-6 bg-gradient-to-br from-blue-50 to-purple-50 ${
                    isSelected ? "border-blue-400" : "border-transparent"
                  }`}
                >
                  <div className="mb-4 text-center font-semibold text-gray-800">
                    {plan.label}
                  </div>
                  <div className="mb-4 flex items-baseline justify-center gap-1">
                    <span className="text-xl font-semibold">
                      {currencySymbol}
                    </span>
                    <span className="text-4xl font-extrabold">
                      {formatPrice(plan.displayPrice)}
                    </span>
                    <span className="text-sm text-gray-500">{suffix}</span>
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
                </button>
              );
            })
          )}
        </div>

        <div className="mt-2 flex w-full flex-row gap-3">
          <Button
            type="button"
            disabled={!selectedPlanKey || isLoading || isFetching}
            className={`min-w-0 flex-1 rounded-full h-12 font-medium shadow-lg shadow-blue-300 text-white transition ${
              !selectedPlanKey || isLoading || isFetching
                ? "bg-gray-300 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-500 hover:to-blue-800"
            }`}
            onClick={handleBuy}
          >
            Buy
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isFetching}
            className="min-w-0 flex-1 rounded-full h-12 font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setIsTrialModalOpen(true)}
          >
            Use Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
