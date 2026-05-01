import { API } from "@/lib/axios";

// GET /users/own - Get current user profile
export const getUserProfileApi = async () => {
  const res = await API.get("/users/own");
  return res?.data;
};

// GET /users/:userId - Get another user profile
export const getUserByIdApi = async (userId: string) => {
  const res = await API.get(`/users/${userId}`);
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

// DELETE /users
export const deleteUserApi = async () => {
  const res = await API.delete("/users");
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

// POST /reports - Report a user, post, or frame
export const reportEntityApi = async (data: {
  entityId: string;
  entityType: "User" | "Post" | "Frame";
  reason: string;
  description?: string;
  supportingEntityId?: string;
  supportingEntityType?: "User" | "Post" | "Frame";
}) => {
  const res = await API.post("/reports", data);
  return res.data;
};

// GET /badges - Get Badges profile
export const getBadgesApi = async () => {
  const res = await API.get("/badges/own");
  return res.data;
};

// GET /badges/:badgeId - Get Single Badge details
export const getSingleBadgeApi = async (badgeId: string) => {
  const res = await API.get(`/badges/${badgeId}`);
  return res.data;
};
