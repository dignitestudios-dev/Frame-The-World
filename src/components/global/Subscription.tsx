"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import {
  cancelStripeSubscriptionApi,
  getCurrentSubscriptionApi,
  getPlansApi,
} from "@/services/subscriptionApi";
import { getApiErrorMessage } from "@/lib/apiError";

const getPriceSuffix = (durationDays: number): string => {
  if (durationDays === 30) return "/Month";
  if (durationDays === 365) return "/Year";
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

function isNativeStorePlatform(platform: string | null | undefined): boolean {
  const p = platform?.toLowerCase() ?? "";
  return p === "apple" || p === "google" || p === "android";
}

const NATIVE_STORE_SUBSCRIPTION_MESSAGE =
  "This subscription was not purchased on Web. please manage this subscription on the purchasing platform.";

function formatPeriodEnd(iso: string | undefined): string {
  if (!iso) return "the end of your billing period";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "the end of your billing period";
  }
}

function SubscriptionMainSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="rounded-[24px] border-2 border-[#A5C0FF] bg-[#E8F0FF] p-6 md:p-8 flex flex-col items-center">
        <SkeletonText className="h-6 w-28 mb-4" />
        <div className="flex items-baseline gap-2 mb-6">
          <Skeleton className="h-8 w-6 rounded-full" />
          <Skeleton className="h-14 w-32 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <div className="w-full max-w-md space-y-3 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5 rounded-full shrink-0" />
              <SkeletonText className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-2xl rounded-full" />
      </div>
    </div>
  );
}

export default function Subscription() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ["settings-subscription-plans"],
    queryFn: getPlansApi,
    staleTime: 5 * 60 * 1000,
  });

  const subQuery = useQuery({
    queryKey: ["settings-subscription-current"],
    queryFn: getCurrentSubscriptionApi,
    staleTime: 60 * 1000,
  });

  const plans = useMemo(() => {
    const list = plansQuery.data?.data?.plans ?? [];
    return [...list]
      .filter((p) => p.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [plansQuery.data]);

  const subscription = subQuery.data?.data?.subscription;
  const isSubscribed = subQuery.data?.data?.isSubscribed === true;

  const currentPlan = useMemo(() => {
    const key = subscription?.planKey;
    if (!key) return undefined;
    return plans.find((p) => p.key === key);
  }, [subscription?.planKey, plans]);

  const isSubscriptionCancelled =
    subscription?.cancelAtPeriodEnd === true ||
    ["canceled", "cancelled"].includes(subscription?.status?.toLowerCase() ?? "");

  const isNativeStoreSubscription = isNativeStorePlatform(subscription?.platform);

  const cancelMutation = useMutation({
    mutationFn: cancelStripeSubscriptionApi,
    onSuccess: () => {
      setCancelError(null);
      setShowCancelModal(false);
      void subQuery.refetch();
    },
    onError: (err: unknown) => {
      setCancelError(getApiErrorMessage(err));
    },
  });

  const isLoading = plansQuery.isPending || subQuery.isPending;
  const isError = plansQuery.isError || subQuery.isError;
  const error = plansQuery.error ?? subQuery.error;

  const refetchAll = () => {
    void plansQuery.refetch();
    void subQuery.refetch();
  };

  const handleConfirmCancel = () => {
    setCancelError(null);
    cancelMutation.mutate();
  };

  const openCancelModal = () => {
    setCancelError(null);
    setShowCancelModal(true);
  };

  return (
    <div className="flex-1 bg-white rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm h-auto md:min-h-[700px] relative">
      <div className="py-4 md:py-6 border-b border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Subscription</h2>
      </div>

      {isLoading ? (
        <SubscriptionMainSkeleton />
      ) : isError ? (
        <div className="p-8 text-center">
          <p className="text-red-500 text-sm font-medium mb-4">{getApiErrorMessage(error)}</p>
          <Button type="button" onClick={refetchAll} variant="outline">
            Retry
          </Button>
        </div>
      ) : (
        <div className="p-4 md:p-8">
          {!isSubscribed ? (
            <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-8 text-center space-y-4">
              <p className="text-gray-700 text-sm font-medium">
                You don&apos;t have an active subscription yet.
              </p>
              <Button asChild className="rounded-full">
                <Link href="/subscription">View plans</Link>
              </Button>
            </div>
          ) : currentPlan ? (
            <>
              <div className="rounded-[24px] border-2 border-[#A5C0FF] bg-[#E8F0FF] p-6 md:p-8 flex flex-col items-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">{currentPlan.label}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-xl font-bold mr-0.5">
                    {getCurrencySymbol(currentPlan.currency)}
                  </span>
                  <span className="text-5xl font-black">{formatPrice(currentPlan.displayPrice)}</span>
                  <span className="text-gray-400 font-medium ml-1">
                    {getPriceSuffix(currentPlan.durationDays)}
                  </span>
                </div>

                <div className="space-y-3 mb-8 text-left w-full max-w-md">
                  {(currentPlan.details ?? []).length > 0 ? (
                    (currentPlan.details ?? []).map((line, i) => (
                      <div key={`${currentPlan._id}-m-${i}`} className="flex items-center gap-3 text-gray-600">
                        <CheckCircle2 className="h-5 w-5 text-[#4F6EF7] shrink-0" fill="currentColor" stroke="white" />
                        <span className="text-sm font-medium">{line}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center w-full">No plan details listed.</p>
                  )}
                </div>

                <div className="w-full max-w-[34em]">
                  {isNativeStoreSubscription ? (
                    <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium leading-relaxed text-red-600">
                      {NATIVE_STORE_SUBSCRIPTION_MESSAGE}
                    </p>
                  ) : !isSubscriptionCancelled ? (
                    <button
                      type="button"
                      onClick={openCancelModal}
                      className="w-full py-3.5 rounded-full border border-red-300 bg-[#F5D7E3] text-red-500 font-bold text-sm"
                    >
                      Cancel
                    </button>
                  ) : (
                    <p className="text-center text-sm font-medium leading-relaxed text-gray-600">
                      Your subscription has been cancelled
                      {subscription?.currentPeriodEnd
                        ? ` and it ends on ${formatPeriodEnd(subscription.currentPeriodEnd)}.`
                        : "."}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
              <p className="text-sm font-medium text-gray-800">
                Active subscription ({subscription?.planKey ?? "unknown"}) — plan details could not be matched to the catalog.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={refetchAll}>
                Refresh
              </Button>
            </div>
          )}
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[40px] w-full max-w-[400px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="h-32 bg-blue-100 flex items-center justify-center pt-4">
              <div className="w-20 h-20 rounded-full bg-[#FFF9C4] border-2 border-[#FFEB3B] flex items-center justify-center shadow-sm">
                <span className="text-[#FBC02D] text-4xl font-bold">?</span>
              </div>
            </div>

            <div className="px-8 pb-10 text-center mt-2">
              <h3 className="text-[28px] font-bold text-gray-900 mb-3 leading-tight">
                Cancel Subscription
              </h3>
              <p className="text-gray-400 text-[15px] mb-4 leading-relaxed max-w-[260px] mx-auto">
                Are you sure you want to cancel this subscription
              </p>

              {cancelError ? (
                <p className="mb-3 text-center text-sm text-red-500">{cancelError}</p>
              ) : null}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={cancelMutation.isPending}
                  className="flex flex-1 items-center justify-center gap-2 py-4 rounded-2xl bg-[#D4000026] text-[#EF5350] font-bold text-[15px] hover:bg-[#FFD1D1] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                      <span>Please wait…</span>
                    </>
                  ) : (
                    "End Subscription"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelMutation.isPending}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-b from-[#CBFE8B] to-[#81DE76] text-black font-bold text-[15px] shadow-md hover:brightness-105 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
