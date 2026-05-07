import { API } from "@/lib/axios";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  profilePicture?: {
    location: string;
  } | null;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  iata?: string;
  clia?: string;
  isIdentityVerified?: boolean;
  isProfileCompleted?: boolean;
  isPasswordSet?: boolean;
  isSubscribed?: boolean;
  isOnTrial?: boolean;
  totalFollowers?: number;
  totalFollowing?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// ─── Auth API Functions ───────────────────────────────────────────────────────

// POST /auth/check-email
export const checkEmailApi = async (data: { email: string; method?: string }) => {
  const res = await API.post("/auth/check-email", data);
  return res.data;
};

// POST /auth/signup
export const signupApi = async (data: any) => {
  const res = await API.post<AuthResponse>("/auth", data);
  return res.data;
};

// POST /auth/signin
export const signinApi = async (data: any) => {
  const res = await API.post<AuthResponse>("/auth", data);
  return res.data;
};

// POST /auth/social-auth
export const socialAuthApi = async (data: { method: string; idToken: string }) => {
  const res = await API.post<AuthResponse>("/auth", data);
  return res.data;
};

// POST /auth/verify-email
export const verifyEmailApi = async (data: { email: string; otp: string }) => {
  const res = await API.post("/auth/verify-email", data);
  return res.data;
};

// POST /auth/resend-email-verification-otp
export const resendEmailVerificationOtpApi = async (data: { email: string }) => {
  const res = await API.post("/auth/email-verification-otp", data);
  return res.data;
};

// POST /auth/forgot-password
export const forgotPasswordApi = async (data: { email: string }) => {
  const res = await API.post("/auth/forgot", data);
  return res.data;
};

// POST /auth/verify-otp
export const verifyOtpApi = async (data: { email: string; otp: string }) => {
  const res = await API.post("/auth/verify-otp", data);
  return res.data;
};

// POST /auth/update-password
export const updatePasswordApi = async (data: any) => {
  const res = await API.post("/auth/update-password", data);
  return res.data;
};

// POST /auth/change-password
export const changePasswordApi = async (data: any) => {
  const res = await API.post("/auth/change-password", data);
  return res.data;
};

// POST /auth/set-password
export const setPasswordApi = async (data: any) => {
  const res = await API.post("/auth/set-password", data);
  return res.data;
};

// POST /auth/logout
export const logoutApi = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};