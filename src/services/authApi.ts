import { API } from "@/lib/axios";

// POST /auth/signup - { email, method: "email", password }
export const signupApi = async (data: { email: string; password: string }) => {
  const res = await API.post("/auth", {
    email: data.email,
    method: "email",
    password: data.password,
  });
  return res.data;
};

// POST /auth/signin - { email, method: "email", password }
export const signinApi = async (data: { email: string; password: string }) => {
  const res = await API.post("/auth", {
    email: data.email,
    method: "email",
    password: data.password,
  });
  return res.data;
};

// POST /auth - Social Authentication (Google, Apple)
export const socialAuthApi = async (data: { method: "google" | "apple"; idToken: string }) => {
  const res = await API.post("/auth", data);
  return res.data;
};


// POST /auth/verify-email - { email, otp }
export const verifyEmailApi = async (data: { email: string; otp: string }) => {
  const res = await API.post("/auth/verify-email", data);
  return res.data;
};

// POST /auth/email-verification-otp (resend) - { email }
export const resendEmailVerificationOtpApi = async (data: { email: string }) => {
  const res = await API.post("/auth/email-verification-otp", data);
  return res.data;
};

// POST /auth/forgot - { email }
export const forgotPasswordApi = async (data: { email: string }) => {
  const res = await API.post("/auth/forgot", data);
  return res.data;
};

// POST /auth/verify-otp - { email, otp }
export const verifyOtpApi = async (data: { email: string; otp: string }) => {
  const res = await API.post("/auth/verify-otp", data);
  return res.data;
};

// POST /auth/update-password - { resetToken, password }
export const updatePasswordApi = async (data: { resetToken: string; password: string }) => {
  const res = await API.post("/auth/update-password", data);
  return res.data;
};

// POST /auth/change-password - { current_password, password } (requires auth token)
export const changePasswordApi = async (data: { password?: string; newPassword: string }) => {
  const res = await API.post("/auth/change-password", data);
  return res.data;
};

// POST /auth/set-password - { password } (requires auth token)
export const setPasswordApi = async (data: { password: string }) => {
  const res = await API.post("/auth/set-password", data);
  return res.data;
};

// POST /auth/logout
export const logoutApi = async () => {
  const res = await API.post("/auth/logout");
  return res.data;
};

// POST /users/verify-identity - { iata } or { clia } (requires auth token)
export const verifyIdentityApi = async (data: { iata?: string; clia?: string }) => {
  const res = await API.post("/users/verify-identity", data);
  return res.data;
};

// POST /users/complete-profile - FormData (requires auth token)
export const completeProfileApi = async (formData: FormData) => {
  const res = await API.post("/users/complete-profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET /users/own - Get current user profile
export const getUserProfileApi = async () => {
  const res = await API.get("/users/own");
  return res?.data;
};

// GET /badges - Get Badges profile
export const getBadgesApi = async () => {
  const res = await API.get("/badges/own");
  return res.data;
};


// PATCH /users/ - Update user profile (FormData)
export const updateUserApi = async (formData: FormData) => {
  const res = await API.patch("/users/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// GET /categories - { page, limit }
export const getCategoriesApi = async (params?: { page?: number; limit?: number }) => {
  const res = await API.get("/categories", { params });
  return res.data;
};