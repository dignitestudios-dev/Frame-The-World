import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SubscriptionProvider = "apple" | "google" | "stripe";

export interface SubscriptionProviderId {
  provider: SubscriptionProvider;
  productId: string;
  priceId: string | null;
}

export interface SubscriptionPlan {
  _id: string;
  key: string;
  label: string;
  currency: string;
  displayPrice: number;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
  providerIds: SubscriptionProviderId[];
  details: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GetPlansResponse {
  success: boolean;
  message: string;
  data: {
    plans: SubscriptionPlan[];
  };
}

export interface PurchaseSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
  };
}

export interface CurrentSubscription {
  platform: string | null;
  planKey: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  autoRenewStatus: boolean;
}

export interface GetCurrentSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    isSubscribed: boolean;
    isOnTrial: boolean;
    isTrialConsumed: boolean;
    subscription: CurrentSubscription | null;
  };
}

export interface CancelStripeSubscriptionResponse {
  success: boolean;
  message: string;
}

export interface StartTrialResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

// ─── Subscription API Functions ──────────────────────────────────────────────

// GET /subscriptions/plans - Fetch all active subscription plans
export const getPlansApi = async (): Promise<GetPlansResponse> => {
  const res = await API.get<GetPlansResponse>("/subscriptions/plans");
  return res.data;
};

// GET /subscriptions/subscription - Current user's subscription
export const getCurrentSubscriptionApi = async (): Promise<GetCurrentSubscriptionResponse> => {
  const res = await API.get<GetCurrentSubscriptionResponse>("/subscriptions/subscription");
  return res.data;
};

// POST /subscriptions/stripe/cancel — cancel at period end (Stripe)
export const cancelStripeSubscriptionApi = async (): Promise<CancelStripeSubscriptionResponse> => {
  const res = await API.post<CancelStripeSubscriptionResponse>("/subscriptions/stripe/cancel");
  return res.data;
};

// POST /subscriptions/purchase/:planId - Create a Stripe checkout session
export const purchaseSubscriptionApi = async (
  planId: string
): Promise<PurchaseSubscriptionResponse> => {
  const res = await API.post<PurchaseSubscriptionResponse>(
    `/subscriptions/purchase/${planId}`
  );
  return res.data;
};

// POST /subscription/trial/start — start free trial
export const startSubscriptionTrialApi = async (): Promise<StartTrialResponse> => {
  const res = await API.post<StartTrialResponse>("/subscriptions/trial/start");
  return res.data;
};
